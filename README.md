# PrivEstate

[![CI](https://github.com/parasbabar/level4/actions/workflows/ci.yml/badge.svg)](https://github.com/parasbabar/level4/actions/workflows/ci.yml)

> Private ownership. Verifiable real estate.

## Live Demo

Run locally against Midnight Preprod in under 60 seconds:
```bash
git clone https://github.com/parasbabar/level4.git
cd level4
npm install
npm run dev
# Open http://localhost:5173 and connect your Midnight Lace Wallet (set to Preprod)
```

## Contract Address

| Network | Address |
| ------- | ----------------------------------- |
| Preprod | `2e5e3eea72733c09f794677002d0a0840163b3b3da1d6e661bc4dd1b421eaab9` |

## What This Product Does

Traditional real-estate investment and fractional asset tokenization suffer from an inherent privacy paradox: public ledgers record token holdings, wallet balances, and investment amounts in plain text for any observer to view. When institutional or high-net-worth investors purchase fractional shares of premium properties, their sensitive financial profiles—including their exact ownership percentages, total capital deployed, and annual rental earnings—become permanently visible. Conversely, off-chain private real estate syndicates require intrusive documentation, forcing investors to disclose complete bank statements and tax filings to every counterparty, landlord, and regulatory auditor.

PrivEstate resolves this fundamental conflict by pairing tokenized Real-World Assets (RWA) with Midnight's privacy-first blockchain and Zero-Knowledge Proofs. By leveraging Midnight's Compact smart contract language, investors can privately hold fractional property shares in shielded state and generate succinct cryptographic proofs of their claims without revealing the underlying financial figures. For example, an investor holding 17.43% of a luxury residential building can prove to a syndicate: *"I own at least 10% of this asset"*, while the verifier learns only that the statement is mathematically valid—without ever learning whether the investor owns 10.1%, 17.43%, or 90%.

Furthermore, PrivEstate modernizes regulatory compliance and investor accreditation. Instead of submitting sensitive net-worth records to third-party portals, investors prove through a private witness circuit that their deployed capital satisfies the required statutory minimum (e.g., $\ge \$250,000$). Regulators and auditors can independently verify the Zero-Knowledge claim on-chain through public verification counters, guaranteeing strict compliance while preserving absolute investor confidentiality.

## Privacy Model

### What is PUBLIC
* **Property Identification**: Property metadata, unique identifiers (`propertyId`), and physical property disclosures.
* **Tokenized Asset Economics**: Total fractional share supply (`totalShares`) and statutory compliance minimums (`complianceMinimum`).
* **Verifiable Audit Log**: Aggregated cryptographic verification counters (`verifiedOwnershipCount`, `verifiedComplianceCount`, `verifiedRentalYieldCount`) and the last public threshold benchmark verified.

### What is PRIVATE
* **Exact Ownership Shares**: The investor's specific share allocation (e.g., 17,430 shares) remains strictly confidential in off-chain client witness storage.
* **Capital Invested**: The exact dollar amount deployed by the investor (e.g., $500,000) is shielded from external inspection.
* **Confidential Rental Income**: Annual rental payouts, yield distributions, and bank routing details are kept strictly private.
* **Investor Identity & Keys**: Private identity salts and cryptographic secret keys used to derive Zero-Knowledge commitments.

### What the user PROVES without revealing
* **Ownership Threshold Claim**: Proves $investorOwnership \ge requiredThreshold$ (e.g., *"I own at least 10%"*) without revealing the exact percentage ($17.43\%$).
* **Regulatory Compliance**: Proves $investmentAmount \ge minimumRequired$ (e.g., satisfying the $\$250,000$ accredited investor requirement) without revealing total net worth or bank deposits.
* **Confidential Rental Yield**: Proves that property rental distributions meet or exceed a specific yield benchmark without disclosing private payout amounts.

## Tech Stack
* **Smart Contracts**: Compact Smart Contract Language (Language version $\ge 0.23$)
* **Privacy & ZK Engine**: Midnight Network, ZK Intermediate Representation (ZKIR), Compact Runtime (`@midnight-ntwrk/compact-runtime`)
* **Wallet Connector**: Midnight DApp Connector Standard (`@midnight-ntwrk/dapp-connector-api`) for Midnight Lace Wallet
* **Frontend**: React 19, TypeScript, Vite, Lucide Icons, Vanilla CSS Design System
* **Testing**: Vitest, Compact Simulator Testbed
* **CI/CD**: GitHub Actions

## Prerequisites
* **Node.js**: v22.x or higher
* **npm**: v10.x or higher
* **Compact CLI Toolchain**: `compact` version `0.5.2` (Compiler version `0.34.0`, Runtime `0.19.0`)
* **Midnight Wallet**: Midnight Lace Wallet browser extension configured for Preprod
* **WSL2 (Windows only)** or native Linux/macOS for running the Compact compiler CLI

## Setup & Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/parasbabar/level4.git
   cd level4
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Compile the Compact smart contract**:
   ```bash
   npm run compact
   ```
   *This compiles `contracts/privestate.compact` into TypeScript bindings and ZKIR circuits in `managed/`.*

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## Run Tests

Execute the comprehensive contract, witness, and circuit test suite:
```bash
npm test
```

The test suite validates:
1. Contract initialization with public ledger isolation and private state shielding.
2. Valid ownership threshold proof assertion ($\ge 10\%$) with ledger audit increment.
3. Rejection of invalid ownership threshold claims below the required threshold.
4. Valid regulatory accreditation proof ($\ge \$250,000$) without capital disclosure.
5. Rejection of sub-threshold compliance claims.
6. Confidential rental yield claim verification.
7. Cryptographic investor commitment derivation.

## CI/CD

Continuous Integration is automated using GitHub Actions via `.github/workflows/ci.yml`. On every push and pull request to `main`:
1. Checks out the repository and sets up Node.js v22.
2. Installs dependencies using `npm ci`.
3. Installs the official Midnight Compact compiler CLI.
4. Executes `npm run compact` to verify contract compilation.
5. Runs the full test suite with `npm test`.
6. Executes `npm run build` to verify zero-error production frontend bundling.

## Usage Guide

For an in-depth, step-by-step walkthrough covering wallet setup, property exploration, generating Zero-Knowledge proofs, and auditor verification, refer to:
👉 [docs/USAGE.md](docs/USAGE.md)

## Product X Profile

**PrivEstate** — Private ownership. Verifiable real estate.

- **GitHub**: https://github.com/parasbabar/level4
- **Contract Address**: `2e5e3eea72733c09f794677002d0a0840163b3b3da1d6e661bc4dd1b421eaab9` (Midnight Preprod)
- **Track**: Finance — Tokenized Real-World Assets (RWA) with Zero-Knowledge Proofs
- **Network**: Midnight Preprod
- **Status**: ✅ Contract Deployed · ✅ 8/8 Tests Passing · ✅ Production Build Verified
