'use client';

// React hooks we need:
// useState - stores data that can change (messages, loading state, etc.)
// useEffect - runs code when the component first loads
// useRef - references a DOM element directly (for auto-scrolling)
import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '@/lib/useWindowSize';

// Our data and API functions
import { SESSION_ID, CATEGORY_CARDS, STARTER_QUESTIONS, QUICK_PROMPTS } from '@/lib/constants';
import { sendMessage, clearSession } from '@/lib/api';

// Components we'll build in upcoming steps
// (these will cause errors until we create them — we fix that at the end)
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import ChatInput from '@/components/ChatInput';
import StatusIndicator from '@/components/StatusIndicator';

export default function Home() {

  // ── State ──────────────────────────────────────────────────────
  // messages: array of { role, content, sources, question }
  // role is either 'user' or 'assistant'
  const [messages, setMessages]     = useState([]);

  // isLoading: true while waiting for FastAPI to respond
  // used to show the typing indicator and disable the input
  const [isLoading, setIsLoading]   = useState(false);

  // sidebarOpen: controls whether the slide-in sidebar is visible
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // chatStarted: false = show welcome screen, true = show chat view
  // switches to true the moment the first message is sent
  const [chatStarted, setChatStarted] = useState(false);

  // ── Auto-scroll ref ────────────────────────────────────────────
  // This attaches to an invisible div at the bottom of the message list.
  // Every time messages update, we scroll to it automatically.
  const bottomRef = useRef(null);

  const isMobile = useIsMobile();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── Close sidebar when clicking outside ───────────────────────
  // If sidebar is open and user clicks the main content area,
  // close the sidebar automatically.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarOpen && !e.target.closest('#sidebar') && !e.target.closest('#menu-btn')) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  // ── Send Message ───────────────────────────────────────────────
  const handleSendMessage = async (question) => {
    if (!question.trim() || isLoading) return;

    // Switch from welcome screen to chat view
    setChatStarted(true);

    // Close sidebar if open
    setSidebarOpen(false);

    // Add user message to the list immediately
    // User sees their message appear before FastAPI responds
    setMessages(prev => [...prev, {
      role: 'user',
      content: question,
    }]);

    setIsLoading(true);

    try {
      const data = await sendMessage(question, SESSION_ID);

      // Add assistant response to message list
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        question: question, // stored so feedback knows which question this answer belongs to
      }]);

    } catch (error) {
      // If FastAPI is unreachable or returns an error,
      // show a friendly error message instead of crashing
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Unable to reach the server. Make sure the FastAPI backend is running on port 8000.',
        sources: [],
        question: question,
      }]);
    } finally {
      // Always runs — whether success or error
      setIsLoading(false);
    }
  };

  // ── New Conversation ───────────────────────────────────────────
  const handleNewConversation = async () => {

    if (messages.length > 0) {
      await clearSession(SESSION_ID);
    }
    // Reset all local state back to welcome screen
    setMessages([]);
    setChatStarted(false);
    setSidebarOpen(false);
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg-base)',
      position: 'relative',
    }}>

      {/* ── Sidebar overlay (dark backdrop when sidebar is open) ── */}
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

      {/* ── Sidebar (slides in from left) ── */}
      <div id="sidebar">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSendMessage={handleSendMessage}
          onNewConversation={handleNewConversation}
          prompts={QUICK_PROMPTS}
        />
      </div>

      {/* ── Main content area ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}>

        {/* ── Navbar ── */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 32px',
          borderBottom: '1px solid var(--border-dim)',
          background: 'rgba(8,5,17,0.8)',
          backdropFilter: 'blur(12px)',
          zIndex: 10,
          flexShrink: 0,
        }}>
          {/* Hamburger menu button */}
          <button
            id="menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              width: '38px',
              height: '38px',
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
                // Animate top and bottom lines to form an X when open
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

          {/* Logo — click to start a new conversation */}
          <button
            onClick={handleNewConversation}
            aria-label="Start a new conversation"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
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

          {/* Status indicator (green/red dot) */}
          <StatusIndicator />
        </nav>

        {/* ── Page body — switches between welcome and chat ── */}
        {!chatStarted ? (

          // ── WELCOME SCREEN ────────────────────────────────────
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: isMobile ? '0 16px 32px' : '0 24px 40px',
            position: 'relative',
          }}>

            {/* Background glow effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '700px',
              height: '400px',
              background: 'radial-gradient(ellipse at center top, rgba(124,58,237,0.25) 0%, rgba(124,58,237,0.06) 50%, transparent 70%)',
              pointerEvents: 'none',
            }}/>

            {/* Hero text */}
            <div style={{
              textAlign: 'center',
              marginTop: isMobile ? '32px' : '64px',
              marginBottom: '40px',
              animation: 'fade-up 0.6s ease forwards',
              position: 'relative',
            }}>
              {/* Pill badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: '20px',
                padding: '5px 14px',
                fontSize: '11px',
                color: '#A78BCA',
                marginBottom: '24px',
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
                Niagara University · Admissions Office
              </div>

              {/* Main heading */}
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 5vw, 56px)',
                fontWeight: '700',
                color: '#fff',
                lineHeight: '1.1',
                marginBottom: '16px',
                letterSpacing: '-1px',
              }}>
                Your Tour Guide<br/>
                <span style={{ color: 'var(--gold)' }}>Assistant</span>
              </h1>

              {/* Subheading */}
              <p style={{
                fontSize: '15px',
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

            {/* Search input on welcome screen */}
            <div style={{
              width: '100%',
              maxWidth: '580px',
              marginBottom: '12px',
              animation: 'fade-up 0.6s ease 0.1s forwards',
            }}>
              <ChatInput
                onSend={handleSendMessage}
                isLoading={isLoading}
                placeholder="Ask anything about Niagara University..."
                large
              />
            </div>

            <p style={{
              fontSize: '11px',
              color: 'var(--text-subtle)',
              marginBottom: '48px',
              animation: 'fade-up 0.6s ease 0.15s forwards',
            }}>
              Press Enter to send · Shift+Enter for new line
            </p>

            {/* Category cards */}
            <div style={{
              width: '100%',
              maxWidth: '900px',
              animation: 'fade-up 0.6s ease 0.2s forwards',
            }}>
              <p style={{
                fontSize: '11px',
                color: 'var(--text-subtle)',
                textAlign: 'center',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}>
                Explore by category
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: '14px',
              }}>
                {CATEGORY_CARDS.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleSendMessage(card.question)}
                    style={{
                      background: card.gradient,
                      border: `1px solid ${card.border}`,
                      borderRadius: '16px',
                      padding: '22px 18px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.4)`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Arrow icon top right */}
                    <span style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.3)',
                    }}>↗</span>

                    {/* Category icon */}
                    <span style={{
                      fontSize: '24px',
                      display: 'block',
                      marginBottom: '12px',
                    }}>
                      {card.icon}
                    </span>

                    {/* Card title */}
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#fff',
                      marginBottom: '6px',
                      letterSpacing: '0.02em',
                    }}>
                      {card.title}
                    </div>

                    {/* Card subtitle */}
                    <div style={{
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.4)',
                      lineHeight: '1.5',
                    }}>
                      {card.subtitle}
                    </div>
                  </button>
                ))}
              </div>

              {/* Starter questions below cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: '10px',
                marginTop: '14px',
              }}>
                {STARTER_QUESTIONS.map(({ icon, text }) => (
                  <button
                    key={text}
                    onClick={() => handleSendMessage(text)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(124,58,237,0.2)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
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
                    <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>
                    <span style={{
                      fontSize: '12px',
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

          // ── CHAT VIEW ─────────────────────────────────────────
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            bottomRef={bottomRef}
          />
        )}

        {/* ── Chat input — only shows in active chat view ── */}
        {chatStarted && (
          <div style={{ flexShrink: 0, padding: isMobile ? '0 12px 16px' : '0 24px 20px', }}>
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