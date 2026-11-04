# Coffee-Supply-Chain

This is a DApp coffee supply chain solution to prove the authenticity of coffee using an Ethereum smart contract. This project demonstrates
solid blockchain architecture with role based permissions in a supply chain flow between sellers and buyers at various stages- see code in /contracts folder. 


![activity](https://user-images.githubusercontent.com/67720949/177696085-bd69f935-1e28-47dc-b303-fb24c4ec6c09.png)



![sequence](https://user-images.githubusercontent.com/67720949/177696098-76705450-a16f-44a9-a458-dfdeeaaf3a8f.png)




![State](https://user-images.githubusercontent.com/67720949/177696111-ede6a48c-6aae-405c-8936-4c8688234372.png)




![class](https://user-images.githubusercontent.com/67720949/177696125-549e1752-9c44-4b07-9aa6-8da52b936b60.png)




![Fairtradecoffee](https://user-images.githubusercontent.com/67720949/177696131-9d540509-cd40-455c-b50a-7560db0f0cfb.png)

## What's new — November 2026 security overhaul

First full security review since 2022. Both sides of the discipline are now in the repo — defensive hardening plus an offensive red-team pipeline (**scan → triage → exploit → remediate → verify → report**), defined in full and exercised once end-to-end by a recorded engagement. The exploit phase was analytical: no live system is deployed to attack.

**Defensive security**
- Four critical smart-contract vulnerabilities fixed — sale-price bypass (`paidEnough` compared against the UPC instead of the price), sale proceeds misrouted to the buyer instead of the farmer, unauthenticated/hijackable item harvesting, and a payable constructor that permanently locked ETH — each pinned by a regression test that fails against the old code
- CI security gate on every push and PR: compile, solhint lint, test suite, production dependency audit, committed-secret scan (`.github/workflows/security.yml`)
- Exceptions-aware audit gate: advisories with no compatible fix are ledgered with expiry and maintainer approval (`scripts/audit-with-exceptions.mjs` + `.npm-audit-exceptions.json`)
- Dependabot updates with a publish cooldown; secrets removed from source (env vars + gitignored `.secret`); browser bundle hardened (CSP, SRI-pinned jQuery, DOM-safe rendering)

**Offensive security (red team)**
- An end-to-end red teaming pipeline — **scan to remediation** — defined in [`security/_template_redteam_workflow.md`](security/_template_redteam_workflow.md) (scope → scan → triage → exploit → remediate → verify → report, with SLA tiers and an accepted-risk ledger)
- First engagement executed and recorded: [`security/engagements/2026-11-04-baseline.md`](security/engagements/2026-11-04-baseline.md) — 12 findings triaged by exploitability: 11 fixed, 1 unfixable advisory chain accepted with a 90-day review clock
- The purple-team gate: a finding is closed only when the CI gate or a regression test proves it closed
- **`red-team-dast.yml` deliberately does not exist yet**: this DApp ships a static page — no server routes, no server-side auth, no session layer — so there is no rendered surface for DAST to exercise; the automatable checks that do apply (dependency audit, secret scan, static analysis) already run in the CI gate
- The same file becomes **optional but high-value the moment a backend lands**: when server routes or server-side authentication appear, add the ZAP passive baseline (per [`security/_template_redteam_workflow.md`](security/_template_redteam_workflow.md)) before the first route ships — it is the only tool class here that tests the *running* surface for header, CORS/cookie, and auth-bypass defects that code review and the current gate cannot see; the SSVC triage script and SLA aging reports ride the same build queue

**Program Versions:**

- Truffle v5.11.5 (Truffle suite was sunset by ConsenSys in Q4 2023 — plan a migration to Foundry or Hardhat for long-term maintenance)
- Solidity - 0.5.16 (solc-js)
- Node >= 18 (CI runs Node 20)
- Web3.js v1.10.4

Below are the dependencies in the package.json file:

```
"dependencies": {
    "@truffle/hdwallet-provider": "^2.1.15",
    "truffle-assertions": "^0.9.2",
    "web3": "^1.10.4"
  }
  ```


**Why I used each library:**


**truffle**: truffle is development environment, testing framework and asset pipeline for blockchains using the Ethereum Virtual Machine (EVM), aiming to make life as a developer easier. It compiles the contracts (`npm run build`) and runs the tests (`npm test`) against a bundled local chain.

**truffle-assertions**: used to test Ethereum smart contracts inside Truffle tests. It is used to assert that contracts correctly emitted different events as expected, and that unauthorized calls revert.

**truffle-hdwallet-provider**: HD Wallet-enabled Web3 provider. It signs transactions for addresses derived from a 12-word mnemonic. The mnemonic lives in the gitignored `.secret` file; the Infura project ID is passed via the `INFURA_PROJECT_ID` environment variable. Never commit either: a project ID was committed to this repo historically and must be treated as public knowledge.

**web3**: a collection of libraries that allow you to interact with a local or remote ethereum node using HTTP, IPC or WebSocket. The browser bundle (`node_modules/web3/dist/web3.min.js`) is served by lite-server and used by the DApp UI.


**IPFS Write-up**

I did not use IPFS for this project.

The contract was historically deployed to the Rinkeby test network (address 0x018C2daBef4904ECbd7118350A0c54DbeaE3549A) — **Rinkeby was shut down in 2022**; that deployment is defunct. Redeploy to Sepolia via `npx truffle migrate --network Sepolia` with `INFURA_PROJECT_ID` set and a funded mnemonic in `.secret`. **Redeploy precondition**: create a **fresh** Infura account/project for that variable — the historically exposed ID is permanently public and must never be reused.

## Development

```sh
npm ci           # install pinned dependencies
npm run build    # compile contracts (solc 0.5.16)
npm test         # run the contract test suite on a local chain
npm run lint     # solhint static analysis of contracts
npm run dev      # serve the DApp UI at http://localhost:3000 (run `npm run build` first — artifacts are generated, not committed)
npm audit        # dependency vulnerability report
```

CI (`.github/workflows/security.yml`) compiles, lints, tests, audits the production dependency tree at high severity, and scans for committed secrets on every push and pull request. Dependabot keeps dependencies and pinned workflow actions updated with a publish cooldown.

## Dependency & update policy

Run `npm outdated` (or `npm run outdated`) to see drift. `Current`/`Wanted` gaps are handled automatically by Dependabot (minor/patch, cooldown-delayed); **`Latest` gaps on major versions are deliberate and triaged in the monthly sweep** (see `security/_template_redteam_workflow.md`, Phase 1 "Outdated drift") — never blind-bump a major.

Current deliberate major drift, and why it stays:

| Package | Current | Latest | Why deferred |
| ------- | ------- | ------ | ------------ |
| `web3` | 1.10.4 | 4.16.0 | **web3.js is archived upstream** (ChainSafe sunset Jan 2025, EF repo archive Mar 2025) — 4.x receives no security fixes either, and the 4.x API breaks the vendored `truffle-contract.js` and callback-style `app.js`. Real remediation is migrating the DApp UI to **viem or ethers.js**; web3 1.x's unfixable advisory chain is ledgered in `.npm-audit-exceptions.json` until then. |
| `solhint` | 3.6.2 | 6.2.5 | 6.x targets modern Solidity and a Node ≥ 20 baseline; on a solc 0.5.16 codebase the upgrade is style churn with no security value. Bump together with the compiler/toolchain migration. |

End-of-life components (tracked as feed-forward items in `security/engagements/2026-11-04-baseline.md`): **Truffle** (sunset Q4 2023 → Foundry/Hardhat), **web3.js** (archived → viem/ethers), **solc 0.5.16** (EOL, compiler migration), jQuery (legacy stack → modern rewrite).

The audit gate is exceptions-aware: `npm run security:check` fails on any high/critical advisory **not** covered by an unexpired entry in `.npm-audit-exceptions.json`, and fails on expired ledger entries. Ledger approvals are maintainer decisions, never self-service.

