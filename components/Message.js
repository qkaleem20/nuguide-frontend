'use client';

import { useState } from 'react';
import SourceTag from './SourceTag';
import { submitFeedback } from '@/lib/api';
import { SESSION_ID } from '@/lib/constants';

export default function Message({ message, isMobile }) {

  // Controls whether the sources panel is expanded or collapsed
  const [showSources, setShowSources] = useState(false);

  // Tracks whether this message has received feedback
  // null = no feedback yet, 'positive' or 'negative' after clicking
  const [feedbackGiven, setFeedbackGiven] = useState(null);

  // ── Feedback handler ─────────────────────────────────────────
  const handleFeedback = async (rating) => {
    // Prevent double-clicking — once feedback is given, it's locked
    if (feedbackGiven) return;
    setFeedbackGiven(rating);
    await submitFeedback(
      message.question || '',
      message.content,
      rating,
      SESSION_ID
    );
  };

  // ── User message ─────────────────────────────────────────────
  // Simple purple bubble aligned to the right
  if (message.role === 'user') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '16px',
        paddingRight: '4px',
        animation: 'fade-up 0.3s ease forwards',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #6D28D9, #7C3AED)',
          color: '#fff',
          padding: '12px 18px',
          borderRadius: '18px 18px 4px 18px',
          maxWidth: isMobile ? '88%' : '65%',
          fontSize: '14px',
          lineHeight: '1.6',
          fontWeight: '400',
          boxShadow: '0 4px 16px rgba(109,40,217,0.3)',
        }}>
          {message.content}
        </div>
      </div>
    );
  }

  // ── Assistant message ────────────────────────────────────────
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-start',
      marginBottom: '8px',
      paddingLeft: '4px',
      animation: 'fade-up 0.3s ease forwards',
    }}>
      <div style={{ maxWidth: isMobile ? '96%' : '75%%', width: '100%' }}>

        {/* Row: avatar + bubble */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}>

          {/* NG avatar */}
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7C3AED, #D4A017)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: '600',
            color: '#fff',
            marginTop: '2px',
          }}>
            NG
          </div>

          {/* Message bubble */}
          <div style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: '4px 18px 18px 18px',
            padding: '14px 18px',
            fontSize: '14px',
            lineHeight: '1.75',
            color: 'rgba(255,255,255,0.88)',
            fontWeight: '300',
          }}>
            {/* Message text — preserves line breaks from the API response */}
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {message.content}
            </div>
          </div>
        </div>

        {/* ── Controls row: sources toggle + feedback ── */}
        {/* Sits below the bubble, indented to align with bubble left edge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '8px',
          paddingLeft: '38px', // aligns with bubble (28px avatar + 10px gap)
          paddingRight: '4px',
        }}>

          {/* Sources toggle button */}
          {message.sources && message.sources.length > 0 && (
            <button
              onClick={() => setShowSources(!showSources)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                color: showSources
                  ? 'rgba(167,139,202,0.9)'
                  : 'rgba(255,255,255,0.25)',
                transition: 'color 0.2s ease',
                padding: '2px 0',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'rgba(167,139,202,0.9)';
              }}
              onMouseLeave={e => {
                if (!showSources) {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.25)';
                }
              }}
            >
              {/* Chevron rotates when sources are open */}
              <span style={{
                display: 'inline-block',
                transform: showSources ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                fontSize: '9px',
              }}>
                ▾
              </span>
              {message.sources.length} source{message.sources.length !== 1 ? 's' : ''}
            </button>
          )}

          {/* Feedback buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginLeft: 'auto',
          }}>
            {feedbackGiven ? (
              // After feedback is given — show a thank you confirmation
              <span style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.25)',
              }}>
                {feedbackGiven === 'positive' ? '👍' : '👎'} Thanks
              </span>
            ) : (
              // Before feedback — show thumbs up and thumbs down buttons
              <>
                <button
                  onClick={() => handleFeedback('positive')}
                  title="Helpful"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.3)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)';
                    e.currentTarget.style.color = '#22C55E';
                    e.currentTarget.style.background = 'rgba(34,197,94,0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.3)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  👍
                </button>

                <button
                  onClick={() => handleFeedback('negative')}
                  title="Not helpful"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.3)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)';
                    e.currentTarget.style.color = '#EF4444';
                    e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.3)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  👎
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Sources list ── */}
        {/* Only renders when showSources is true */}
        {showSources && message.sources && (
          <div style={{
            paddingLeft: '38px',
            marginTop: '8px',
            display: 'flex',
            flexWrap: 'wrap',
            animation: 'fade-up 0.2s ease forwards',
          }}>
            {message.sources.map((source, i) => (
              <SourceTag key={i} source={source} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}