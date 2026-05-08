import { useChat } from "./hooks/useChat";
import { useTheme } from "./hooks/useTheme";
import SetupScreen from "./components/SetupScreen";
import TitleBar from "./components/TitleBar";
import NavRail from "./components/NavRail";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import FloatingInput from "./components/FloatingInput";

function App() {
  const { theme, toggle } = useTheme();
  const chat = useChat();
  const lastLog = chat.logs[chat.logs.length - 1] ?? "";
  const hasError = lastLog.includes("[错误]") || lastLog.includes("失败");
  const statusLine = chat.connected
    ? "Online"
    : hasError
      ? "Port issue"
      : "Scanning";
  const statusDetail = chat.connected
    ? "Connected and ready to chat"
    : hasError
      ? "Check the listening port"
      : "Looking for peers on the LAN";

  if (!chat.started) {
    return (
      <div className="relative h-screen overflow-hidden bg-base text-text">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,192,122,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_24%),linear-gradient(180deg,var(--color-base)_0%,var(--color-base-inset)_100%)]" />
        <div className="relative h-full p-1.5 sm:p-2.5 lg:p-3.5 xl:p-4">
          <div className="h-full overflow-hidden rounded-[28px] border border-white/8 bg-[#11151c] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
            <SetupScreen onStart={chat.startChat} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden bg-base text-text">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,192,122,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_24%),linear-gradient(180deg,var(--color-base)_0%,var(--color-base-inset)_100%)]" />
      <div className="relative h-full p-1.5 sm:p-2.5 lg:p-3.5 xl:p-4">
        <div className="flex h-full min-h-0 overflow-hidden rounded-[28px] border border-white/8 bg-[#11151c] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[28px] bg-[#151922]">
            <TitleBar
              theme={theme}
              onToggleTheme={toggle}
              connected={chat.connected}
              statusText={statusLine}
            />

            <div className="grid flex-1 min-h-0 grid-cols-[clamp(68px,5vw,88px)_clamp(260px,23vw,360px)_minmax(0,1fr)] gap-0 px-1.5 sm:px-2.5 lg:px-3 pb-1.5 sm:pb-2.5 lg:pb-3">
              <NavRail nickname={chat.nickname} />
              <Sidebar
                nickname={chat.nickname}
                connected={chat.connected}
                peers={chat.peers}
                messages={chat.messages}
                statusLine={statusDetail}
              />

              <div className="relative flex min-w-0 flex-1 flex-col min-h-0 overflow-hidden rounded-[28px] border border-white/6 bg-[#171c25]">
                <ChatArea
                  nickname={chat.nickname}
                  connected={chat.connected}
                  messages={chat.messages}
                  statusText={statusDetail}
                  logs={chat.logs}
                  peerTyping={chat.peerTyping}
                />
                <FloatingInput
                  connected={chat.connected}
                  sendFeedback={chat.sendFeedback}
                  onSend={chat.sendMessage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
