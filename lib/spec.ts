import { z } from 'zod';

const Field = z.object({
  value: z.string(),
  stated: z.boolean(),
});

export const BuildSpec = z.object({
  goal: Field,
  audience: Field,
  artifact: Field,
  inputs: Field,
  success_looks_like: Field,
  risk_note: Field,
  restated: z.string(),
  intake_mode: z.enum(['open', 'guided']),
});

export type BuildSpec = z.infer<typeof BuildSpec>;

import { ask } from './model';
import { readFileSync } from 'fs';
import path from 'path';

const EXTRACT = readFileSync(path.join(process.cwd(), 'prompts/extract.md'), 'utf8');

export async function extractSpec(answer: string): Promise<BuildSpec | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await ask(EXTRACT, [{ role: 'user', content: answer }]);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    try {
      const parsed = BuildSpec.safeParse(JSON.parse(cleaned));
      if (parsed.success) return parsed.data;
    } catch {}
  }
  return null;
}

export type Gap = {
  field: string;
  kind: 'missing' | 'inferred';
  guess: string;
};

const FIELD_ORDER = [
  'goal',
  'audience',
  'artifact',
  'inputs',
  'success_looks_like',
  'risk_note',
] as const;

export function nextGap(spec: BuildSpec): Gap | null {
  for (const field of FIELD_ORDER) {
    const f = spec[field];
    if (f.stated) continue;
    return {
      field,
      kind: f.value.trim() === '' ? 'missing' : 'inferred',
      guess: f.value,
    };
  }
  return null;
}

const ASK = readFileSync(path.join(process.cwd(), 'prompts/ask.md'), 'utf8');

export async function askForGap(gap: Gap, spec: BuildSpec): Promise<string> {
  const context = [
    `They want: ${spec.restated}`,
    `Gap field: ${gap.field}`,
    `Gap kind: ${gap.kind}`,
    gap.guess ? `Your assumption: ${gap.guess}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return ask(ASK, [{ role: 'user', content: context }]);
}

const FOLD = readFileSync(path.join(process.cwd(), 'prompts/fold.md'), 'utf8');

export async function foldAnswer(
  spec: BuildSpec,
  field: string,
  reply: string
): Promise<BuildSpec | null> {
  const context = [
    `Current spec:`,
    JSON.stringify(spec, null, 2),
    ``,
    `Field asked about: ${field}`,
    `Their reply: ${reply}`,
  ].join('\n');

  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await ask(FOLD, [{ role: 'user', content: context }]);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    try {
      const parsed = BuildSpec.safeParse(JSON.parse(cleaned));
      if (parsed.success) return parsed.data;
    } catch {}
  }
  return null;
}