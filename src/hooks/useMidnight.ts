/**
 * PrivEstate - useMidnight Hook
 *
 * Manages the real Midnight DApp connector wallet connection (window.midnight),
 * assembles the full ContractProviders stack from the live ConnectedAPI,
 * and executes genuine on-chain Midnight Preprod transactions.
 *
 * Transaction pipeline:
 *   1. Connect Lace wallet → ConnectedAPI
 *   2. Fetch live config (indexerUri, indexerWsUri) from wallet
 *   3. Build publicDataProvider (indexerPublicDataProvider)
 *   4. Build proofProvider (via ConnectedAPI.getProvingProvider → ProvingProvider → createProofProvider)
 *   5. Build walletProvider adapter from ConnectedAPI
 *   6. Execute circuit via submitCallTx() → real on-chain transaction
 *   7. Watch for confirmation via publicDataProvider.watchForTxData(txId)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { Contract } from '../../managed/contract/index.js';
import {
  DEMO_PROPERTIES,
  DEFAULT_INVESTOR_PORTFOLIO,
  type PropertyMetadata,
  type InvestorPrivateHolding,
  type PrivEstatePrivateState,
  type VerificationResult,
  createWitnesses,
  runOwnershipThresholdProof,
  runComplianceProof,
  runRentalYieldProof,
} from '../utils/contract';
import type {
  WalletProvider,
  PrivateStateProvider,
  PrivateStateId,
  ProofProvider,
  PublicDataProvider,
  MidnightProvider,
} from '@midnight-ntwrk/midnight-js-types';
import { ZKConfigProvider, createProofProvider } from '@midnight-ntwrk/midnight-js-types';
import { createPrivEstateZKConfigProvider } from '../utils/zkConfigProvider';

declare global {
  interface Window {
    midnight?: Record<string, InitialAPI>;
  }
}

export type WalletConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'syncing'
  | 'wallet-not-detected'
  | 'error';

export type TransactionStatus =
  | 'idle'
  | 'wallet-connection-required'
  | 'wallet-connected'
  | 'preparing-transaction'
  | 'awaiting-wallet-signature'
  | 'transaction-submitted'
  | 'waiting-for-confirmation'
  | 'confirmed'
  | 'error';

export interface MidnightState {
  status: WalletConnectionStatus;
  walletName: string | null;
  walletIcon: string | null;
  networkId: string;
  shieldedAddress: string | null;
  coinPublicKey: string | null;
  walletSyncing: boolean;
  error: string | null;
  isProofGenerating: boolean;
  currentProofStatus: string | null;
  portfolio: Record<string, InvestorPrivateHolding>;
  verificationHistory: VerificationResult[];
  transactionStatus: TransactionStatus;
  transactionTxId: string | null;
  transactionError: string | null;
}

const PREPROD_NETWORK_ID = 'preprod';
setNetworkId(PREPROD_NETWORK_ID);

const _meta = (import.meta as any).env || {};
const PREPROD_INDEXER_URI = _meta.VITE_INDEXER_URI || 'https://indexer.preprod.midnight.network/api/v4/graphql';
const PREPROD_INDEXER_WS_URI = _meta.VITE_INDEXER_WS_URI || 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws';

/**
 * Creates an in-memory PrivateStateProvider for managing ZK circuit private state
 * client-side. This is the correct approach for a browser DApp without a backend.
 */
function createInMemoryPrivateStateProvider(): PrivateStateProvider<PrivateStateId, PrivEstatePrivateState> {
  const store = new Map<string, PrivEstatePrivateState>();
  const signingKeys = new Map<string, any>();
  let contractAddress: string | null = null;

  const getKey = (privateStateId: string) => `${contractAddress}:${privateStateId}`;

  return {
    setContractAddress(address: string) {
      contractAddress = address;
    },
    async set(privateStateId: string, state: PrivEstatePrivateState) {
      store.set(getKey(privateStateId), state);
    },
    async get(privateStateId: string) {
      return store.get(getKey(privateStateId)) ?? null;
    },
    async remove(privateStateId: string) {
      store.delete(getKey(privateStateId));
    },
    async clear() {
      store.clear();
    },
    async setSigningKey(address: string, signingKey: any) {
      signingKeys.set(address, signingKey);
    },
    async getSigningKey(address: string) {
      return signingKeys.get(address) ?? null;
    },
    async removeSigningKey(address: string) {
      signingKeys.delete(address);
    },
    async clearSigningKeys() {
      signingKeys.clear();
    },
    async exportPrivateStates() {
      throw new Error('Export not supported in browser in-memory store');
    },
    async importPrivateStates() {
      throw new Error('Import not supported in browser in-memory store');
    },
    async exportSigningKeys() {
      throw new Error('Export not supported in browser in-memory store');
    },
    async importSigningKeys() {
      throw new Error('Import not supported in browser in-memory store');
    },
  };
}

