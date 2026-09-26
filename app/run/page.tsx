'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const MAX_ITEMS = 25;

export default function RunPage() {
  const router = useRouter();
  const [material, setMaterial] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [tool, setTool] = useState<any>(undefined);

  useEffect(() => {
    fetch('/api/tool')
      .then((r) => r.json())
      .then((d) => setTool(d.tool))
      .catch(() => setTool(null));
  }, []);

  const items = material
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const tooMany = items.length > MAX_ITEMS;

  async function start() {
    setBusy(true);
    setError('');
    setStatus('Starting…');

    try {
      const created = await (
        await fetch('/api/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ material }),
        })
      ).json();

      if (created.error) {
        setError(created.error);
        setBusy(false);
        return;
      }

      const runId = created.runId;
      const total = created.itemCount;
      let guard = 0;

      while (guard++ < MAX_ITEMS + 5) {
        const res = await (
          await fetch('/api/run/step', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ runId }),
          })
        ).json();

        if (res.error) {
          setError(res.error);
          setBusy(false);
          return;
        }
        if (res.done) break;
        setStatus(`${total - res.remaining} of ${total} done…`);
      }

      router.push(`/run/${runId}`);
    } catch (e: any) {
      setError(String(e?.message ?? e));
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 680, margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Run your tool</h1>
      <p style={{ color: '#555', marginTop: 0, lineHeight: 1.5 }}>
        Paste your material below — one item per line. Your tool runs over every
        line separately.
      </p>
      {tool === null && (
        <div style={{ marginTop: 16, padding: 12, background: '#fff8e1', border: '1px solid #f0d48a', borderRadius: 6 }}>
          You have not saved a tool yet.{' '}
          <button onClick={() => router.push('/tool')} style={{ border: 'none', background: 'none', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}>
            Go to the tool screen
          </button>
        </div>
      )}

      {tool && (
        <div style={{ marginTop: 16, marginBottom: 16, padding: 12, background: '#f4f4f5', borderRadius: 6, lineHeight: 1.5 }}>
          <div style={{ fontSize: 13, color: '#666' }}>Your tool</div>
          <div style={{ marginTop: 4 }}>{tool.spec}</div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
            Gives back: {tool.fields.map((f: any) => f.name).join(', ')}
          </div>
        </div>
      )}

      <textarea
        value={material}
        onChange={(e) => setMaterial(e.target.value)}
        disabled={busy}
        rows={14}
        placeholder={'One item per line.\nAnother item here.\nAnd another.'}
        style={{ width: '100%', padding: 12, fontSize: 14, fontFamily: 'inherit', lineHeight: 1.5, borderRadius: 6, border: '1px solid #ccc' }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
        <button
          onClick={start}
          disabled={busy || items.length === 0 || tooMany}
          style={{ padding: '10px 18px', fontSize: 15, borderRadius: 6, border: 'none', background: busy || items.length === 0 || tooMany ? '#bbb' : '#111', color: 'white', cursor: busy ? 'default' : 'pointer' }}
        >
          {busy ? 'Running…' : `Run on ${items.length} item${items.length === 1 ? '' : 's'}`}
        </button>

        <span style={{ color: tooMany ? '#b00' : '#666', fontSize: 14 }}>
          {tooMany
            ? `${items.length} items — ${MAX_ITEMS} is the limit for now`
            : status}
        </span>
      </div>

      {error && (
        <p style={{ marginTop: 16, padding: 12, background: '#fee', border: '1px solid #fbb', borderRadius: 6, color: '#900' }}>
          {error}
        </p>
      )}
    </main>
  );
}