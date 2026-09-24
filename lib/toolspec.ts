import { z } from 'zod';
import { Field } from './spec';

// A field definition: what the learner wants back per item.
// No value yet — the value only exists once a run produces one.
export const FieldDef = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  // 'extract' — pull this out of the item. 'write' — produce it for the item.
  mode: z.enum(['extract', 'write']).optional(),
});

export const ToolSpec = z.object({
  spec: z.string().min(1),
  fields: z.array(FieldDef).min(1).max(5),
  pass_fail_rule: z.string().min(1),
});

export type FieldDef = z.infer<typeof FieldDef>;
export type ToolSpec = z.infer<typeof ToolSpec>;

// One item's result from a run. Here is where Field comes back:
// every produced value carries whether the source stated it.
export const ResultRow = z.object({
  item: z.string(),
  outputs: z.record(z.string(), Field),
});

export type ResultRow = z.infer<typeof ResultRow>;

import { ask } from './model';
import { readFileSync } from 'fs';
import path from 'path';

// A draft carries the same three parts as a ToolSpec, plus a stated flag
// on each one. It never reaches the database. confirmToolSpec strips the
// flags off once the learner has seen them and agreed.
export const FieldDefDraft = FieldDef.extend({ stated: z.boolean() });

export const ToolSpecDraft = z.object({
  spec: Field,
  fields: z.array(FieldDefDraft).min(1).max(5),
  pass_fail_rule: Field,
});

export type FieldDefDraft = z.infer<typeof FieldDefDraft>;
export type ToolSpecDraft = z.infer<typeof ToolSpecDraft>;

export function confirmToolSpec(draft: ToolSpecDraft): ToolSpec {
  return ToolSpec.parse({
    spec: draft.spec.value,
    fields: draft.fields.map((f) => ({
      name: f.name,
      description: f.description,
      mode: f.mode,
    })),
    pass_fail_rule: draft.pass_fail_rule.value,
  });
}

const EXTRACT_TOOL = readFileSync(
  path.join(process.cwd(), 'prompts/extract-tool.md'),
  'utf8'
);

export async function extractToolSpec(
  conversation: string
): Promise<ToolSpecDraft | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await ask(EXTRACT_TOOL, [{ role: 'user', content: conversation }]);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    try {
      const parsed = ToolSpecDraft.safeParse(JSON.parse(cleaned));
      if (parsed.success) return parsed.data;
    } catch {}
  }
  return null;
}