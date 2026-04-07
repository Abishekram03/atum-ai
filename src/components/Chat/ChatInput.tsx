import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Send, Command } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-indigo-500/20 rounded-xl blur-lg transition-opacity opacity-0 group-focus-within:opacity-100" />
      <div className="relative flex items-center glass-panel px-4 py-3 rounded-xl border border-border/80 focus-within:border-primary/50 transition-colors bg-surface/80">
        <div className="pl-1 pr-3 text-text-muted border-r border-border/80 mr-3 flex flex-col items-center">
          <Command size={14} className="opacity-50" />
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Query the Atum intelligence layer..."
          className="flex-1 bg-transparent border-none outline-none text-text placeholder-text-muted/60 text-[15px] disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="ml-3 p-2 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary text-white transition-all shadow-[0_0_10px_rgba(59,130,246,0.3)] disabled:shadow-none"
        >
          <Send size={16} className={text.trim() && !disabled ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
        </button>
      </div>
    </div>
  );
}
