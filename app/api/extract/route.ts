import { NextRequest, NextResponse } from 'next/server';
import { extractSpec, foldAnswer, nextGap, askForGap, BuildSpec } from '@/lib/spec';
import { getLearnerId } from '@/lib/identity';

export async function POST(req: NextRequest) {
  const learnerId = await getLearnerId();
  const { answer, spec: priorSpec, field } = await req.json();

  let spec;
  if (priorSpec && field) {
    spec = await foldAnswer(priorSpec, field, answer);
  } else {
    spec = await extractSpec(answer);
  }

  if (!spec) return NextResponse.json({ error: 'could not understand that' });

  const gap = nextGap(spec);
  console.log('FOLD RESULT:', JSON.stringify(spec, null, 2));
  if (!gap) return NextResponse.json({ spec, done: true });

  const question = await askForGap(gap, spec);
  return NextResponse.json({ spec, gap, question });
}