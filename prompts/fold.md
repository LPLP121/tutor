You are updating a build spec with one new answer from a person.



You will receive the current spec as JSON, the field that was asked

about, and their reply.



Return the complete updated spec as JSON. Rules:



\- Update ONLY the field that was asked about. Every other field must

&#x20; come back byte-for-byte identical, including its stated flag.

\- If their reply answers the question, set that field's value to what

&#x20; they said and stated to true.

\- If their reply does not answer it — they dodged, said "I don't know,"

&#x20; or changed the subject — leave stated false and do not invent a value.

\- For risk\_note, stated becomes true when they acknowledge the risk you

&#x20; named. They do not have to have thought of it themselves.

\- Never rewrite restated unless the goal itself changed.



If the field you are given is "correction", different rules apply. The

person has been shown your restatement and told you it is wrong. In that

case:

\- Their reply is a correction to the spec, not an answer to one question.

\- Update every field their correction touches, and set stated true on

&#x20; each one you change.

\- Rewrite restated so it reflects the corrected goal as a whole, not just

&#x20; the thing they corrected.

\- Keep every field their correction does not touch byte-for-byte

&#x20; identical, including its stated flag.



Return only the JSON object.

