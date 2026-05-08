import { getCurrentWindow } from "@tauri-apps/api/window";
import { MoonStar, SunMedium } from "lucide-react";
import type { Theme } from "../hooks/useTheme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isPreviewRuntime } from "@/lib/previewMocks";

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  connected: boolean;
  statusText: string;
}

export default function TitleBar({
  theme,
  onToggleTheme,
  connected,
  statusText,
}: Props) {
  const appWindow = getCurrentWindow();

  return (
    <div
      data-tauri-drag-region
      className="drag-region flex h-[54px] shrink-0 items-center justify-between border-b border-white/6 bg-[#11151c] px-3 sm:h-[56px] sm:px-4 lg:px-5 select-none"
      onDoubleClick={() => {
        if (!isPreviewRuntime()) {
          void appWindow.toggleMaximize();
        }
      }}
    >
      <div className="no-drag flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/6 bg-[#171c25] text-accent shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>

        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-text-2">
            LAN Chat
          </div>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-text-3">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                connected ? "bg-green shadow-[0_0_0_4px_rgba(52,211,153,0.10)]" : "bg-text-4",
              )}
              style={connected ? undefined : { animation: "pulse-dot 2s ease infinite" }}
            />
            <span className="truncate max-w-[180px] sm:max-w-[240px] lg:max-w-[280px]">{statusText}</span>
          </div>
        </div>
      </div>

      <div className="no-drag flex min-w-[88px] items-center justify-end gap-2">
        <Badge
          variant={connected ? "success" : "secondary"}
          className="hidden rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] md:inline-flex"
        >
          {connected ? "Connected" : "Scanning"}
        </Badge>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          className="rounded-2xl border border-white/6 bg-[#171c25] text-text-3 hover:border-white/10 hover:bg-white/5 hover:text-text"
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? <MoonStar size={16} /> : <SunMedium size={16} />}
        </Button>
      </div>
    </div>
  );
}
