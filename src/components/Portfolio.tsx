import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, Edit3, Check } from 'lucide-react';
import type { PropertyMetadata, InvestorPrivateHolding } from '../utils/contract';

interface PortfolioProps {
  properties: PropertyMetadata[];
  portfolio: Record<string, InvestorPrivateHolding>;
  onUpdateHolding: (propertyId: string, updates: Partial<InvestorPrivateHolding>) => void;
  onSelectPropertyForProof: (property: PropertyMetadata, type: 'ownership' | 'compliance' | 'rental') => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({
  properties,
  portfolio,
  onUpdateHolding,
  onSelectPropertyForProof,
}) => {
  const [showSensitiveData, setShowSensitiveData] = useState<boolean>(true);
  const [editingPropId, setEditingPropId] = useState<string | null>(null);
  const [editShares, setEditShares] = useState<string>('');
  const [editInvestment, setEditInvestment] = useState<string>('');
  const [editRental, setEditRental] = useState<string>('');

  const startEdit = (holding: InvestorPrivateHolding) => {
    setEditingPropId(holding.propertyId);
    setEditShares(holding.ownershipShares.toString());
    setEditInvestment(holding.investmentAmountUsd.toString());
    setEditRental(holding.annualRentalIncomeUsd.toString());
  };

  const saveEdit = (propId: string) => {
    onUpdateHolding(propId, {
      ownershipShares: BigInt(editShares || '0'),
      investmentAmountUsd: BigInt(editInvestment || '0'),
      annualRentalIncomeUsd: BigInt(editRental || '0'),
    });
    setEditingPropId(null);
  };

  const propertiesWithHoldings = properties.filter(
    (prop) => portfolio[prop.id] && portfolio[prop.id].ownershipShares > 0n
  );

  return (
    <div className="space-y-6">
      {/* Header with Privacy Guarantee & Shield Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Shielded Private Portfolio</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> 🔒 PRIVATE & CONFIDENTIAL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            This information resides strictly within your client-side shielded storage. The Midnight blockchain and external observers never see these raw numbers; only your generated ZK proofs verify specific claims.
          </p>
        </div>

        {propertiesWithHoldings.length > 0 && (
          <button
            onClick={() => setShowSensitiveData(!showSensitiveData)}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-2 transition"
          >
            {showSensitiveData ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showSensitiveData ? 'Mask Private Values' : 'Reveal Shielded Values'}</span>
          </button>
        )}
      </div>

      {propertiesWithHoldings.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-200">No private holdings yet.</h3>
            <p className="text-xs max-w-md mx-auto text-slate-400 mt-1">
              You have not acquired fractional shares in any tokenized property yet. Visit the RWA Marketplace to acquire shares through your connected Midnight Lace Wallet.
            </p>
          </div>
        </div>
      ) : (
        /* Holdings Table */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Investor Holdings by Property ({propertiesWithHoldings.length})
            </span>
            <span className="text-[11px] font-mono text-indigo-400">
              Client-side Witness State
            </span>
          </div>

          <div className="divide-y divide-slate-800">
            {propertiesWithHoldings.map((prop) => {
              const holding = portfolio[prop.id];

            const isEditing = editingPropId === prop.id;
            const ownershipPercentage =
              prop.totalShares > 0n
                ? (Number(holding.ownershipShares * 10000n / prop.totalShares) / 100).toFixed(2)
                : '0.00';

            return (
              <div key={prop.id} className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:bg-slate-800/30 transition">
                {/* Property Identity */}
                <div className="flex items-center gap-4 min-w-[240px]">
                  <img
                    src={prop.imageUrl}
                    alt={prop.name}
                    className="w-14 h-14 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-white">{prop.name}</h4>
                    <span className="text-xs font-mono text-indigo-400">{prop.id}</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">
                      Total pool: {prop.totalShares.toLocaleString()} shares
                    </span>
                  </div>
                </div>

                {/* Private Metrics or Edit Mode */}
                {isEditing ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full bg-slate-950/60 p-3 rounded-lg border border-indigo-500/30">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Shares Owned</label>
                      <input
                        type="number"
                        value={editShares}
                        onChange={(e) => setEditShares(e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Capital Invested ($)</label>
                      <input
                        type="number"
                        value={editInvestment}
                        onChange={(e) => setEditInvestment(e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Annual Rental ($)</label>
                      <input
                        type="number"
                        value={editRental}
                        onChange={(e) => setEditRental(e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 flex-1 w-full lg:w-auto">
                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Private Shares</span>
                        <Lock className="w-2.5 h-2.5 text-emerald-400" />
                      </div>
                      <div className="text-sm font-semibold text-white mt-1">
                        {showSensitiveData ? (
                          <>
                            {holding.ownershipShares.toLocaleString()}{' '}
                            <span className="text-xs text-indigo-400 font-normal">
                              ({ownershipPercentage}%)
                            </span>
                          </>
                        ) : (
                          <span className="font-mono text-slate-500">••••••••••</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Invested Capital</span>
                        <Lock className="w-2.5 h-2.5 text-emerald-400" />
                      </div>
                      <div className="text-sm font-semibold text-white mt-1">
                        {showSensitiveData ? (
                          `$${holding.investmentAmountUsd.toLocaleString()}`
                        ) : (
                          <span className="font-mono text-slate-500">••••••••••</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Rental Yield</span>
                        <Lock className="w-2.5 h-2.5 text-emerald-400" />
                      </div>
                      <div className="text-sm font-semibold text-emerald-400 mt-1">
                        {showSensitiveData ? (
                          `$${holding.annualRentalIncomeUsd.toLocaleString()}/yr`
                        ) : (
                          <span className="font-mono text-slate-500">••••••••••</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 self-end lg:self-center">
                  {isEditing ? (
                    <button
                      onClick={() => saveEdit(prop.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                    >
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(holding)}
                      className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
                      title="Adjust testnet private holding"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => onSelectPropertyForProof(prop, 'ownership')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
                  >
                    Prove
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
};
