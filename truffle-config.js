/**
 * Truffle configuration.
 *
 * Credentials are read from the environment / gitignored files — never hardcoded:
 *   - `.secret` (gitignored): the 12-word wallet mnemonic
 *   - `INFURA_PROJECT_ID` env var: the Infura project ID. The ID previously committed
 *     to this repo is permanently public and must NEVER be reused — create a fresh
 *     Infura account/project at redeploy time.
 *
 * Note: the previously configured Rinkeby network was shut down in 2022;
 * Sepolia is the replacement Ethereum test network.
 */

const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const path = require('path');

function loadMnemonic() {
  try {
    return fs.readFileSync(path.join(__dirname, '.secret')).toString().trim();
  } catch (e) {
    // Public networks require a funded mnemonic in .secret; skip quietly for local dev.
    return undefined;
  }
}

module.exports = {
  networks: {
    // No 'development' network defined: `truffle test` spins up its own
    // ephemeral chain automatically. Define one here if you run an external
    // Ganache node manually.

    Sepolia: {
      provider: () =>
        new HDWalletProvider(
          loadMnemonic(),
          `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
        ),
      network_id: 11155111,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },

  mocha: {
    // timeout: 100000
  },

  compilers: {
    solc: {
      version: "0.5.16",
      // settings: {
      //   optimizer: { enabled: false, runs: 200 },
      //   evmVersion: "byzantium"
      // }
    }
  }
};
