import { NextRequest, NextResponse } from 'next/server';
import { getLearnerId } from '@/lib/identity';
import { ensureLearner, saveTool, loadLatestTool } from '@/lib/db';
import { confirmToolSpec, ToolSpecDraft } from '@/lib/toolspec';

export async function POST(req: NextRequest) {
  const learnerId = await getLearnerId();
  await ensureLearner(learnerId);

  const body = await req.json();
  const parsed = ToolSpecDraft.safeParse(body.draft);
  if (!parsed.success) {
    return NextResponse.json({ error: 'That tool definition is incomplete.' }, { status: 400 });
  }

  try {
    const tool = confirmToolSpec(parsed.data);
    const toolId = await saveTool(learnerId, tool);
    return NextResponse.json({ toolId });
  } catch {
    return NextResponse.json(
      { error: 'Every tool needs a rule for what counts as wrong.' },
      { status: 400 }
    );
  }
}
export async function GET() {
  const learnerId = await getLearnerId();
  const latest = await loadLatestTool(learnerId);
  return NextResponse.json({ tool: latest ? latest.tool : null });
}