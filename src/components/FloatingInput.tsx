import { useEffect, useRef, useState } from "react";
import { FileText, Mic, Paperclip, SendHorizontal, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Props {
  connected: boolean;
  sendFeedback?: string | null;
  onSend: (content: string) => void;
}

export default function FloatingInput({ connected, sendFeedback, onSend }: Props) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = connected && input.trim().length > 0;

  const quickReplies = [
    "收到",
    "稍等我一下",
    "我这边好了",
    "可以开始了",
  ];

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "0px";
    el.style.height = `${Math.max(92, Math.min(el.scrollHeight, 144))}px`;
  }, [input]);

  const handleSend = () => {
    if (!canSend) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="pointer-events-none absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-6 sm:right-6 lg:left-7 lg:right-7">
      <div className="mx-auto flex w-full max-w-none flex-col gap-3 pointer-events-auto">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-[11px] text-text-4">
            <span className="h-1.5 w-1.5 rounded-full bg-green" />
            <span>{connected ? "Ready to send" : "Waiting for connection"}</span>
            {sendFeedback && connected && (
              <Badge
                variant="success"
                className="send-feedback-pop rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em]"
              >
                {sendFeedback}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={connected ? "success" : "secondary"}
              className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em]"
            >
              {connected ? "Active" : "Disabled"}
            </Badge>
            <div className="hidden items-center gap-1 rounded-full border border-white/6 bg-[#202634] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-text-4 sm:flex">
              <Sparkles size={10} className="text-green" />
              <span>Enter to send</span>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex min-h-[148px] flex-col gap-4 rounded-[30px] border bg-[#202634] px-4 py-4 shadow-[0_18px_44px_rgba(0,0,0,0.24)] sm:min-h-[164px] sm:px-5 sm:py-5",
            connected ? "border-white/7" : "border-white/5 opacity-95",
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-[18px] border border-white/6 bg-[#171c25] text-text-3 hover:bg-white/5 hover:text-text"
                title="Attach file"
              >
                <Paperclip size={16} />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-[18px] border border-white/6 bg-[#171c25] text-text-3 hover:bg-white/5 hover:text-text"
                title="Attach note"
              >
                <FileText size={16} />
              </Button>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-text-4">
              <span className="hidden rounded-full border border-white/6 bg-[#171c25] px-3 py-1 uppercase tracking-[0.18em] sm:inline-flex">
                Shift+Enter 换行
              </span>
              <span className="hidden rounded-full border border-white/6 bg-[#171c25] px-3 py-1 uppercase tracking-[0.18em] sm:inline-flex">
                {connected ? "Link ready" : "Offline"}
              </span>
            </div>
          </div>

          <div className="min-h-[88px] min-w-0 rounded-[28px] border border-white/6 bg-[#171c25] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:min-h-[98px] sm:px-5">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={connected ? "Type a message" : "等待连接..."}
              disabled={!connected}
              rows={1}
              className="min-h-[88px] max-h-[164px] border-0 bg-transparent px-0 py-0 text-[15px] leading-6 text-text shadow-none placeholder:text-text-4 focus:bg-transparent focus:shadow-none disabled:cursor-not-allowed disabled:opacity-35 sm:min-h-[98px] sm:text-[16px]"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="hidden flex-wrap gap-2 md:flex">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => setInput(reply)}
                  disabled={!connected}
                  className="rounded-full border border-white/6 bg-[#171c25] px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-text-3 transition-all hover:border-white/10 hover:bg-white/5 hover:text-text disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {reply}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-[18px] border border-white/6 bg-[#171c25] text-text-3 hover:bg-white/5 hover:text-text"
                title="Voice"
              >
                <Mic size={16} />
              </Button>

              <Button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                size="icon"
                className={cn(
                  "h-11 w-11 rounded-[18px] transition-transform active:scale-95",
                  canSend ? "bg-[#4da97a] text-white" : "bg-[#2a3140] text-text-4",
                )}
                title="Send"
              >
                <SendHorizontal size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
