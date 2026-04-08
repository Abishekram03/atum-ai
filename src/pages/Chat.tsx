import ChatContainer from "../components/Chat/ChatContainer";
import type { Id } from "../../convex/_generated/dataModel";

interface ChatProps {
  sessionId?: Id<"sessions"> | null;
  onNewSession?: (sessionId: Id<"sessions">) => void;
}

export default function Chat({ sessionId, onNewSession }: ChatProps) {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#262624]">
      <ChatContainer sessionId={sessionId} onNewSession={onNewSession} />
    </div>
  );
}
