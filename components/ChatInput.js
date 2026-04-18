'use client';

import { useRef, useEffect } from 'react';

export default function ChatInput({ onSend, isLoading, placeholder, large }) {

  // useRef gives us direct access to the textarea DOM element
  // We need this to manually control its height and focus
  const textareaRef = useRef(null);

  // Auto-focus the input when the component first appears
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // ── Auto-resize handler ──────────────────────────────────────
  // Called every time the user types
  // Resets height to 'auto' first so it can shrink when text is deleted
  // Then sets it to the scroll height so it grows to fit the content
  // Max height of 140px prevents it from taking over the screen
  const handleInput = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 140) + 'px';
  };

  // ── Send handler ─────────────────────────────────────────────
  const handleSend = () => {
    const value = textareaRef.current?.value.trim();
    if (!value || isLoading) return;

    onSend(value);

    // Clear the input and reset its height after sending
    textareaRef.current.value = '';
    textareaRef.current.style.height = 'auto';
  };

  // ── Keyboard handler ─────────────────────────────────────────
  // Enter sends the message
  // Shift+Enter adds a new line (default textarea behavior)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // stops the default Enter newline behavior
      handleSend();
    }
  };

  // ── Size variants ────────────────────────────────────────────
  // large=true is used on the welcome screen (bigger, more prominent)
  // large=false (default) is used in the active chat view
  const containerPadding = large ? '18px 20px' : '14px 20px';
  const textareaSize = large ? '15px' : '14px';

  return (
    <div style={{
      padding: large ? '0' : '12px 24px 20px',
      background: large ? 'transparent' : 'transparent',
    }}>
      {/* Input wrapper — the visible rounded container */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '12px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: large ? '16px' : '16px',
        padding: containerPadding,
        transition: 'border-color 0.2s ease, background 0.2s ease',
        // Focus-within applies styles when any child is focused
        // This makes the whole container highlight when typing
      }}
      onFocus={() => {}}
      onBlur={() => {}}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder={placeholder || 'Ask anything about Niagara University...'}
          rows={1}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: textareaSize,
            lineHeight: '1.6',
            color: isLoading
              ? 'rgba(255,255,255,0.3)'
              : 'rgba(255,255,255,0.88)',
            fontFamily: 'var(--font-body)',
            fontWeight: '300',
            maxHeight: '140px',
            overflowY: 'auto',
            // Placeholder color via CSS — can't be done inline in React
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={isLoading}
          title="Send message"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: 'none',
            background: isLoading
              ? 'rgba(124,58,237,0.2)'           // dimmed when loading
              : 'linear-gradient(135deg, #7C3AED, #9333EA)', // vivid when ready
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.2s ease, transform 0.1s ease',
          }}
          onMouseEnter={e => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseDown={e => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'scale(0.95)';
            }
          }}
          onMouseUp={e => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
        >
          {/* Send arrow icon — built with pure CSS border trick */}
          {isLoading ? (
            // Spinning circle when loading
            <div style={{
              width: '14px',
              height: '14px',
              border: '2px solid rgba(255,255,255,0.2)',
              borderTopColor: 'rgba(255,255,255,0.7)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}/>
          ) : (
            // Arrow icon when ready
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
        </button>
      </div>

      {/* Hint text — only shown in chat view, not welcome screen */}
      {!large && (
        <p style={{
          fontSize: '11px',
          color: 'var(--text-subtle)',
          textAlign: 'center',
          marginTop: '8px',
        }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      )}
    </div>
  );
}