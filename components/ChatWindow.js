'use client';

import Message from './Message';
import TypingIndicator from './TypingIndicator';
import { useIsMobile } from '@/lib/useWindowSize';

export default function ChatWindow({
  messages,
  isLoading,
  onSendMessage,
  bottomRef,
}) {
  const isMobile = useIsMobile();

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      // More padding on desktop, tighter on mobile
      padding: isMobile ? '16px 12px' : '24px 32px',
      position: 'relative',
    }}>

      {/* ── Background glow — subtle, doesn't distract from chat ── */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '300px',
        background: 'radial-gradient(ellipse at center top, rgba(124,58,237,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        flexShrink: 0,
      }}/>

      {/* ── Message list ── */}
      <div style={{
        flex: 1,
        maxWidth: isMobile ? '100%' : '760px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Render each message */}
        {messages.map((message, index) => (
          <Message
            key={index}
            message={message}
            isMobile={isMobile}
          />
        ))}

        {/* Typing indicator while waiting for response */}
        {isLoading && <TypingIndicator />}

        {/* Invisible div at the bottom — scrolled to automatically */}
        <div ref={bottomRef} style={{ height: '1px' }} />
      </div>
    </div>
  );
}