'use client';

import React, { useState } from 'react';
import { X, Coins, DollarSign, Gem, ChevronRight } from 'lucide-react';
import { PortfolioAsset } from '../../types';

interface AddCashCommoditiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHolding: (asset: PortfolioAsset) => void;
}

type AssetType = 'gold' | 'silver' | 'cash';

const ASSET_CONFIG: Record<AssetType, {
  id: string;
  symbol: string;
  name: string;
  unit: string;
  placeholder: string;
  color: string;
  gradient: string;
  border: string;
  icon: React.ReactNode;
  emoji: string;
  priceFetcher: () => number;
}> = {
  gold: {
    id: 'commodity-gold',
    symbol: 'XAU',
    name: 'Gold',
    unit: 'oz',
    placeholder: 'e.g. 1.5',
    color: '#EAB308',
    gradient: 'from-yellow-500/20 to-amber-600/10',
    border: 'border-yellow-500/40',
    icon: <Gem className="w-6 h-6" />,
    emoji: '🥇',
    priceFetcher: () => 2380.00, // Gold ~price per oz
  },
  silver: {
    id: 'commodity-silver',
    symbol: 'XAG',
    name: 'Silver',
    unit: 'oz',
    placeholder: 'e.g. 10',
    color: '#94A3B8',
    gradient: 'from-slate-400/20 to-slate-600/10',
    border: 'border-slate-400/40',
    icon: <Coins className="w-6 h-6" />,
    emoji: '🥈',
    priceFetcher: () => 30.50, // Silver ~price per oz
  },
  cash: {
    id: 'commodity-cash',
    symbol: 'CASH',
    name: 'Cash / Fiat',
    unit: 'USD',
    placeholder: 'e.g. 5000',
    color: '#22C55E',
    gradient: 'from-green-500/20 to-emerald-600/10',
    border: 'border-green-500/40',
    icon: <DollarSign className="w-6 h-6" />,
    emoji: '💵',
    priceFetcher: () => 1.00,
  },
};

export const AddCashCommoditiesModal: React.FC<AddCashCommoditiesModalProps> = ({
  isOpen,
  onClose,
  onAddHolding,
}) => {
  const [selected, setSelected] = useState<AssetType | null>(null);
  const [amount, setAmount] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  if (!isOpen) return null;

  const config = selected ? ASSET_CONFIG[selected] : null;
  const referencePrice = config ? config.priceFetcher() : 0;
  const effectivePrice = customPrice.trim() !== '' ? parseFloat(customPrice) : referencePrice;
  const parsedAmount = parseFloat(amount) || 0;
  const estimatedValue = parsedAmount * effectivePrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || parsedAmount <= 0) return;

    const cfg = ASSET_CONFIG[selected];
    const asset: PortfolioAsset = {
      coinId: `${cfg.id}-${Date.now()}`,
      symbol: cfg.symbol,
      name: cfg.name,
      amount: parsedAmount,
      avgBuyPrice: effectivePrice,
      currentPrice: effectivePrice,
      change24h: 0,
      allocationPercent: 0,
      color: cfg.color,
    };

    onAddHolding(asset);
    setSelected(null);
    setAmount('');
    setCustomPrice('');
    onClose();
  };

  const handleClose = () => {
    setSelected(null);
    setAmount('');
    setCustomPrice('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#2E2E2E]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#EAB308]/10 border border-[#EAB308]/30 flex items-center justify-center text-[#EAB308]">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Add Cash or Commodities</h2>
              <p className="text-xs text-gray-400">Track your non-crypto assets</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#2A2A2A] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* Asset Type Selector Cards */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Select Asset Type</p>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(ASSET_CONFIG) as [AssetType, typeof ASSET_CONFIG[AssetType]][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => { setSelected(key); setAmount(''); setCustomPrice(''); }}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all group ${
                    selected === key
                      ? `bg-gradient-to-br ${cfg.gradient} ${cfg.border} shadow-lg scale-[1.03]`
                      : 'border-[#2E2E2E] bg-[#212121] hover:border-[#3E3E3E] hover:bg-[#252525]'
                  }`}
                >
                  <span className="text-2xl mb-2">{cfg.emoji}</span>
                  <span className={`text-xs font-bold ${selected === key ? 'text-white' : 'text-gray-300'}`}>
                    {cfg.name}
                  </span>
                  <span className={`text-[10px] font-mono mt-0.5 ${selected === key ? 'text-gray-300' : 'text-gray-500'}`}>
                    {cfg.symbol}
                  </span>
                  {selected === key && (
                    <span
                      className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold text-black"
                      style={{ backgroundColor: cfg.color }}
                    >✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Detail Form - only shows when selected */}
          {selected && config && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">

              {/* Reference Price info row */}
              <div
                className={`flex items-center justify-between bg-gradient-to-r ${config.gradient} border ${config.border} rounded-xl px-4 py-3`}
              >
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Reference Price</p>
                  <p className="text-sm font-extrabold text-white">
                    ${referencePrice.toLocaleString()} / {config.unit}
                  </p>
                </div>
                <span className="text-2xl">{config.emoji}</span>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">
                  Amount ({config.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder={config.placeholder}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#161616] text-white font-bold text-base p-3 rounded-xl border border-[#2E2E2E] focus:outline-none focus:border-yellow-500/60 transition-colors"
                  autoFocus
                  required
                />
              </div>

              {/* Custom Buy Price (optional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase">
                    Purchase Price (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomPrice(referencePrice.toString())}
                    className="text-[10px] font-bold hover:underline"
                    style={{ color: config.color }}
                  >
                    Use Reference
                  </button>
                </div>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder={`$${referencePrice.toLocaleString()}`}
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full bg-[#161616] text-white font-bold text-base p-3 rounded-xl border border-[#2E2E2E] focus:outline-none focus:border-yellow-500/60 transition-colors"
                />
              </div>

              {/* Estimated Value */}
              <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">Estimated Value</span>
                <span className="font-extrabold font-mono text-sm" style={{ color: config.color }}>
                  ${estimatedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={parsedAmount <= 0}
                className="w-full py-3 text-black font-extrabold rounded-xl transition-all shadow-md text-sm flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: config.color }}
              >
                <span>Add {config.name} to Portfolio</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {!selected && (
            <p className="text-center text-xs text-gray-500 pb-2">
              Select an asset type above to continue
            </p>
          )}

        </div>
      </div>
    </div>
  );
};
