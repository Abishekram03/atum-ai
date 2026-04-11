import { useState, useRef, useEffect, useCallback } from "react";
import type { KeyboardEvent } from "react";
import { ArrowUp, Bot, Check, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

type SupportedModel = "llama-3-8b-instruct" | "gemma-4-26b-a4b-it";

interface ChatInputProps {
  onSend: (text: string, model: SupportedModel) => void;
  disabled: boolean;
  placeholder?: string;
}

const MODEL_OPTIONS: Array<{ id: SupportedModel; label: string }> = [
  { id: "llama-3-8b-instruct", label: "Llama 3 8B" },
  { id: "gemma-4-26b-a4b-it", label: "Gemma 4 26B" },
];

export default function ChatInput({
  onSend,
  disabled,
  placeholder = "Reply...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState<SupportedModel>(
    "llama-3-8b-instruct",
  );
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const maxHeight = 120;
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        maxHeight,
      )}px`;
    }
  }, [message]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        modelMenuRef.current &&
        !modelMenuRef.current.contains(event.target as Node)
      ) {
        setIsModelMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSend = useCallback(() => {
    if (disabled || !message.trim()) return;

    onSend(message, selectedModel);
    setMessage("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [message, disabled, onSend, selectedModel]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const canSend = message.trim() && !disabled;
  const selectedModelLabel =
    MODEL_OPTIONS.find((option) => option.id === selectedModel)?.label ||
    "Llama 3 8B";

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
        <div className="flex items-center justify-between w-full px-3 pb-2 mt-auto">
          <div className="relative" ref={modelMenuRef}>
            <button
              type="button"
              onClick={() => setIsModelMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-[#2B2B29] px-2.5 py-1.5 text-xs text-zinc-200 hover:border-zinc-600 hover:bg-[#323230] transition"
              title="Select model"
            >
              <Bot className="h-3.5 w-3.5 text-zinc-400" />
              <span>{selectedModelLabel}</span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
            </button>

            {isModelMenuOpen && (
              <div className="absolute bottom-11 left-0 z-30 min-w-[180px] rounded-lg border border-zinc-700 bg-[#1D1D1B] p-1 shadow-xl">
                {MODEL_OPTIONS.map((option) => {
                  const isSelected = selectedModel === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(option.id);
                        setIsModelMenuOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs text-zinc-200 hover:bg-zinc-800/80 transition"
                    >
                      <span>{option.label}</span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-[#C4A86E]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Button
            size="icon"
            className={cn(
              "h-8 w-8 p-0 flex-shrink-0 rounded-lg transition-all",
              canSend
                ? "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-900/20"
                : "bg-zinc-700/50 text-zinc-500 cursor-not-allowed",
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
