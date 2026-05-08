import { Bell, Layers3, MessageSquareText, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Props {
  nickname: string;
}

const navItems = [
  { icon: MessageSquareText, active: true, label: "Chats" },
  { icon: Layers3, active: false, label: "Spaces" },
  { icon: Bell, active: false, label: "Alerts" },
];

export default function NavRail({ nickname }: Props) {
  const initial = nickname.charAt(0).toUpperCase() || "S";

  return (
    <aside className="flex h-full w-[clamp(72px,6vw,88px)] shrink-0 flex-col items-center rounded-[28px] border border-white/6 bg-[#10151c] px-0 py-0">
      <div className="flex h-[72px] w-full items-center justify-center pt-2">
        <Avatar className="h-12 w-12 border-white/6 bg-[#171c25] sm:h-14 sm:w-14">
          <AvatarFallback className="bg-transparent text-[16px] text-white">
            {initial}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/6 bg-[#161b24] text-accent shadow-[0_10px_24px_rgba(0,0,0,0.20)] sm:h-12 sm:w-12">
        <MessageSquareText size={18} />
      </div>

      <div className="mt-1 flex flex-1 flex-col items-center gap-1.5">
        {navItems.map(({ icon: Icon, active, label }) => (
          <button
            key={label}
            className={cn(
              "group relative flex h-11 w-11 items-center justify-center rounded-[18px] border transition-all sm:h-12 sm:w-12",
              active
                ? "border-white/10 bg-[#1a2130] text-accent shadow-[0_10px_24px_rgba(0,0,0,0.25)]"
                : "border-transparent bg-transparent text-text-4 hover:border-white/8 hover:bg-white/4 hover:text-text",
            )}
            title={label}
            type="button"
          >
            <Icon size={18} />
            {active && <span className="absolute -left-3 h-7 w-1 rounded-full bg-accent" />}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="mt-auto mb-2 flex h-11 w-11 items-center justify-center rounded-[18px] border border-transparent text-text-4 hover:border-white/8 hover:bg-white/4 hover:text-text sm:h-12 sm:w-12"
        title="Settings"
      >
        <Settings size={18} />
      </button>
    </aside>
  );
}
