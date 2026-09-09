import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  getInvestorOwnership(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getInvestmentAmount(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getRentalIncome(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
}

export type ImpureCircuits<PS> = {
  proveOwnershipThreshold(context: __compactRuntime.CircuitContext<PS>,
                          requiredShares_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  proveCompliance(context: __compactRuntime.CircuitContext<PS>,
                  minimumRequired_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  proveRentalClaim(context: __compactRuntime.CircuitContext<PS>,
                   minimumYield_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type ProvableCircuits<PS> = {
  proveOwnershipThreshold(context: __compactRuntime.CircuitContext<PS>,
                          requiredShares_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  proveCompliance(context: __compactRuntime.CircuitContext<PS>,
                  minimumRequired_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  proveRentalClaim(context: __compactRuntime.CircuitContext<PS>,
                   minimumYield_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type PureCircuits = {
  computeInvestorCommitment(sk_0: Uint8Array, propId_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  proveOwnershipThreshold(context: __compactRuntime.CircuitContext<PS>,
                          requiredShares_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  proveCompliance(context: __compactRuntime.CircuitContext<PS>,
                  minimumRequired_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  proveRentalClaim(context: __compactRuntime.CircuitContext<PS>,
                   minimumYield_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  computeInvestorCommitment(context: __compactRuntime.CircuitContext<PS>,
                            sk_0: Uint8Array,
                            propId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, Uint8Array>>;
}

export type Ledger = {
  readonly propertyId: Uint8Array;
  readonly totalShares: bigint;
  readonly complianceMinimum: bigint;
  readonly verifiedOwnershipCount: bigint;
  readonly verifiedComplianceCount: bigint;
  readonly verifiedRentalYieldCount: bigint;
  readonly lastVerifiedThreshold: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               initPropertyId_0: Uint8Array,
               initTotalShares_0: bigint,
               initComplianceMinimum_0: bigint): Promise<__compactRuntime.ConstructorResult<PS>>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
export declare const expectedVk: Record<string, string>;
