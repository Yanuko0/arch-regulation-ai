// components/features/InputBar/InputBar.tsx
'use client';
import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Square, Calculator } from 'lucide-react';

interface InputBarProps {
  onSend: (text: string) => void;
  isStreaming?: boolean;
  onStop?: () => void;
  placeholder?: string;
  sendHint?: string;
  disabled?: boolean;
}

export function InputBar({
  onSend,
  isStreaming = false,
  onStop,
  placeholder = '...',
  sendHint = 'Enter',
  disabled = false,
}: InputBarProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="relative w-full" style={{ padding: '10px 15px' }}>
      <div
        className="flex gap-4 items-end w-full glass-card p-3 md:p-4 rounded-[2rem] shadow-xl border-[var(--color-border)] bg-[var(--color-bg-secondary)]/80"
        suppressHydrationWarning={true}>
        {/* 文字輸入區 */}
        <div className="flex-1 relative" style={{ display: 'flex' }}>
          <textarea
            ref={textareaRef}
            id="chat-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={placeholder}
            disabled={disabled || isStreaming}
            rows={1}
            style={{ fontSize: '20px' }}
            className="input-field border-0 bg-transparent px-4 py-4 pr-16 min-h-[56px] max-h-[200px] text-base leading-loose resize-none focus:bg-transparent shadow-none"
          />
          {/* Shift+Enter 提示 */}
          {value.length > 0 && (
            <span className="absolute bottom-4 right-16 text-xs text-[var(--color-text-muted)] pointer-events-none">
              {sendHint}
            </span>
          )}
        </div>

        {/* 送出 / 停止按鈕 */}
        {isStreaming ? (
          <button
            id="stop-stream-btn"
            onClick={onStop}
            className="shrink-0 h-14 w-14 rounded-full flex items-center justify-center
                       bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)]
                       hover:bg-[var(--color-bg-card)] transition-colors shadow-md"
          >
            <Square size={20} fill="currentColor" />
          </button>
        ) : (
          <button
            id="send-message-btn"
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className="shrink-0 h-14 w-14 rounded-full flex items-center justify-center bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] hover:bg-[var(--color-text-secondary)] disabled:opacity-50 disabled:bg-[var(--color-bg-secondary)] disabled:text-[var(--color-text-muted)] transition-colors shadow-md"
          >
            <Send size={22} />
          </button>
        )}
      </div>
    </div>
  );
}
