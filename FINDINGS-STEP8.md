# Step 8 findings

Written September 26, 2026, after Step 8 (`3181116` through `2814dbb`) and a full walkthrough on the live site (run 7).

Numbered S8-n so they don't collide with FINDINGS.md.

## S8-1 — The clipboard mangles files pasted from chat into Notepad

Adds backslashes before markdown characters (`\-`, `\_`, `\#`, `1\.`), turns leading spaces into `&#x20;`, and drops `<a` tags entirely. Hit in `prompts/extract-tool.md` and `prompts/plan.md` (both cleaned) and `app/page.tsx` (fixed by hand).

`prompts/extract.md` has carried escaped characters since Week 3 and has not been cleaned. Intake works anyway, so the model reads past it, but it is noise in a live prompt.

Workaround: run the PowerShell replace after pasting; type anything containing `<a` by hand. Durable fix: files arrive by download, not clipboard. This file is the first one done that way.

## S8-2 — Chat is not saved, so the coach helps blind

The tool screen drafts from the stored intake spec, because chat messages live only in the browser. Anything the learner tells the coach after intake never reaches their tool.

Partly resolved: the coach no longer drafts (`487a8d8`), so there is one draft, not two. Still open: `/api/chat` receives the intake spec only. The coach cannot see the learner's saved tool, their rule, or their run results, so it cannot help with "why did this one fail?"

## S8-3 — Fields are read-only on the tool screen

The learner sees which fields were invented but cannot edit, remove, or add one. Deliberate cut for Step 8.

## S8-4 — `Field` has no `.min(1)`

A draft can carry an empty spec or rule. `confirmToolSpec` now parses against `ToolSpec` and throws, and the tool screen blocks save when either is empty. The schema itself is unchanged.

## S8-5 — The plan and the coach both lean toward writing the learner's rule

Plan step 1 shows a failed output whose broken rule matches the learner's own intake risk almost exactly. The coach offered an example "from a different domain" that was the same domain and nearly the learner's rule.

`coach.md` now requires examples from a different line of work. Plan step 1 is unchanged. Watch in Plinio's session whether his rule is his or a copy.

## S8-6 — `stated` works per field, not per claim

A written field is marked "written by the model" as a whole, so invented facts inside it are not individually visible. In run 7 all three replies invented store policy (expedited shipping, a tag rule, a refund promise). The builder passed one on first read.

A rule about tone does not catch invented facts. This is a curriculum question before it is a code question: nothing in Tutor currently prompts a learner to check for made-up facts.

## S8-7 — Model failures surface as a raw crash

When the API call fails, `/api/extract` returns a 500 with no body and the page shows `Unexpected end of JSON input`. Hit on September 26 when the credit balance ran out. Other routes likely behave the same.

Two problems: the learner sees a crash, not a message; and nothing warned that the balance was running low. Section 8 of the plan, happening in development.

## S8-8 — Every visit to the tool screen redrafts

`extractToolSpec` runs on each page load, so the draft can change between visits (field names varied run to run) and each load costs a model call.

## S8-9 — The run screen didn't say what an item is

Fixed in `2814dbb`: the screen now shows the saved tool. Kept here because the builder got stuck on it, which is the evidence it would have stopped Plinio.

## S8-10 — The double-call guard on the tool screen probably doesn't work

The `asked` state guard in `app/tool/page.tsx` was meant to stop React's dev mode from calling `/api/tool/draft` twice. It likely doesn't: both runs of the effect see `asked` as false. The error disappeared on the retest, but that may have been both calls succeeding. Correct fix is a `useRef` guard.

Dev only. Production runs the effect once, so learners are not affected.
