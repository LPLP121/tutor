// Run with: npx tsx --env-file=.env.local scripts/test-item.ts

import { processItem } from '../lib/runner';

const tool = {
  spec: 'For each complaint, tell me what went wrong and draft a reply I can send.',
  fields: [
    { name: 'product', description: 'Which product the complaint is about', mode: 'extract' as const },
    { name: 'problem', description: 'What went wrong, in a few words', mode: 'extract' as const },
    { name: 'reply', description: 'A short, warm reply to the customer that addresses the specific problem', mode: 'write' as const },
  ],
  pass_fail_rule: 'An output is wrong if the reply promises a refund, since I never authorised that.',
};

const item = `Ordered the walnut side table on the 3rd, arrived yesterday with
a long scratch down one leg and the box was crushed on one corner. I don't want
to ship it back and wait another two weeks. Third order from you and the first
one that's had a problem.`;

async function main() {
  const outputs = await processItem(tool, item);
  console.log(JSON.stringify(outputs, null, 2));
}

main();