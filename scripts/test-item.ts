// Run with: npx tsx --env-file=.env.local scripts/test-item.ts

import { processItem } from '../lib/runner';

const tool = {
  spec: 'For each section, give me one drill that makes the learner predict a shape before they see it.',
  fields: [
    { name: 'concept', description: 'The idea the section teaches' },
    { name: 'drill_question', description: 'The shape to predict' },
    { name: 'answer', description: 'The correct shape' },
  ],
  pass_fail_rule: 'An output is wrong if the drill can be answered without watching that section.',
};

const item = `Section 3: building the bigram counting matrix. We make a 2D
array N of counts, one row per first character and one column per second
character. There are 26 letters plus a special token, so we allocate it with
torch.zeros and then walk every word, incrementing N at the index pair for
each adjacent character pair.`;

async function main() {
  const outputs = await processItem(tool, item);
  console.log(JSON.stringify(outputs, null, 2));
}

main();