import { NextRequest, NextResponse } from 'next/server';
import { extractSpec, nextGap, askForGap } from '@/lib/spec';

export async function POST(req: NextRequest) {
  const { answer } = await req.json();
  const spec = await extractSpec(answer);
  if (!spec) return NextResponse.json({ error: 'extraction failed' });

  const gap = nextGap(spec);
  if (!gap) return NextResponse.json({ spec, done: true });

  const question = await askForGap(gap, spec);
  return NextResponse.json({ gap, question });
}