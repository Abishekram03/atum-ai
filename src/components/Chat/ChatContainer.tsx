import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id, Doc } from "../../../convex/_generated/dataModel";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
};

type SupportedModel = "llama-3-8b-instruct" | "gemma-4-26b-a4b-it";

interface ChatContainerProps {
  sessionId?: Id<"sessions"> | null;
  onNewSession?: (id: Id<"sessions">) => void;
}

export default function ChatContainer({
  sessionId,
  onNewSession,
}: ChatContainerProps) {
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Real database list if session exists
  const dbMessages = useQuery(
    api.messages.listBySession,
    sessionId ? { sessionId } : "skip",
  );
  const createSession = useMutation(api.sessions.create);
  const saveMessage = useMutation(api.messages.save);

  // Sync DB messages to local when session changes
  useEffect(() => {
    if (sessionId) {
      if (dbMessages === undefined) {
        // Keep optimistic messages visible while first load for a just-created session is in flight.
        if (!isLoading) {
          setLocalMessages([]);
        }
        return;
      }

      setLocalMessages(
        dbMessages.map((m: Doc<"messages">) => ({
          id: m._id,
          role: m.role,
          content: m.content,
          timestamp: m.createdAt,
        })),
      );
    } else {
      setLocalMessages([]); // New chat
    }
  }, [sessionId, dbMessages, isLoading]);

  const handleSendMessage = async (text: string, model: SupportedModel) => {
    if (!text.trim() || isLoading) return;

    let targetSessionId = sessionId;

    // If no session exists, create one!
    if (!targetSessionId) {
      targetSessionId = await createSession({
        name: text.substring(0, 30) + "...",
      });
      if (onNewSession) onNewSession(targetSessionId);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setLocalMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      await saveMessage({
        sessionId: targetSessionId,
        role: "user",
        content: text,
      });

      const backendUrl =
        import.meta.env.VITE_BACKEND_URL ||
        "https://atum-backend.abishekram596.workers.dev";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-product-id": "customer-support-tool",
      };
      const response = await fetch(`${backendUrl}/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: text,
          model,
          sessionId: targetSessionId,
          persistToConvex: false,
        }),
      });

      if (!response.ok) throw new Error(`API Error`);

      const data = await response.json();

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "No response generated.",
        timestamp: Date.now(),
      };

      await saveMessage({
        sessionId: targetSessionId,
        role: "assistant",
        content: botMsg.content,
      });

      setLocalMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "system",
        content:
          "Error communicating with Atum edge layer. Ensure backend is running.",
        timestamp: Date.now(),
      };
      setLocalMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#262624] w-full">
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-4">
        {localMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <h1 className="text-3xl font-serif font-light text-[#C2C0B6] mb-2 text-center">
              How can I help you today?
            </h1>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full">
            <MessageList messages={localMessages} isLoading={isLoading} />
          </div>
        )}
      </div>
      <div className="p-4 relative z-20 w-full max-w-4xl mx-auto">
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
