'use client';

import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '@/lib/useWindowSize';
import { SESSION_ID, CATEGORY_CARDS, STARTER_QUESTIONS, QUICK_PROMPTS } from '@/lib/constants';
import { sendMessage, clearSession } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import ChatInput from '@/components/ChatInput';
import StatusIndicator from '@/components/StatusIndicator';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const bottomRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarOpen && !e.target.closest('#sidebar') && !e.target.closest('#menu-btn')) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  const handleSendMessage = async (question) => {
    if (!question.trim() || isLoading) return;
    setChatStarted(true);
    setSidebarOpen(false);
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setIsLoading(true);

    try {
      const data = await sendMessage(question, SESSION_ID);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        question: question,
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Unable to reach the server. Make sure the FastAPI backend is running on port 8000.',
        sources: [],
        question: question,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = async () => {
    if (messages.length > 0) {
      await clearSession(SESSION_ID);
    }
    setMessages([]);
    setChatStarted(false);
    setSidebarOpen(false);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      height: '100dvh', // dynamic viewport height — accounts for mobile browser bars
      overflow: 'hidden',
      background: 'var(--bg-base)',
      position: 'relative',
    }}>
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 40,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Sidebar */}
      <div id="sidebar">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSendMessage={handleSendMessage}
          onNewConversation={handleNewConversation}
          prompts={QUICK_PROMPTS}
        />
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Navbar */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '14px 16px' : '18px 32px',
          borderBottom: '1px solid var(--border-dim)',
          background: 'rgba(8,5,17,0.8)',
          backdropFilter: 'blur(12px)',
          zIndex: 10,
          flexShrink: 0,
        }}>
          {/* Hamburger */}
          <button
            id="menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              width: isMobile ? '34px' : '38px',
              height: isMobile ? '34px' : '38px',
              borderRadius: '10px',
              border: '1px solid var(--purple-border)',
              background: 'var(--purple-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              cursor: 'pointer',
            }}
          >
            {[0,1,2].map(i => (
              <span key={i} style={{
                width: '14px',
                height: '1.5px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '1px',
                display: 'block',
                transform: sidebarOpen
                  ? i === 0 ? 'rotate(45deg) translate(4px,4px)'
                  : i === 2 ? 'rotate(-45deg) translate(4px,-4px)'
                  : 'scaleX(0)'
                  : 'none',
                transition: 'transform 0.2s ease, opacity 0.2s ease',
                opacity: sidebarOpen && i === 1 ? 0 : 1,
              }}/>
            ))}
          </button>

          {/* Logo */}
          <button
            onClick={handleNewConversation}
            aria-label="Start a new conversation"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: '700',
              color: '#fff',
              letterSpacing: '-0.3px',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'transparent',
              border: 'none',
              padding: '4px 8px',
              cursor: 'pointer',
              borderRadius: '6px',
              transition: 'opacity 0.15s ease, transform 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '0.85';
              e.currentTarget.style.transform = 'translateX(-50%) scale(1.03)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
            }}
          >
            NU<span style={{ color: 'var(--gold)' }}>Guide</span>
          </button>

          <StatusIndicator />
        </nav>

        {/* Page body */}
        {!chatStarted ? (

          // WELCOME SCREEN
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: isMobile ? '0 14px 24px' : '0 24px 40px',
            position: 'relative',
            WebkitOverflowScrolling: 'touch', // smooth scroll on iOS
          }}>
            {/* Background glow */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: isMobile ? '400px' : '700px',
              height: isMobile ? '250px' : '400px',
              background: 'radial-gradient(ellipse at center top, rgba(124,58,237,0.25) 0%, rgba(124,58,237,0.06) 50%, transparent 70%)',
              pointerEvents: 'none',
            }}/>

            {/* Hero text */}
            <div style={{
              textAlign: 'center',
              marginTop: isMobile ? '20px' : '64px',
              marginBottom: isMobile ? '24px' : '40px',
              animation: 'fade-up 0.6s ease forwards',
              position: 'relative',
              padding: isMobile ? '0 4px' : '0',
            }}>
              {/* Pill badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: '20px',
                padding: isMobile ? '4px 12px' : '5px 14px',
                fontSize: isMobile ? '10px' : '11px',
                color: '#A78BCA',
                marginBottom: isMobile ? '16px' : '24px',
                letterSpacing: '0.06em',
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--purple-vivid)',
                  animation: 'pulse-glow 2s ease infinite',
                  display: 'inline-block',
                }}/>
                Niagara University · Admissions
              </div>

              {/* Heading */}
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: isMobile ? 'clamp(28px, 8vw, 36px)' : 'clamp(36px, 5vw, 56px)',
                fontWeight: '700',
                color: '#fff',
                lineHeight: '1.1',
                marginBottom: isMobile ? '12px' : '16px',
                letterSpacing: '-1px',
              }}>
                Your Tour Guide<br/>
                <span style={{ color: 'var(--gold)' }}>Assistant</span>
              </h1>

              {/* Subheading */}
              <p style={{
                fontSize: isMobile ? '13px' : '15px',
                color: 'var(--text-muted)',
                maxWidth: '420px',
                margin: '0 auto',
                lineHeight: '1.7',
                fontWeight: '300',
              }}>
                Ask anything about academic programs, campus life,
                scholarships, or the tour route — instantly.
              </p>
            </div>

            {/* Search input */}
            <div style={{
              width: '100%',
              maxWidth: isMobile ? '100%' : '580px',
              marginBottom: isMobile ? '8px' : '12px',
              animation: 'fade-up 0.6s ease 0.1s forwards',
            }}>
              <ChatInput
                onSend={handleSendMessage}
                isLoading={isLoading}
                placeholder="Ask anything about Niagara University..."
                large
              />
            </div>

            {/* Hint text */}
            {!isMobile && (
              <p style={{
                fontSize: '11px',
                color: 'var(--text-subtle)',
                marginBottom: '48px',
                animation: 'fade-up 0.6s ease 0.15s forwards',
              }}>
                Press Enter to send · Shift+Enter for new line
              </p>
            )}

            {/* Category cards */}
            <div style={{
              width: '100%',
              maxWidth: '900px',
              marginTop: isMobile ? '8px' : '0',
              animation: 'fade-up 0.6s ease 0.2s forwards',
            }}>
              <p style={{
                fontSize: isMobile ? '10px' : '11px',
                color: 'var(--text-subtle)',
                textAlign: 'center',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: isMobile ? '12px' : '16px',
              }}>
                Explore by category
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: isMobile ? '10px' : '14px',
              }}>
                {CATEGORY_CARDS.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleSendMessage(card.question)}
                    style={{
                      background: card.gradient,
                      border: `1px solid ${card.border}`,
                      borderRadius: isMobile ? '12px' : '16px',
                      padding: isMobile ? '16px 12px' : '22px 18px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.4)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Arrow icon */}
                    <span style={{
                      position: 'absolute',
                      top: isMobile ? '10px' : '14px',
                      right: isMobile ? '10px' : '14px',
                      fontSize: isMobile ? '12px' : '14px',
                      color: 'rgba(255,255,255,0.3)',
                    }}>↗</span>

                    {/* Icon */}
                    <span style={{
                      fontSize: isMobile ? '20px' : '24px',
                      display: 'block',
                      marginBottom: isMobile ? '8px' : '12px',
                    }}>
                      {card.icon}
                    </span>

                    {/* Title */}
                    <div style={{
                      fontSize: isMobile ? '12px' : '13px',
                      fontWeight: '600',
                      color: '#fff',
                      marginBottom: '4px',
                      letterSpacing: '0.02em',
                      lineHeight: '1.3',
                    }}>
                      {card.title}
                    </div>

                    {/* Subtitle */}
                    <div style={{
                      fontSize: isMobile ? '10px' : '11px',
                      color: 'rgba(255,255,255,0.4)',
                      lineHeight: '1.4',
                    }}>
                      {card.subtitle}
                    </div>
                  </button>
                ))}
              </div>

              {/* Starter questions */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: isMobile ? '8px' : '10px',
                marginTop: isMobile ? '10px' : '14px',
              }}>
                {STARTER_QUESTIONS.map(({ icon, text }) => (
                  <button
                    key={text}
                    onClick={() => handleSendMessage(text)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(124,58,237,0.2)',
                      borderRadius: isMobile ? '10px' : '12px',
                      padding: isMobile ? '12px 14px' : '14px 16px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: isMobile ? '8px' : '10px',
                      transition: 'border-color 0.2s ease, background 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)';
                      e.currentTarget.style.background = 'rgba(124,58,237,0.08)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    }}
                  >
                    <span style={{ fontSize: isMobile ? '14px' : '16px', flexShrink: 0 }}>{icon}</span>
                    <span style={{
                      fontSize: isMobile ? '11px' : '12px',
                      color: 'rgba(255,255,255,0.5)',
                      lineHeight: '1.5',
                    }}>
                      {text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

        ) : (

          // CHAT VIEW
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            bottomRef={bottomRef}
          />
        )}

        {/* Chat input in active chat */}
        {chatStarted && (
          <div style={{
            flexShrink: 0,
            padding: isMobile ? '0 10px 8px' : '0 24px 20px',
            // Safe area for iPhones with home indicator bar
            paddingBottom: isMobile ? 'max(8px, env(safe-area-inset-bottom))' : '20px',
          }}>
            <ChatInput
              onSend={handleSendMessage}
              isLoading={isLoading}
              placeholder="Ask anything about Niagara University..."
            />
          </div>
        )}
      </div>
    </div>
  );
}