import React, { useState } from 'react';
import { Award, Lock, CheckCircle2, RefreshCw, AlertCircle, Info } from 'lucide-react';
import type { PropertyMetadata, InvestorPrivateHolding, VerificationResult } from '../utils/contract';

interface ComplianceProofProps {
  properties: PropertyMetadata[];
  selectedProperty: PropertyMetadata | null;
  portfolio: Record<string, InvestorPrivateHolding>;
  isGenerating: boolean;
  proofStatus: string | null;
  onSelectProperty: (property: PropertyMetadata) => void;
  onGenerateProof: (property: PropertyMetadata, minimumUsd: bigint) => Promise<VerificationResult>;
}

export const ComplianceProof: React.FC<ComplianceProofProps> = ({
  properties,
  selectedProperty,
  portfolio,
  isGenerating,
  proofStatus,
  onSelectProperty,
  onGenerateProof,
}) => {
  const currentProperty = selectedProperty || properties[0];
  const holding = portfolio[currentProperty.id];

  const [minimumRequirement, setMinimumRequirement] = useState<number>(250_000);
  const [lastResult, setLastResult] = useState<VerificationResult | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExecutionError(null);
    setLastResult(null);

    try {
      const res = await onGenerateProof(currentProperty, BigInt(minimumRequirement));
      setLastResult(res);
    } catch (err: any) {
      setExecutionError(err.message || 'Compliance verification failed. Threshold requirement not satisfied.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Verifiable Investor Compliance & Accreditation</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Prove you meet regulatory accreditation criteria without revealing your net worth or total capital.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Property Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Associated Property Offering
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {properties.map((prop) => {
                const isSelected = prop.id === currentProperty.id;
                return (
                  <button
                    key={prop.id}
                    type="button"
                    onClick={() => {
                      onSelectProperty(prop);
                      setLastResult(null);
                      setExecutionError(null);
                    }}
                    className={`p-3.5 rounded-lg border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-600/10 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs truncate text-white">{prop.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400 mt-1">
                      Req: ${prop.complianceMinimumUsd.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy Callout */}
          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>
                Your Private Investment Capital: <strong className="text-white">${holding?.investmentAmountUsd.toLocaleString()}</strong>
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              🔒 Shielded Witness
            </span>
          </div>

          {/* Preset Requirements */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Regulatory Benchmark
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Standard Accredited', amount: 100_000 },
                { label: 'Qualified Investor', amount: 250_000 },
                { label: 'Institutional Tier', amount: 500_000 },
              ].map((tier) => (
                <button
                  key={tier.amount}
                  type="button"
                  onClick={() => setMinimumRequirement(tier.amount)}
                  className={`p-3 rounded-lg border text-left transition ${
                    minimumRequirement === tier.amount
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{tier.label}</div>
                  <div className="text-xs font-mono mt-1 opacity-90">${tier.amount.toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Evaluating Compliance Circuit...</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>Generate Compliance Proof</span>
              </>
            )}
          </button>
        </form>

        {/* Live Generating Progress Indicator */}
        {isGenerating && proofStatus && (
          <div className="mt-4 p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-3">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
            <span className="font-mono">{proofStatus}</span>
          </div>
        )}

        {/* Error State */}
        {executionError && (
          <div className="mt-4 p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-200">Compliance Requirement Rejected</p>
              <p className="mt-0.5">{executionError}</p>
              <p className="mt-1 text-slate-400">
                Constraint: <code className="text-rose-300">investmentAmount &gt;= ${minimumRequirement.toLocaleString()}</code> evaluated to false in the Compact circuit.
              </p>
            </div>
          </div>
        )}

        {/* Success */}
        {lastResult && (
          <div className="mt-6 p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>✓ Eligible & Cryptographically Validated</span>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 text-xs space-y-2.5">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Accreditation Requirement:</span>
                <span className="font-semibold text-white">&gt;= ${minimumRequirement.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Underlying Financial Amount:</span>
                <span className="font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  NOT DISCLOSED (🔒 PRIVATE)
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Zero-Knowledge Circuit:</span>
                <span className="font-mono text-indigo-400">{lastResult.zkirCircuit}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Regulator Verification Key:</span>
                <span className="font-mono text-slate-400 truncate max-w-[280px]">
                  {lastResult.proofHash}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Auditors can confirm you satisfy regulatory thresholds without receiving access to your bank statements, tax returns, or exact portfolio size.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
