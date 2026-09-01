import { z } from 'zod';

const WorkedExample = z.object({
  prompt: z.string().min(1),
  output: z.string().min(1),
  why: z.string().min(1),
});

const Step = z.object({
  title: z.string().min(1),
  why: z.string().min(1),
  instruction: z.string().min(1),
  doneWhen: z.string().min(1),
  worked: WorkedExample.nullable(),
});

export const Plan = z.object({
  steps: z.array(Step).length(5),
}).superRefine((plan, ctx) => {
  const [one, two, three, four, five] = plan.steps;

  if (!one.worked) {
    ctx.addIssue({
      code: 'custom',
      path: ['steps', 0, 'worked'],
      message: 'Step 1 must be fully worked: prompt, output, and why.',
    });
  }

  if (!two.worked && !three.worked) {
    ctx.addIssue({
      code: 'custom',
      path: ['steps', 1, 'worked'],
      message: 'Steps 2 and 3 must keep partial scaffolding — at least one worked example between them.',
    });
  }

  if (four.worked) {
    ctx.addIssue({
      code: 'custom',
      path: ['steps', 3, 'worked'],
      message: 'Step 4 must not include a worked example.',
    });
  }

  if (five.worked) {
    ctx.addIssue({
      code: 'custom',
      path: ['steps', 4, 'worked'],
      message: 'Step 5 must not include a worked example — the learner works alone.',
    });
  }
});

export type Plan = z.infer<typeof Plan>;

import { ask } from './model';
import { readFileSync } from 'fs';
import path from 'path';
import type { BuildSpec } from './spec';

const PLAN = readFileSync(path.join(process.cwd(), 'prompts/plan.md'), 'utf8');

export async function generatePlan(spec: BuildSpec): Promise<Plan | null> {
  const context = [
    `They want: ${spec.restated}`,
    `Goal: ${spec.goal.value}`,
    `Audience: ${spec.audience.value}`,
    `Artifact: ${spec.artifact.value}`,
    `Inputs they have: ${spec.inputs.value}`,
    `Success looks like: ${spec.success_looks_like.value}`,
    `Risk to keep in mind: ${spec.risk_note.value}`,
  ].join('\n');

  let correction = '';

  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await ask(PLAN, [{ role: 'user', content: context + correction }], 8000);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    try {
      const parsed = Plan.safeParse(JSON.parse(cleaned));
      if (parsed.success) return parsed.data;
      correction =
        '\n\nYour previous attempt was rejected for these reasons. Fix them:\n' +
        parsed.error.issues.map((i) => `- ${i.message}`).join('\n');
     } catch {
      correction = '\n\nYour previous attempt was not valid JSON. Return only JSON, no fences.';
    }
  }

  return null;
}