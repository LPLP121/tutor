-- Queries for reading the event log. One file, no dashboard.
-- A product with three users needs one query, not a chart.

-- Events by kind, per day.
SELECT
  date_trunc('day', created_at)::date AS day,
  kind,
  count(*) AS n
FROM events
GROUP BY 1, 2
ORDER BY 1 DESC, 3 DESC;


-- session_abandoned: never written, always inferred.
-- A learner who started intake and never reached a generated plan.
-- Threshold is one hour; adjust after watching a real session in Week 8.
SELECT
  e.learner_id,
  max(e.created_at) AS started_at,
  count(*) FILTER (WHERE e.kind = 'spec_rejected') AS rejections
FROM events e
WHERE e.kind = 'intake_started'
  AND NOT EXISTS (
    SELECT 1 FROM events p
    WHERE p.learner_id = e.learner_id
      AND p.kind = 'plan_generated'
      AND p.created_at > e.created_at
  )
GROUP BY e.learner_id
HAVING max(e.created_at) < now() - interval '1 hour'
ORDER BY started_at DESC;


-- One session, in order. The Week 8 query.
-- Replace the id with the learner you sat with.
SELECT created_at, kind, payload
FROM events
WHERE learner_id = 'REPLACE_ME'
ORDER BY created_at;