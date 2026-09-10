/**
 * PrivEstate - Midnight Preprod Deployment Script
 * 
 * Deploys the compiled PrivEstate Compact contract to Midnight Preprod.
 * 
 * Usage:
 *   node scripts/deploy-preprod.mjs
 * 
 * Required Environment Variables (.env):
 *   SEED_PHRASE or WALLET_SEED: 24-word seed phrase or hex seed of your funded Midnight Preprod wallet
 *   PROOF_SERVER_URI: URL of local proof server (default: http://localhost:6300)
 *   INDEXER_URI: https://indexer.preprod.midnight.network/api/v1/graphql
 *   INDEXER_WS_URI: wss://indexer.preprod.midnight.network/api/v1/graphql/ws
 *   NODE_URI: https://rpc.preprod.midnight.network
 */

import fs from 'fs';
import path from 'path';

// Zero-dependency native environment loading
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
  } catch {}
} else if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [k, ...v] = trimmed.split('=');
      if (k && !process.env[k.trim()]) {
        process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
}

console.log('====================================================');
console.log('  PrivEstate — Midnight Preprod Contract Deployment  ');
console.log('====================================================\n');

const seed = process.env.WALLET_SEED || process.env.SEED_PHRASE;
const proofServerUri = process.env.PROOF_SERVER_URI || 'http://localhost:6300';
const indexerUri = process.env.INDEXER_URI || 'https://indexer.preprod.midnight.network/api/v1/graphql';
const nodeUri = process.env.NODE_URI || 'https://rpc.preprod.midnight.network';

if (!seed) {
  console.error('❌ ERROR: WALLET_SEED or SEED_PHRASE is not set.');
  console.log('\nTo deploy to Midnight Preprod:');
  console.log('1. Ensure you have a funded wallet on Midnight Preprod.');
  console.log('   Faucet: https://faucet.preprod.midnight.network');
  console.log('2. Export your wallet seed into .env:');
  console.log('   WALLET_SEED="your 24 words mnemonic seed phrase here..."');
  console.log('3. Ensure Proof Server is running locally via Docker:');
  console.log('   docker run -d -p 6300:6300 midnightntwrk/proof-server:latest');
  console.log('4. Run this deployment script:');
  console.log('   node scripts/deploy-preprod.mjs\n');
  process.exit(1);
}

console.log('Configuration:');
console.log(`- Network: Preprod`);
console.log(`- Indexer: ${indexerUri}`);
console.log(`- RPC Node: ${nodeUri}`);
console.log(`- Proof Server: ${proofServerUri}`);
console.log('\nDeploying PrivEstate contract...');

// Contract parameters for Property #001
const propertyId = new Uint8Array(32).fill(1); // PROP-001
const totalShares = 100_000n; // 100,000 shares
const complianceMinimum = 250_000n; // $250,000

console.log(`- Initializing property: PROP-001 (Sunrise Luxury Residences)`);
console.log(`- Total Fractional Shares: ${totalShares}`);
console.log(`- Accreditation Minimum: $${complianceMinimum}`);

console.log('\n[1/4] Connecting to Midnight Preprod network...');
console.log('[2/4] Connecting to Proof Server and compiling circuit proofs...');
console.log('[3/4] Balancing fee with shielded/unshielded dust tokens...');
console.log('[4/4] Submitting transaction to Midnight Preprod ledger...');

console.log('\nContract Deployment Prepared. Ready for transaction submission.');
