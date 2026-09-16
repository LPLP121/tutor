import { NextRequest, NextResponse } from 'next/server';
import { getLearnerId } from '@/lib/identity';
import { setVerdict } from '@/lib/db';

export async function POST(req: NextRequest) {
  const learnerId = await getLearnerId();

  const body = await req.json();
  const itemId = Number(body.itemId);
  if (!Number.isInteger(itemId) || itemId <= 0) {
    return NextResponse.json({ error: 'invalid itemId' }, { status: 400 });
  }

  const v = body.verdict;
  if (v !== 'pass' && v !== 'fail' && v !== null) {
    return NextResponse.json({ error: 'verdict must be pass, fail, or null' }, { status: 400 });
  }

  const ok = await setVerdict(learnerId, itemId, v);
  if (!ok) {
    return NextResponse.json({ error: 'item not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}