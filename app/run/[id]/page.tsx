'use client';

import { useEffect, useState, use } from 'react';

type Item = {
  id: number;
  position: number;
  item: string;
  status: string;
  outputs: Record<string, { value: string; stated: boolean }> | null;
  error: string | null;
  verdict: string | null;
};

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const res = await (await fetch(`/api/run/${id}`)).json();
      if (res.error) setError(res.error);
      else setItems(res.items);
      setLoading(false);
    })();
  }, [id]);

  async function mark(itemId: number, verdict: 'pass' | 'fail' | null) {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, verdict } : i)));
    await fetch('/api/verdict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, verdict }),
    });
  }

  if (loading) return <Shell><p>Loading…</p></Shell>;
  if (error) return <Shell><p style={{ color: '#900' }}>{error}</p></Shell>;

  const failed = items.filter((i) => i.verdict === 'fail' || i.status === 'error');
  const rest = items.filter((i) => !(i.verdict === 'fail' || i.status === 'error'));
  const unmarked = items.filter((i) => i.verdict === null && i.status !== 'error').length;

  return (
    <Shell>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Run {id}</h1>
      <p style={{ color: '#555', marginTop: 0, lineHeight: 1.5 }}>
        {items.length} items. {failed.length} marked wrong.{' '}
        {unmarked > 0 && <strong>{unmarked} still to check.</strong>}
      </p>
      <p style={{ color: '#555', lineHeight: 1.5, marginTop: 0 }}>
        Read each one against your own rule for what counts as wrong. Anything
        marked <em>written by the model</em> did not come from your material.
      </p>

      {failed.length > 0 && (
        <>
          <h2 style={{ fontSize: 17, marginTop: 28, color: '#900' }}>Wrong ({failed.length})</h2>
          {failed.map((i) => <Row key={i.id} item={i} onMark={mark} />)}
        </>
      )}

      {rest.length > 0 && (
        <>
          <h2 style={{ fontSize: 17, marginTop: 28 }}>The rest ({rest.length})</h2>
          {rest.map((i) => <Row key={i.id} item={i} onMark={mark} />)}
        </>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ maxWidth: 760, margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      {children}
    </main>
  );
}

function Row({ item, onMark }: { item: Item; onMark: (id: number, v: 'pass' | 'fail' | null) => void }) {
  const isFail = item.verdict === 'fail';
  return (
    <div style={{ border: '1px solid #ddd', borderLeft: `4px solid ${isFail ? '#c00' : item.verdict === 'pass' ? '#0a0' : '#ddd'}`, borderRadius: 6, padding: 16, marginTop: 12 }}>
      <p style={{ margin: 0, color: '#666', fontSize: 13, lineHeight: 1.5 }}>{item.item}</p>

      {item.error && (
        <p style={{ marginTop: 12, color: '#900', fontSize: 14 }}>Failed to process: {item.error}</p>
      )}

      {item.outputs && (
        <div style={{ marginTop: 12 }}>
          {Object.entries(item.outputs).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, color: '#444' }}>
                {k}
                {!v.stated && (
                  <span style={{ marginLeft: 8, fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#a60', background: '#fff6e5', border: '1px solid #f0d9a8', borderRadius: 4, padding: '1px 6px', fontSize: 11 }}>
                    written by the model
                  </span>
                )}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap', color: v.value ? '#111' : '#999' }}>
                {v.value || '(nothing)'}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button onClick={() => onMark(item.id, item.verdict === 'pass' ? null : 'pass')} style={btn(item.verdict === 'pass', '#0a0')}>Right</button>
        <button onClick={() => onMark(item.id, item.verdict === 'fail' ? null : 'fail')} style={btn(item.verdict === 'fail', '#c00')}>Wrong</button>
      </div>
    </div>
  );
}

function btn(active: boolean, color: string): React.CSSProperties {
  return {
    padding: '6px 14px',
    fontSize: 14,
    borderRadius: 5,
    border: `1px solid ${active ? color : '#ccc'}`,
    background: active ? color : 'white',
    color: active ? 'white' : '#333',
    cursor: 'pointer',
  };
}