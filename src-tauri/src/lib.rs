use mdns_sd::{ServiceDaemon, ServiceEvent, ServiceInfo};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::net::IpAddr;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Manager};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::{mpsc, Mutex};

const SERVICE_TYPE: &str = "_localchat._tcp.local.";

// ─── 前后端共享的数据结构 ───

/// 聊天消息（前端 ↔ 后端 ↔ 网络）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub sender: String,
    pub content: String,
}

/// mDNS 发现的设备信息（后端 → 前端 Event）
#[derive(Debug, Clone, Serialize)]
pub struct PeerDiscovered {
    pub name: String,
    pub addr: String,
}

/// 连接状态变化（后端 → 前端 Event）
#[derive(Debug, Clone, Serialize)]
pub struct ConnectionStatus {
    pub connected: bool,
    pub peer_addr: String,
}

// ─── Tauri 全局状态 ───

/// 用于从前端发送消息到网络写入端
struct ChatState {
    /// 发送到网络的 channel
    outgoing_tx: mpsc::Sender<ChatMessage>,
}

// ─── Tauri Commands（前端 invoke 调用）───

/// 前端调用发送消息
#[tauri::command]
async fn send_message(
    state: tauri::State<'_, Arc<Mutex<Option<ChatState>>>>,
    sender: String,
    content: String,
) -> Result<(), String> {
    let guard = state.lock().await;
    if let Some(chat) = guard.as_ref() {
        let msg = ChatMessage { sender, content };
        chat.outgoing_tx
            .send(msg)
            .await
            .map_err(|e| format!("发送失败: {}", e))?;
        Ok(())
    } else {
        Err("尚未建立连接".to_string())
    }
}

/// 前端调用启动聊天服务
#[tauri::command]
async fn start_chat(app: AppHandle, nickname: String, port: u16) -> Result<(), String> {
    let app_handle = app.clone();

    tokio::spawn(async move {
        if let Err(e) = run_chat_service(app_handle, nickname, port).await {
            eprintln!("聊天服务异常: {}", e);
        }
    });

    Ok(())
}

// ─── 核心网络逻辑（从 CLI 迁移）───

async fn run_chat_service(
    app: AppHandle,
    nickname: String,
    listen_port: u16,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let (conn_tx, mut conn_rx) = mpsc::channel::<TcpStream>(4);

    // TCP 监听
    let listener_tx = conn_tx.clone();
    let app_clone = app.clone();
    tokio::spawn(async move {
        let listener = match TcpListener::bind(format!("0.0.0.0:{}", listen_port)).await {
            Ok(l) => l,
            Err(e) => {
                let _ = app_clone.emit("chat-error", format!("无法绑定端口: {}", e));
                return;
            }
        };
        let _ = app_clone.emit("chat-log", format!("正在监听端口 {} ...", listen_port));

        while let Ok((stream, addr)) = listener.accept().await {
            let _ = app_clone.emit("chat-log", format!("收到来自 {} 的连接", addr));
            let _ = listener_tx.send(stream).await;
        }
    });

    // mDNS 注册
    let mdns = ServiceDaemon::new().map_err(|e| format!("mDNS 创建失败: {}", e))?;

    let instance_name = format!("{}_{}", nickname, listen_port);
    let host_name = hostname::get()
        .map(|h| h.to_string_lossy().to_string())
        .unwrap_or_else(|_| "localhost".to_string());
    let host_fqdn = if host_name.ends_with(".local.") {
        host_name.clone()
    } else {
        format!("{}.local.", host_name.trim_end_matches('.'))
    };

    let service_info = ServiceInfo::new(
        SERVICE_TYPE,
        &instance_name,
        &host_fqdn,
        "",
        listen_port,
        None,
    )
    .map_err(|e| format!("服务信息创建失败: {}", e))?
    .enable_addr_auto();

    mdns.register(service_info)
        .map_err(|e| format!("mDNS 注册失败: {}", e))?;

    // mDNS 发现
    let receiver = mdns
        .browse(SERVICE_TYPE)
        .map_err(|e| format!("mDNS 浏览失败: {}", e))?;

    let my_instance = instance_name.clone();
    let my_port = listen_port;
    let discover_tx = conn_tx.clone();
    let app_clone = app.clone();
    let connected_peers: Arc<std::sync::Mutex<HashSet<String>>> =
        Arc::new(std::sync::Mutex::new(HashSet::new()));

    let connected_peers_clone = connected_peers.clone();
    tokio::spawn(async move {
        while let Ok(event) = receiver.recv_async().await {
            if let ServiceEvent::ServiceResolved(info) = event {
                let full_name = info.get_fullname().to_string();

                if full_name.contains(&my_instance) {
                    continue;
                }

                let peer_port = info.get_port();

                // 端口号小的一方主动连接
                if my_port >= peer_port {
                    continue;
                }

                let addresses = info.get_addresses();
                for addr in addresses {
                    match *addr {
                        IpAddr::V4(v4) if !v4.is_loopback() => {}
                        _ => continue,
                    }

                    let peer_key = format!("{}:{}", addr, peer_port);
                    {
                        let mut peers = connected_peers_clone.lock().unwrap();
                        if peers.contains(&peer_key) {
                            continue;
                        }
                        peers.insert(peer_key.clone());
                    }

                    // 通知前端发现了新设备
                    let _ = app_clone.emit(
                        "peer-discovered",
                        PeerDiscovered {
                            name: full_name.clone(),
                            addr: peer_key.clone(),
                        },
                    );

                    let tx = discover_tx.clone();
                    let pk = peer_key.clone();
                    let app_inner = app_clone.clone();
                    let peers_ref = connected_peers_clone.clone();
                    tokio::spawn(async move {
                        match TcpStream::connect(&pk).await {
                            Ok(stream) => {
                                let _ = app_inner
                                    .emit("chat-log", format!("已自动连接到 {}", pk));
                                let _ = tx.send(stream).await;
                            }
                            Err(e) => {
                                let _ = app_inner.emit(
                                    "chat-error",
                                    format!("连接 {} 失败: {}", pk, e),
                                );
                                let mut peers = peers_ref.lock().unwrap();
                                peers.remove(&pk);
                            }
                        }
                    });
                }
            }
        }
    });

    drop(conn_tx);

    // 等待连接建立
    if let Some(stream) = conn_rx.recv().await {
        let peer_addr = stream
            .peer_addr()
            .map(|a| a.to_string())
            .unwrap_or_default();

        // 通知前端已连接
        let _ = app.emit(
            "connection-status",
            ConnectionStatus {
                connected: true,
                peer_addr: peer_addr.clone(),
            },
        );

        // 启动聊天读写
        run_chat_io(app.clone(), stream, nickname).await;

        // 断开连接
        let _ = app.emit(
            "connection-status",
            ConnectionStatus {
                connected: false,
                peer_addr,
            },
        );
    }

    let _ = mdns.unregister(&format!("{}.{}", instance_name, SERVICE_TYPE));
    let _ = mdns.shutdown();
    Ok(())
}

