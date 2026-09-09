import { NextResponse } from 'next/server';
import { getLearnerId } from '@/lib/identity';
import { loadLatestPlan } from '@/lib/db';

export async function GET() {
  const learnerId = await getLearnerId();
  const result = await loadLatestPlan(learnerId);
  if (!result) {
    return NextResponse.json({ plan: null });
  }
  return NextResponse.json({
    planId: result.planId,
    spec: result.spec,
    steps: result.steps,
  });
}