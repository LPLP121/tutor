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

export async function loadLatestPlan(learnerId: string): Promise<{ planId: number; spec: BuildSpec; steps: Plan['steps'] } | null> {  const rows = await sql`
    SELECT p.id AS plan_id, p.steps, s.spec
    FROM plans p
    JOIN specs s ON s.id = p.spec_id
    WHERE s.learner_id = ${learnerId}
    ORDER BY p.created_at DESC
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  return {
    planId: rows[0].plan_id as number,
    spec: rows[0].spec as BuildSpec,
    steps: rows[0].steps as Plan['steps'],
  };
}