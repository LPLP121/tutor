import { neon } from '@neondatabase/serverless';
import type { BuildSpec } from './spec';
import type { Plan } from './plan';
import type { ToolSpec } from './toolspec';
import { log } from './events';
import { processItem } from './runner';

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

export const MAX_ITEMS = 25;

export async function createRun(
  learnerId: string,
  toolId: number,
  items: string[]
): Promise<number> {
  if (items.length === 0) throw new Error('no items');
  if (items.length > MAX_ITEMS) throw new Error(`too many items (max ${MAX_ITEMS})`);

  const rows = await sql`
    INSERT INTO runs (tool_id, learner_id)
    VALUES (${toolId}, ${learnerId})
    RETURNING id
  `;
  const runId = rows[0].id as number;

  for (let i = 0; i < items.length; i++) {
    await sql`
      INSERT INTO run_items (run_id, position, item)
      VALUES (${runId}, ${i}, ${items[i]})
    `;
  }

  await log(learnerId, 'run_created', { run_id: runId, tool_id: toolId, item_count: items.length });
  return runId;
}

export async function loadRun(
  learnerId: string,
  runId: number
): Promise<{
  status: string;
  items: {
    id: number;
    position: number;
    item: string;
    status: string;
    outputs: any;
    error: string | null;
    verdict: string | null;
  }[];
} | null> {
  const runRows = await sql`
    SELECT status FROM runs
    WHERE id = ${runId} AND learner_id = ${learnerId}
  `;
  if (runRows.length === 0) return null;

  const items = await sql`
    SELECT id, position, item, status, outputs, error, verdict
    FROM run_items
    WHERE run_id = ${runId}
    ORDER BY position
  `;

  return { status: runRows[0].status as string, items: items as any };
}

// Processes the next pending item in a run. Returns how many remain after.
// One item per call — this is what keeps each invocation short.
export async function stepRun(
  learnerId: string,
  runId: number
): Promise<{ done: boolean; remaining: number }> {
  const toolRows = await sql`
    SELECT t.spec, t.fields, t.pass_fail_rule
    FROM runs r
    JOIN tools t ON t.id = r.tool_id
    WHERE r.id = ${runId} AND r.learner_id = ${learnerId}
  `;
  if (toolRows.length === 0) throw new Error('run not found');

  const tool = {
    spec: toolRows[0].spec as string,
    fields: toolRows[0].fields as ToolSpec['fields'],
    pass_fail_rule: toolRows[0].pass_fail_rule as string,
  };

  const next = await sql`
    SELECT id, item FROM run_items
    WHERE run_id = ${runId} AND status = 'pending'
    ORDER BY position
    LIMIT 1
  `;

  if (next.length === 0) {
    await sql`UPDATE runs SET status = 'done' WHERE id = ${runId}`;
    await log(learnerId, 'run_finished', { run_id: runId });
    return { done: true, remaining: 0 };
  }

  const itemId = next[0].id as number;

  try {
    const outputs = await processItem(tool, next[0].item as string);
    await sql`
      UPDATE run_items
      SET status = 'done', outputs = ${JSON.stringify(outputs)}
      WHERE id = ${itemId}
    `;
    await log(learnerId, 'run_item_done', { run_id: runId, item_id: itemId });
  } catch (e: any) {
    await sql`
      UPDATE run_items
      SET status = 'error', error = ${String(e.message ?? e)}
      WHERE id = ${itemId}
    `;
    await log(learnerId, 'run_item_error', { run_id: runId, item_id: itemId, error: String(e.message ?? e) });
  }

  const left = await sql`
    SELECT COUNT(*)::int AS n FROM run_items
    WHERE run_id = ${runId} AND status = 'pending'
  `;
  return { done: false, remaining: left[0].n as number };
}

export async function setVerdict(
  learnerId: string,
  itemId: number,
  verdict: 'pass' | 'fail' | null
): Promise<boolean> {
  const rows = await sql`
    UPDATE run_items
    SET verdict = ${verdict}
    WHERE id = ${itemId}
      AND run_id IN (SELECT id FROM runs WHERE learner_id = ${learnerId})
    RETURNING id
  `;
  if (rows.length === 0) return false;
  await log(learnerId, 'verdict_set', { item_id: itemId, verdict });
  return true;
}