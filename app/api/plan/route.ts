import { NextRequest, NextResponse } from 'next/server';
import { BuildSpec } from '@/lib/spec';
import { generatePlan } from '@/lib/plan';
import { getLearnerId } from '@/lib/identity';
import { ensureLearner, saveSpec, savePlan } from '@/lib/db';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const learnerId = await getLearnerId();

  const body = await req.json();
  const parsed = BuildSpec.safeParse(body.spec);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid spec' }, { status: 400 });
  }
  const spec = parsed.data;

  const plan = await generatePlan(spec);
  if (!plan) {
    return NextResponse.json({ error: 'could not build a plan' }, { status: 502 });
  }

  await ensureLearner(learnerId);
  const specId = await saveSpec(learnerId, spec);
  const planId = await savePlan(specId, plan);

  return NextResponse.json({ plan, planId });
}