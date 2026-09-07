\# Design intent



Things this product should be, written down before they are built. Not defects

— see FINDINGS.md for those. These are claims about what the product is for,

recorded so they survive the weeks where the work is plumbing.



\---



\## D1 — The first two minutes must produce something



\*\*Written:\*\* Week 4, after the plan generator started working.



A learner should make something quickly, and it should mean something to them.

Fast enough to surprise them. Real enough that it isn't a toy. A dopamine hit

in the first two minutes, before they have decided whether this is worth their

evening.



\*\*Why this matters:\*\* The person arriving is worried about their job. They are

not confident this will work and they are not sure they belong here. Nothing in

a five-step checklist tells them otherwise until the very end. The current

design asks for patience from exactly the person least able to spare it.



\*\*What it argues against in the current build:\*\* Step 1 is a demonstration the

learner \*reads\*. The tutor writes an example prompt, shows the output, explains

the shape. That is pedagogically correct — a worked example is the right way to

start a novice — but it is passive. The learner watches something work rather

than making something work.



\*\*What it might look like instead:\*\* Step 1 stays fully worked, but the learner

runs it on their own material within the first two minutes. Their resume. Their

mother's actual pill bottles. Their real job posting. Same worked example, same

fading schedule, but the demonstration happens on their input rather than a

sample. The output is theirs, and it exists.



\*\*Open question, deliberately unresolved:\*\* Does that two-minute thing need to

be keepable — saved, sendable, revisitable — or is the moment enough on its

own? This is a Week 8 question. A real learner will answer it in a way that

speculation cannot.



\*\*Where this gets acted on:\*\* Week 6 has "the completion moment" budgeted, and

the artifact route lands there. But the intent above is about the \*opening\*

moment, not the closing one, so it needs its own home earlier in the build.



\---



\## D2 — What the learner walks away with



\*\*Written:\*\* Week 4, after watching Plinio's first coaching session.



Something they built that solves a real problem of theirs.



\- It runs on its own — over many items, or on their own material

\- Not something they could have gotten from a chat window

\- They understand why it works, enough to fix it when it's wrong



\*\*Why this matters:\*\* The person arriving is worried about their job and wants

to understand the change rather than have it happen to them. If what they end

up with is something they could have gotten by typing into ChatGPT, they did

not need this, and they would be right to leave. The line between using AI and

building with it is whether it runs without you sitting there.



\*\*What it argues against in the current build:\*\* The coach has no definition of

what a learner is building, so it infers one. In Plinio's first session it ran

eleven turns, asked six times for a nutrition profile, produced nothing, and

ended by writing his prompt for him and sending him to ChatGPT. Every question

it asked was reasonable. Reasonable gathering, with no requirement to produce

anything, produces nothing. Nothing in prompts/coach.md mentions Tutor, so the

coach does not know it has model access of its own.



\*\*Open question, deliberately unresolved:\*\* Does "runs on its own" include

running on a schedule, or only running over many items at once? The batch

version is within reach — a loop around code that already works. The scheduled

version I have never built, and nothing in Tutor runs without a person typing

first. Committing learners to an outcome I have not produced myself is a

promise I should be able to keep. Batch is the safe claim for these 8 weeks.



\*\*Where this gets acted on:\*\* Intake has to surface a problem with repetition

in it, or the learner cannot end up with anything but a prompt. That is a Week

5 change to the intake prompts, not code. The coach rewrite follows, since its

job depends on what intake hands it.

