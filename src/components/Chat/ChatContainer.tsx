import { useState } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
};

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('https://atum-backend.abishekram596.workers.dev/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + 'dummy-key-1234567890' // Simulate real key usage
        },
        body: JSON.stringify({ message: text, workspaceId: 'default_workspace' })
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

      const data = await response.json();
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "No response generated.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: "Error communicating with Atum edge layer. Ensure backend is running.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface/30 rounded-2xl border border-border/50 overflow-hidden shadow-2xl backdrop-blur-sm relative">
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-4">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>
      <div className="p-4 border-t border-border/50 bg-surface/50 backdrop-blur-md relative z-20">
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
