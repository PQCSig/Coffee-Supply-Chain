# Insight — Commit policy and anti-patterns for a public repo

- **Date**: 2026-11-04
- **Origin**: baseline engagement (`../2026-11-04-baseline.md`) — FT-5 (committed
  Infura ID), FT-10 (blanket `security/` ignore), FT-12 (exception ledger), the
  corrupted `SupplyChain.json` artifact, and the visibility-policy review that
  followed it.
- **Applies to**: `**` — every future commit, ignore-rule change, and engagement record.

## The premise, corrected

"Public repo, so security insight should not be visible" is mostly false as
stated. Everything derivable from the code — contracts, fixes, tests, CI — is
public the moment the repo is. Ignore policy cannot retract shipped code; it
governs **working state** only: credentials, in-progress triage, exploit
tooling. The disclosure that matters is *unfixed* work, and the doctrine for
that window lives in the SLA tiers, not in blanket ignores.

## The three disclosure classes

| Class | Examples | Rule | Rationale |
| ----- | -------- | ---- | --------- |
| Compromise-enabling secrets | `.secret`, `.env*`, keystores, private keys | Ignore, always | Exposure = loss of control. Gitignore prevents only *future* commits; history is permanent — a leaked credential is rotated, never un-leaked. |
| Working intelligence | `npm audit` snapshots, triage/enrichment caches (`.cache/triage/`), DAST session state, engagement PoC scripts, captures | Ignore, local-only | The pre-triaged vulnerability map: which advisories apply, at which versions, with which reach. Anyone can regenerate raw advisory lists from a clone; the exploit-relevant part is the triage reasoning while findings are still open. |
| Policy & accountability | Exception ledger (`.npm-audit-exceptions.json`), CI workflows, lint configs, security tests, AGENTS.md, finalized engagement and insights markdown | Commit, deliberately public | Enforcement machinery. In a public repo, hiding it buys nothing and destroys accountability: an invisible gate cannot be reviewed, an invisible acceptance cannot be challenged. |

The subtle case: the ledger looks like class 2 but is class 3. It commits the
adjudicated minimum — advisory id, package, expiry, approval — so the gate can
fail on expiry and acceptance stays auditable. It must never hold reach
analysis or attack paths; if honesty requires that detail, it goes in a local
engagement file instead. "Acceptance without visibility is just hiding."

## The sequencing rule (public-repo-specific)

Engagement records are committed only after — ideally atomically with — the
fix commit. Publishing a finding whose fix is still an uncommitted working-tree
change advertises a critical, unpatched vulnerability to every reader. The
Act-tier 48h SLA exists precisely to bound this window; disclosure ordering is
part of the remediation.

## Anti-patterns

Each of these was observed or narrowly avoided in this repo. Pattern → why it
fails → what to do instead.

1. **Blanket-ignoring policy directories** (`security/` whole-dir ignore,
   2022–2026) — engagement records became uncommittable and the documented
   ignore-pair policy was unenforceable. Ignore the *artifacts* (snapshots,
   caches, payloads), commit the *policy* (templates, ledger, findings,
   insights).
2. **Committing a credential "just for local testing"** — the Infura project
   ID sat in `truffle-config.js` and public history since 2022. Fixing HEAD
   does not fix history; only rotation does. Credentials belong in the
   environment or a secret manager, with gitignore as backstop, not container.
3. **Tracking generated artifacts** — `build/contracts/` was committed, and a
   stray `gh repo create` prefix sat inside `SupplyChain.json` for four years
   because generated files treated as source get no scrutiny. Generate in CI,
   verify bytecode at deploy time, ignore the output.
4. **Hiding security tests** — regression tests are the purple-team gate
   (FT-1/FT-2/FT-3 reverts); hiding them hides regressions and the proof of
   every security claim. Obscurity at the test layer protects nothing the
   source doesn't already show.
5. **Publishing findings before fixes** — see the sequencing rule above.
6. **Self-approved exceptions** — the ledger's `approvedBy` field exists
   because acceptance is a maintainer decision. The gate passes PENDING
   entries but warns on every run until signed; silence is not approval.
7. **Over-waiving a gate to make it green** — a permanently red gate gets
   ignored, so the honest alternative (ledger the unfixable, fail on the new)
   must stay narrow: waive only what has no compatible fix, with expiry.
8. **Treating gitignore as a security control** — it is bookkeeping. It does
   not scrub history, does not cover forks or caches, and ignored files get no
   secret-scanning safety net. Push protection and secret scanning complement
   it; neither replaces it.
9. **Publishing local state in public docs** — an early draft of this repo's
   README said the exposed Infura ID "must be rotated": an internal action
   item, useful to no clone-reader, and an active signal to attackers that the
   credential may still be live. The clone-reader test: a README line must
   change a reader's behavior based only on what the repo contains. If it
   answers "what should the maintainer do next," or references uncommitted or
   local-only state, it belongs in the issue tracker, the engagement record,
   or AGENTS.md's maintainer notes — and publish completed facts
   ("exposed historically, treat as public"), never open ones ("pending
   rotation").

## Verification hooks

- `git check-ignore -v <path>` — proves a path's disposition before relying on it
- `npm run security:check` — re-runs the waiver arithmetic on every push; a new
  advisory not in the ledger fails the gate, an expired ledger entry fails the gate
- CI secret-scan step — fails the build on credential patterns in tracked source
