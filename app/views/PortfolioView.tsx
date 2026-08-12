'use client';

import React, { useState } from 'react';
import { ChevronDown, Coins } from 'lucide-react';
import { PortfolioAsset, CryptoCoin } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

type Currency = 'USD' | 'CAD' | 'MXN';

const CURRENCY_CONFIG: Record<Currency, { flag: string; symbol: string; label: string; rate: number }> = {
  USD: { flag: '🇺🇸', symbol: '$', label: 'US Dollar', rate: 1 },
  CAD: { flag: '🇨🇦', symbol: 'CA$', label: 'Canadian Dollar', rate: 1.36 },
  MXN: { flag: '🇲🇽', symbol: 'MX$', label: 'Mexican Peso', rate: 17.15 },
};

interface PortfolioViewProps {
  portfolio: PortfolioAsset[];
  coins: CryptoCoin[];
  onOpenAddCryptoModal: () => void;
  onOpenAddCommoditiesModal: () => void;
  onOpenVisibilityModal: () => void;
  onRemoveHolding: (coinId: string) => void;
  onOpenCoinModal: (coin: CryptoCoin) => void;
  onOpenShareModal: () => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  portfolio,
  coins,
  onOpenAddCryptoModal,
  onOpenAddCommoditiesModal,
  onOpenVisibilityModal,
  onRemoveHolding,
  onOpenCoinModal,
  onOpenShareModal
}) => {
  const [accountFilter, setAccountFilter] = useState<'All' | 'Other'>('All');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('Total value');

  // Compute live portfolio metrics matching screenshot
  const totalValue = portfolio.reduce((sum, item) => sum + (item.amount * item.currentPrice), 0);
  const totalCost = portfolio.reduce((sum, item) => sum + (item.amount * item.avgBuyPrice), 0);
  const totalPnlUsd = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnlUsd / totalCost) * 100 : 0;
  const curr = CURRENCY_CONFIG[currency];
  const convertedValue = totalValue * curr.rate;
  const convertedCost = totalCost * curr.rate;
  const convertedPnlUsd = totalPnlUsd * curr.rate;

  // Today's return calculation (using 24h change)
  const todayReturnUsd = portfolio.reduce((sum, item) => {
    const itemVal = item.amount * item.currentPrice;
    return sum + (itemVal * (item.change24h / 100));
  }, 0);
  const todayReturnPercent = totalValue > 0 ? (todayReturnUsd / totalValue) * 100 : 0;
  const convertedTodayReturn = todayReturnUsd * curr.rate;

  // Donut chart segments
  const colorsList = ['#10B981', '#8B5CF6', '#3B82F6', '#EC4899', '#F59E0B', '#14B8A6'];
  const pieData = portfolio.map((item, idx) => {
    const val = item.amount * item.currentPrice;
    const alloc = totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : '0';
    return {
      name: item.symbol,
      value: Math.max(0.1, val),
      allocPercent: alloc,
      color: item.color || colorsList[idx % colorsList.length]
    };
  });

  return (
    <div className="space-y-6">

      {/* Top Controls Bar - Exact Screenshot Match */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-[#2E2E2E]">
        {/* Account Tabs */}
        <div className="flex items-center space-x-6 text-sm font-bold">
          <button
            onClick={() => setAccountFilter('All')}
            className={`pb-1 relative ${accountFilter === 'All' ? 'text-white' : 'text-gray-400'}`}
          >
            <span>All</span>
            {accountFilter === 'All' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00F0FF] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setAccountFilter('Other')}
            className="flex items-center space-x-1 text-gray-400 hover:text-white pb-1"
          >
            <span>Other</span>
            <span className="w-3.5 h-3.5 text-gray-500" >🔒</span>
          </button>
        </div>

        {/* Currency & Account Selector */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenShareModal}
            className="flex items-center space-x-1.5 bg-[#00F0FF] hover:bg-[#00D8E6] text-black font-extrabold text-xs px-3.5 py-1.5 rounded-full transition-all shadow"
          >
            <span className="w-3.5 h-3.5" >📤</span>
            <span>Share Portfolio</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowCurrencyDropdown((prev) => !prev)}
              className="bg-[#212121] border border-[#2E2E2E] px-3 py-1.5 rounded-full text-xs font-bold text-gray-200 flex items-center space-x-1.5"
            >
              <span>{curr.flag} {currency}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {showCurrencyDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-[#212121] border border-[#2E2E2E] rounded-2xl overflow-hidden shadow-xl z-20">
                {(Object.entries(CURRENCY_CONFIG) as [Currency, typeof CURRENCY_CONFIG[Currency]][]).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => { setCurrency(key); setShowCurrencyDropdown(false); }}
                    className={`w-full text-left px-4 py-3 transition-colors ${currency === key ? 'bg-[#2A2A2A]' : 'hover:bg-[#2E2E2E]'}`}
                  >
                    <div className="flex items-center justify-between text-sm text-white">
                      <span>{cfg.flag} {key}</span>
                      {currency === key && <span className="text-[#00F0FF] font-bold">✓</span>}
                    </div>
                    <div className="text-[10px] text-gray-400">{cfg.label}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#212121] border border-[#2E2E2E] px-3 py-1.5 rounded-full text-xs font-medium text-gray-300">
            Showing: All Accounts
          </div>
        </div>
      </div>

      {/* Main Portfolio Grid - Exact Screenshot Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left Column: Donut Chart Card with Center "$383.77 Portfolio Value" */}
        <div className="lg:col-span-6 bg-[#212121] border border-[#2E2E2E] rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center relative min-h-[300px]">
          <div className="w-64 h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={96}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#161616', borderColor: '#2E2E2E', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label - Exact Screenshot Match */}
            <div className="absolute text-center flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {curr.symbol}{convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-semibold text-gray-400 mt-0.5">
                Portfolio Value
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: 3 Cards Split */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">

          {/* Top Row: Today's Return & All-Time Return Cards */}
          <div className="grid grid-cols-2 gap-4">

            {/* Today's Return Card */}
            <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-5 shadow-xl">
              <div className="flex items-center space-x-1 text-xs font-semibold text-gray-400 mb-2 cursor-pointer hover:text-white">
                <span>Today's Return</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
              <div className={`text-2xl font-extrabold tracking-tight ${convertedTodayReturn >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {convertedTodayReturn >= 0 ? '+' : ''}{curr.symbol}{convertedTodayReturn.toFixed(2)}
              </div>
              <div className={`text-xs font-bold mt-1 ${todayReturnPercent >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {todayReturnPercent >= 0 ? '+' : ''}{todayReturnPercent.toFixed(2)}% <span className="text-gray-400 font-normal">Today</span>
              </div>
            </div>

            {/* All-Time Return Card */}
            <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-5 shadow-xl">
              <div className="text-xs font-semibold text-gray-400 mb-2">All-Time Return</div>
              <div className={`text-2xl font-extrabold tracking-tight ${convertedPnlUsd >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {convertedPnlUsd >= 0 ? '+' : ''}{curr.symbol}{convertedPnlUsd.toFixed(2)}
              </div>
              <div className={`text-xs font-bold mt-1 ${totalPnlPercent >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}% <span className="text-gray-400 font-normal">All time</span>
              </div>
            </div>

          </div>

          {/* Bottom Card: 4 Quick Action Circle Buttons - Exact Screenshot Match */}
          <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-5 shadow-xl">
            <div className="grid grid-cols-4 gap-2 text-center">

              {/* Action 1: Add Investments */}
              <button
                onClick={onOpenAddCryptoModal}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#14B8A6]/20 group-hover:bg-[#14B8A6]/30 flex items-center justify-center text-[#14B8A6] mb-2 transition-colors">
                  <span className="w-5 h-5" >🏢</span>
                </div>
                <span className="text-[11px] font-medium text-gray-300 leading-tight">Add Investments</span>
              </button>

              {/* Action 2: Add cash or commodities */}
              <button
                onClick={onOpenAddCommoditiesModal}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#EAB308]/20 group-hover:bg-[#EAB308]/30 flex items-center justify-center text-[#EAB308] mb-2 transition-colors">
                  <Coins className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-gray-300 leading-tight">Add cash or commodities</span>
              </button>

              {/* Action 3: Holding visibility */}
              <button
                onClick={onOpenVisibilityModal}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/20 group-hover:bg-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] mb-2 transition-colors">
                  <span className="w-5 h-5" >👁️</span>
                </div>
                <span className="text-[11px] font-medium text-gray-300 leading-tight">Holding visibility</span>
              </button>

              {/* Action 4: Edit Portfolio */}
              <button
                onClick={onOpenAddCryptoModal}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#F97316]/20 group-hover:bg-[#F97316]/30 flex items-center justify-center text-[#F97316] mb-2 transition-colors">
                  <span className="w-5 h-5" >✏️</span>
                </div>
                <span className="text-[11px] font-medium text-gray-300 leading-tight">Edit Portfolio</span>
              </button>

            </div>
          </div>

        </div>

      </div>

      {/* Holdings Table Section - Exact Screenshot Match */}
      <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-6 shadow-xl space-y-4">

        {/* Table Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#2E2E2E]">
          <h3 className="font-bold text-white text-base">Holdings</h3>
          <div className="text-xs text-gray-400 font-medium flex items-center space-x-1 cursor-pointer">
            <span>Sort:</span>
            <span className="font-bold text-white">Total value</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-gray-400 border-b border-[#2E2E2E] uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3 px-3">Holdings</th>
                <th className="py-3 px-3 text-center">% of portfolio</th>
                <th className="py-3 px-3 text-right">Position</th>
                <th className="py-3 px-3 text-right">Today's Return</th>
                <th className="py-3 px-3 text-right">All-Time Return</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E2E2E]">
              {portfolio.map((item) => {
                const currentVal = item.amount * item.currentPrice * curr.rate;
                const allocPct = convertedValue > 0 ? ((currentVal / convertedValue) * 100).toFixed(2) : '0.00';
                const todayReturn = currentVal * (item.change24h / 100);
                const allTimePnl = currentVal - (item.amount * item.avgBuyPrice * curr.rate);
                const allTimePnlPct = (item.amount * item.avgBuyPrice) > 0 ? (allTimePnl / (item.amount * item.avgBuyPrice * curr.rate)) * 100 : 0;
                const matchedCoin = coins.find(c => c.symbol.toUpperCase() === item.symbol.toUpperCase());

                return (
                  <tr key={item.coinId} className="hover:bg-[#2A2A2A] transition-colors">

                    {/* Holdings Ticker & Name */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold text-black shrink-0"
                          style={{ backgroundColor: item.color || '#10B981' }}
                        >
                          {item.symbol.slice(0, 4)}
                        </div>
                        <div>
                          <div
                            onClick={() => matchedCoin && onOpenCoinModal(matchedCoin)}
                            className="font-bold text-white hover:text-[#00F0FF] cursor-pointer transition-colors"
                          >
                            {item.symbol}
                          </div>
                          <div className="text-[11px] text-gray-400">{item.name}</div>
                        </div>
                      </div>
                    </td>

                            {/* % of portfolio */}
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-gray-200">
                      {allocPct}%
                    </td>

                    {/* Position ({currency} & shares) */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="font-bold text-white font-mono">{curr.symbol}{currentVal.toFixed(2)}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{item.amount.toFixed(2)} shares</div>
                    </td>

                    {/* Today's Return */}
                    <td className="py-3.5 px-3 text-right font-mono">
                      <div className={`font-bold ${todayReturn >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {todayReturn >= 0 ? '+' : ''}{curr.symbol}{todayReturn.toFixed(2)}
                      </div>
                      <div className={`text-[11px] font-bold ${item.change24h >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                      </div>
                    </td>

                    {/* All-Time Return */}
                    <td className="py-3.5 px-3 text-right font-mono">
                      <div className={`font-bold ${allTimePnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {allTimePnl >= 0 ? '+' : ''}{curr.symbol}{allTimePnl.toFixed(2)}
                      </div>
                      <div className={`text-[11px] font-bold ${allTimePnlPct >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {allTimePnlPct >= 0 ? '+' : ''}{allTimePnlPct.toFixed(2)}%
                      </div>
                    </td>

                    {/* Action Remove */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => onRemoveHolding(item.coinId)}
                        title="Delete asset"
                        className="text-gray-500 hover:text-[#EF4444] p-1.5 rounded-lg hover:bg-[#161616] transition-colors"
                      >
                        <span className="w-4 h-4" >🗑️</span>
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
