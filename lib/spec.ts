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