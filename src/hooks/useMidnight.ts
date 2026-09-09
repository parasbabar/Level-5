/**
 * PrivEstate - useMidnight Hook
 * 
 * Manages the real Midnight DApp connector wallet connection (window.midnight),
 * network state, circuit execution pipeline, and verification results.
 */

import { useState, useEffect, useCallback } from 'react';
import type { InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import {
  DEMO_PROPERTIES,
  DEFAULT_INVESTOR_PORTFOLIO,
  type PropertyMetadata,
  type InvestorPrivateHolding,
  type VerificationResult,
  runOwnershipThresholdProof,
  runComplianceProof,
  runRentalYieldProof,
} from '../utils/contract';

declare global {
  interface Window {
    midnight?: Record<string, InitialAPI>;
  }
}

export type WalletConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'wallet-not-detected'
  | 'error';

export interface MidnightState {
  status: WalletConnectionStatus;
  walletName: string | null;
  walletIcon: string | null;
  networkId: string;
  shieldedAddress: string | null;
  error: string | null;
  isProofGenerating: boolean;
  currentProofStatus: string | null;
  portfolio: Record<string, InvestorPrivateHolding>;
  verificationHistory: VerificationResult[];
}

const PREPROD_NETWORK_ID = 'preprod';

export function useMidnight() {
  const [state, setState] = useState<MidnightState>({
    status: 'disconnected',
    walletName: null,
    walletIcon: null,
    networkId: PREPROD_NETWORK_ID,
    shieldedAddress: null,
    error: null,
    isProofGenerating: false,
    currentProofStatus: null,
    portfolio: DEFAULT_INVESTOR_PORTFOLIO,
    verificationHistory: [],
  });

  const [connectedApi, setConnectedApi] = useState<ConnectedAPI | null>(null);

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
      if (wallets.length === 0) {
        throw new Error('Midnight wallet provider is empty.');
      }

      const initialApi = wallets[0];
      const api = await initialApi.connect(PREPROD_NETWORK_ID);

      let address: string | null = null;
      try {
        if ('getShieldedAddresses' in api && typeof (api as any).getShieldedAddresses === 'function') {
          const addrs = await (api as any).getShieldedAddresses();
          address = addrs.shieldedCoinPublicKey || addrs.shieldedEncryptionPublicKey || null;
        }
      } catch (err) {
        console.warn('Could not retrieve shielded address from connected wallet:', err);
      }

      setConnectedApi(api);
      setState((prev) => ({
        ...prev,
        status: 'connected',
        walletName: initialApi.name,
        walletIcon: initialApi.icon,
        shieldedAddress: address,
        error: null,
      }));
    } catch (err: any) {
      console.error('Midnight wallet connection error:', err);
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: err.message || 'Failed to connect to Midnight wallet.',
      }));
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setConnectedApi(null);
    setState((prev) => ({
      ...prev,
      status: 'disconnected',
      shieldedAddress: null,
      error: null,
    }));
  }, []);

  // Update investor private holdings
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

  // Real ZK Ownership Proof execution
  const proveOwnership = useCallback(
    async (property: PropertyMetadata, requiredPercentage: number) => {
      const holding = state.portfolio[property.id];
      if (!holding) {
        throw new Error(`No private holding found for ${property.name}`);
      }

      setState((prev) => ({
        ...prev,
        isProofGenerating: true,
        currentProofStatus: 'Constructing private witness & evaluating Compact circuit...',
        error: null,
      }));

      try {
        // Step 1: Initializing witness
        await new Promise((r) => setTimeout(r, 600));
        setState((prev) => ({
          ...prev,
          currentProofStatus: 'Evaluating ZK constraint: investorOwnership >= requiredThreshold...',
        }));

        // Step 2: Real execution of the Compact circuit
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
      if (!holding) {
        throw new Error(`No private holding found for ${property.name}`);
      }

      setState((prev) => ({
        ...prev,
        isProofGenerating: true,
        currentProofStatus: 'Generating Zero-Knowledge compliance proof...',
        error: null,
      }));

      try {
        await new Promise((r) => setTimeout(r, 600));
        setState((prev) => ({
          ...prev,
          currentProofStatus: 'Verifying investmentAmount >= minimumRequired in Compact circuit...',
        }));

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
      if (!holding) {
        throw new Error(`No private holding found for ${property.name}`);
      }

      setState((prev) => ({
        ...prev,
        isProofGenerating: true,
        currentProofStatus: 'Generating confidential rental yield proof...',
        error: null,
      }));

      try {
        await new Promise((r) => setTimeout(r, 600));
        setState((prev) => ({
          ...prev,
          currentProofStatus: 'Verifying rental income satisfies yield benchmark...',
        }));

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
  };
}
