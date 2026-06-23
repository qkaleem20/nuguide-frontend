'use client';

// Admin dashboard for Niagara University tour-guide chatbot.
// Place at:  app/admin/page.js   →   open at /admin
//
// Tabs: Overview | Unanswered | Thumbs-down | Sync.
// Password-gated by ADMIN_TOKEN (kept in memory, sent as X-Admin-Token).

import { useState, useEffect, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function adminFetch(path, token, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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

const fmt = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
};

function Card({ title, children }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px',
      padding: '20px 22px', marginBottom: '18px',
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

function MiniBtn({ label, onClick, tone }) {
  const colors = {
    neutral: 'rgba(255,255,255,0.12)',
    purple: C.purpleDeep,
    red: 'rgba(239,68,68,0.18)',
  };
  return (
    <button onClick={onClick} style={{
      padding: '4px 10px', borderRadius: '7px', cursor: 'pointer',
      border: `1px solid ${C.border}`, fontSize: '12px', color: C.text,
      background: colors[tone] || colors.neutral, whiteSpace: 'nowrap',
    }}>{label}</button>
  );
}

function Tag({ status }) {
  const map = {
    needs_content: { t: 'Needs content', c: C.gold },
    off_topic: { t: 'Off-topic', c: C.textDim },
    hidden: { t: 'Hidden', c: C.textDim },
  };
  const s = map[status] || { t: status, c: C.textDim };
  return (
    <span style={{
      fontSize: '11px', color: s.c, border: `1px solid ${C.border}`,
      borderRadius: '6px', padding: '1px 7px', marginLeft: '8px',
    }}>{s.t}</span>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');

  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [unanswered, setUnanswered] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [loadError, setLoadError] = useState('');

  const [uFilter, setUFilter] = useState('needs_content');
  const [fFilter, setFFilter] = useState('active');

  const pollRef = useRef(null);

  async function loadAll(t) {
    try {
      const [s, f, u, sync] = await Promise.all([
        adminFetch('/admin/stats', t),
        adminFetch('/admin/feedback', t),
        adminFetch('/admin/unanswered', t),
        adminFetch('/admin/sync/status', t),
      ]);
      setStats(s); setFeedback(f); setUnanswered(u.logs || []); setSyncStatus(sync);
      setLoadError('');
    } catch (e) {
      if (e.unauthorized) { setAuthed(false); setAuthError('Wrong password.'); }
      else setLoadError(e.message);
    }
  }

  async function refetchUnanswered() {
    try { const u = await adminFetch('/admin/unanswered', token); setUnanswered(u.logs || []); } catch (e) { setLoadError(e.message); }
  }
  async function refetchFeedback() {
    try { const f = await adminFetch('/admin/feedback', token); setFeedback(f); } catch (e) { setLoadError(e.message); }
  }

  async function authenticate() {
    setAuthError('');
    try {
      const sync = await adminFetch('/admin/sync/status', tokenInput);
      setToken(tokenInput); setAuthed(true); setSyncStatus(sync); loadAll(tokenInput);
    } catch (e) {
      setAuthError(e.unauthorized ? 'Wrong password.' : e.message);
    }
  }

  // ── unanswered actions ──
  async function setUStatus(ts, status) {
    await adminFetch('/admin/unanswered/update', token, {
      method: 'POST', body: JSON.stringify({ timestamp: ts, status }),
    });
    refetchUnanswered();
  }
  async function delU(ts) {
    if (!confirm('Permanently delete this entry? This cannot be undone.')) return;
    await adminFetch('/admin/unanswered/delete', token, {
      method: 'POST', body: JSON.stringify({ timestamp: ts }),
    });
    refetchUnanswered();
  }

  // ── feedback actions ──
  async function setFStatus(ts, status) {
    await adminFetch('/admin/feedback/update', token, {
      method: 'POST', body: JSON.stringify({ timestamp: ts, status }),
    });
    refetchFeedback();
  }
  async function delF(ts) {
    if (!confirm('Permanently delete this feedback? This cannot be undone.')) return;
    await adminFetch('/admin/feedback/delete', token, {
      method: 'POST', body: JSON.stringify({ timestamp: ts }),
    });
    refetchFeedback();
  }

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
            clearInterval(pollRef.current); pollRef.current = null; loadAll(token);
          }
        } catch (e) {
          clearInterval(pollRef.current); pollRef.current = null; setLoadError(e.message);
        }
      }, 4000);
    } catch (e) { setLoadError(e.message); }
  }

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  // ── password screen ──
  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', background: C.bg, color: C.text,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '32px', width: '320px' }}>
          <h1 style={{ margin: '0 0 4px', fontSize: '18px' }}>NUGuide Admin</h1>
          <p style={{ margin: '0 0 18px', fontSize: '13px', color: C.textDim }}>Enter the admin password.</p>
          <input
            type="password" value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && authenticate()}
            placeholder="Password"
            style={{
              width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: '10px',
              border: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.3)', color: C.text,
              fontSize: '14px', marginBottom: '12px', outline: 'none',
            }}
          />
          {authError && <p style={{ margin: '0 0 12px', fontSize: '12px', color: C.red }}>{authError}</p>}
          <button onClick={authenticate} style={{
            width: '100%', padding: '11px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontSize: '14px', fontWeight: 600, color: '#fff',
            background: `linear-gradient(135deg, ${C.purpleDeep}, ${C.purple})`,
          }}>Enter</button>
        </div>
      </div>
    );
  }

  // ── derived ──
  const counts = feedback?.counts || { positive: 0, negative: 0, total: 0 };

  const uBuckets = { needs_content: [], off_topic: [], hidden: [] };
  for (const e of unanswered) (uBuckets[e.status] || uBuckets.needs_content).push(e);

  const negatives = feedback?.negative || [];
  const fBuckets = {
    active: negatives.filter((f) => f.status !== 'hidden'),
    hidden: negatives.filter((f) => f.status === 'hidden'),
  };

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'unanswered', label: `Unanswered (${uBuckets.needs_content.length})` },
    { id: 'feedback', label: `Thumbs-down (${fBuckets.active.length})` },
    { id: 'sync', label: 'Sync' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui, sans-serif', padding: '28px 18px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '20px', margin: '0 0 16px' }}>NUGuide Admin</h1>

        {/* tab bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              border: `1px solid ${C.border}`, color: tab === t.id ? '#fff' : C.textDim,
              background: tab === t.id ? `linear-gradient(135deg, ${C.purpleDeep}, ${C.purple})` : 'transparent',
            }}>{t.label}</button>
          ))}
        </div>

        {loadError && <div style={{ color: C.red, fontSize: '13px', marginBottom: '14px' }}>{loadError}</div>}

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <>
            <Card title="Usage">
              <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                <div><div style={{ fontSize: '28px', fontWeight: 700 }}>{stats?.last_7_days ?? '—'}</div><div style={{ fontSize: '12px', color: C.textDim }}>questions this week</div></div>
                <div><div style={{ fontSize: '28px', fontWeight: 700 }}>{stats?.total ?? '—'}</div><div style={{ fontSize: '12px', color: C.textDim }}>questions all-time</div></div>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: 700 }}>{counts.total ? Math.round((counts.positive / counts.total) * 100) + '%' : '—'}</div>
                  <div style={{ fontSize: '12px', color: C.textDim }}>rated helpful ({counts.positive}👍 / {counts.negative}👎)</div>
                </div>
              </div>
            </Card>

            <Card title="Most-Asked Questions">
              {stats?.top_questions?.length ? (
                <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: 1.9 }}>
                  {stats.top_questions.map((q, i) => (
                    <li key={i}>{q.question}<span style={{ color: C.textDim }}> — {q.count}×</span></li>
                  ))}
                </ol>
              ) : <p style={{ fontSize: '13px', color: C.textDim, margin: 0 }}>No questions logged yet.</p>}
            </Card>

            <Card title="Knowledge Base">
              <div style={{ fontSize: '13px', color: C.textDim }}>Last sync: {fmt(syncStatus?.last_run)}</div>
              <p style={{ fontSize: '13px', color: C.textDim, margin: '8px 0 0' }}>Run a sync from the Sync tab.</p>
            </Card>
          </>
        )}

        {/* ── UNANSWERED ── */}
        {tab === 'unanswered' && (
          <Card title="Questions The Bot Couldn't Answer">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {[
                ['needs_content', `Needs content (${uBuckets.needs_content.length})`],
                ['off_topic', `Off-topic (${uBuckets.off_topic.length})`],
                ['hidden', `Hidden (${uBuckets.hidden.length})`],
              ].map(([id, lbl]) => (
                <button key={id} onClick={() => setUFilter(id)} style={{
                  padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
                  border: `1px solid ${C.border}`, color: uFilter === id ? '#fff' : C.textDim,
                  background: uFilter === id ? C.purpleDeep : 'transparent',
                }}>{lbl}</button>
              ))}
            </div>

            {uBuckets[uFilter].length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {uBuckets[uFilter].map((e, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', borderBottom: `1px solid ${C.border}`, paddingBottom: '10px' }}>
                    <div style={{ fontSize: '14px' }}>
                      {e.question}
                      <Tag status={e.status} />
                      <div style={{ fontSize: '11px', color: C.textDim, marginTop: '3px' }}>{fmt(e.timestamp)} · {e.sources_found} sources</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {e.status !== 'needs_content' && <MiniBtn label="Needs content" tone="purple" onClick={() => setUStatus(e.timestamp, 'needs_content')} />}
                      {e.status !== 'off_topic' && <MiniBtn label="Off-topic" onClick={() => setUStatus(e.timestamp, 'off_topic')} />}
                      {e.status === 'hidden'
                        ? <MiniBtn label="Unhide" onClick={() => setUStatus(e.timestamp, 'needs_content')} />
                        : <MiniBtn label="Hide" onClick={() => setUStatus(e.timestamp, 'hidden')} />}
                      <MiniBtn label="Delete" tone="red" onClick={() => delU(e.timestamp)} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <p style={{ fontSize: '13px', color: C.textDim, margin: 0 }}>Nothing here.</p>}
          </Card>
        )}

        {/* ── THUMBS-DOWN ── */}
        {tab === 'feedback' && (
          <Card title="Thumbs-Down Answers">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {[['active', `Active (${fBuckets.active.length})`], ['hidden', `Hidden (${fBuckets.hidden.length})`]].map(([id, lbl]) => (
                <button key={id} onClick={() => setFFilter(id)} style={{
                  padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
                  border: `1px solid ${C.border}`, color: fFilter === id ? '#fff' : C.textDim,
                  background: fFilter === id ? C.purpleDeep : 'transparent',
                }}>{lbl}</button>
              ))}
            </div>

            {fBuckets[fFilter].length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[...fBuckets[fFilter]].reverse().map((f, i) => (
                  <div key={i} style={{ borderLeft: `2px solid ${C.red}`, paddingLeft: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Q: {f.question}</div>
                    <div style={{ fontSize: '13px', color: C.textDim, whiteSpace: 'pre-wrap', marginTop: '4px' }}>A: {f.answer}</div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '8px' }}>
                      <span style={{ fontSize: '11px', color: C.textDim, marginRight: '6px' }}>{fmt(f.timestamp)}</span>
                      {f.status === 'hidden'
                        ? <MiniBtn label="Unhide" onClick={() => setFStatus(f.timestamp, 'active')} />
                        : <MiniBtn label="Hide" onClick={() => setFStatus(f.timestamp, 'hidden')} />}
                      <MiniBtn label="Delete" tone="red" onClick={() => delF(f.timestamp)} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <p style={{ fontSize: '13px', color: C.textDim, margin: 0 }}>Nothing here.</p>}
          </Card>
        )}

        {/* ── SYNC ── */}
        {tab === 'sync' && (
          <Card title="Knowledge Base">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button onClick={triggerSync} disabled={syncStatus?.running} style={{
                padding: '10px 20px', borderRadius: '10px', border: 'none',
                cursor: syncStatus?.running ? 'default' : 'pointer', fontSize: '14px', fontWeight: 600, color: '#fff',
                opacity: syncStatus?.running ? 0.55 : 1,
                background: `linear-gradient(135deg, ${C.purpleDeep}, ${C.purple})`,
              }}>{syncStatus?.running ? 'Syncing…' : 'Sync now'}</button>
              <span style={{ fontSize: '13px', color: C.textDim }}>Last sync: {fmt(syncStatus?.last_run)}</span>
            </div>

            {syncStatus?.error && <p style={{ color: C.red, fontSize: '13px', marginTop: '12px' }}>Last sync failed: {syncStatus.error}</p>}

            {syncStatus?.last_result && (
              <div style={{ fontSize: '13px', color: C.textDim, marginTop: '12px', lineHeight: 1.7 }}>
                <div>Files synced: {syncStatus.last_result.drive?.synced_count ?? '—'}{syncStatus.last_result.drive?.skipped?.length ? `, skipped: ${syncStatus.last_result.drive.skipped.length}` : ''}</div>
                <div>Chunks indexed: {syncStatus.last_result.ingest?.chunks_indexed ?? '—'}</div>
                {syncStatus.last_result.drive?.skipped?.length > 0 && (
                  <ul style={{ margin: '6px 0 0', paddingLeft: '18px' }}>
                    {syncStatus.last_result.drive.skipped.map((s, i) => <li key={i}>{s.name} — {s.reason}</li>)}
                  </ul>
                )}
              </div>
            )}
            <p style={{ fontSize: '12px', color: C.textDim, marginTop: '14px' }}>
              Sync rebuilds the knowledge base from Google Drive. Run it after the docs are updated.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}