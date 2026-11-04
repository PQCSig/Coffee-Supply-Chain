# Insights

Durable, cross-engagement lessons — the things this repo should not have to
learn twice. One file per insight, named `YYYY-MM-DD-<topic>.md`, written when
the lesson is learned (engagement close or monthly sweep), not retroactively.

## What belongs here

- Governance decisions with reasoning (commit/visibility policy, exception doctrine)
- Process rules distilled from engagement findings (disclosure sequencing, verification gates)
- Anti-patterns observed in this repo's history, each anchored to the concrete incident that taught it

## What does not

- Per-engagement findings and evidence — those go in `../YYYY-MM-DD-<name>.md`
- Raw scan output, triage reports, enrichment caches, and the offensive
  playbook itself — local-only by policy (see the commit-policy insight below)

## Index

| Date | Insight | One-line lesson |
| ---- | ------- | --------------- |
| 2026-11-04 | [Commit policy and anti-patterns](2026-11-04-commit-policy-and-anti-patterns.md) | Commit policy and accountability, ignore secrets and working intelligence, ship the fix before disclosing the finding. |

Committability: markdown here commits under the same ignore pair as findings
(`/.gitignore`). Anything else dropped in this folder stays local.
