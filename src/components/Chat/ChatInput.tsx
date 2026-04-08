import { useState, useRef, useEffect, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, disabled, placeholder = "Query the Atum intelligence layer..." }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const maxHeight = 120;
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        maxHeight
      )}px`;
    }
  }, [message]);

  const handleSend = useCallback(() => {
    if (disabled || !message.trim()) return;

    onSend(message);
    setMessage("");
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [message, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const canSend = message.trim() && !disabled;

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="bg-[#30302E] border border-zinc-700/50 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.2)] items-end gap-2 min-h-[100px] flex flex-col transition-all focus-within:border-zinc-500/50">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 min-h-[60px] w-full p-4 focus-within:border-none focus:outline-none focus:border-none border-none outline-none focus-within:ring-0 focus-within:ring-offset-0 max-h-[120px] resize-none border-0 bg-transparent text-zinc-100 shadow-none focus-visible:ring-0 placeholder:text-zinc-500 text-sm sm:text-base custom-scrollbar"
          rows={1}
        />
        <div className="flex items-center justify-end w-full px-3 pb-2 mt-auto">
          <Button
            size="icon"
            className={cn(
              "h-8 w-8 p-0 flex-shrink-0 rounded-lg transition-all",
              canSend
                ? "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-900/20"
                : "bg-zinc-700/50 text-zinc-500 cursor-not-allowed"
            )}
            onClick={handleSend}
            disabled={!canSend}
            title="Send query"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
