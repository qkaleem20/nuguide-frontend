'use client';

import { useState } from 'react';

export default function Sidebar({
  isOpen,
  onClose,
  onSendMessage,
  onNewConversation,
  prompts,
}) {

  // Tracks which category accordion is currently open
  // null means all are collapsed
  const [openCategory, setOpenCategory] = useState(null);

  const toggleCategory = (category) => {
    setOpenCategory(prev => prev === category ? null : category);
  };

  return (
    <>
      {/* ── Sidebar panel ── */}
      <div
        id="sidebar"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '280px',
          background: 'linear-gradient(180deg, #0F0820 0%, #080511 100%)',
          borderRight: '1px solid rgba(124,58,237,0.2)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',

          // Slide in/out animation
          // When closed: move 280px to the left (off screen)
          // When open: move back to 0 (on screen)
          transform: isOpen ? 'translateX(0)' : 'translateX(-280px)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >

        {/* ── Header ── */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(124,58,237,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: '700',
            color: '#fff',
          }}>
            NU<span style={{ color: 'var(--gold)' }}>Guide</span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: '1px solid rgba(124,58,237,0.3)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease, color 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(124,58,237,0.15)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
            }}
          >
            ✕
          </button>
        </div>

        {/* ── New Conversation button ── */}
        <div style={{ padding: '12px 16px', flexShrink: 0 }}>
          <button
            onClick={onNewConversation}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(124,58,237,0.35)',
              background: 'rgba(124,58,237,0.12)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s ease, border-color 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(124,58,237,0.22)';
              e.currentTarget.style.borderColor = 'rgba(124,58,237,0.6)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(124,58,237,0.12)';
              e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)';
            }}
          >
            {/* Refresh icon built from CSS */}
            <span style={{ fontSize: '14px' }}>↺</span>
            New Conversation
          </button>
        </div>

        {/* ── Quick prompts ── */}
        {/* flex:1 makes this section take all remaining height */}
        {/* overflowY:auto adds a scrollbar only when needed */}
        <nav style={{
          flex: 1,
          overflowY: 'auto',
          padding: '4px 12px 12px',
        }}>
          {Object.entries(prompts).map(([category, questions]) => (
            <div key={category} style={{ marginBottom: '2px' }}>

              {/* Category header button */}
              <button
                onClick={() => toggleCategory(category)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 8px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(124,58,237,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.45)',
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                }}>
                  {category}
                </span>

                {/* Chevron rotates when category is open */}
                <span style={{
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.3)',
                  transition: 'transform 0.2s ease',
                  transform: openCategory === category
                    ? 'rotate(180deg)'
                    : 'rotate(0deg)',
                  display: 'inline-block',
                }}>
                  ▾
                </span>
              </button>

              {/* Prompt list — only renders when category is open */}
              {openCategory === category && (
                <div style={{
                  paddingLeft: '8px',
                  paddingBottom: '4px',
                }}>
                  {questions.map((question) => (
                    <button
                      key={question}
                      onClick={() => {
                        onSendMessage(question);
                        onClose();
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '7px 10px',
                        borderRadius: '7px',
                        border: 'none',
                        background: 'transparent',
                        color: 'rgba(255,255,255,0.45)',
                        fontSize: '12px',
                        lineHeight: '1.5',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease, color 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(124,58,237,0.12)';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                      }}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* ── Footer — contact info ── */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid rgba(124,58,237,0.15)',
          flexShrink: 0,
        }}>
          <div style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.25)',
            lineHeight: '1.8',
            letterSpacing: '0.02em',
          }}>
            <div style={{
              fontSize: '10px',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.35)',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              Quick contacts
            </div>
            Sara Villnave · ext. 8714<br />
            Alexis Kadlecik · ext. 8713<br />
            Admissions · 716-286-8700<br />
            Graduate Studies · 716-286-7360
          </div>
        </div>
      </div>
    </>
  );
}