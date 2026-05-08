import { useEffect, useRef } from "react";
import {
  CircleOff,
  MessageSquareText,
  MoreVertical,
  Phone,
  Video,
  CheckCircle2,
} from "lucide-react";
import type { ChatMessage } from "../hooks/useChat";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Props {
  nickname: string;
  connected: boolean;
  messages: ChatMessage[];
  statusText: string;
  logs: string[];
  peerTyping: boolean;
}

function formatTime(ts?: number) {
  if (!ts) return "";

  return new Date(ts).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function simplifyLog(log: string) {
  return log
    .replace(/^\[错误\]\s*/, "")
    .replace(/^错误[:：]\s*/, "")
    .replace(/\(os error 48\)/i, "")
    .trim();
}

function formatDayLabel(ts?: number) {
  if (!ts) return "";

  const date = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "今天";
  if (date.toDateString() === yesterday.toDateString()) return "昨天";

  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
  }).format(date);
}

function isSameDay(a?: number, b?: number) {
  if (!a || !b) return false;
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function ChatArea({
  nickname,
  connected,
  messages,
  statusText,
  logs,
  peerTyping,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const hasMessages = messages.length > 0;
  const lastLog = logs.length ? simplifyLog(logs[logs.length - 1]) : "";

  return (
    <div className="flex-1 min-h-0 bg-[#171c25] px-3 pt-3 pb-[clamp(132px,16vh,208px)] sm:px-5 sm:pt-4 lg:px-6 lg:pt-5">
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex h-[84px] shrink-0 items-center justify-between border-b border-white/6 px-1 sm:h-[88px]">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Avatar className="h-11 w-11 border-white/6 bg-[#242b38] sm:h-12 sm:w-12">
              <AvatarFallback className="bg-transparent text-[16px] text-white">
                {connected ? "O" : nickname.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate text-[18px] font-semibold tracking-tight text-text sm:text-[20px]">
                {connected ? "Ali Khan" : "Waiting for peer"}
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-text-3 sm:text-[12px]">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    connected ? "bg-green shadow-[0_0_0_5px_rgba(52,211,153,0.10)]" : "bg-text-4",
                  )}
                  style={connected ? undefined : { animation: "pulse-dot 2s ease infinite" }}
                />
                <span>{connected ? "Online" : statusText}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em] md:inline-flex">
              {messages.length} messages
            </Badge>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/6 bg-[#202634] text-text-3 hover:bg-white/5 hover:text-text sm:h-10 sm:w-10"
              title="Call"
            >
              <Phone size={16} />
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/6 bg-[#202634] text-text-3 hover:bg-white/5 hover:text-text sm:h-10 sm:w-10"
              title="Video"
            >
              <Video size={16} />
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/6 bg-[#202634] text-text-3 hover:bg-white/5 hover:text-text sm:h-10 sm:w-10"
              title="More"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        <div className="border-b border-white/6 px-1 py-3 text-[11px] text-text-3 sm:py-4 sm:text-[12px]">
          <div className="flex items-center gap-2">
            {connected ? <CheckCircle2 size={13} /> : <CircleOff size={13} />}
            <span>{connected ? "Direct LAN link active" : "Waiting for peer response"}</span>
          </div>
          {lastLog && (
            <div className="mt-1 truncate text-[11px] text-text-4">{lastLog}</div>
          )}
        </div>

        <ScrollArea className="min-h-0 flex-1 px-3 py-6 sm:px-5 sm:py-7 lg:px-6">
          {connected && peerTyping && (
            <div className="mb-4 flex items-center gap-3 px-3 sm:px-6 lg:px-8">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/6 bg-[#242b38] text-[11px] text-text-3">
                O
              </div>
              <div className="rounded-full border border-white/6 bg-[#202634] px-3.5 py-1.5 text-[10px] text-text-3">
                对方正在输入...
              </div>
            </div>
          )}

          {!hasMessages ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center sm:min-h-[360px] sm:px-8">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/6 bg-[#202634] text-text-3">
                <MessageSquareText size={28} />
              </div>
              <p className="text-[20px] font-semibold tracking-tight text-text-2 sm:text-[22px]">
                等待对方连接…
              </p>
              <p className="mt-2 max-w-[420px] text-[12px] leading-relaxed text-text-4 sm:text-[13px]">
                这是一个点对点局域网聊天窗口。设备发现完成后会自动连接，然后你可以直接开始对话。
              </p>
              <div className="mt-6 flex items-center gap-2">
                <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em]">
                  Direct
                </Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em]">
                  LAN
                </Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em]">
                  Encrypted
                </Badge>
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-4 pb-8">
              {messages.map((msg, i) => {
                const isSelf = msg.sender === nickname;
                const prev = messages[i - 1];
                const sameDayAsPrev = prev ? isSameDay(prev.timestamp, msg.timestamp) : false;
                const sameSenderAsPrev =
                  prev && prev.sender === msg.sender && sameDayAsPrev;
                const showDaySeparator = !prev || !sameDayAsPrev;
                const showSenderMeta = !sameSenderAsPrev;
                const metaText = `${isSelf ? "You" : msg.sender} · ${formatTime(msg.timestamp)} · ${isSelf ? "已发送" : "已接收"}`;

                return (
                  <div key={`${msg.sender}-${msg.timestamp ?? i}-${i}`} className="flex flex-col gap-4">
                    {showDaySeparator && (
                      <div className="flex items-center justify-center">
                        <div className="rounded-full border border-white/6 bg-[#202634] px-3.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-text-3 sm:text-[10px]">
                          {formatDayLabel(msg.timestamp)}
                        </div>
                      </div>
                    )}

                    <div
                      className={cn(
                        "flex items-end gap-3",
                        isSelf
                          ? "justify-end pr-3 sm:pr-6 lg:pr-8"
                          : "justify-start pl-3 sm:pl-6 lg:pl-8",
                        !showSenderMeta && (isSelf ? "mr-10 sm:mr-12" : "ml-10 sm:ml-12"),
                      )}
                    >
                      {!isSelf && showSenderMeta && (
                        <Avatar className="h-8 w-8 border-white/6 bg-[#242b38] sm:h-9 sm:w-9">
                          <AvatarFallback className="bg-transparent text-[12px] text-white">
                            {msg.sender.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          "max-w-[78%] sm:max-w-[72%]",
                          isSelf ? "items-end" : "items-start",
                        )}
                      >
                        {showSenderMeta ? (
                          <div className="mb-1 px-1 text-[9px] font-medium text-text-4 sm:text-[10px]">
                            {metaText}
                          </div>
                        ) : (
                          <div className="mb-1 h-3" />
                        )}
                        <div
                          className={cn(
                            "rounded-[20px] border px-4 py-3.5 text-[14px] leading-[1.65] shadow-[0_10px_26px_rgba(0,0,0,0.16)]",
                            isSelf
                              ? "rounded-tr-[6px] border-[color:rgba(76,169,122,0.22)] bg-[#2a7358] text-[#effaf4]"
                              : "rounded-tl-[6px] border-white/6 bg-[#242b38] text-text",
                          )}
                        >
                          {msg.content}
                        </div>
                      </div>

                      {isSelf && showSenderMeta && (
                        <Avatar className="h-8 w-8 border-white/6 bg-[#2a7358] sm:h-9 sm:w-9">
                          <AvatarFallback className="bg-transparent text-[12px] text-[#effaf4]">
                            {nickname.charAt(0).toUpperCase() || "Y"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
