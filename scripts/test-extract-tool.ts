import { extractToolSpec, confirmToolSpec } from '../lib/toolspec';

const CONVERSATION = `
Learner: I get maybe sixty emails a week from vendors asking about invoices and I
can never tell which ones actually need me to do something today.
Coach: What would you want to see for each one?
Learner: Honestly just whether it needs action and by when.
`;

async function main() {
  const draft = await extractToolSpec(CONVERSATION);
  if (!draft) {
    console.log('FAILED: no valid draft after two attempts');
    return;
  }
  console.log(JSON.stringify(draft, null, 2));
  console.log('---');
  console.log('inferred parts:');
  if (!draft.spec.stated) console.log('  spec');
  if (!draft.pass_fail_rule.stated) console.log('  pass_fail_rule');
  for (const f of draft.fields) if (!f.stated) console.log('  field: ' + f.name);
  console.log('---');
  console.log('after confirm:', JSON.stringify(confirmToolSpec(draft), null, 2));
}

main();