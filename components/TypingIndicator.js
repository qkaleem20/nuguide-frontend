export default function TypingIndicator() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-start',
      marginBottom: '16px',
      paddingLeft: '4px',
    }}>

      {/* Avatar circle — matches the assistant message avatar */}
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
        marginRight: '10px',
        marginTop: '2px',
      }}>
        NG
      </div>

      {/* Bubble containing the dots */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: '4px 18px 18px 18px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
      }}>

        {/* Three dots — each has a different animation delay */}
        {/* This creates the staggered bouncing effect */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'rgba(124,58,237,0.7)',
              animation: 'typing-bounce 1.2s ease infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}