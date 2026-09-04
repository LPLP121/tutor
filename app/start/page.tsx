'use client';

import { useState } from 'react';
import examples from '@/prompts/intake-examples.json';

export default function Start() {
  const [answer, setAnswer] = useState('');
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [spec, setSpec] = useState<any>(null);
  const [field, setField] = useState<string>('');
  const [confirming, setConfirming] = useState(false);

  function track(kind: string, payload: any = {}) {
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, payload }),
    }).catch(() => {});
  }

  async function confirm() {
    track('spec_confirmed', { restated: spec?.restated });    
    setBusy(true);
    const res = await fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spec }),
    });
    const data = await res.json();
    setBusy(false);

    if (!res.ok || !data.plan) {
      setQuestion('Something went wrong building your plan. Try again in a moment.');
      return;
    }

    sessionStorage.setItem('spec', JSON.stringify(spec));
    sessionStorage.setItem('plan', JSON.stringify(data.plan));
    sessionStorage.setItem('planId', String(data.planId));
    window.location.href = '/';
  }

  function fix() {
    track('spec_rejected', { restated: spec?.restated });
    setConfirming(false);
    setQuestion('No problem — tell me what I got wrong.');
    setField('correction');
  }

  async function start() {
    setBusy(true);
    const res = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer, spec, field }),
    });
    const data = await res.json();
    setSpec(data.spec ?? null);
    setField(data.gap?.field ?? '');
    if (data.done && data.spec) {
      setSpec(data.spec);
      setConfirming(true);
      setBusy(false);
      return;
    }
    setQuestion(data.done ? 'Got everything I need.' : data.question ?? 'Something went wrong.');
    setAnswer('');
    setBusy(false);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl font-medium tracking-tight">
        What's something you'd like AI to help with?
      </h1>
      <p className="mt-3 text-neutral-500">
        We'll build it together — you'll be the one making it.
      </p>

      <p className="mt-2 text-sm text-neutral-400">
        <a href="/data" className="underline hover:text-neutral-600">
          What we do with what you tell us
        </a>
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
        disabled={busy || answer.trim().length < 1}
        className="mt-4 rounded-lg bg-neutral-900 px-5 py-2.5 text-white disabled:bg-neutral-300"
      >
        {busy ? 'Thinking...' : 'Start'}
      </button>

      {question && (
        <p className="mt-8 rounded-lg bg-blue-50 p-4 text-neutral-800">{question}</p>
      )}
      {confirming && spec && (
        <div className="mt-8 rounded-lg border border-neutral-300 p-6">
          <p className="text-sm text-neutral-500">Here's what I understood:</p>
          <p className="mt-3 text-lg text-neutral-900">{spec.restated}</p>

          <ul className="mt-5 space-y-2 text-sm text-neutral-600">
            <li>It's for: {spec.audience.value}</li>
            <li>You'll give it: {spec.inputs.value}</li>
            <li>It works if: {spec.success_looks_like.value}</li>
            <li>Watch out for: {spec.risk_note.value}</li>
          </ul>

          <p className="mt-6 text-neutral-800">Did I get that right?</p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={confirm}
              className="rounded-lg bg-neutral-900 px-5 py-2.5 text-white"
            >
              Yes, let's go
            </button>
            <button
              onClick={fix}
              className="rounded-lg border border-neutral-300 px-5 py-2.5"
            >
              Not quite
            </button>
          </div>
        </div>
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