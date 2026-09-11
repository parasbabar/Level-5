import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

const copyCircuitContext = function(ctx) {
  const copied = Object.assign({}, ctx);
  if (!copied.callContext) {
    copied.callContext = {
      currentQueryContext: copied.currentQueryContext,
      currentGasCost: copied.currentGasCost ?? __compactRuntime.emptyRunningCost()
    };
  }
  return copied;
};
const finalizeCallProofData = __compactRuntime.finalizeCallProofData || function() {};

const _descriptor_0 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_2 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_3 = new __compactRuntime.CompactTypeVector(3, _descriptor_2);

const _descriptor_4 = __compactRuntime.CompactTypeBoolean;

class _Either_0 {
  alignment() {
    return _descriptor_4.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_4.fromValue(value_0),
      left: _descriptor_2.fromValue(value_0),
      right: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_4.toValue(value_0.is_left).concat(_descriptor_2.toValue(value_0.left).concat(_descriptor_2.toValue(value_0.right)));
  }
}

const _descriptor_5 = new _Either_0();

const _descriptor_6 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_2.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.bytes);
  }
}

const _descriptor_7 = new _ContractAddress_0();

const _descriptor_8 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_9 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.getInvestorOwnership) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named getInvestorOwnership');
    }
    if (typeof(witnesses_0.getInvestmentAmount) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named getInvestmentAmount');
    }
    if (typeof(witnesses_0.getRentalIncome) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named getRentalIncome');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      proveOwnershipThreshold: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`proveOwnershipThreshold: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        let contextOrig_0 = args_1[0];
        const requiredShares_0 = args_1[1];
        if (typeof(contextOrig_0) === 'object' && contextOrig_0 !== null && !contextOrig_0.callContext && contextOrig_0.currentQueryContext !== undefined) {
          contextOrig_0 = {
            ...contextOrig_0,
            callContext: {
              currentQueryContext: contextOrig_0.currentQueryContext,
              currentGasCost: contextOrig_0.currentGasCost ?? __compactRuntime.emptyRunningCost()
            }
          };
        }
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0 !== null && (contextOrig_0.callContext?.currentQueryContext != undefined || contextOrig_0.currentQueryContext != undefined))) {
          __compactRuntime.typeError('proveOwnershipThreshold',
                                     'argument 1 (as invoked from Typescript)',
                                     'privestate.compact line 85 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(requiredShares_0) === 'bigint' && requiredShares_0 >= 0n && requiredShares_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('proveOwnershipThreshold',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'privestate.compact line 85 char 1',
                                     'Uint<0..18446744073709551616>',
                                     requiredShares_0)
        }
        const context = copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(requiredShares_0),
            alignment: _descriptor_1.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._proveOwnershipThreshold_0(context,
                                                         partialProofData,
                                                         requiredShares_0);
        partialProofData.output = { value: [], alignment: [] };
        finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.callContext?.currentGasCost ?? context.currentGasCost ?? __compactRuntime.emptyRunningCost() };
      },
      proveCompliance: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`proveCompliance: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        let contextOrig_0 = args_1[0];
        const minimumRequired_0 = args_1[1];
        if (typeof(contextOrig_0) === 'object' && contextOrig_0 !== null && !contextOrig_0.callContext && contextOrig_0.currentQueryContext !== undefined) {
          contextOrig_0 = {
            ...contextOrig_0,
            callContext: {
              currentQueryContext: contextOrig_0.currentQueryContext,
              currentGasCost: contextOrig_0.currentGasCost ?? __compactRuntime.emptyRunningCost()
            }
          };
        }
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0 !== null && (contextOrig_0.callContext?.currentQueryContext != undefined || contextOrig_0.currentQueryContext != undefined))) {
          __compactRuntime.typeError('proveCompliance',
                                     'argument 1 (as invoked from Typescript)',
                                     'privestate.compact line 107 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(minimumRequired_0) === 'bigint' && minimumRequired_0 >= 0n && minimumRequired_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('proveCompliance',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'privestate.compact line 107 char 1',
                                     'Uint<0..18446744073709551616>',
                                     minimumRequired_0)
        }
        const context = copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(minimumRequired_0),
            alignment: _descriptor_1.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._proveCompliance_0(context,
                                                 partialProofData,
                                                 minimumRequired_0);
        partialProofData.output = { value: [], alignment: [] };
        finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.callContext?.currentGasCost ?? context.currentGasCost ?? __compactRuntime.emptyRunningCost() };
      },
      proveRentalClaim: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`proveRentalClaim: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        let contextOrig_0 = args_1[0];
        const minimumYield_0 = args_1[1];
        if (typeof(contextOrig_0) === 'object' && contextOrig_0 !== null && !contextOrig_0.callContext && contextOrig_0.currentQueryContext !== undefined) {
          contextOrig_0 = {
            ...contextOrig_0,
            callContext: {
              currentQueryContext: contextOrig_0.currentQueryContext,
              currentGasCost: contextOrig_0.currentGasCost ?? __compactRuntime.emptyRunningCost()
            }
          };
        }
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0 !== null && (contextOrig_0.callContext?.currentQueryContext != undefined || contextOrig_0.currentQueryContext != undefined))) {
          __compactRuntime.typeError('proveRentalClaim',
                                     'argument 1 (as invoked from Typescript)',
                                     'privestate.compact line 125 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(minimumYield_0) === 'bigint' && minimumYield_0 >= 0n && minimumYield_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('proveRentalClaim',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'privestate.compact line 125 char 1',
                                     'Uint<0..18446744073709551616>',
                                     minimumYield_0)
        }
        const context = copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(minimumYield_0),
            alignment: _descriptor_1.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._proveRentalClaim_0(context,
                                                  partialProofData,
                                                  minimumYield_0);
        partialProofData.output = { value: [], alignment: [] };
        finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.callContext?.currentGasCost ?? context.currentGasCost ?? __compactRuntime.emptyRunningCost() };
      },
      computeInvestorCommitment(context, ...args_1) {
        return { result: pureCircuits.computeInvestorCommitment(...args_1), context };
      }
    };
    this.impureCircuits = {
      proveOwnershipThreshold: this.circuits.proveOwnershipThreshold,
      proveCompliance: this.circuits.proveCompliance,
      proveRentalClaim: this.circuits.proveRentalClaim
    };
    this.provableCircuits = {
      proveOwnershipThreshold: this.circuits.proveOwnershipThreshold,
      proveCompliance: this.circuits.proveCompliance,
      proveRentalClaim: this.circuits.proveRentalClaim
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 4) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 4 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    const initPropertyId_0 = args_0[1];
    const initTotalShares_0 = args_0[2];
    const initComplianceMinimum_0 = args_0[3];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!(initPropertyId_0.buffer instanceof ArrayBuffer && initPropertyId_0.BYTES_PER_ELEMENT === 1 && initPropertyId_0.length === 32)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 1 (argument 2 as invoked from Typescript)',
                                 'privestate.compact line 57 char 1',
                                 'Bytes<32>',
                                 initPropertyId_0)
    }
    if (!(typeof(initTotalShares_0) === 'bigint' && initTotalShares_0 >= 0n && initTotalShares_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 2 (argument 3 as invoked from Typescript)',
                                 'privestate.compact line 57 char 1',
                                 'Uint<0..18446744073709551616>',
                                 initTotalShares_0)
    }
    if (!(typeof(initComplianceMinimum_0) === 'bigint' && initComplianceMinimum_0 >= 0n && initComplianceMinimum_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 3 (argument 4 as invoked from Typescript)',
                                 'privestate.compact line 57 char 1',
                                 'Uint<0..18446744073709551616>',
                                 initComplianceMinimum_0)
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('proveOwnershipThreshold', new __compactRuntime.ContractOperation());
    state_0.setOperation('proveCompliance', new __compactRuntime.ContractOperation());
    state_0.setOperation('proveRentalClaim', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(0n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(1n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(2n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(3n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(4n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(5n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(6n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(0n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(initPropertyId_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(1n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(initTotalShares_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(2n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(initComplianceMinimum_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_0 = 0n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(6n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const ctx = context.callContext ?? context;
    state_0.data = new __compactRuntime.ChargedState(ctx.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: ctx.currentPrivateState,
      currentZswapLocalState: ctx.currentZswapLocalState
    }
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_3, value_0);
    return result_0;
  }
  _getInvestorOwnership_0(context, partialProofData) {
    const ctx = context.callContext ?? context;
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(ctx.currentQueryContext.state), ctx.currentPrivateState, ctx.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.getInvestorOwnership(witnessContext_0);
    ctx.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('getInvestorOwnership',
                                 'return value',
                                 'privestate.compact line 70 char 1',
                                 'Uint<0..18446744073709551616>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_1.toValue(result_0),
      alignment: _descriptor_1.alignment()
    });
    return result_0;
  }
  _getInvestmentAmount_0(context, partialProofData) {
    const ctx = context.callContext ?? context;
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(ctx.currentQueryContext.state), ctx.currentPrivateState, ctx.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.getInvestmentAmount(witnessContext_0);
    ctx.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('getInvestmentAmount',
                                 'return value',
                                 'privestate.compact line 71 char 1',
                                 'Uint<0..18446744073709551616>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_1.toValue(result_0),
      alignment: _descriptor_1.alignment()
    });
    return result_0;
  }
  _getRentalIncome_0(context, partialProofData) {
    const ctx = context.callContext ?? context;
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(ctx.currentQueryContext.state), ctx.currentPrivateState, ctx.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.getRentalIncome(witnessContext_0);
    ctx.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('getRentalIncome',
                                 'return value',
                                 'privestate.compact line 72 char 1',
                                 'Uint<0..18446744073709551616>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_1.toValue(result_0),
      alignment: _descriptor_1.alignment()
    });
    return result_0;
  }
  _proveOwnershipThreshold_0(context, partialProofData, requiredShares_0)
  {
    const actualOwnership_0 = this._getInvestorOwnership_0(context,
                                                           partialProofData);
    __compactRuntime.assert(actualOwnership_0 >= requiredShares_0,
                            'Ownership threshold requirement not satisfied');
    __compactRuntime.assert(actualOwnership_0
                            <=
                            _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_8.toValue(1n),
                                                                                                                   alignment: _descriptor_8.alignment() } }] } },
                                                                                       { popeq: { cached: false,
                                                                                                   result: undefined } }]).value),
                            'Investor ownership exceeds total authorized shares');
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_8.toValue(3n),
                                                                  alignment: _descriptor_8.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_0.toValue(tmp_0),
                                                                alignment: _descriptor_0.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(6n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(requiredShares_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    return [];
  }
  _proveCompliance_0(context, partialProofData, minimumRequired_0) {
    const actualInvestment_0 = this._getInvestmentAmount_0(context,
                                                           partialProofData);
    __compactRuntime.assert(actualInvestment_0 >= minimumRequired_0,
                            'Investment does not meet minimum compliance threshold');
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_8.toValue(4n),
                                                                  alignment: _descriptor_8.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_0.toValue(tmp_0),
                                                                alignment: _descriptor_0.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _proveRentalClaim_0(context, partialProofData, minimumYield_0) {
    const actualRental_0 = this._getRentalIncome_0(context, partialProofData);
    __compactRuntime.assert(actualRental_0 >= minimumYield_0,
                            'Rental income does not meet required yield threshold');
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_8.toValue(5n),
                                                                  alignment: _descriptor_8.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_0.toValue(tmp_0),
                                                                alignment: _descriptor_0.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _computeInvestorCommitment_0(sk_0, propId_0) {
    return this._persistentHash_0([new Uint8Array([112, 114, 105, 118, 101, 115, 116, 97, 116, 101, 58, 105, 110, 118, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   propId_0,
                                   sk_0]);
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const currentQueryContext = new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress());
  const context = {
    currentQueryContext,
    callContext: { currentQueryContext, currentGasCost: __compactRuntime.emptyRunningCost() },
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get propertyId() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_8.toValue(0n),
                                                                                                   alignment: _descriptor_8.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get totalShares() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_8.toValue(1n),
                                                                                                   alignment: _descriptor_8.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get complianceMinimum() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_8.toValue(2n),
                                                                                                   alignment: _descriptor_8.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get verifiedOwnershipCount() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_8.toValue(3n),
                                                                                                   alignment: _descriptor_8.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    },
    get verifiedComplianceCount() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_8.toValue(4n),
                                                                                                   alignment: _descriptor_8.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    },
    get verifiedRentalYieldCount() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_8.toValue(5n),
                                                                                                   alignment: _descriptor_8.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    },
    get lastVerifiedThreshold() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_8.toValue(6n),
                                                                                                   alignment: _descriptor_8.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    }
  };
}
const _emptyContext = {
  callContext: { currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress()), currentGasCost: __compactRuntime.emptyRunningCost() }
};
const _dummyContract = new Contract({
  getInvestorOwnership: (...args) => undefined,
  getInvestmentAmount: (...args) => undefined,
  getRentalIncome: (...args) => undefined
});
export const pureCircuits = {
  computeInvestorCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`computeInvestorCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const sk_0 = args_0[0];
    const propId_0 = args_0[1];
    if (!(sk_0.buffer instanceof ArrayBuffer && sk_0.BYTES_PER_ELEMENT === 1 && sk_0.length === 32)) {
      __compactRuntime.typeError('computeInvestorCommitment',
                                 'argument 1',
                                 'privestate.compact line 140 char 1',
                                 'Bytes<32>',
                                 sk_0)
    }
    if (!(propId_0.buffer instanceof ArrayBuffer && propId_0.BYTES_PER_ELEMENT === 1 && propId_0.length === 32)) {
      __compactRuntime.typeError('computeInvestorCommitment',
                                 'argument 2',
                                 'privestate.compact line 140 char 1',
                                 'Bytes<32>',
                                 propId_0)
    }
    return _dummyContract._computeInvestorCommitment_0(sk_0, propId_0);
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
export const expectedVk = {
  'proveCompliance': '4d1efef0afcf15495bf7dc9fb133012036cacab07f7e28f9aaa771fde47054b3',
  'proveOwnershipThreshold': '5779949786a59162ae59501e6b16ad86875dad79afd412a84525c9c4be8de984',
  'proveRentalClaim': '1e1bbc9ff171000c4d80089a84ce53f07b924f0e049e4cc7c4802cef11509372',
};

//# sourceMappingURL=index.js.map
