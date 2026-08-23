import { NextRequest, NextResponse } from 'next/server';
import { ask } from '@/lib/model';
import { readFileSync } from 'fs';
import path from 'path';

const COACH = readFileSync(path.join(process.cwd(), 'prompts/coach.md'), 'utf8');

export async function POST(req: NextRequest) {
  const { messages, spec } = await req.json();

  let system = COACH;
  if (spec) {
    system = `${COACH}

---

You already interviewed this person. Here is what you learned:

Their goal: ${spec.goal.value}
Who it's for: ${spec.audience.value}
Kind of tool: ${spec.artifact.value}
What they'll feed it: ${spec.inputs.value}
How they'll know it worked: ${spec.success_looks_like.value}
The risk you named: ${spec.risk_note.value}

Do not ask them any of this again. Open by picking up where the
interview left off and start teaching.`;
  }

  const text = await ask(system, messages);
  return NextResponse.json({ text });
}