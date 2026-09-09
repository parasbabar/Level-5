import React from 'react';
import { Building2, ShieldCheck, MapPin, DollarSign, Percent, ArrowRight } from 'lucide-react';
import type { PropertyMetadata } from '../utils/contract';

interface PropertyMarketplaceProps {
  properties: PropertyMetadata[];
  onSelectPropertyForProof: (property: PropertyMetadata, type: 'ownership' | 'compliance' | 'rental') => void;
}

export const PropertyMarketplace: React.FC<PropertyMarketplaceProps> = ({
  properties,
  onSelectPropertyForProof,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <span>Tokenized Real-World Assets (RWA)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real estate properties fractionalized into verifiable shares on Midnight Network.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
            3 Active RWA Assets
          </span>
        </div>
      </div>

      {/* Grid of properties */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((prop) => (
          <div
            key={prop.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden shadow-lg transition duration-200 flex flex-col"
          >
            {/* Image & Status Badge */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-800">
              <img
                src={prop.imageUrl}
                alt={prop.name}
                className="w-full h-full object-cover brightness-90 hover:scale-105 transition duration-500"
              />
              <div className="absolute top-3 left-3 bg-amber-500/90 backdrop-blur text-slate-950 font-bold text-[10px] tracking-wide px-2.5 py-1 rounded shadow-md uppercase">
                {prop.status}
              </div>
              <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur text-emerald-400 text-xs font-mono font-semibold px-2 py-0.5 rounded border border-emerald-500/30">
                {prop.id}
              </div>
              <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur text-white text-xs px-2.5 py-1 rounded flex items-center gap-1.5 border border-slate-800">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{prop.location}</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">{prop.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{prop.assetType}</p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800">
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-emerald-400" /> Total Valuation
                    </span>
                    <span className="text-sm font-semibold text-white mt-1 block">
                      ${prop.totalValuationUsd.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Percent className="w-3 h-3 text-indigo-400" /> Projected APY
                    </span>
                    <span className="text-sm font-semibold text-emerald-400 mt-1 block">
                      {prop.projectedYieldApy}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider">Total Shares</span>
                    <span className="text-xs font-mono font-semibold text-slate-200 mt-1 block">
                      {prop.totalShares.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider">Accred. Min</span>
                    <span className="text-xs font-mono font-semibold text-slate-200 mt-1 block">
                      ${prop.complianceMinimumUsd.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                <button
                  onClick={() => onSelectPropertyForProof(prop, 'ownership')}
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Generate Ownership ZK Proof</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSelectPropertyForProof(prop, 'compliance')}
                    className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition text-center"
                  >
                    Prove Compliance
                  </button>
                  <button
                    onClick={() => onSelectPropertyForProof(prop, 'rental')}
                    className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition text-center"
                  >
                    Prove Rental Yield
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