async fn run_chat_io(app: AppHandle, stream: TcpStream, _nickname: String) {
    let (reader, mut writer) = stream.into_split();
    let mut buf_reader = BufReader::new(reader);

    // 创建前端 → 网络的 channel，并注册到全局状态
    let (outgoing_tx, mut outgoing_rx) = mpsc::channel::<ChatMessage>(64);

    {
        let state = app.state::<Arc<Mutex<Option<ChatState>>>>();
        let mut guard = state.lock().await;
        *guard = Some(ChatState { outgoing_tx });
    }

    // 网络 → 前端：读取对方消息，emit 给前端
    let app_recv = app.clone();
    let recv_handle = tokio::spawn(async move {
        let mut line = String::new();
        loop {
            line.clear();
            match buf_reader.read_line(&mut line).await {
                Ok(0) => {
                    let _ = app_recv.emit("chat-log", "对方已断开连接");
                    break;
                }
                Ok(_) => {
                    if let Ok(msg) = serde_json::from_str::<ChatMessage>(line.trim()) {
                        let _ = app_recv.emit("chat-message", msg);
                    }
                }
                Err(_) => break,
            }
        }
    });

    // 前端 → 网络：从 channel 读取消息，写入 TCP
    let app_send = app.clone();
    let send_handle = tokio::spawn(async move {
        while let Some(msg) = outgoing_rx.recv().await {
            // 同时 emit 给前端显示自己发的消息
            let _ = app_send.emit("chat-message", msg.clone());
            let mut json = serde_json::to_string(&msg).unwrap();
            json.push('\n');
            if writer.write_all(json.as_bytes()).await.is_err() {
                break;
            }
        }
    });

    tokio::select! {
        _ = recv_handle => {},
        _ = send_handle => {},
    }

    // 清理状态
    let state = app.state::<Arc<Mutex<Option<ChatState>>>>();
    let mut guard = state.lock().await;
    *guard = None;
}

// ─── Tauri 入口 ───

pub fn run() {
    tauri::Builder::default()
        .manage(Arc::new(Mutex::new(None::<ChatState>)))
        .invoke_handler(tauri::generate_handler![start_chat, send_message])
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                // debug 构建时自动打开 devtools
                #[cfg(debug_assertions)]
                window.open_devtools();

                // macOS: 应用系统级毛玻璃特效
                #[cfg(target_os = "macos")]
                {
                    use window_vibrancy::NSVisualEffectMaterial;
                    let _ = window_vibrancy::apply_vibrancy(
                        &window,
                        NSVisualEffectMaterial::UnderWindowBackground,
                        None,
                        None,
                    );
                }

                // Windows: 应用 Acrylic 半透明特效
                #[cfg(target_os = "windows")]
                {
                    let _ = window_vibrancy::apply_acrylic(&window, Some((18, 18, 18, 180)));
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("启动 Tauri 应用失败");
}
