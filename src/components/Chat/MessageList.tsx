import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
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
        <div className="flex items-start w-full animate-in fade-in slide-in-from-bottom-2">
          <div className="py-2 flex items-center space-x-1.5 opacity-60">
            <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
      <div ref={bottomRef} className="h-2" />
    </div>
  );
}
