// Run with: npx tsx --env-file=.env.local scripts/test-run-loop.ts

import { ensureLearner, saveTool, createRun, stepRun, loadRun } from '../lib/db';

const learnerId = 'anon_looptest_' + Date.now();

const tool = {
  spec: 'For each section, give me one drill that makes the learner predict a shape before they see it.',
  fields: [
    { name: 'concept', description: 'The idea the section teaches' },
    { name: 'drill_question', description: 'The shape to predict' },
    { name: 'answer', description: 'The correct shape' },
  ],
  pass_fail_rule: 'An output is wrong if the drill can be answered without watching that section.',
};

const items = [
  'Section 1: reading names.txt. We load 32,033 names, one per line, and look at the shortest and longest.',
  'Section 2: bigrams as a dictionary. We count every adjacent character pair across all names into a Python dict keyed by tuples.',
  'Section 3: the counting matrix. We move the counts into a 2D torch tensor N, one row per first character, one column per second, allocated with torch.zeros.',
];

async function main() {
  await ensureLearner(learnerId);
  const toolId = await saveTool(learnerId, tool);
  const runId = await createRun(learnerId, toolId, items);
  console.log('run', runId, 'created with', items.length, 'items\n');

  let guard = 0;
  while (guard++ < 30) {
    const started = Date.now();
    const { done, remaining } = await stepRun(learnerId, runId);
    if (done) break;
    console.log(`item processed in ${Date.now() - started}ms — ${remaining} remaining`);
  }

  const run = await loadRun(learnerId, runId);
  console.log('\nrun status:', run?.status);
  for (const i of run?.items ?? []) {
    console.log(`\n[${i.position}] ${i.status}`);
    if (i.error) console.log('  error:', i.error);
    if (i.outputs) {
      for (const [k, v] of Object.entries(i.outputs as any)) {
        const f = v as { value: string; stated: boolean };
        console.log(`  ${k} (stated: ${f.stated}): ${f.value.slice(0, 70)}`);
      }
    }
  }
  console.log('\nlearner:', learnerId);
}

main();