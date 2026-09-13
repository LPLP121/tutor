import { NextRequest, NextResponse } from 'next/server';
import { getLearnerId } from '@/lib/identity';
import { stepRun } from '@/lib/db';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const learnerId = await getLearnerId();

  const body = await req.json();
  const runId = Number(body.runId);
  if (!Number.isInteger(runId) || runId <= 0) {
    return NextResponse.json({ error: 'invalid runId' }, { status: 400 });
  }

  try {
    const { done, remaining } = await stepRun(learnerId, runId);
    return NextResponse.json({ done, remaining });
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    if (msg === 'run not found') {
      return NextResponse.json({ error: 'run not found' }, { status: 404 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}