# Red Team Vulnerability Workflow — Scan to Remediation

Applies to: `**`
Read with: [AGENTS.md](AGENTS.md) · [audit-with-exceptions.mjs](../scripts/audit-with-exceptions.mjs) · [.npm-audit-exceptions.json](../.npm-audit-exceptions.json)

> **Applicability in this repo (updated 2026-11-04).** This template was ported from a
> Next.js application and parts of its machinery do **not** exist here:
> `tests/security/`, `src/proxy.ts`, the ZAP/DAST stack, and the
> `npm run security:triage`/`security:aging` scripts (SSVC/KEV/EPSS triage and
> SLA aging are not ported). Wherever the body below says **BUILT** or
> **shipped** — the Build Queue, the Cadence table, and every reference to
> `red-team.yml`, `red-team-dast.yml`, `codeql.yml`, TruffleHog, or
> `.github/zap/` — those statuses describe the **source project**, not this
> repository. The only workflow file here is `.github/workflows/security.yml`
> (plus `dependabot.yml`); DAST and the weekly red-team bundles are
> build-queue items, not operating machinery.
> What exists and operates today: the engagement-record
> convention (`engagements/`), the "what never gets committed" ignore policy
> (enforced in `/.gitignore`), the CI merge gate
> (`/.github/workflows/security.yml`), and the exceptions-aware audit gate —
> `scripts/audit-with-exceptions.mjs` + `.npm-audit-exceptions.json` (minimal
> port of this document's ledger design; `npm run security:check`). The Phase 0
> attack surface for this repository is the Solidity contracts
> (`contracts/**`), the DApp UI (`src/js/app.js`, `index.html`), and the npm
> dependency tree — substitute `npm audit`/`solhint`/`truffle test` for the
> scanner commands, and record contract findings with
> `security/engagements/`. Everything else is an aspirational build queue,
> not a description of this codebase.

## Operating Principle

The ideal repo already runs a strong defense: gates on every PR, a daily patch bot, Dependabot with publish cooldown, secret scanning, and a documented-exception audit policy. What it lacks is the spear — a repeatable adversarial cycle that hunts for what scanners miss, prioritizes by exploitability instead of raw severity, and drives every confirmed finding to a verified fix.

This document defines that cycle. The rule that governs it: **a finding is not closed until a gate or a test proves it closed.** Scanner noise gets triaged, real weaknesses get exploited and fixed, and every fix lands a regression test in `tests/security/`.

Patch velocity is the metric that matters. Reference: _\*"Given Enough Agents, All Bugs Become Shallow"_ — the header comment in `.github/workflows/security.yml`.

---

## Operating the Pipeline (start here)

If you are new to this repo: **the machinery runs itself on a schedule. Your job is to read what it reports and act inside your authority.** The monthly sprint and quarterly engagement are the human cycles — everything below them is automated.

Your first hour:

1. Read this document top to bottom once. Then skim the two workflows, [`.github/workflows/red-team.yml`](../.github/workflows/red-team.yml) and [`.github/workflows/red-team-dast.yml`](../.github/workflows/red-team-dast.yml) — every security decision in them carries a comment explaining itself.
2. Run each tool locally once to learn its output shape. All three explain their own verdicts in the console:
   - `npm run security:triage -- --audit-level=low` — the deep scan (needs network for KEV/EPSS enrichment)
   - `npm run security:aging` — SLA clocks over accumulated triage reports
   - `npm run security:check` — what the merge gate runs (banned packages + audit)
3. Skim `.npm-audit-exceptions.json` — the accepted-risk ledger — and `tests/security/`, the regression suites that keep accepted risks honest.

Every Monday: read the two `[red-team]` tracking issues in that order — **weekly triage first** (dependency surface), **ZAP baseline second** (rendered surface). Open the report artifacts only when a finding needs detail. Monthly: run the sweep (exceptions review + aging) and, in sprint months, write the engagement record from [`_template.md`](engagements/_template.md).

### When a signal fires — what it means and who decides

| Signal                               | It means                                                                                      | You do                                                                                                       | You escalate when                                                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `security-gate` red on your PR       | Unhandled advisory ≥ high, expired exception, banned package, or a failing security test      | Fix, override the pin, or draft an exception entry (schema in the audit script header)                       | You want to _accept_ the risk — exceptions carry an `approvedBy`; approval is not self-service            |
| `[red-team] weekly triage` issue     | Act = KEV-listed and production-reachable (48h clock); Attend = 14 days; Track = normal cycle | Verify reach yourself (dev vs prod tree), patch via PR, or draft an exception                                | Anything Act — patch inside 48 hours needs maintainer hands immediately; cooldown never delays an Act fix |
| `[red-team] ZAP baseline` issue      | Passive DAST finding on the rendered surface                                                  | Check each alert against the app; add a justified IGNORE to `.github/zap/baseline-rules.tsv` or file the fix | The finding looks exploitable — treat it as an engagement finding (Phase 3), never tune it away           |
| `npm run security:aging` exit 1      | Open finding past SLA, or expired exception                                                   | Re-triage: fix, except, or document why it rides                                                             | The breach is older than one cycle, or the same cause repeats                                             |
| Any scheduled run red with no report | The scan went blind (script exit 2)                                                           | Read the run logs first                                                                                      | Pipeline stays broken a second run — a silent scanner is a security event                                 |

Authority boundaries, plainly: a learning analyst may triage, verify or downgrade findings (with written reasoning), patch, and add regression tests. Accepting a risk on the books, approving exceptions, and overriding an Act outcome are maintainer decisions — the ledger records `approvedBy` on purpose.

---

## System of Record

Findings live in exactly one place depending on type — never in chat threads or issue limbo:

| Finding type                                        | System of record                                                       | Lifetime                                                              |
| --------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Dependency advisories (prod)                        | `npm audit` + `.npm-audit-exceptions.json` if accepted                 | Closed when the gate passes, or when the exception expires            |
| Code weaknesses (SAST)                              | CodeQL alerts (GitHub Security tab)                                    | Closed when CodeQL re-scan is clean                                   |
| Secrets                                             | TruffleHog alert + rotation ticket                                     | Closed when credential is rotated AND history is scrubbed or revoked  |
| Supply-chain posture                                | `verify-banned.mjs` + Dependabot cooldown config                       | Closed when the tree is clean                                         |
| Red team findings (exploited or confirmed manually) | `security/engagements/YYYY-MM-DD-<name>.md`                            | Closed when Phase 5 verification passes                               |
| Accepted risks                                      | `.npm-audit-exceptions.json` (keyed by GHSA id, with `nextReviewDate`) | Auto-fail the gate on expiry — re-review is mandatory, never optional |

### What never gets committed

Git history is public infrastructure. Several artifacts this workflow produces are a **vulnerability map of the production tree** — which advisories apply, at which versions, with which reach — and handing that to an attacker pre-triaged defeats the point of the exercise. Committed templates stay clean too: `.env.example` carries placeholders only, and `.env.test` is ignored outright because it holds real test-mode Stripe ids.

| Artifact                                                            | Where it lives                       | Why not git                                                                |
| ------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------- |
| Audit snapshots (`security-audit*.json`, `audit-before/after.json`) | CI runners, or `.gitignore`d locally | Dependency-version intel for the production tree                           |
| Triage reports + enrichment cache (`.cache/triage/`)                | Local cache, CI artifacts            | Same — an attacker reads it as "here is what's exploitable and what isn't" |
| DAST session state (`.zap/`)                                        | Runner workspace                     | Contains app routes and auth-session material                              |
| Engagement PoC scripts, payloads, captures                          | Engagement branch or nowhere         | Working exploit code in `main` is a loaded weapon                          |
| Engagement finding reports (`security/engagements/*.md`)            | Committed — redacted evidence only   | The record matters; the ammunition doesn't                                 |

The `security/engagements/**` + `!security/engagements/*.md` ignore pair enforces the last two rows mechanically: markdown findings flow into history, everything else dropped into that directory stays out. If a report genuinely needs a payload snippet to make its point, it gets defanged (sequence broken, characters substituted) inside the markdown itself.

---

## Cadence

| Trigger              | What runs                                                                                                              | Phase coverage |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------- |
| Every push / PR      | `security-gate` job: banned check, audit ≥ high (exceptions-aware), typecheck, security test suite; CodeQL; TruffleHog | Phases 1, 5    |
| Daily 06:00 UTC      | `daily-patch` job: `npm audit fix` → auto-PR with before/after counts                                                  | Phase 4        |
| Weekly Mon 06:36 UTC | CodeQL scheduled scan (actions, js/ts, python)                                                                         | Phase 1        |
| Weekly Mon 08:00 UTC | `red-team.yml`: full-surface SSVC triage, artifact report, Act/Attend tracking issue                                   | Phases 1, 2, 6 |
| Weekly Mon 08:45 UTC | `red-team-dast.yml`: ZAP baseline (passive) against the production build, tracking issue, report artifact              | Phase 1        |
| Weekly Mon 09:00     | Dependabot grouped version PRs (3/3/7-day publish cooldown)                                                            | Phase 4        |
| Monthly, 1st week    | Exception review sweep + aging report + red team sprint (Phase 1–3 on the current attack surface)                      | Phases 0–3, 6  |
| Quarterly            | Full engagement: fresh scope, exploitation attempts, purple-team retro, policy updates                                 | All phases     |

The monthly sprint and quarterly engagement use the same runbook below — only depth changes.

---

## The Pipeline

```
[0 Scope] → [1 Scan] → [2 Triage] → [3 Exploit] → [4 Remediate] → [5 Verify] → [6 Report]
    ↑                                                                              |
    └────────────────────── findings reshape next cycle's scope ──────────────────┘
```

### Phase 0 — Scope (attack surface inventory)

Build the target list before touching a scanner. For this repo the surface is:

1. **Routes**: every file under `src/app/api/` and `middleware`/`src/proxy.ts` gates — method, auth requirement, rate-limit status.
2. **Secrets boundaries**: env vars consumed at runtime (`process.env.*`), their rotation owner, and whether they reach the client bundle.
3. **Dependencies**: production tree (`npm ls --omit=dev --json`) vs dev tree — different blast radius, different SLA.
4. **Data flows**: PII touching points — auth session, Stripe webhooks, Redis/Upstash caches, MongoDB collections. GDPR posture: synthetic data only, everywhere outside production.
5. **CI/CD**: workflow triggers with any write permission (`daily-patch` is the only one), third-party actions and their SHA pins.

Output: a dated scope section at the top of the engagement file. Scope drift between cycles is itself a finding.

### Phase 1 — Scan

Run everything that is cheap and automated; keep human time for triage.

| Scanner                              | Command                                                                                 | Catches                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Dependency audit (gate policy)       | `npm run audit:exceptions -- --omit=dev --audit-level=high`                             | Known CVEs in the production tree                               |
| Dependency audit (full, triage-only) | `npm run audit:exceptions -- --audit-level=low`                                         | Dev-tree findings worth knowing (cypress, jest chains)          |
| SAST                                 | CodeQL (CI, `codeql.yml`)                                                               | Injection, auth flaws, workflow misuse                          |
| Secrets                              | TruffleHog `--only-verified` + the grep pattern in `security.yml`                       | Live credentials in history or source                           |
| Banned packages                      | `npm run verify:banned`                                                                 | SHA1-Hulud-class compromised packages                           |
| Outdated drift                       | `npm outdated` (via `verify:packages`)                                                  | Stale pins hiding unpatched bugs                                |
| E2E behavior                         | `npm run test:security:suite`                                                           | Auth, input validation, data protection, dev-bypass regressions |
| DAST                                 | ZAP baseline (passive) against the standalone production build, via `red-team-dast.yml` | Runtime misconfig, missing headers, auth bypass on live routes  |

Scan output is raw material. Nothing in Phase 1 is a conclusion — severity labels from scanners are inputs to Phase 2, not verdicts.

### Phase 2 — Triage (exploitability over severity)

Raw CVSS says nothing about _this_ app. Each unique finding gets one SSVC-style decision using four questions, in order:

1. **Exploitation** — is it in CISA KEV, or does EPSS show > 0.5 exploitation probability? (`none` / `poc` / `active`)
2. **Reach** — is the vulnerable code path reachable in _our_ production runtime? A dev-only chain (e.g. cypress → systeminformation) is structurally different from an express route bug. (`isolated` / `reachable` / `exposed` for internet-facing)
3. **Automatability** — network vector, low complexity, no user interaction? (`yes` / `no`)
4. **Mission prevalence** — auth, payments, data storage are essential; everything else supports. (`essential` / `support` / `minimal`)

Decision tree:

| Exploitation      | Reach                | Automatable | Outcome     |
| ----------------- | -------------------- | ----------- | ----------- |
| active (KEV/EPSS) | exposed or reachable | any         | **Act**     |
| active            | isolated             | any         | **Attend**  |
| poc               | exposed              | yes         | **Attend**  |
| poc               | reachable            | any         | **Track\*** |
| none              | exposed              | yes         | **Track\*** |
| none              | reachable            | any         | **Track**   |
| none              | isolated             | any         | **Track**   |

Outcomes map to SLAs:

| Outcome | SLA      | Action                                                                                            |
| ------- | -------- | ------------------------------------------------------------------------------------------------- |
| Act     | 48 hours | Patch lands ahead of Dependabot cooldown — cooldown never delays a KEV-listed, reachable advisory |
| Attend  | 14 days  | Fix or exception in the current sprint                                                            |
| Track\* | 30 days  | Fix in a scheduled patch PR                                                                       |
| Track   | 90 days  | Normal Dependabot cycle                                                                           |

The existing exception machinery enforces the boundary between "accepted risk" and "forgotten risk": an entry in `.npm-audit-exceptions.json` carries `reason`, `approvedBy`, `mitigations`, and a `nextReviewDate`; a past date hard-fails the gate ([`audit-with-exceptions.mjs`](../scripts/audit-with-exceptions.mjs)). Keep that file as the single exception ledger for dependency findings; engagement findings record acceptance in the engagement file with the same fields.

### Phase 3 — Exploit (prove it or downgrade it)

For **Act** and **Attend** findings only — attempting exploitation on every scanner warning wastes the sprint. The red team question is always: can this cause unauthorized access, data breach, or system compromise _here_?

Rules of engagement (non-negotiable):

- **Target**: local dev (`npm run dev`) or a disposable preview build. Never the production Fly app. Never any system holding real user data.
- **Data**: synthetic only. This project's GDPR posture extends to its own testing.
- **Scope of attempts**: auth bypass, session/JWT flaws, injection (SQL/NoSQL/command/template), path traversal, SSRF, prototype pollution, rate-limit evasion, webhook signature bypass, dev-bypass leakage (`tests/security/dev-bypass.test.ts` exists precisely because this class of bug bit before), supply-chain manifests (install scripts, postinstall behavior of new deps).
- **Method**: use the matching skill from `.agents/skills/` — e.g. `testing-for-broken-access-control`, `testing-jwt-token-security`, `exploiting-prototype-pollution-in-javascript`, `testing-api-security-with-owasp-top-10`. Index by phase in the appendix below.
- **Evidence**: working PoC request/script + observed response, captured in the engagement file. PoC code stays in the engagement branch or stays uncommitted — exploit tooling never merges to `main`.
- **Honest downgrades**: a finding that cannot be exploited gets recorded as such, with the reasoning. Unexploitable ≠ deleted; it moves to Track with the downgrade note.

A confirmed exploit escalates the SLA to **Act** regardless of scanner severity. A confirmed exploit with no scanner finding at all is the most valuable output of the whole cycle — it reshapes Phase 0 scope and usually earns a new `tests/security/` suite.

### Phase 4 — Remediate

Pick the first option that actually closes the finding:

1. **Upgrade the dependency or fix the code** — preferred, always. Daily: commit `npm audit fix` output via the `daily-patch` PR, then run `npm run deps:verify` locally for typecheck + audit + lockfile sanity.
2. **Override the transitive pin** — when the direct dep is fine but a child is vulnerable: `"overrides": { "postcss": "^8.5.10" }` (already used). Verify with `npm ls <pkg>` that the override took.
3. **Document an exception** — only when no fix exists. Full schema, `nextReviewDate` ≤ 90 days out, compensating controls written as testable statements ("jest-config merges repo-local config, never request data" — not "we are careful"). One renewal maximum; if the exception would need a second renewal, the risk decision was wrong.
4. **Remove / replace** — if the package is banned-list material or unused, cut it. `verify-banned.mjs` keeps the grave from reopening.

Cooldown policy: the Dependabot 3/3/7-day cooldown applies to version-update PRs only. Security updates and **Act**-outcome patches bypass it — machine-speed supply-chain attacks get machine-speed responses; everything else gets the retreat window.

### Phase 5 — Verify (purple-team gate)

A remediation is done when the machine says so:

- The **same gate** that exposed the finding now passes: `npm run security:check` (banned + audit scan) and, for code fixes, the relevant `tests/security/` suite.
- **Every exploited finding lands a regression test** in `tests/security/` that fails against the old behavior and passes against the new. This is the purple-team step — the exploit becomes a permanent, free re-scan that runs on every future PR.
- Re-run the originating scanner (CodeQL re-scan, fresh `npm audit`) and confirm the alert closes in the Security tab. An alert that stays open after the fix ships means the fix went to the wrong branch.
- Exception-accepted findings verify differently: the exception's compensating controls each map to an assertion somewhere (a test, a config check, a monitor). A control nobody can test is a control nobody has.

### Phase 6 — Report and retrospective

Close the cycle in the engagement file:

- Findings table: id, source, SSVC outcome, disposition (fixed / exception / downgrade), SLA met or missed.
- Metrics: time-to-triage, time-to-remediate per outcome tier, exception count and rate (target < 5% of open findings), gate flake rate.
- Scope deltas: new routes, new deps, new secrets boundaries discovered.
- Feed forward: anything that took longer than its SLA gets a named cause (missing tooling, missing test harness, exception needed) and that cause enters the Build Queue.

Monthly sweep (30 minutes, calendar-blocked): review every entry in `.npm-audit-exceptions.json` against its `nextReviewDate`, delete stale entries the gate warns about, and re-score any accepted advisory whose reach changed (a dev-only finding that migrated into the production tree changes tier immediately).

---

## Build Queue

**Status: shipped.** All five items below are built and operating — the triage script, both weekly workflows, the engagement records, and the aging report. The queue itself now serves a different job: it accumulates items _earned_ by future cycles. When a breach has a named cause, a test harness is missing, or a scope gap opens, it enters here with a file path and a contract so implementation stays mechanical. Current open items from the baseline engagement: the client-bundle secrets-boundary audit, ZAP promotion to gate (criteria in `.github/zap/README.md`), and authenticated DAST once synthetic accounts exist.

Built items, kept for reference — each names its file path and contract:

**1. `scripts/red-team/triage.mjs` — SSVC triage automation — BUILT**
Plain Node, no deps, same conventions as `audit-with-exceptions.mjs`. Runs `npm audit --json` (or reads a saved report via `--file` plus `--prod-file` for reach classification), resolves GHSA → CVE through the OSV API, then enriches with the CISA KEV feed and the FIRST EPSS API — all cached in `.cache/triage/` with a 24h TTL and negative caching so a feed outage costs one attempt per TTL window. Hard-won catch from the first live run: OSV is case-sensitive on GHSA ids and answers HTTP 404 for the uppercased form — which reads as "this advisory has no CVE", not as a bug, and the negative cache then preserves that silent severity-only degradation for the full TTL. The script therefore keeps the canonical mixed case from npm's advisory URL and uppercases only for exception matching. Applies the decision tree above, writes `triage-<date>.json` + `.md`, and exits 1 on any **Act** finding without a valid exception or with an expired one. Reach is classified by differencing the full audit against `npm audit --omit=dev` (present only in dev tree = isolated); unknown exploitation degrades to severity-only triage, loudly banner-flagged. Run it with `npm run security:triage -- --audit-level=low`; the decision line is pinned by `tests/security/red-team-triage.test.ts` (deterministic, pre-seeded cache, no network).

**2. `.github/workflows/red-team.yml` — weekly deep-scan bundle — BUILT**
Mondays 08:00 UTC plus `workflow_dispatch`. Runs the triage at `--audit-level=low` (full audit surface), an informational `npm outdated`, publishes `triage-<date>.json/.md` as run artifacts — never commits them — and maintains exactly one `[red-team] weekly triage` issue: created/updated on any Act or Attend finding, closed automatically by a clean run. An exit-2 run (scan went blind) also files an issue, because a silent scanner is a security event, not a convenience. Job verdict goes red on the script's SLA tripwire (exit 1) or broken input (exit 2); the merge gate is untouched. Mirrors security.yml's posture: `permissions: {}` at workflow level, `contents: read` + `issues: write` at job level, `persist-credentials: false`, first-party actions on version tags kept current by Dependabot's cooldown, `timeout-minutes` cap. The jq body-composition was validated against a live triage report; the embedded github-script JS is syntax-checked.

**3. `security/engagements/` — engagement records — BUILT**
Directory convention live: `_template.md` mirrors the seven phases (scope tables, scan record, findings/disposition grid, redacted-evidence section, verification checklist, metrics block, feed-forward), and `2026-11-02-baseline.md` records the real starting point — 20 API routes under `src/proxy.ts` gating, three Track-tier dev-only advisories, the carried deepmerge exception, and a zeroed metrics baseline. The gitignore pair from "What never gets committed" keeps markdown committable and PoC artifacts out.

**4. DAST baseline — ZAP in CI — BUILT, non-blocking by design**
`.github/workflows/red-team-dast.yml` (Mondays 08:45 UTC + dispatch): builds the app env-free exactly like ci.yml, boots the standalone tree the way the Fly image does (`server.js` + copied `public/` and `.next/static`), waits for readiness, then runs `zaproxy/action-baseline` pinned to the v0.15.0 SHA against `http://localhost:3000/` — the action's `--network="host"` makes loopback targets work. Passive rules only (`-a`); the alert-handling TSV lives at `.github/zap/baseline-rules.tsv` with **zero ignores initially** — the first scheduled runs establish the noise floor, and every IGNORE entry added afterwards needs a testable justification per the policy in `.github/zap/README.md`. Non-blocking (`fail_action: false`); the action maintains its own `[red-team] ZAP baseline` tracking issue (updated weekly, auto-closed on clean) and attaches the report artifact. Promotion to gate: two consecutive tuned clean runs, then flip `fail_action`. Known blind spots, stated in the README: no active scanning, no auth flows (awaits synthetic accounts), API 500s on the runner are expected noise.
**5. `scripts/red-team/aging-report.mjs` — SLA aging — BUILT**
The triage's memory. Reads every accumulated `triage-*.json`, derives first-seen per advisory, ages open findings against outcome SLAs, and buckets them (at-risk ≥80%, breached ≥100%). Resolved findings report days-to-clear — the MTTR raw material. Exceptions read from the same ledger: valid ones cover the clock, expired ones fail the run. Exit 1 on any unexcepted breach, so a finding may never quietly ride past its SLA; exit 0 with an explicit "no reports" when the cache is empty. Ages are stated as lower bounds everywhere — the clock is only as old as retained reports. Runs in the monthly sweep via `npm run security:aging`; `tests/security/red-team-aging.test.ts` pins breach, exception-cover, expired-exception, and empty-cache behavior with frozen `--today` fixtures. (The 80%-escalation issue firing stays a later add-on once the weekly workflow has history.)

**6. Reachability labeling in `audit-with-exceptions.mjs`** _(optional, later)_
Extend the gate's advisory classification with the prod/dev path walk from item 1 so the report itself states reach, not just severity. Keep gate semantics unchanged — this is reporting, not policy drift.

---

## Appendix — Skill Index by Phase

| Phase       | `.agents/skills/` entries                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0 Scope     | `performing-api-inventory-and-discovery`, `implementing-attack-surface-management`, `collecting-open-source-intelligence`                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 1 Scan      | `implementing-devsecops-security-scanning`, `integrating-dast-with-owasp-zap-in-pipeline`, `integrating-sast-into-github-actions-pipeline`, `implementing-semgrep-for-custom-sast-rules`, `scanning-containers-with-trivy-in-cicd`, `implementing-secret-scanning-with-gitleaks`, `generating-and-analyzing-sboms`                                                                                                                                                                                                                                                       |
| 2 Triage    | `triaging-vulnerabilities-with-ssvc-framework`, `performing-cve-prioritization-with-kev-catalog`, `implementing-epss-score-for-vulnerability-prioritization`, `prioritizing-vulnerabilities-with-cvss-scoring`, `building-vulnerability-aging-and-sla-tracking`                                                                                                                                                                                                                                                                                                          |
| 3 Exploit   | `testing-api-security-with-owasp-top-10`, `testing-for-broken-access-control`, `testing-jwt-token-security`, `testing-oauth2-implementation-flaws`, `exploiting-prototype-pollution-in-javascript`, `exploiting-server-side-request-forgery`, `exploiting-insecure-deserialization`, `testing-for-open-redirect-vulnerabilities`, `testing-cors-misconfiguration`, `testing-for-host-header-injection`, `testing-api-for-broken-object-level-authorization`, `performing-api-rate-limiting-bypass`, `detecting-dependency-confusion`, `detecting-malicious-npm-packages` |
| 4 Remediate | `implementing-patch-management-workflow`, `building-patch-tuesday-response-process`, `building-vulnerability-exception-tracking-system`                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 5 Verify    | `performing-purple-team-atomic-testing`, `implementing-vulnerability-remediation-sla`, `building-vulnerability-scanning-workflow`                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 6 Report    | `building-vulnerability-dashboard-with-defectdojo`, `building-vulnerability-aging-and-sla-tracking`, `conducting-post-incident-lessons-learned`                                                                                                                                                                                                                                                                                                                                                                                                                          |

The dependency-specific skills (`detecting-malicious-npm-packages`, `analyzing-sbom-for-supply-chain-vulnerabilities`, `hunting-for-supply-chain-compromise`) back the verify-banned and cooldown defenses; read them when triaging anything that arrives through a new dependency.
