import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export type EventKind =
  | 'intake_started'
  | 'spec_extracted'
  | 'spec_confirmed'
  | 'spec_rejected'
  | 'plan_generated'
  | 'step_viewed'
  | 'step_submitted';

export async function log(
  learnerId: string,
  kind: EventKind,
  payload: any = {}
): Promise<void> {
  try {
    await sql`
      INSERT INTO events (learner_id, kind, payload)
      VALUES (${learnerId}, ${kind}, ${JSON.stringify(payload)})
    `;
  } catch (e) {
    console.error('event log failed:', kind, e);
  }
}