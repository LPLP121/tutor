'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ToolSpecDraft } from '@/lib/toolspec';

const GUESS = { background: '#fff8e1', border: '1px solid #f0d48a' };
const SAID = { background: '#fff', border: '1px solid #ccc' };

export default function ToolPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<ToolSpecDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [asked, setAsked] = useState(false);

  useEffect(() => {
    if (asked) return;
    setAsked(true);
    (async () => {
      try {
        const res = await (await fetch('/api/tool/draft', { method: 'POST' })).json();
        if (res.error) setError(res.error);
        else setDraft(res.draft);
      } catch (e: any) {
        setError(String(e?.message ?? e));
      }
      setLoading(false);
    })();
  }, []);

  const ruleMissing = !draft || draft.pass_fail_rule.value.trim().length === 0;
  const specMissing = !draft || draft.spec.value.trim().length === 0;
  const incomplete = ruleMissing || specMissing;

  async function save() {
    if (!draft) return;
    setBusy(true);
    setError('');
    try {
      const res = await (
        await fetch('/api/tool', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ draft }),
        })
      ).json();
      if (res.error) {
        setError(res.error);
        setBusy(false);
        return;
      }
      router.push('/run');
    } catch (e: any) {
      setError(String(e?.message ?? e));
      setBusy(false);
    }
  }

  const wrap = { maxWidth: 680, margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' };
  const label = { fontSize: 13, color: '#666', marginBottom: 4, display: 'block' };
  const box = { width: '100%', padding: 10, fontSize: 14, fontFamily: 'inherit', lineHeight: 1.5, borderRadius: 6 };

  if (loading) return <main style={wrap}><p>Drafting your tool…</p></main>;

  if (!draft) {
    return (
      <main style={wrap}>
        <h1 style={{ fontSize: 24 }}>Your tool</h1>
        <p style={{ padding: 12, background: '#fee', border: '1px solid #fbb', borderRadius: 6, color: '#900' }}>{error}</p>
      </main>
    );
  }

  return (
    <main style={wrap}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Your tool, as I understood it</h1>
      <p style={{ color: '#555', marginTop: 0, lineHeight: 1.5 }}>
        Anything on a yellow background I worked out myself — you did not say it.
        Change whatever is wrong.
      </p>

      <div style={{ marginTop: 24 }}>
        <label style={label}>What it does for each item</label>
        <input
          value={draft.spec.value}
          onChange={(e) => setDraft({ ...draft, spec: { ...draft.spec, value: e.target.value } })}
          disabled={busy}
          style={{ ...box, ...(draft.spec.stated ? SAID : GUESS) }}
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <label style={label}>What it gives back</label>
        {draft.fields.map((f, i) => (
          <div key={i} style={{ padding: 10, marginBottom: 8, borderRadius: 6, ...(f.stated ? SAID : GUESS) }}>
            <strong style={{ fontSize: 14 }}>{f.name}</strong>
            <span style={{ fontSize: 13, color: '#666', marginLeft: 8 }}>
              {f.mode === 'extract' ? 'pulled from the item' : 'written for the item'}
            </span>
            <div style={{ fontSize: 14, marginTop: 4 }}>{f.description}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <label style={label}>What makes an answer wrong</label>
        <textarea
          value={draft.pass_fail_rule.value}
          onChange={(e) => setDraft({ ...draft, pass_fail_rule: { ...draft.pass_fail_rule, value: e.target.value } })}
          disabled={busy}
          rows={3}
          placeholder="Name one specific wrong answer you would be able to spot by reading it."
          style={{ ...box, ...(draft.pass_fail_rule.stated ? SAID : GUESS) }}
        />
        {ruleMissing && (
          <p style={{ fontSize: 13, color: '#666', marginTop: 4, lineHeight: 1.5 }}>
            This one is yours to write. Nobody can tell you what wrong looks like
            for your own material.
          </p>
        )}
      </div>

      <button
        onClick={save}
        disabled={busy || incomplete}
        style={{ marginTop: 24, padding: '10px 18px', fontSize: 15, borderRadius: 6, border: 'none', background: busy || incomplete ? '#bbb' : '#111', color: 'white', cursor: busy || incomplete ? 'default' : 'pointer' }}
      >
        {busy ? 'Saving…' : 'This is my tool'}
      </button>

      {error && (
        <p style={{ marginTop: 16, padding: 12, background: '#fee', border: '1px solid #fbb', borderRadius: 6, color: '#900' }}>
          {error}
        </p>
      )}
    </main>
  );
}