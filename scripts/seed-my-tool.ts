// Run with: npx tsx --env-file=.env.local scripts/seed-my-tool.ts

import { ensureLearner, saveTool } from '../lib/db';

const learnerId = 'anon_c2fdfdc0-e787-4727-a584-cd75fd63cd76';

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
  console.log('tool', toolId, 'saved for', learnerId);
}

main();