import { emit } from "@tauri-apps/api/event";
import { mockIPC, mockWindows } from "@tauri-apps/api/mocks";

function schedule(delay: number, fn: () => void) {
  setTimeout(fn, delay);
}

function buildPreviewReplies(content: string) {
  const normalized = content.trim().toLowerCase();

  if (/[?？]$/.test(content)) {
    return [
      "可以，我这边看到了。",
      "你继续发，我配合你看布局。",
    ];
  }

  if (normalized.includes("你好") || normalized.includes("hi") || normalized.includes("hello")) {
    return [
      "你好，我这边已经连上了。",
      "这版预览节奏会更自然一些。",
    ];
  }

  if (normalized.length <= 4) {
    return [
      "收到。",
      "继续，我这边同步得很顺。",
    ];
  }

  return [
    "收到，我这边能看到消息了。",
    "继续试试输入框和消息分组的效果。",
  ];
}

export function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function isPreviewRuntime() {
  return typeof window !== "undefined" && "__TAURI_PREVIEW_MOCKS__" in window;
}

export function ensurePreviewMocks() {
  if (typeof window === "undefined" || isTauriRuntime()) {
    return;
  }

  const previewWindow = window as Window & { __TAURI_PREVIEW_MOCKS__?: boolean };
  previewWindow.__TAURI_PREVIEW_MOCKS__ = true;
  mockWindows("main");
  mockIPC(
    async (cmd, payload: any) => {
      switch (cmd) {
        case "start_chat": {
          const nickname = String(payload?.nickname ?? "Preview");
          const port = Number(payload?.port ?? 9000);

          schedule(120, () => {
            void emit("chat-log", `预览模式已启动：${nickname} @ ${port}`);
          });

          schedule(500, () => {
            void emit("peer-discovered", {
              name: `${nickname}-peer._localchat._tcp.local.`,
              addr: "192.168.1.23:9000",
            });
          });

          schedule(900, () => {
            void emit("connection-status", {
              connected: true,
              peer_addr: "192.168.1.23:9000",
            });
          });

          schedule(1120, () => {
            void emit("peer-typing", true);
          });

          schedule(1500, () => {
            void emit("chat-message", {
              sender: "Preview Peer",
              content: "已连接，我们先看看整体布局是否顺眼。",
            });
          });

          schedule(1860, () => {
            void emit("peer-typing", false);
          });

          return null;
        }

        case "send_message": {
          const sender = String(payload?.sender ?? "Me");
          const content = String(payload?.content ?? "");
          const replies = buildPreviewReplies(content);

          schedule(80, () => {
            void emit("chat-message", {
              sender,
              content,
            });
          });

          schedule(140, () => {
            void emit("peer-typing", true);
          });

          schedule(460, () => {
            void emit("chat-message", {
              sender: "Preview Peer",
              content: replies[0],
            });
          });

          schedule(820, () => {
            void emit("chat-message", {
              sender: "Preview Peer",
              content: replies[1],
            });
          });

          schedule(1080, () => {
            void emit("peer-typing", false);
          });

          return null;
        }

        default:
          return null;
      }
    },
    { shouldMockEvents: true },
  );
}
