import { z } from 'zod';
import { Field } from './spec';

// A field definition: what the learner wants back per item.
// No value yet — the value only exists once a run produces one.
export const FieldDef = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
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