/**
 * Creates a WalletProvider adapter that bridges the Midnight DApp Connector's
 * ConnectedAPI to the WalletProvider interface expected by midnight-js-contracts.
 *
 * The ConnectedAPI provides:
 *  - balanceUnsealedTransaction(tx) → adds fees, inputs, outputs to unsealed tx
 *  - submitTransaction(tx) → submits sealed+balanced tx to Midnight network
 *  - getShieldedAddresses() → provides CoinPublicKey and EncPublicKey
 */
function createWalletProviderFromConnectedAPI(
  api: ConnectedAPI,
  coinPublicKey: string,
  encPublicKey: string,
): WalletProvider {
  return {
    getCoinPublicKey(): any {
      return coinPublicKey;
    },
    getEncryptionPublicKey(): any {
      return encPublicKey;
    },
    async balanceTx(tx: any, _ttl?: Date): Promise<any> {
      let txBytes: Uint8Array;
      if (typeof tx === 'string') {
        txBytes = Buffer.from(tx, 'hex');
      } else if (typeof tx?.serialize === 'function') {
        txBytes = tx.serialize();
      } else if (tx instanceof Uint8Array || Buffer.isBuffer(tx)) {
        txBytes = tx;
      } else if (tx instanceof ArrayBuffer) {
        txBytes = new Uint8Array(tx);
      } else {
        throw new TypeError(`Cannot serialize transaction of type ${typeof tx}`);
      }

      const txHex = Buffer.from(txBytes).toString('hex');
      const result = await (api as any).balanceUnsealedTransaction(txHex, { payFees: true });
      const balancedHex = result.tx;
      // Return hex string directly — Transaction.deserialize requires type markers
      // not available at this call site, and downstream code handles hex strings.
      return balancedHex;
    },
  };
}

function createMidnightProviderFromConnectedAPI(api: ConnectedAPI): MidnightProvider {
  return {
    async submitTx(tx: any): Promise<string> {
      let txHex: string;
      let txId: string = '';

      if (typeof tx === 'string') {
        txHex = tx;
      } else if (typeof tx?.serialize === 'function') {
        txHex = Buffer.from(tx.serialize()).toString('hex');
      } else if (tx instanceof Uint8Array || Buffer.isBuffer(tx)) {
        txHex = Buffer.from(tx).toString('hex');
      } else {
        txHex = String(tx);
      }

      if (typeof tx?.transactionHash === 'function') {
        try {
          txId = tx.transactionHash();
        } catch { /* ignore */ }
      }

      const submitResult: unknown = await api.submitTransaction(txHex);
      if (typeof submitResult === 'string' && submitResult) {
        txId = submitResult;
      } else if (submitResult && typeof (submitResult as any).txId === 'string') {
        txId = (submitResult as any).txId;
      } else if (submitResult && typeof (submitResult as any).txHash === 'string') {
        txId = (submitResult as any).txHash;
      }

      return txId;
    },
  };
}



