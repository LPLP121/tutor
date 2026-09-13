import { NextRequest, NextResponse } from 'next/server';
import { getLearnerId } from '@/lib/identity';
import { loadRun } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const learnerId = await getLearnerId();
  const { id } = await params;

  const runId = Number(id);
  if (!Number.isInteger(runId) || runId <= 0) {
    return NextResponse.json({ error: 'invalid run id' }, { status: 400 });
  }

  const run = await loadRun(learnerId, runId);
  if (!run) {
    return NextResponse.json({ error: 'run not found' }, { status: 404 });
  }

  return NextResponse.json(run);
}