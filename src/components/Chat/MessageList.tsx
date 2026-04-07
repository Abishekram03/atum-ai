import { useEffect, useRef } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import MessageItem from './MessageItem';
import type { Message } from './ChatContainer';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-out fade-in duration-700">
        <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.15)] relative">
          <Sparkles className="text-primary w-8 h-8" />
        </div>
        <h3 className="text-xl font-medium text-text mb-2">Systems Ready</h3>
        <p className="text-text-muted max-w-sm mx-auto leading-relaxed">
          The internal intelligence layer is standing by. Type a prompt below to initialize a session with the generation engine.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-2">
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
      {isLoading && (
        <div className="flex items-start space-x-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0 relative overflow-hidden mt-1 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Bot size={16} className="text-primary relative z-10" />
          </div>
          <div className="glass-panel px-5 py-4 rounded-2xl rounded-tl-sm flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
      <div ref={bottomRef} className="h-2" />
    </div>
  );
}
