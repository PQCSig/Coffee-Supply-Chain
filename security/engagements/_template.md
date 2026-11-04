# Engagement — `<YYYY-MM-DD>` `<short-name>`

One file per cycle: monthly sprint or quarterly engagement, named `YYYY-MM-DD-<name>.md`. This template mirrors the phases in [the workflow](../red-team-workflow.md) — fill it as you go, not retroactively. Everything here is committed, so evidence is **redacted**: request shapes yes, working payloads no (see "What never gets committed").

- **Cadence**: monthly sprint / quarterly engagement
- **Operator**:
- **Scope snapshot commit**: `<sha>`
- **Triage reports referenced**: `.cache/triage/triage-<date>.json`

## Phase 0 — Scope

Attack surface as it stood at the snapshot commit. Anything that changed mid-cycle goes in Scope Deltas.

**Routes** (from `src/app/api/**/route.ts` + `src/proxy.ts` gates):

| Route | Methods | Auth | Rate-limited | Notes |
| ----- | ------- | ---- | ------------ | ----- |
|       |         |      |              |       |

**Secrets boundaries**: env vars consumed at runtime, rotation owner, client-bundle exposure (`NEXT_PUBLIC_*` audited).

**Dependency tree**: production vs dev split, lockfile state, new deps since last cycle.

**Data flows**: PII touchpoints (auth session, Stripe webhooks, Redis/Upstash, MongoDB collections). Synthetic data only, everywhere outside production.

**CI/CD**: workflows with write permission, third-party actions and pin state.

## Phase 1 — Scan record

| Scanner     | Command                                        | Result | Report |
| ----------- | ---------------------------------------------- | ------ | ------ |
| SSVC triage | `npm run security:triage -- --audit-level=low` |        |        |
| Merge gate  | `npm run security:check`                       |        |        |
| SAST        | CodeQL (Security tab)                          |        |        |
| Secrets     | TruffleHog (CI)                                |        |        |

## Phase 2/3 — Findings and exploitation

| #   | Finding | Source | Exploitation | Reach | Outcome | Disposition                          | SLA met | Regression test    |
| --- | ------- | ------ | ------------ | ----- | ------- | ------------------------------------ | ------- | ------------------ |
|     |         |        |              |       |         | fixed / exception / downgrade / open |         | `tests/security/…` |

### Exploitation evidence (redacted)

Per exploited finding: the attack in words, request/response shapes with payloads defanged (sequence broken, characters substituted), and why it worked. PoC code stays uncommitted — reference the engagement branch if one exists.

### Honest downgrades

Findings that could not be exploited, with the reasoning. A downgrade is data, not a dismissal — it moves to Track with the note attached.

## Phase 4 — Dispositions

- **Fixed**: PR/commit references.
- **Excepted**: advisory id, `nextReviewDate`, compensating controls (as testable statements).
- **Removed**: packages cut, replacements named.

## Phase 5 — Verification

- [ ] Every fixed finding has a passing gate or a regression test that failed before the fix
- [ ] Originating scanner alert closed (CodeQL re-scan / fresh audit)
- [ ] Every exception's compensating controls map to a testable assertion

## Phase 6 — Metrics

| Metric         | This cycle | Target                |
| -------------- | ---------- | --------------------- |
| Time-to-triage |            | same run              |
| MTTR — Act     |            | 48 hours              |
| MTTR — Attend  |            | 14 days               |
| SLA compliance |            | ≥ 90%                 |
| Exception rate |            | < 5% of open findings |

## Scope deltas & feed forward

New routes, deps, or secrets boundaries discovered mid-cycle; anything that breached SLA gets a named cause and enters the Build Queue in `../red-team-workflow.md`.
