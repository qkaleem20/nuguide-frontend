'use client';

// Admin dashboard for Niagara University tour-guide chatbot.
// Place this file at:  app/admin/page.js
// Open it at:          /admin  (e.g. https://www.nuguide.info/admin)
//
// It is password-gated by the ADMIN_TOKEN you set on the backend. The token is
// kept in memory only (re-enter after a refresh) and sent as the
// X-Admin-Token header on every request.

import { useState, useEffect, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── tiny fetch helper that attaches the admin token ──────────────────────────
async function adminFetch(path, token, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'X-Admin-Token': token,
    },
  });
  if (res.status === 401) {
    const err = new Error('Unauthorized');
    err.unauthorized = true;
    throw err;
  }
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.json();
}

// ── theme tokens (matches the chat UI) ───────────────────────────────────────
const C = {
  bg: '#0b0b12',
  card: 'rgba(255,255,255,0.04)',
  border: 'rgba(124,58,237,0.2)',
  purple: '#7C3AED',
  purpleDeep: '#6D28D9',
  gold: '#D4A017',
  green: '#22C55E',
  red: '#EF4444',
  text: 'rgba(255,255,255,0.88)',
  textDim: 'rgba(255,255,255,0.45)',
};

function Card({ title, children }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: '14px',
      padding: '20px 22px',
      marginBottom: '18px',
    }}>
      {title && (
        <h2 style={{
          margin: '0 0 14px', fontSize: '13px', fontWeight: 600,
          letterSpacing: '0.04em', textTransform: 'uppercase', color: C.gold,
        }}>{title}</h2>
      )}
      {children}
    </div>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');

  const [stats, setStats] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [unanswered, setUnanswered] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [loadError, setLoadError] = useState('');

  const pollRef = useRef(null);

  // ── load all dashboard data ────────────────────────────────────────────────
  async function loadAll(t) {
    try {
      const [s, f, u, sync] = await Promise.all([
        adminFetch('/admin/stats', t),
        adminFetch('/admin/feedback', t),
        adminFetch('/admin/unanswered', t),
        adminFetch('/admin/sync/status', t),
      ]);
      setStats(s);
      setFeedback(f);
      setUnanswered(u.logs || []);
      setSyncStatus(sync);
      setLoadError('');
    } catch (e) {
      if (e.unauthorized) { setAuthed(false); setAuthError('Wrong password.'); }
      else setLoadError(e.message);
    }
  }

  // ── password submit ────────────────────────────────────────────────────────
  async function authenticate() {
    setAuthError('');
    try {
      const sync = await adminFetch('/admin/sync/status', tokenInput);
      setToken(tokenInput);
      setAuthed(true);
      setSyncStatus(sync);
      loadAll(tokenInput);
    } catch (e) {
      setAuthError(e.unauthorized ? 'Wrong password.' : e.message);
    }
  }

  // ── sync now + poll until done ──────────────────────────────────────────────
  async function triggerSync() {
    try {
      await adminFetch('/admin/sync', token, { method: 'POST' });
      setSyncStatus((s) => ({ ...(s || {}), running: true, error: null }));
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const sync = await adminFetch('/admin/sync/status', token);
          setSyncStatus(sync);
          if (!sync.running) {
            clearInterval(pollRef.current);
            pollRef.current = null;
            loadAll(token); // refresh counts/questions after a sync
          }
        } catch (e) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setLoadError(e.message);
        }
      }, 4000);
    } catch (e) {
      setLoadError(e.message);
    }
  }

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  // ── password screen ─────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', background: C.bg, color: C.text,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px',
          padding: '32px', width: '320px',
        }}>
          <h1 style={{ margin: '0 0 4px', fontSize: '18px' }}>NUGuide Admin</h1>
          <p style={{ margin: '0 0 18px', fontSize: '13px', color: C.textDim }}>
            Enter the admin password.
          </p>
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && authenticate()}
            placeholder="Password"
            style={{
              width: '100%', boxSizing: 'border-box', padding: '11px 14px',
              borderRadius: '10px', border: `1px solid ${C.border}`,
              background: 'rgba(0,0,0,0.3)', color: C.text, fontSize: '14px',
              marginBottom: '12px', outline: 'none',
            }}
          />
          {authError && (
            <p style={{ margin: '0 0 12px', fontSize: '12px', color: C.red }}>{authError}</p>
          )}
          <button onClick={authenticate} style={{
            width: '100%', padding: '11px', borderRadius: '10px', border: 'none',
            cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#fff',
            background: `linear-gradient(135deg, ${C.purpleDeep}, ${C.purple})`,
          }}>Enter</button>
        </div>
      </div>
    );
  }

  // ── helpers for rendering ────────────────────────────────────────────────────
  const fmt = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
  };

  // aggregate unanswered into unique questions sorted by frequency
  const unansweredAgg = (() => {
    const map = new Map();
    for (const row of unanswered) {
      const q = (row.question || '').trim();
      if (!q) continue;
      const cur = map.get(q.toLowerCase()) || { question: q, count: 0, last: row.timestamp };
      cur.count += 1;
      if (row.timestamp > cur.last) cur.last = row.timestamp;
      map.set(q.toLowerCase(), cur);
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  })();

  const counts = feedback?.counts || { positive: 0, negative: 0, total: 0 };

  // ── dashboard ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', background: C.bg, color: C.text,
      fontFamily: 'system-ui, sans-serif', padding: '28px 18px',
    }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '20px', margin: '0 0 4px' }}>NUGuide Admin</h1>
        <p style={{ fontSize: '13px', color: C.textDim, margin: '0 0 22px' }}>
          Knowledge base, usage, and answer quality.
        </p>

        {loadError && (
          <div style={{ color: C.red, fontSize: '13px', marginBottom: '14px' }}>
            {loadError}
          </div>
        )}

        {/* ── Sync ── */}
        <Card title="Knowledge Base">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={triggerSync}
              disabled={syncStatus?.running}
              style={{
                padding: '10px 20px', borderRadius: '10px', border: 'none',
                cursor: syncStatus?.running ? 'default' : 'pointer',
                fontSize: '14px', fontWeight: 600, color: '#fff',
                opacity: syncStatus?.running ? 0.55 : 1,
                background: `linear-gradient(135deg, ${C.purpleDeep}, ${C.purple})`,
              }}
            >
              {syncStatus?.running ? 'Syncing…' : 'Sync now'}
            </button>
            <span style={{ fontSize: '13px', color: C.textDim }}>
              Last sync: {fmt(syncStatus?.last_run)}
            </span>
          </div>

          {syncStatus?.error && (
            <p style={{ color: C.red, fontSize: '13px', marginTop: '12px' }}>
              Last sync failed: {syncStatus.error}
            </p>
          )}

          {syncStatus?.last_result && (
            <div style={{ fontSize: '13px', color: C.textDim, marginTop: '12px', lineHeight: 1.7 }}>
              <div>
                Files synced: {syncStatus.last_result.drive?.synced_count ?? '—'}
                {syncStatus.last_result.drive?.skipped?.length
                  ? `, skipped: ${syncStatus.last_result.drive.skipped.length}`
                  : ''}
              </div>
              <div>Chunks indexed: {syncStatus.last_result.ingest?.chunks_indexed ?? '—'}</div>
              {syncStatus.last_result.drive?.skipped?.length > 0 && (
                <ul style={{ margin: '6px 0 0', paddingLeft: '18px' }}>
                  {syncStatus.last_result.drive.skipped.map((s, i) => (
                    <li key={i}>{s.name} — {s.reason}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Card>

        {/* ── Usage ── */}
        <Card title="Usage">
          <div style={{ display: 'flex', gap: '40px' }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{stats?.last_7_days ?? '—'}</div>
              <div style={{ fontSize: '12px', color: C.textDim }}>questions this week</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{stats?.total ?? '—'}</div>
              <div style={{ fontSize: '12px', color: C.textDim }}>questions all-time</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>
                {counts.total ? Math.round((counts.positive / counts.total) * 100) + '%' : '—'}
              </div>
              <div style={{ fontSize: '12px', color: C.textDim }}>
                rated helpful ({counts.positive}👍 / {counts.negative}👎)
              </div>
            </div>
          </div>
        </Card>

        {/* ── Most asked ── */}
        <Card title="Most-Asked Questions">
          {stats?.top_questions?.length ? (
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: 1.9 }}>
              {stats.top_questions.map((q, i) => (
                <li key={i}>
                  {q.question}
                  <span style={{ color: C.textDim }}> — {q.count}×</span>
                </li>
              ))}
            </ol>
          ) : (
            <p style={{ fontSize: '13px', color: C.textDim, margin: 0 }}>
              No questions logged yet. This fills in as guides use the bot.
            </p>
          )}
        </Card>

        {/* ── Thumbs-down ── */}
        <Card title={`Thumbs-Down Answers (${counts.negative})`}>
          {feedback?.negative?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[...feedback.negative].reverse().map((f, i) => (
                <div key={i} style={{
                  borderLeft: `2px solid ${C.red}`, paddingLeft: '12px',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Q: {f.question}</div>
                  <div style={{ fontSize: '13px', color: C.textDim, whiteSpace: 'pre-wrap', marginTop: '4px' }}>
                    A: {f.answer}
                  </div>
                  <div style={{ fontSize: '11px', color: C.textDim, marginTop: '4px' }}>{fmt(f.timestamp)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: C.textDim, margin: 0 }}>
              No thumbs-down feedback yet.
            </p>
          )}
        </Card>

        {/* ── Unanswered ── */}
        <Card title={`Questions The Bot Couldn't Answer (${unansweredAgg.length})`}>
          {unansweredAgg.length ? (
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '14px', lineHeight: 1.9 }}>
              {unansweredAgg.map((q, i) => (
                <li key={i}>
                  {q.question}
                  {q.count > 1 && <span style={{ color: C.textDim }}> — asked {q.count}×</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '13px', color: C.textDim, margin: 0 }}>
              Nothing logged. These are questions where the bot said it didn't have the answer.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}