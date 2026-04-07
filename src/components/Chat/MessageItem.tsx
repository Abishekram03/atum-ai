import { User, Bot } from 'lucide-react';
import type { Message } from './ChatContainer';

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex items-start space-x-4 ${isUser ? 'flex-row-reverse space-x-reverse' : ''} animate-in fade-in slide-in-from-bottom-2`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-lg ${
        isUser 
          ? 'bg-surface border border-border' 
          : 'bg-primary/10 border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
      }`}>
        {isUser ? <User size={16} className="text-text-muted" /> : <Bot size={16} className="text-primary" />}
      </div>
      
      <div className={`px-5 py-3.5 rounded-2xl max-w-[80%] leading-relaxed ${
        isUser 
          ? 'bg-primary text-white rounded-tr-sm shadow-[0_4px_20px_rgba(59,130,246,0.3)]' 
          : 'glass-panel text-text rounded-tl-sm'
      }`}>
        <p className="text-[15px]">{message.content}</p>
        <span className={`text-[10px] block mt-2 opacity-50 ${isUser ? 'text-blue-100 text-right' : 'text-text-muted'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
