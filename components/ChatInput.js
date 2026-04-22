'use client';

import { useRef, useEffect } from 'react';
import { useIsMobile } from '@/lib/useWindowSize';

export default function ChatInput({ onSend, isLoading, placeholder, large }) {
  const textareaRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Don't auto-focus on mobile — it pops up the keyboard immediately
    // which is annoying on the welcome screen
    if (!isMobile) {
      textareaRef.current?.focus();
    }
  }, [isMobile]);

  const handleInput = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 140) + 'px';
  };

  const handleSend = () => {
    const value = textareaRef.current?.value.trim();
    if (!value || isLoading) return;
    onSend(value);
    textareaRef.current.value = '';
    textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const containerPadding = large
    ? (isMobile ? '14px 14px' : '18px 20px')
    : (isMobile ? '10px 12px' : '14px 20px');

  const textareaSize = large
    ? (isMobile ? '14px' : '15px')
    : '14px';

  return (
    <div style={{
      padding: large ? '0' : (isMobile ? '8px 0 12px' : '12px 24px 20px'),
      background: 'transparent',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: isMobile ? '8px' : '12px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: large ? '14px' : '14px',
        padding: containerPadding,
        transition: 'border-color 0.2s ease, background 0.2s ease',
      }}>
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
          }}
        />

        <button
          onClick={handleSend}
          disabled={isLoading}
          title="Send message"
          style={{
            width: isMobile ? '34px' : '36px',
            height: isMobile ? '34px' : '36px',
            borderRadius: '10px',
            border: 'none',
            background: isLoading
              ? 'rgba(124,58,237,0.2)'
              : 'linear-gradient(135deg, #7C3AED, #9333EA)',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.2s ease, transform 0.1s ease',
          }}
          onMouseEnter={e => {
            if (!isLoading) e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseDown={e => {
            if (!isLoading) e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onMouseUp={e => {
            if (!isLoading) e.currentTarget.style.transform = 'scale(1.05)';
          }}
        >
          {isLoading ? (
            <div style={{
              width: '14px',
              height: '14px',
              border: '2px solid rgba(255,255,255,0.2)',
              borderTopColor: 'rgba(255,255,255,0.7)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}/>
          ) : (
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

      {/* Hide hint text on mobile — wastes space, mobile users know how Enter works */}
      {!large && !isMobile && (
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