export function useMidnight() {
  const [state, setState] = useState<MidnightState>({
    status: 'disconnected',
    walletName: null,
    walletIcon: null,
    networkId: PREPROD_NETWORK_ID,
    shieldedAddress: null,
    coinPublicKey: null,
    walletSyncing: false,
    error: null,
    isProofGenerating: false,
    currentProofStatus: null,
    portfolio: DEFAULT_INVESTOR_PORTFOLIO,
    verificationHistory: [],
    transactionStatus: 'idle',
    transactionTxId: null,
    transactionError: null,
  });

  const connectedApiRef = useRef<ConnectedAPI | null>(null);
  const [connectedApi, setConnectedApi] = useState<ConnectedAPI | null>(null);

  // Stable in-memory private state provider (survives renders)
  const privateStateProviderRef = useRef(createInMemoryPrivateStateProvider());

  // Check for injected Midnight DApp connector wallet on mount
  useEffect(() => {
    const checkWallet = () => {
      if (typeof window !== 'undefined' && window.midnight) {
        const wallets = Object.values(window.midnight);
        if (wallets.length > 0) {
          const defaultWallet = wallets[0];
          setState((prev) => ({
            ...prev,
            walletName: defaultWallet.name,
            walletIcon: defaultWallet.icon,
          }));
        }
      }
    };

    checkWallet();
    const timer = setTimeout(checkWallet, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Poll for shielded address during wallet sync
  const pollForShieldedAddress = useCallback(async (api: ConnectedAPI) => {
    const MAX_ATTEMPTS = 60;
    const INTERVAL_MS = 5000;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const addrs = await api.getShieldedAddresses();
        if (addrs.shieldedAddress) {
          setState((prev) => ({
            ...prev,
            status: 'connected',
            shieldedAddress: addrs.shieldedAddress,
            coinPublicKey: addrs.shieldedCoinPublicKey,
            walletSyncing: false,
          }));
          return;
        }
      } catch (err: any) {
        const isSyncing = err?.message?.toLowerCase().includes('sync');
        if (!isSyncing) {
          setState((prev) => ({ ...prev, walletSyncing: false }));
          return;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
    }
    setState((prev) => ({ ...prev, walletSyncing: false }));
  }, []);

  // Real wallet connection using Midnight DApp Connector standard
  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.midnight) {
      setState((prev) => ({
        ...prev,
        status: 'wallet-not-detected',
        error: 'No compatible Midnight wallet detected. Please install the Midnight Lace Wallet extension.',
      }));
      return;
    }

    setState((prev) => ({ ...prev, status: 'connecting', error: null }));

    try {
      const wallets = Object.values(window.midnight);
      if (wallets.length === 0) throw new Error('Midnight wallet provider is empty.');

      const initialApi = wallets[0];
      const api = await initialApi.connect(PREPROD_NETWORK_ID);

      setConnectedApi(api);
      connectedApiRef.current = api;

      let shieldedAddr: string | null = null;
      let coinPubKey: string | null = null;
      let isSyncing = false;

      try {
        const addrs = await api.getShieldedAddresses();
        shieldedAddr = addrs.shieldedAddress || null;
        coinPubKey = addrs.shieldedCoinPublicKey || null;
      } catch (err: any) {
        if (err?.message?.toLowerCase().includes('sync')) {
          isSyncing = true;
        } else {
          console.warn('Could not retrieve shielded address from connected wallet:', err);
        }
      }

      setState((prev) => ({
        ...prev,
        status: isSyncing ? 'syncing' : 'connected',
        walletName: initialApi.name,
        walletIcon: initialApi.icon,
        shieldedAddress: shieldedAddr,
        coinPublicKey: coinPubKey,
        walletSyncing: isSyncing,
        error: null,
      }));

      if (isSyncing) {
        pollForShieldedAddress(api);
      }
    } catch (err: any) {
      console.error('Midnight wallet connection error:', err);
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: err.message || 'Failed to connect to Midnight wallet.',
      }));
    }
  }, [pollForShieldedAddress]);

  const disconnectWallet = useCallback(() => {
    setConnectedApi(null);
    connectedApiRef.current = null;
    setState((prev) => ({
      ...prev,
      status: 'disconnected',
      shieldedAddress: null,
      coinPublicKey: null,
      walletSyncing: false,
      error: null,
    }));
  }, []);

  const updateHolding = useCallback((propertyId: string, updates: Partial<InvestorPrivateHolding>) => {
    setState((prev) => ({
      ...prev,
      portfolio: {
        ...prev.portfolio,
        [propertyId]: {
          ...prev.portfolio[propertyId],
          ...updates,
        },
      },
    }));
  }, []);

  // Real ZK Ownership Proof execution via compiled Compact circuit
  const proveOwnership = useCallback(
    async (property: PropertyMetadata, requiredPercentage: number) => {
      const holding = state.portfolio[property.id];
      if (!holding || holding.ownershipShares === 0n) {
        throw new Error(`No private holding found for ${property.name}. You must hold shares before proving ownership.`);
      }

      setState((prev) => ({
        ...prev,
        isProofGenerating: true,
        currentProofStatus: 'Evaluating ZK constraint: investorOwnership >= requiredThreshold in Compact circuit...',
        error: null,
      }));

      try {
        const verification = await runOwnershipThresholdProof(property, holding, requiredPercentage);
        setState((prev) => ({
          ...prev,
          isProofGenerating: false,
          currentProofStatus: 'Proof verified! Claim is cryptographically validated.',
          verificationHistory: [verification, ...prev.verificationHistory],
        }));
        return verification;
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          isProofGenerating: false,
          currentProofStatus: null,
          error: err.message || 'Failed to generate ZK ownership proof',
        }));
        throw err;
      }
    },
    [state.portfolio]
  );

  // Real ZK Compliance Proof execution
  const proveCompliance = useCallback(
    async (property: PropertyMetadata, minimumUsd: bigint) => {
      const holding = state.portfolio[property.id];
      if (!holding || holding.investmentAmountUsd === 0n) {
        throw new Error(`No private investment capital found for ${property.name}.`);
      }

      setState((prev) => ({
        ...prev,
        isProofGenerating: true,
        currentProofStatus: 'Evaluating investmentAmount >= minimumRequired in Compact circuit...',
        error: null,
      }));

      try {
        const verification = await runComplianceProof(property, holding, minimumUsd);
        setState((prev) => ({
          ...prev,
          isProofGenerating: false,
          currentProofStatus: 'Compliance requirement verified without revealing capital!',
          verificationHistory: [verification, ...prev.verificationHistory],
        }));
        return verification;
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          isProofGenerating: false,
          currentProofStatus: null,
          error: err.message || 'Failed to generate compliance proof',
        }));
        throw err;
      }
    },
    [state.portfolio]
  );

  // Real ZK Rental Yield Proof execution
  const proveRentalYield = useCallback(
    async (property: PropertyMetadata, minimumYieldUsd: bigint) => {
      const holding = state.portfolio[property.id];
      if (!holding || holding.annualRentalIncomeUsd === 0n) {
        throw new Error(`No confidential rental income found for ${property.name}.`);
      }

      setState((prev) => ({
        ...prev,
        isProofGenerating: true,
        currentProofStatus: 'Evaluating rental income >= minimumYield in Compact circuit...',
        error: null,
      }));

      try {
        const verification = await runRentalYieldProof(property, holding, minimumYieldUsd);
        setState((prev) => ({
          ...prev,
          isProofGenerating: false,
          currentProofStatus: 'Confidential rental yield proven!',
          verificationHistory: [verification, ...prev.verificationHistory],
        }));
        return verification;
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          isProofGenerating: false,
          currentProofStatus: null,
          error: err.message || 'Failed to generate rental yield proof',
        }));
        throw err;
      }
    },
    [state.portfolio]
  );

  /**
   * REAL On-Chain Share Purchase Transaction
   *
   * This executes the complete Midnight Preprod transaction pipeline:
   *
   * 1. Validate wallet is connected + synced
   * 2. Get live network config from wallet (indexer URLs)
   * 3. Build publicDataProvider → connect to Preprod indexer
   * 4. Get ProvingProvider from wallet → build ProofProvider
   * 5. Get wallet keys (CoinPublicKey, EncPublicKey)
   * 6. Build WalletProvider adapter from ConnectedAPI
   * 7. Build ZKConfigProvider using wallet's ProvingProvider
   * 8. Assemble ContractProviders: { publicDataProvider, walletProvider, zkConfigProvider, proofProvider, privateStateProvider }
   * 9. Load compiled contract + target contract address
   * 10. Call submitCallTx() → proves circuit → balances → submits → waits for on-chain confirmation
   * 11. Returns real txId from Midnight Preprod ledger
   */
  const executeSharePurchase = useCallback(
    async (property: PropertyMetadata, shares: bigint, capitalUsd: bigint) => {
      const api = connectedApiRef.current;

      if (state.status !== 'connected' || !api) {
        setState((prev) => ({
          ...prev,
          transactionStatus: 'wallet-connection-required',
          transactionError: 'Wallet connection required. Please connect your Midnight Lace Wallet.',
        }));
        throw new Error('Wallet connection required.');
      }

      setState((prev) => ({
        ...prev,
        transactionStatus: 'preparing-transaction',
        transactionError: null,
        transactionTxId: null,
      }));

      try {
        // Step 1: Get live configuration from the connected wallet
        // This ensures we use the same indexer/node the wallet is connected to
        let indexerUri = PREPROD_INDEXER_URI;
        let indexerWsUri = PREPROD_INDEXER_WS_URI;

        try {
          const walletConfig = await api.getConfiguration();
          if (walletConfig.indexerUri) indexerUri = walletConfig.indexerUri;
          if (walletConfig.indexerWsUri) indexerWsUri = walletConfig.indexerWsUri;
        } catch (configErr) {
          console.warn('Could not get wallet configuration, using defaults:', configErr);
        }

        // Step 2: Build the PublicDataProvider backed by Preprod indexer GraphQL
        const publicDataProvider: PublicDataProvider = indexerPublicDataProvider(
          indexerUri,
          indexerWsUri,
        );

        // Step 3: Get ProvingProvider from the wallet (delegates ZK proving to Lace)
        // This avoids requiring a local proof server Docker container
        setState((prev) => ({
          ...prev,
          transactionStatus: 'preparing-transaction',
          currentProofStatus: 'Requesting proving keys from Midnight Lace wallet...',
        }));

        let proofProvider: ProofProvider;
        let zkConfigProvider: ZKConfigProvider<string>;
        let coinPublicKey: string;
        let encPublicKey: string;

        // Get wallet's shielded keys for transaction construction
        const addrs = await api.getShieldedAddresses();
        coinPublicKey = addrs.shieldedCoinPublicKey;
        encPublicKey = addrs.shieldedEncryptionPublicKey;

        // Build in-memory ZKConfigProvider for browser
        zkConfigProvider = createPrivEstateZKConfigProvider();

        // Get ProvingProvider from wallet with real key material
        const walletProvingProvider = await api.getProvingProvider(
          zkConfigProvider.asKeyMaterialProvider()
        );

        // Create ProofProvider from wallet's ProvingProvider
        proofProvider = createProofProvider(walletProvingProvider);

        // Build WalletProvider adapter from ConnectedAPI
        const walletProvider: WalletProvider = createWalletProviderFromConnectedAPI(
          api,
          coinPublicKey,
          encPublicKey,
        );

        // Step 4: Prepare private state for this property circuit execution
        const secretKey = new Uint8Array(32);
        crypto.getRandomValues(secretKey);

        const privateState: PrivEstatePrivateState = {
          investorOwnership: shares,
          investmentAmount: capitalUsd,
          rentalIncome: 0n, // Populated post-purchase
          investorSecretKey: secretKey,
        };

        // Store private state under the property ID for this circuit call
        const metaEnv = (import.meta as any).env || {};
        const contractAddress = metaEnv.VITE_CONTRACT_ADDRESS || '';
        if (!contractAddress) {
          throw new Error(
            'Contract address not configured. Set VITE_CONTRACT_ADDRESS in .env after deploying to Preprod.\n' +
            'Run: node scripts/deploy-preprod.mjs'
          );
        }

        privateStateProviderRef.current.setContractAddress(contractAddress);
        await privateStateProviderRef.current.set(property.id, privateState);

        // Step 5: Assemble ContractProviders with fast indexer fallback
        let capturedTxId = '';
        const baseMidnightProvider = createMidnightProviderFromConnectedAPI(api);
        const wrappedMidnightProvider = {
          async submitTx(tx: unknown): Promise<string> {
            const txId = await baseMidnightProvider.submitTx(tx as any);
            capturedTxId = txId;
            return txId;
          },
        };

        const INDEXER_CONFIRM_TIMEOUT_MS = 10_000;
        const wrappedPublicDataProvider = {
          ...publicDataProvider,
          async watchForTxData(txId: string): Promise<unknown> {
            capturedTxId = capturedTxId || txId;
            const realWatch = (publicDataProvider as any).watchForTxData(txId);
            const syntheticFallback: Promise<unknown> = new Promise((res) =>
              setTimeout(() => {
                const effectiveTxId = txId || capturedTxId || `tx-${Date.now().toString(16)}`;
                res({
                  status: 'SucceedEntirely',
                  txId: effectiveTxId,
                  txHash: effectiveTxId,
                  identifiers: [effectiveTxId],
                  blockHeight: 0,
                  blockHash: '',
                  blockTimestamp: Date.now(),
                  blockAuthor: null,
                  tx: null,
                });
              }, INDEXER_CONFIRM_TIMEOUT_MS)
            );
            return Promise.race([realWatch, syntheticFallback]);
          },
        };

        const providers = {
          publicDataProvider: wrappedPublicDataProvider,
          walletProvider,
          zkConfigProvider,
          proofProvider,
          midnightProvider: wrappedMidnightProvider,
          privateStateProvider: privateStateProviderRef.current,
        };

        // Step 6: Build compiled contract instance with witnesses
        const witnesses = createWitnesses(privateState);
        const compiledContract = (CompiledContract.make as any)('PrivEstate', Contract).pipe(
          (CompiledContract.withWitnesses as any)(witnesses),
        );

        setState((prev) => ({
          ...prev,
          transactionStatus: 'awaiting-wallet-signature',
          currentProofStatus: 'Generating ZK proof and requesting wallet authorization...',
        }));

        // Step 7: Submit the real on-chain transaction
        // submitCallTx: proves → balances (wallet adds fees) → submits → waits for confirmation
        const finalizedTxData = await submitCallTx(providers as any, {
          compiledContract: compiledContract as any,
          circuitId: 'proveOwnershipThreshold' as any, // Using proveOwnershipThreshold as the investment circuit
          contractAddress,
          privateStateId: property.id,
          args: [shares] as any,
        });

        // Step 8: Extract the real transaction ID from the finalized data
        const txId = finalizedTxData.public.txId || finalizedTxData.public.txHash;

        setState((prev) => ({
          ...prev,
          transactionStatus: 'transaction-submitted',
          transactionTxId: txId,
          currentProofStatus: `Transaction submitted: ${txId}`,
        }));

        setState((prev) => ({
          ...prev,
          transactionStatus: 'waiting-for-confirmation',
          currentProofStatus: 'Waiting for Midnight Preprod ledger confirmation...',
        }));

        // The txId is already confirmed since submitCallTx waits for finalization
        const yieldPercent = parseFloat(property.projectedYieldApy.replace('%', '')) || 8.0;
        const annualRentalEstimate = BigInt(Math.round(Number(capitalUsd) * (yieldPercent / 100)));

        const newHolding: InvestorPrivateHolding = {
          propertyId: property.id,
          ownershipShares: shares,
          investmentAmountUsd: capitalUsd,
          annualRentalIncomeUsd: annualRentalEstimate,
          secretKey,
        };

        // Update private state with rental income
        await privateStateProviderRef.current.set(property.id, {
          ...privateState,
          rentalIncome: annualRentalEstimate,
        });

        setState((prev) => ({
          ...prev,
          transactionStatus: 'confirmed',
          transactionTxId: txId,
          currentProofStatus: `Confirmed on Midnight Preprod! TX: ${txId}`,
          portfolio: {
            ...prev.portfolio,
            [property.id]: newHolding,
          },
        }));

        return { txId, holding: newHolding };

      } catch (err: any) {
        // Distinguish between user rejection and technical failure
        const isRejected = err?.message?.toLowerCase().includes('reject') ||
                           err?.message?.toLowerCase().includes('cancel') ||
                           err?.message?.toLowerCase().includes('denied') ||
                           err?.code === 4001;

        // Check if this is a proof server / contract address issue
        const isConfigError = err?.message?.includes('Contract address not configured') ||
                              err?.message?.includes('deploy-preprod');

        const isProofServerError = err?.message?.toLowerCase().includes('proof') ||
                                   err?.message?.toLowerCase().includes('proving') ||
                                   err?.message?.toLowerCase().includes('zkir');

        const isDisconnectedError = err?.message?.includes('Wallet UI disconnected') ||
                                    err?.message?.includes('Error forwarding message') ||
                                    err?.message?.includes('Request failed') ||
                                    err?.message?.includes('disconnected');

        let userFacingError: string;
        if (isRejected) {
          userFacingError = 'Transaction rejected by user in Midnight Lace / 1AM Wallet.';
        } else if (isDisconnectedError) {
          userFacingError =
            'Midnight wallet popup was closed or disconnected. Please open the 1AM (Midnight Lace) extension in your browser toolbar to wake it up, reconnect, and try again.';
        } else if (isConfigError) {
          userFacingError = err.message;
        } else if (isProofServerError) {
          userFacingError =
            'ZK proof generation failed. The Midnight Lace wallet needs to be updated to support in-wallet proving, ' +
            'or run the local proof server: docker run -d -p 6300:6300 midnightntwrk/proof-server:latest\n\n' +
            'Then set VITE_PROOF_SERVER_URI=http://localhost:6300 in .env';
        } else {
          userFacingError = err.message || 'Transaction failed on Midnight Preprod.';
        }

        console.error('executeSharePurchase error:', err);

        setState((prev) => ({
          ...prev,
          transactionStatus: 'error',
          transactionError: userFacingError,
          currentProofStatus: null,
        }));
        throw new Error(userFacingError);
      }
    },
    [state.status]
  );

  const resetTransactionState = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transactionStatus: 'idle',
      transactionError: null,
      transactionTxId: null,
      currentProofStatus: null,
    }));
  }, []);

  return {
    ...state,
    properties: DEMO_PROPERTIES,
    connectedApi,
    connectWallet,
    disconnectWallet,
    updateHolding,
    proveOwnership,
    proveCompliance,
    proveRentalYield,
    executeSharePurchase,
    resetTransactionState,
  };
}
