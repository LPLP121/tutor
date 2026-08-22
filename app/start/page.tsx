'use client';

import { useState } from 'react';
import examples from '@/prompts/intake-examples.json';

export default function Start() {
  const [answer, setAnswer] = useState('');
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    const res = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer }),
    });
    const data = await res.json();
    setQuestion(data.question ?? 'Something went wrong.');
    setBusy(false);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl font-medium tracking-tight">
        What do you want AI to do for you?
      </h1>
      <p className="mt-3 text-neutral-500">
        Describe it however it comes out. No right way to say it.
      </p>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={5}
        className="mt-8 w-full rounded-lg border border-neutral-300 p-4 text-base"
        placeholder="Type here..."
      />

      <button
        onClick={start}
        disabled={busy || answer.trim().length < 10}
        className="mt-4 rounded-lg bg-neutral-900 px-5 py-2.5 text-white disabled:bg-neutral-300"
      >
        {busy ? 'Thinking...' : 'Start'}
      </button>

      {question && (
        <p className="mt-8 rounded-lg bg-blue-50 p-4 text-neutral-800">{question}</p>
      )}

      <div className="mt-12 border-t border-neutral-200 pt-8">
        <p className="text-sm text-neutral-500">People have said things like:</p>
        <ul className="mt-4 space-y-3">
          {examples.map((ex: string, i: number) => (
            <li
              key={i}
              onClick={() => setAnswer(ex)}
              className="cursor-pointer rounded-lg bg-neutral-50 p-4 text-sm text-neutral-700 hover:bg-neutral-100"
            >
              {ex}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-neutral-500">
          Not sure where to start? I can ask you a few short questions instead.
        </p>
      </div>
    </main>
  );
}