import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export interface ChatMessage {
  sender: string;
  content: string;
  timestamp?: number;
}

export interface PeerDiscovered {
  name: string;
  addr: string;
}

export interface ConnectionStatus {
  connected: boolean;
  peer_addr: string;
}

export function useChat() {
  const [started, setStarted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [peers, setPeers] = useState<PeerDiscovered[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const nicknameRef = useRef("");
  const sendFeedbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const unlisten: (() => void)[] = [];

    listen<ChatMessage>("chat-message", (e) => {
      setMessages((prev) => [
        ...prev,
        { ...e.payload, timestamp: Date.now() },
      ]);
    }).then((fn) => unlisten.push(fn));

    listen<string>("chat-log", (e) => {
      setLogs((prev) => [...prev, e.payload]);
    }).then((fn) => unlisten.push(fn));

    listen<string>("chat-error", (e) => {
      setLogs((prev) => [...prev, `[错误] ${e.payload}`]);
    }).then((fn) => unlisten.push(fn));

    listen<PeerDiscovered>("peer-discovered", (e) => {
      setPeers((prev) => {
        if (prev.some((p) => p.addr === e.payload.addr)) return prev;
        return [...prev, e.payload];
      });
    }).then((fn) => unlisten.push(fn));

    listen<ConnectionStatus>("connection-status", (e) => {
      setConnected(e.payload.connected);
    }).then((fn) => unlisten.push(fn));

    listen<boolean>("peer-typing", (e) => {
      setPeerTyping(Boolean(e.payload));
    }).then((fn) => unlisten.push(fn));

    return () => {
      unlisten.forEach((fn) => fn());
      if (sendFeedbackTimerRef.current !== null) {
        window.clearTimeout(sendFeedbackTimerRef.current);
      }
    };
  }, []);

  const startChat = async (nickname: string, port: number) => {
    nicknameRef.current = nickname;
    await invoke("start_chat", { nickname, port });
    setStarted(true);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !connected) return;
    await invoke("send_message", {
      sender: nicknameRef.current,
      content: content.trim(),
    });

    setSendFeedback("已发送");
    if (sendFeedbackTimerRef.current !== null) {
      window.clearTimeout(sendFeedbackTimerRef.current);
    }
    sendFeedbackTimerRef.current = window.setTimeout(() => {
      setSendFeedback(null);
      sendFeedbackTimerRef.current = null;
    }, 1200);
  };

  return {
    started,
    connected,
    messages,
    peers,
    logs,
    peerTyping,
    sendFeedback,
    nickname: nicknameRef.current,
    startChat,
    sendMessage,
  };
}
