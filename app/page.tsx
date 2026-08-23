'use client';

import { useState, useEffect } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [spec, setSpec] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('spec');
    if (!stored) return;
    const parsed = JSON.parse(stored);
    setSpec(parsed);
    setBusy(true);
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [], spec: parsed }),
    })
      .then((r) => r.json())
      .then((d) => setMessages([{ role: 'assistant', content: d.text }]))
      .finally(() => setBusy(false));
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

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>Coach</h1>

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
          placeholder="What do you want AI to do for you?"
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