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



Return only the JSON object.

