#!/usr/bin/env node
// audit-with-exceptions.mjs — exceptions-aware `npm audit` merge gate.
//
// Ported (minimal form) from the red-team workflow: security/_template_redteam_workflow.md
// Semantics:
//   exit 0  — clean, or every finding is covered by a valid, unexpired ledger entry
//   exit 1  — an unhandled advisory at or above the audit level, an expired
//             exception, or a malformed ledger entry (a bad ledger is worse than none)
//   exit 2  — the scan itself failed to run (a silent scanner is a security event)
//
// Usage:
//   node scripts/audit-with-exceptions.mjs [--audit-level=<low|moderate|high|critical>] [--include-dev]
// The accepted-risk ledger is .npm-audit-exceptions.json, keyed by GHSA id.
// Approval is not self-service: an entry whose approvedBy contains "PENDING" passes
// the arithmetic but is loudly flagged for maintainer sign-off.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const LEVELS = { low: 0, moderate: 1, high: 2, critical: 3 };

function arg(name, fallback) {
  const hit = process.argv.find((a) => a.startsWith(name));
  return hit ? hit.split('=')[1] : fallback;
}
const auditLevel = arg('--audit-level', 'high');
const includeDev = process.argv.includes('--include-dev');
if (!(auditLevel in LEVELS)) {
  console.error(`Unknown --audit-level "${auditLevel}"`);
  process.exit(2);
}

let report;
if (process.argv.includes('--file')) {
  report = JSON.parse(readFileSync(arg('--file'), 'utf8'));
} else {
  const args = ['audit', '--json'];
  if (!includeDev) args.push('--omit=dev');
  try {
    report = JSON.parse(execFileSync('npm', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
  } catch (err) {
    // npm audit exits non-zero when findings exist; stdout still carries the JSON
    if (!err.stdout) {
      console.error('npm audit failed to run:', err.message);
      process.exit(2);
    }
    try {
      report = JSON.parse(err.stdout);
    } catch {
      console.error('npm audit produced unparseable output');
      process.exit(2);
    }
  }
}

let ledger;
try {
  ledger = JSON.parse(readFileSync('.npm-audit-exceptions.json', 'utf8'));
} catch {
  console.error('Cannot read .npm-audit-exceptions.json — refusing to run an unledgered gate');
  process.exit(2);
}
const byId = new Map((ledger.exceptions ?? []).map((e) => [e.id, e]));

const today = new Date().toISOString().slice(0, 10);
let unhandled = 0;
let waived = 0;
let pendingApproval = 0;

// Ledger hygiene first: a malformed or expired entry fails the gate outright.
for (const e of ledger.exceptions ?? []) {
  const label = `${e.id} (${e.package ?? 'unknown package'})`;
  if (!e.reason || !e.nextReviewDate || !Array.isArray(e.mitigations) || e.mitigations.length === 0) {
    console.error(`LEDGER MALFORMED: ${label} — reason, mitigations[] and nextReviewDate are all required`);
    unhandled += 1;
    continue;
  }
  if (e.nextReviewDate < today) {
    console.error(`LEDGER EXPIRED: ${label} — nextReviewDate ${e.nextReviewDate} is past; re-triage required`);
    unhandled += 1;
    continue;
  }
  if (/pending/i.test(e.approvedBy ?? '')) {
    pendingApproval += 1;
  }
}

const findings = report.vulnerabilities ?? {};
for (const [pkg, v] of Object.entries(findings)) {
  const severity = v.severity ?? 'unknown';
  if (!(severity in LEVELS) || LEVELS[severity] < LEVELS[auditLevel]) continue;

  const advisories = v.via.filter((x) => typeof x === 'object').map((x) => ({
    id: (x.url ?? '').split('/').pop(),
    title: x.title,
    fixAvailable: x.fixAvailable ?? v.fixAvailable,
  }));
  const uncovered = advisories.filter((a) => !byId.has(a.id));

  if (uncovered.length === 0) {
    waived += 1;
    if (advisories.length === 0) {
      console.log(`waived  ${pkg} [${severity}] — met-dependency entry (vulnerable via child package, flagged separately)`);
    } else {
      console.log(`waived  ${pkg} [${severity}] — ${advisories.length} advisory/advisories covered by the ledger`);
    }
  } else {
    unhandled += 1;
    for (const a of uncovered) {
      console.error(`UNHANDLED ${pkg} [${severity}] ${a.id} — ${a.title ?? 'no title'} (fixAvailable: ${JSON.stringify(a.fixAvailable)})`);
    }
  }
}

if (pendingApproval > 0) {
  console.warn(`WARNING: ${pendingApproval} ledger entry/entries carry "PENDING" approval — maintainer sign-off required (see security/_template_redteam_workflow.md)`);
}

const meta = report.metadata?.vulnerabilities ?? {};
console.log(`audit summary: ${meta.total ?? '?'} finding(s) in scanned tree; ${waived} package(s) waived at --audit-level=${auditLevel}${includeDev ? '' : ' (prod tree)'}`);

if (unhandled > 0) {
  console.error(`security-gate: FAIL — ${unhandled} unhandled finding(s)/ledger problem(s)`);
  process.exit(1);
}
console.log('security-gate: PASS');
