import { NextRequest, NextResponse } from 'next/server';
import { getLearnerId } from '@/lib/identity';
import { ensureLearner, createRun, loadLatestTool, MAX_ITEMS } from '@/lib/db';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const learnerId = await getLearnerId();

  const body = await req.json();
  const raw = typeof body.material === 'string' ? body.material : '';

  const items = raw
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0);

  if (items.length === 0) {
    return NextResponse.json({ error: 'no material' }, { status: 400 });
  }
  if (items.length > MAX_ITEMS) {
    return NextResponse.json(
      { error: `too many items — ${items.length} sent, ${MAX_ITEMS} is the limit` },
      { status: 400 }
    );
  }

  await ensureLearner(learnerId);

  const tool = await loadLatestTool(learnerId);
  if (!tool) {
    return NextResponse.json({ error: 'no tool defined yet' }, { status: 400 });
  }

  const runId = await createRun(learnerId, tool.toolId, items);
  return NextResponse.json({ runId, itemCount: items.length });
}