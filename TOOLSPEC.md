\# ToolSpec — what Tutor stores when a learner defines a tool



A tool is a row. Material is not part of it; material belongs to a run.



\## The row

\- id

\- learner\_id

\- spec            (the learner's sentence, one string, not parsed)

\- fields          (JSONB, the output shape, max 5)

\- pass\_fail\_rule  (the learner's sentence, one string)



\## Fields

Each field carries a name, a one-line description, and per result row

a value and stated: boolean. Reuses the Field type from lib/spec.ts.

The coach drafts the field list by message two; the learner corrects it.



\## Pass/fail rule

Written before the run. Stored with the tool, not the run.

Applied by the learner, by hand, in the results view. Not model-judged.



\## Worked example — my own dogfood tool

Material: 25 sections of a makemore transcript, one per item.

Spec: "For each section, give me one drill that makes the learner

predict a shape before they see it."

Fields: concept, drill\_question, answer.

Pass/fail rule: "An output is wrong if the drill can be answered

without watching that section."

