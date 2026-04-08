import type { Message } from './ChatContainer';

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex items-start w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
      <div className={`max-w-[95%] sm:max-w-[90%] leading-relaxed ${
        isUser 
          ? 'px-5 py-3.5 bg-[#2A2A2A] text-zinc-100 rounded-2xl shadow-sm' 
          : 'py-1 text-zinc-200 w-full'
      }`}>
        <div className="text-[19px] whitespace-pre-wrap font-serif font-normal antialiased tracking-wide" dangerouslySetInnerHTML={isUser ? undefined : { __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}}>
           {isUser ? message.content : undefined}
        </div>
      </div>
    </div>
  );
}
