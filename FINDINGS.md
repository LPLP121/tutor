\# Findings — deferred, with reasons



Deferred issues found during the build. Week 7 is the scheduled place to fix

these. Each entry records what was observed, why it was not fixed at the time,

and where it was found.



\---



\## F1 — Plan generator can contradict the learner's own risk note



\*\*Found:\*\* Week 4, Step 3d, testing the generator against a caregiving spec.



A learner said they did not want to trust the tool over their mother's doctor.

The generated plan's step 1 done-when condition told them a good result was one

that did \*not\* say "consult your doctor." The plan inverted the learner's own

stated safety boundary.



\*\*Why deferred:\*\* Not a code defect — schema, fade, and JSON validation all

passed. The generator prompt is tuned entirely for pedagogy and has nothing

telling it that some requests carry real-world risk. Fixing it means adding a

safety layer to plan generation, which is Week 7 work.



\*\*Note:\*\* Intake accepted the request as reasonable, which it is. The failure is

one layer deeper, at plan generation. Week 3 hostile testing would not have

caught it.



\---



\## F2 — Full learner specs printed to server logs



\*\*Found:\*\* Week 4, reading `app/api/extract/route.ts`.



`console.log('FOLD RESULT:', ...)` prints the complete spec — job, goal, what

the person is struggling with — into Vercel's server logs, which are retained

and readable in the dashboard.



\*\*Why deferred:\*\* Useful for debugging with three known users. Needs a decision

before strangers use the product, and should be checked against what the data

promise page commits to.



\---



\## F3 — Anonymous cookie persists on shared computers



\*\*Found:\*\* Week 4, Step 2, identity design decision.



`tutor\_anon\_id` lasts 90 days. On a library or shared computer, the next person

to open the site inherits the previous learner's identity and could see their

plan.



\*\*Why deferred:\*\* No shared-computer users yet. Relevant the moment the library

pitch succeeds.



\---



\## F4 — Week 3 hostile intake answers, behavior recorded but not fixed



\*\*Found:\*\* Week 3, hostile testing.



The impossible request ("predict lottery numbers") needs an honest reframe. The

harmful request ("write fake reviews") needs a refusal that still leaves the

person willing to come back.



\*\*Why deferred:\*\* The book directs that these be logged in Week 3 and built as a

gate in Week 7.



\---



\## F5 — Unresolved npm high-severity advisory



\*\*Found:\*\* Week 4, after the Clerk install.



`npm install` reports one high severity vulnerability. `npm audit fix` not run,

because it can pull breaking versions mid-build.



\*\*Why deferred:\*\* Week 7 is a security pass with budget for exactly this.



\---



\## F6 — Local development writes to the production database



\*\*Found:\*\* Week 4, Step 3b.



`DATABASE\_URL` on the laptop and on Vercel point at the same Neon database. Test

intakes run locally will appear in production data.



\*\*Why deferred:\*\* Acceptable at three users. Neon supports database branching,

which is the real fix.



\---



\## F7 — Restatement collapses to the last answer during the asking loop



\*\*Found:\*\* Week 4, Step 4, first read of the event log.



Across one intake, `spec\_extracted` fired six times and `restated` read "You want

to share this with your co-workers as well." on every one. That is the answer to

a single follow-up question, not a restatement of what the learner wants. A

different session in the same log produced a proper restatement, so the fold is

overwriting `restated` with the latest reply instead of re-summarising the whole

spec.



\*\*Impact:\*\* The learner is shown this sentence on the confirmation card and asked

"did I get that right?" They are being asked to confirm their own last sentence

back to them. The plan is then generated from it — both plans in this session

were built on a goal the learner never stated.



\*\*Why deferred:\*\* Week 3 code, and the fix is in `prompts/fold.md` rather than

anything built this week. Needs a careful prompt change and a retest of the

asking loop.



\*\*Note:\*\* Found by the event log, seven minutes after the event log was built.



\---



\## F8 — Confirm button generates a plan per click



\*\*Found:\*\* Week 4, Step 4, same session.



`spec\_confirmed` and `plan\_generated` each fired twice, seconds apart, producing

plan 3 and plan 4 for one learner. `confirm()` sets `busy` but the confirm button

has no `disabled` binding, so a second click starts a second generation.



\*\*Impact:\*\* Duplicate rows in `specs` and `plans` with no way to tell which one

the learner actually has. Also two model calls at 8000 tokens each. At scale this

is a cost and a data-integrity problem; at three users it is confusing Week 8

data.



\*\*Why deferred:\*\* One-line fix (`disabled={busy}` on the confirm button), but it

touches the intake screen mid-step. Do it before any real learner session.

