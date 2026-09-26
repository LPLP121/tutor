'use client';
import { useState, useEffect } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };
type Worked = { prompt: string; output: string; why: string };
type Step = {
  title: string;
  why: string;
  instruction: string;
  doneWhen: string;
  worked: Worked | null;
};

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [spec, setSpec] = useState<any>(null);
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/plan/latest')
      .then((r) => r.json())
      .then((d) => {
        if (!d.steps) {
          setLoading(false);
          return;
        }
        setSpec(d.spec);
        setSteps(d.steps);
        setLoading(false);
        setBusy(true);
        return fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: "I'm ready — where do we start?" }],
            spec: d.spec,
          }),
        })
          .then((r) => r.json())
          .then((c) => setMessages([{ role: 'assistant', content: c.text }]))
          .finally(() => setBusy(false));
      })
      .catch(() => setLoading(false));
  }, []);

  async function send() {
    if (!input.trim() || busy) return;
    const next: Msg[] = [...messages, { role: 'user', content: input }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, spec }),
      });
      const data = await res.json();
      setMessages([...next, { role: 'assistant', content: data.text }]);
    } catch {
      setMessages([
        ...next,
        { role: 'assistant', content: 'Something went wrong. Try again.' },
      ]);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
        <div style={{ opacity: 0.5 }}>Loading your plan…</div>
      </main>
    );
  }

  if (!steps) {
    return (
      <main style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
        <h1 style={{ fontSize: 20, marginBottom: 12 }}>Nothing here yet</h1>
        <p style={{ marginBottom: 16 }}>
          You haven&apos;t built a plan yet. It takes a few minutes.
        </p>
        <a href="/start" style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #ccc' }}>
          Start
        </a>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Your plan</h1>
      {spec?.restated && (
        <p style={{ opacity: 0.7, marginBottom: 20 }}>{spec.restated}</p>
      )}

      <ol style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 0, listStyle: 'none' }}>
        {steps.map((s, i) => (
          <li key={i} style={{ border: '1px solid #e4e4e7', borderRadius: 8, padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              {i + 1}. {s.title}
            </div>
            <p style={{ marginBottom: 8 }}>{s.why}</p>
            <p style={{ whiteSpace: 'pre-wrap', marginBottom: 8 }}>{s.instruction}</p>
            <p style={{ fontSize: 14, opacity: 0.7 }}>Done when: {s.doneWhen}</p>
            {s.worked && (
              <div style={{ marginTop: 12, background: '#f4f4f5', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Worked example</div>
                <p style={{ whiteSpace: 'pre-wrap', marginBottom: 8 }}>{s.worked.prompt}</p>
                <p style={{ whiteSpace: 'pre-wrap', marginBottom: 8 }}>{s.worked.output}</p>
                <p style={{ fontSize: 14, opacity: 0.7 }}>{s.worked.why}</p>
              </div>
            )}
          </li>
        ))}
      </ol>
      <a
        href="/tool"
        style={{ display: 'inline-block', marginTop: 20, padding: '10px 18px', borderRadius: 6, background: '#111', color: 'white', textDecoration: 'none' }}
      >
        Open the tool screen
      </a>
      <h2 style={{ fontSize: 18, marginTop: 32, marginBottom: 12 }}>Stuck on a step? Ask here</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              whiteSpace: 'pre-wrap',
              padding: 12,
              borderRadius: 8,
              background: m.role === 'user' ? '#eef2ff' : '#f4f4f5',
            }}
          >
            {m.content}
          </div>
        ))}
        {busy && <div style={{ opacity: 0.5 }}>Thinking…</div>}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask about any step"
          style={{ flex: 1, padding: 10, border: '1px solid #ccc', borderRadius: 8 }}
        />
        <button
          onClick={send}
          disabled={busy}
          style={{ padding: '10px 16px', borderRadius: 8 }}
        >
          Send
        </button>
      </div>
    </main>
  );
}