export default function SourceTag({ source }) {
  const isUrl = source.startsWith('http');

  const label = isUrl
    ? source
        .replace('https://www.niagara.edu/', 'niagara.edu/')
        .replace('https://niagara.edu/', 'niagara.edu/')
        .replace(/\/$/, '')
    : source;

  const style = isUrl
    ? {
        background: 'rgba(29,78,216,0.1)',
        border: '1px solid rgba(29,78,216,0.25)',
        color: 'rgba(147,196,255,0.8)',
      }
    : {
        background: 'rgba(124,58,237,0.1)',
        border: '1px solid rgba(124,58,237,0.25)',
        color: 'rgba(196,167,255,0.8)',
      };

  const sharedStyle = {
    ...style,
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    lineHeight: '1.4',
    marginRight: '6px',
    marginBottom: '5px',
    fontFamily: 'var(--font-body)',
    letterSpacing: '0.01em',
    maxWidth: '280px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
    textDecoration: 'none',
    transition: 'background 0.15s ease, border-color 0.15s ease',
    ...(isUrl && { cursor: 'pointer' }),
  };

  const dot = (
    <span
      style={{
        display: 'inline-block',
        width: '5px',
        height: '5px',
        borderRadius: '50%',
        background: isUrl ? 'rgba(147,196,255,0.6)' : 'rgba(196,167,255,0.6)',
        marginRight: '5px',
        flexShrink: 0,
      }}
    />
  );

  const arrow = isUrl ? (
    <span
      style={{
        marginLeft: '5px',
        fontSize: '9px',
        opacity: 0.5,
        flexShrink: 0,
      }}
    >
      ↗
    </span>
  ) : null;

  // Web sources → clickable link, opens in new tab
  if (isUrl) {
    return (
      <a
        href={source}
        target="_blank"
        rel="noopener noreferrer"
        style={sharedStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(29,78,216,0.2)';
          e.currentTarget.style.borderColor = 'rgba(29,78,216,0.45)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(29,78,216,0.1)';
          e.currentTarget.style.borderColor = 'rgba(29,78,216,0.25)';
        }}
      >
        {dot}
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
        {arrow}
      </a>
    );
  }

  // Local files → static pill, no click
  return (
    <span style={sharedStyle}>
      {dot}
      {label}
    </span>
  );
}