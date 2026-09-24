import { NextResponse } from 'next/server';
import { getLearnerId } from '@/lib/identity';
import { loadLatestPlan } from '@/lib/db';
import { extractToolSpec } from '@/lib/toolspec';

export async function POST() {
  const learnerId = await getLearnerId();

  const latest = await loadLatestPlan(learnerId);
  if (!latest) {
    return NextResponse.json(
      { error: 'Talk to the coach first — there is nothing to draft a tool from yet.' },
      { status: 400 }
    );
  }

  const s = latest.spec;
  const source = [
    `What they want: ${s.goal.value}`,
    `Who it is for: ${s.audience.value}`,
    `What they will feed it: ${s.inputs.value}`,
    `How they will know it worked: ${s.success_looks_like.value}`,
    `What goes wrong if it is careless: ${s.risk_note.value}`,
  ].join('\n');

  const draft = await extractToolSpec(source);
  if (!draft) {
    return NextResponse.json(
      { error: 'Could not draft a tool from that. Tell the coach a bit more.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ draft });
}