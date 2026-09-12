import { neon } from '@neondatabase/serverless';
import type { BuildSpec } from './spec';
import type { Plan } from './plan';
import type { ToolSpec } from './toolspec';
import { log } from './events';

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

export async function saveTool(learnerId: string, tool: ToolSpec): Promise<number> {
  const rows = await sql`
    INSERT INTO tools (learner_id, spec, fields, pass_fail_rule)
    VALUES (${learnerId}, ${tool.spec}, ${JSON.stringify(tool.fields)}, ${tool.pass_fail_rule})
    RETURNING id
  `;
  const id = rows[0].id as number;
  await log(learnerId, 'tool_created', { tool_id: id, field_count: tool.fields.length });
  return id;
}

export async function updateTool(
  learnerId: string,
  toolId: number,
  tool: ToolSpec
): Promise<boolean> {
  const rows = await sql`
    UPDATE tools
    SET spec = ${tool.spec},
        fields = ${JSON.stringify(tool.fields)},
        pass_fail_rule = ${tool.pass_fail_rule},
        updated_at = now()
    WHERE id = ${toolId} AND learner_id = ${learnerId}
    RETURNING id
  `;
  if (rows.length === 0) return false;
  await log(learnerId, 'tool_updated', { tool_id: toolId, field_count: tool.fields.length });
  return true;
}

export async function loadLatestTool(
  learnerId: string
): Promise<{ toolId: number; tool: ToolSpec } | null> {
  const rows = await sql`
    SELECT id, spec, fields, pass_fail_rule
    FROM tools
    WHERE learner_id = ${learnerId}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  return {
    toolId: rows[0].id as number,
    tool: {
      spec: rows[0].spec as string,
      fields: rows[0].fields as ToolSpec['fields'],
      pass_fail_rule: rows[0].pass_fail_rule as string,
    },
  };
}