// Run with: npx tsx --env-file=.env.local scripts/test-tools-db.ts

import { ensureLearner, saveTool, updateTool, loadLatestTool } from '../lib/db';

const learnerId = 'anon_dbtest_' + Date.now();

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
  console.log('learner:', learnerId);

  const toolId = await saveTool(learnerId, tool);
  console.log('saved tool id:', toolId);

  const back = await loadLatestTool(learnerId);
  console.log('read back fields:', back?.tool.fields.map((f) => f.name).join(', '));
  console.log('round trip matches:', back?.tool.pass_fail_rule === tool.pass_fail_rule);

  const ok = await updateTool(learnerId, toolId, {
    ...tool,
    pass_fail_rule: 'Changed rule.',
  });
  console.log('update returned:', ok);

  const denied = await updateTool('anon_someone_else', toolId, tool);
  console.log('cross-learner update blocked:', denied === false);
}

main();