import { neon } from '@neondatabase/serverless';
import type { BuildSpec } from './spec';
import type { Plan } from './plan';

const sql = neon(process.env.DATABASE_URL!);

export async function ensureLearner(learnerId: string): Promise<void> {
  await sql`
    INSERT INTO learners (id)
    VALUES (${learnerId})
    ON CONFLICT (id) DO NOTHING
  `;
}

export async function saveSpec(learnerId: string, spec: BuildSpec): Promise<number> {
  const rows = await sql`
    INSERT INTO specs (learner_id, spec)
    VALUES (${learnerId}, ${JSON.stringify(spec)})
    RETURNING id
  `;
  return rows[0].id as number;
}

export async function savePlan(specId: number, plan: Plan): Promise<number> {
  const rows = await sql`
    INSERT INTO plans (spec_id, steps)
    VALUES (${specId}, ${JSON.stringify(plan.steps)})
    RETURNING id
  `;
  return rows[0].id as number;
}