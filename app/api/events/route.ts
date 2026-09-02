import { NextRequest, NextResponse } from 'next/server';
import { getLearnerId } from '@/lib/identity';
import { log, type EventKind } from '@/lib/events';

const ALLOWED: EventKind[] = [
  'spec_confirmed',
  'spec_rejected',
  'step_viewed',
  'step_submitted',
];

export async function POST(req: NextRequest) {
  const learnerId = await getLearnerId();
  const body = await req.json();

  if (!ALLOWED.includes(body.kind)) {
    return NextResponse.json({ error: 'unknown kind' }, { status: 400 });
  }

  await log(learnerId, body.kind, body.payload ?? {});
  return NextResponse.json({ ok: true });
}