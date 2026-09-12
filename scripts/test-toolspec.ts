import { ToolSpec, ResultRow } from '../lib/toolspec';

let failures = 0;

function check(label: string, passed: boolean) {
  console.log(passed ? `PASS  ${label}` : `FAIL  ${label}`);
  if (!passed) failures++;
}

// The real tool from TOOLSPEC.md.
const good = {
  spec: 'For each section, give me one drill that makes the learner predict a shape before they see it.',
  fields: [
    { name: 'concept', description: 'The idea the section teaches' },
    { name: 'drill_question', description: 'The shape to predict' },
    { name: 'answer', description: 'The correct shape' },
  ],
  pass_fail_rule: 'An output is wrong if the drill can be answered without watching that section.',
};

check('valid tool parses', ToolSpec.safeParse(good).success);

check(
  'six fields rejected',
  !ToolSpec.safeParse({
    ...good,
    fields: [...good.fields, ...good.fields],
  }).success
);

check('zero fields rejected', !ToolSpec.safeParse({ ...good, fields: [] }).success);

check(
  'empty pass/fail rule rejected',
  !ToolSpec.safeParse({ ...good, pass_fail_rule: '' }).success
);

check(
  'result row carries stated per output',
  ResultRow.safeParse({
    item: 'Section 3: the bigram counting matrix',
    outputs: {
      concept: { value: 'Counting bigrams into a 27x27 matrix', stated: true },
      drill_question: { value: 'What shape is N?', stated: true },
      answer: { value: '27 by 27', stated: false },
    },
  }).success
);

console.log(failures === 0 ? '\nAll passed.' : `\n${failures} failed.`);
process.exit(failures === 0 ? 0 : 1);