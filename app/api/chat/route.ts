import { NextRequest, NextResponse } from 'next/server';
import { ask } from '@/lib/model';
import { readFileSync } from 'fs';
import path from 'path';

const COACH = readFileSync(path.join(process.cwd(), 'prompts/coach.md'), 'utf8');

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const text = await ask(COACH, messages);
  return NextResponse.json({ text });
}