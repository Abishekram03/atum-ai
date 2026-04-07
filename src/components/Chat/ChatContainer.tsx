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

    // Simulate network delay and response
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I am Atum's logic engine. This is a simulated response indicating that the intelligence layer is actively processing your message.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMsg]);
      setIsLoading(false);
    }, 1500);
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
