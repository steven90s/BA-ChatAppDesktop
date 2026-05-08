import { useState } from "react";
import { ArrowRight, Globe2, LockKeyhole, ScanSearch, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface Props {
  onStart: (nickname: string, port: number) => Promise<void>;
}

export default function SetupScreen({ onStart }: Props) {
  const [nickname, setNickname] = useState("");
  const [port, setPort] = useState("9000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!nickname.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      await onStart(nickname.trim(), parseInt(port, 10) || 9000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "启动失败，请检查端口和网络状态";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="drag-region h-[60px] shrink-0 border-b border-line" />

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-10">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(37,192,122,0.12)_0%,transparent_68%)] blur-3xl" />

        <div className="relative w-full max-w-[980px] overflow-hidden rounded-[30px] border border-line-hard bg-base-subtle shadow-[0_30px_90px_rgba(0,0,0,0.24)]">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="border-b border-line px-8 py-8 lg:border-b-0 lg:border-r">
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-inset px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-3">
                <span className="h-1.5 w-1.5 rounded-full bg-green" />
                Direct LAN chat
              </div>

              <div className="mt-8 max-w-[440px]">
                <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-line-hard bg-accent-dim shadow-[0_16px_40px_rgba(37,192,122,0.14)]">
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-accent"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>

                <h1 className="mt-6 text-[28px] font-bold tracking-tight text-text">
                  更安静，也更有质感的局域网聊天
                </h1>
                <p className="mt-4 text-[13px] leading-relaxed text-text-3">
                  启动后会自动在局域网内发现对方设备，端到端直连，不经过任何服务器。这个首页会先帮你建立一个更清晰的第一次使用体验。
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: ScanSearch,
                    title: "Auto discover",
                    desc: "自动发现设备",
                  },
                  {
                    icon: Globe2,
                    title: "P2P only",
                    desc: "纯直连传输",
                  },
                  {
                    icon: LockKeyhole,
                    title: "Encrypted",
                    desc: "消息加密传输",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="rounded-[18px] border border-line bg-inset px-4 py-4"
                  >
                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-4">
                      <Icon size={12} className="text-accent" />
                      <span>{title}</span>
                    </div>
                    <div className="mt-2 text-[12px] text-text-2">{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-8 py-8">
              <div className="max-w-[360px]">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-4">
                  Start session
                </div>
                <h2 className="mt-3 text-[22px] font-bold tracking-tight text-text">
                  填一下昵称和端口
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-text-3">
                  这个昵称会显示在对方设备上。端口建议保持默认，除非你在局域网里已经有冲突。
                </p>

                <Card className="mt-6 border-line/70 bg-panel/80">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-[16px]">
                      <Sparkles size={14} className="text-accent" />
                      Session setup
                    </CardTitle>
                    <CardDescription>
                      先启动一个监听端口，然后局域网里的另一台设备会自动看到它。
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-text-4">
                        昵称
                      </label>
                      <Input
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        placeholder="你的名字"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-text-4">
                        端口
                      </label>
                      <Input
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        placeholder="9000"
                        inputMode="numeric"
                        className="font-mono"
                      />
                    </div>

                    <Separator />

                    {error ? (
                      <div className="rounded-2xl border border-red/20 bg-red/10 px-4 py-3 text-[12px] text-red">
                        {error}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-line bg-inset/60 px-4 py-3 text-[12px] leading-relaxed text-text-3">
                        建议优先使用默认端口 `9000`，如果局域网里已经有冲突，再换到别的端口。
                      </div>
                    )}

                    <Button
                      onClick={handleSubmit}
                      disabled={loading || !nickname.trim()}
                      size="lg"
                      className="w-full rounded-2xl"
                    >
                      {loading ? "启动中..." : "启动聊天"}
                      <ArrowRight size={16} />
                    </Button>

                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-text-4">
                      <span>Press Enter to continue</span>
                      <span className="flex items-center gap-1">
                        <Globe2 size={12} />
                        Local only
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
