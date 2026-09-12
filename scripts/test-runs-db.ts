// Run with: npx tsx --env-file=.env.local scripts/test-runs-db.ts

import { ensureLearner, saveTool, createRun, loadRun, MAX_ITEMS } from '../lib/db';

const learnerId = 'anon_runtest_' + Date.now();

const tool = {
  spec: 'For each section, give me one drill that makes the learner predict a shape before they see it.',
  fields: [
    { name: 'concept', description: 'The idea the section teaches' },
    { name: 'drill_question', description: 'The shape to predict' },
    { name: 'answer', description: 'The correct shape' },
  ],
  pass_fail_rule: 'An output is wrong if the drill can be answered without watching that section.',
};

async function main() {
  await ensureLearner(learnerId);
  const toolId = await saveTool(learnerId, tool);

  const items = ['Section 1: intro', 'Section 2: bigrams', 'Section 3: the counting matrix'];
  const runId = await createRun(learnerId, toolId, items);
  console.log('run id:', runId);

  const run = await loadRun(learnerId, runId);
  console.log('run status:', run?.status);
  console.log('item count:', run?.items.length);
  console.log('order preserved:', run?.items.map((i) => i.position).join(',') === '0,1,2');
  console.log('all pending:', run?.items.every((i) => i.status === 'pending'));
  console.log('verdicts empty:', run?.items.every((i) => i.verdict === null));

  const other = await loadRun('anon_someone_else', runId);
  console.log('cross-learner read blocked:', other === null);

  const tooMany = Array.from({ length: MAX_ITEMS + 1 }, (_, i) => 'item ' + i);
  try {
    await createRun(learnerId, toolId, tooMany);
    console.log('cap enforced: false');
  } catch {
    console.log('cap enforced: true');
  }

  try {
    await createRun(learnerId, toolId, []);
    console.log('empty rejected: false');
  } catch {
    console.log('empty rejected: true');
  }
}

main();