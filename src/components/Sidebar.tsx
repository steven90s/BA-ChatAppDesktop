import { useMemo, useState } from "react";
import { MoreVertical, Search, ShieldCheck, Wifi } from "lucide-react";
import type { ChatMessage, PeerDiscovered } from "../hooks/useChat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Props {
  nickname: string;
  connected: boolean;
  peers: PeerDiscovered[];
  messages: ChatMessage[];
  statusLine: string;
}

export default function Sidebar({
  nickname,
  connected,
  peers,
  messages,
  statusLine,
}: Props) {
  const [query, setQuery] = useState("");
  const latestMessage = messages[messages.length - 1];
  const latestPreview = latestMessage?.content ?? "";
  const latestSender = latestMessage?.sender ?? "No messages yet";
  const latestTime = latestMessage?.timestamp
    ? new Date(latestMessage.timestamp).toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const filteredPeers = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const mapped = peers
      .map((peer, index) => ({
        peer,
        index,
        name: peer.name.split(".")[0].replace(/_\d+$/, ""),
      }))
      .filter(({ peer, name }) => {
        if (!normalized) return true;
        return (
          name.toLowerCase().includes(normalized) ||
          peer.addr.toLowerCase().includes(normalized)
        );
      });

    return mapped;
  }, [peers, query]);

  return (
    <aside className="flex h-full w-[clamp(260px,24vw,360px)] shrink-0 flex-col overflow-hidden rounded-[28px] border border-white/6 bg-[#1a1f28]">
      <div className="border-b border-white/6 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-text-4">
              Messages
            </div>
            <div className="mt-2 text-[13px] text-text-3">
              {connected ? "Online in LAN" : statusLine}
            </div>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/6 bg-[#222936] text-text-3 hover:bg-white/5 hover:text-text"
            title="More"
          >
            <MoreVertical size={16} />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-4 rounded-[26px] border border-white/6 bg-[#202634] px-4 py-4 sm:mt-6">
          <div className="relative">
            <Avatar className="h-12 w-12 border-white/6 bg-[#2b3342]">
              <AvatarFallback className="bg-transparent text-[16px] text-white">
                {nickname.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#1a1f28]",
                connected ? "bg-green" : "bg-text-4",
              )}
              style={connected ? undefined : { animation: "pulse-dot 2s ease infinite" }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-[16px] font-semibold text-text">{nickname}</div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-text-4">
              <span className="truncate">{statusLine}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[24px] border border-white/6 bg-[#171c25] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-text-4">
                Active thread
              </div>
              <div className="mt-2 text-[13px] font-medium text-text">
                {latestSender}
              </div>
            </div>
            <Badge variant={connected ? "success" : "secondary"} className="rounded-full px-2.5 py-1 text-[9px] uppercase tracking-[0.16em]">
              {connected ? "Live" : "Idle"}
            </Badge>
          </div>

          <div className="mt-3 rounded-[18px] border border-white/6 bg-[#202634] px-3 py-3">
            <div className="truncate text-[11px] text-text-4">
              {latestTime ? `${latestTime} · ` : ""}
              {latestPreview || "Waiting for the first message"}
            </div>
          </div>
        </div>

        <div className="relative mt-4 sm:mt-5">
          <Search size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-4" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats or IP"
            className="h-11 rounded-[18px] border-white/6 bg-[#171c25] pl-9 pr-3 text-[13px] placeholder:text-text-4"
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-2.5">
          {[
            ["P2P", "模式"],
            ["LAN", "网络"],
            ["On", "加密"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-[18px] border border-white/6 bg-[#202634] px-3 py-3"
            >
              <div className="text-[10px] uppercase tracking-[0.16em] text-text-4">
                {label}
              </div>
              <div className="mt-1 text-[12px] font-medium text-text">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-text-4 sm:px-6">
        <span className="flex items-center gap-2">
          <Wifi size={12} />
          Recent chats
        </span>
        <span>
          {filteredPeers.length}/{peers.length}
        </span>
      </div>

      <div className="min-h-0 flex-1 px-3 pb-3 sm:px-4 sm:pb-4">
        <ScrollArea className="h-full rounded-[28px] border border-white/6 bg-[#171c25]">
          {peers.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-7 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/6 bg-[#222936] text-text-4">
                <Search size={20} className="animate-float-gentle" />
              </div>
              <div className="text-[15px] font-semibold text-text-2">正在扫描局域网…</div>
              <div className="mt-3 max-w-[240px] text-[12px] leading-relaxed text-text-4">
                发现设备后会自动建立连接，你可以先保持这个窗口打开。
              </div>
            </div>
          ) : (
            <div className="p-3">
              {filteredPeers.length === 0 ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/6 bg-[#222936] text-text-4">
                    <Search size={18} />
                  </div>
                  <div className="text-[14px] font-semibold text-text-2">没有匹配的会话</div>
                  <div className="mt-2 max-w-[220px] text-[12px] leading-relaxed text-text-4">
                    试试搜索设备名、IP 或者清空搜索条件。
                  </div>
                </div>
              ) : (
                filteredPeers.map(({ peer, index, name }) => {
                  const active = index === 0;

                  return (
                    <div
                      key={peer.addr}
                      className={cn(
                        "group mb-2.5 flex cursor-default items-center gap-3 border px-3.5 py-3.5 transition-all",
                        active
                          ? "rounded-none border-white/7 bg-white/7"
                          : "rounded-[20px] border-transparent hover:border-white/6 hover:bg-white/4",
                      )}
                    >
                      <div className="relative shrink-0">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/6 bg-[#273145] text-[13px] font-semibold text-white">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#171c25] bg-green" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="truncate text-[13px] font-medium text-text">
                            {name}
                          </div>
                          {active && (
                            <Badge variant="success" className="rounded-full px-2 py-1 text-[9px] uppercase tracking-[0.16em]">
                              Live
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 truncate text-[11px] text-text-4">
                          {active ? "Direct session active" : peer.addr}
                        </div>
                      </div>
                      
                      <div className="flex shrink-0 items-center gap-2">
                        <ShieldCheck size={14} className="text-text-4 opacity-70" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="border-t border-white/6 px-5 py-4 sm:px-6">
        <div className="rounded-[22px] border border-white/6 bg-[#202634] px-4 py-3.5">
          <div className="text-[9px] font-bold uppercase tracking-[0.24em] text-text-4">
            P2P · LAN · Encrypted
          </div>
          <div className="mt-2 text-[11px] text-text-3">
            {connected ? "Secure link active" : "Waiting for peer"}
          </div>
        </div>
      </div>
    </aside>
  );
}
