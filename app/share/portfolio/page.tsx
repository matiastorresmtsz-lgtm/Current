'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PortfolioAsset } from '../../types';

export const dynamic = 'force-dynamic';

const CURRENCY_CONFIG: Record<string, { flag: string; symbol: string; label: string; rate: number }> = {
  USD: { flag: '🇺🇸', symbol: '$', label: 'US Dollar', rate: 1 },
  CAD: { flag: '🇨🇦', symbol: 'CA$', label: 'Canadian Dollar', rate: 1.36 },
  MXN: { flag: '🇲🇽', symbol: 'MX$', label: 'Mexican Peso', rate: 17.15 },
};

function SharePortfolioContent() {
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const [displayCurrency, setDisplayCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const decodeSnapshot = (snapshot: string) => {
    try {
      const decoded = decodeURIComponent(snapshot);
      const jsonString = typeof window !== 'undefined'
        ? decodeURIComponent(escape(window.atob(decoded)))
        : decoded;
      return JSON.parse(jsonString) as { currency?: string; portfolio: PortfolioAsset[] };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const snapshot = params.get('snapshot');
    const currency = params.get('currency')?.toUpperCase() || 'USD';

    if (!snapshot) {
      setError('No portfolio data found in the share link.');
      setLoading(false);
      return;
    }

    const parsed = decodeSnapshot(snapshot);
    if (!parsed || !Array.isArray(parsed.portfolio)) {
      setError('Unable to read shared portfolio data.');
      setLoading(false);
      return;
    }

    setPortfolio(parsed.portfolio);
    setDisplayCurrency((parsed.currency || currency).toUpperCase());
    setLoading(false);
  }, []);

  const curr = CURRENCY_CONFIG[displayCurrency] || CURRENCY_CONFIG.USD;
  const totalValue = useMemo(() => portfolio.reduce((sum, item) => sum + item.amount * item.currentPrice, 0), [portfolio]);
  const convertedValue = totalValue * curr.rate;
  const totalCost = useMemo(() => portfolio.reduce((sum, item) => sum + item.amount * item.avgBuyPrice, 0), [portfolio]);
  const convertedPnl = (totalValue - totalCost) * curr.rate;
  const totalPnlPercent = totalCost > 0 ? (totalValue - totalCost) / totalCost * 100 : 0;

  const pieData = useMemo(() => {
    return portfolio.map((item, idx) => ({
      name: item.symbol,
      value: Math.max(0.1, item.amount * item.currentPrice * curr.rate),
      color: item.color || ['#10B981', '#8B5CF6', '#3B82F6', '#EC4899', '#F59E0B', '#14B8A6'][idx % 6],
    }));
  }, [portfolio, curr.rate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111827] text-white flex items-center justify-center px-4 py-10">
        <div className="rounded-3xl border border-white/10 bg-[#0B1120]/80 p-8 text-center">
          <p className="text-gray-300">Loading shared portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#111827] text-white flex items-center justify-center px-4 py-10">
        <div className="rounded-3xl border border-rose-500/20 bg-[#0B1120]/80 p-8 text-center">
          <h1 className="text-2xl font-extrabold text-white">Invalid share link</h1>
          <p className="mt-4 text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] text-white px-4 py-10 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="rounded-[32px] border border-white/10 bg-[#0B1120]/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.35em] text-cyan-300/70">Current Portfolio Share</div>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Your public portfolio snapshot</h1>
              <p className="max-w-2xl mt-3 text-sm text-gray-300">View the current holdings and portfolio performance in {curr.label}.</p>
            </div>
            <div className="rounded-3xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-gray-200">
              Currency: <span className="font-bold text-white">{displayCurrency}</span>
            </div>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-[#111827]/90 p-6">
              <p className="text-sm text-gray-400 uppercase tracking-[0.25em]">Portfolio value</p>
              <p className="mt-4 text-4xl font-extrabold">{curr.symbol}{convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#111827]/90 p-6">
              <p className="text-sm text-gray-400 uppercase tracking-[0.25em]">All-time return</p>
              <p className={`mt-4 text-4xl font-extrabold ${convertedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {convertedPnl >= 0 ? '+' : '-'}{curr.symbol}{Math.abs(convertedPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#111827]/90 p-6">
              <p className="text-sm text-gray-400 uppercase tracking-[0.25em]">Holdings</p>
              <p className="mt-4 text-4xl font-extrabold">{portfolio.length}</p>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-[#111827]/90 p-6">
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: 14, color: '#f9fafb' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#111827]/90">
              <table className="min-w-full text-left text-xs text-gray-300">
                <thead className="border-b border-white/10 text-[10px] uppercase tracking-[0.25em] text-gray-400">
                  <tr>
                    <th className="px-5 py-4">Asset</th>
                    <th className="px-5 py-4 text-right">Value</th>
                    <th className="px-5 py-4 text-right">Today's Change</th>
                    <th className="px-5 py-4 text-right">Allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {portfolio.map((item) => {
                    const currentVal = item.amount * item.currentPrice * curr.rate;
                    const allocation = convertedValue > 0 ? (currentVal / convertedValue) * 100 : 0;
                    return (
                      <tr key={item.coinId} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-white">{item.symbol}</div>
                          <div className="text-[11px] text-gray-500">{item.name}</div>
                        </td>
                        <td className="px-5 py-4 text-right font-semibold">{curr.symbol}{currentVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className={`px-5 py-4 text-right font-semibold ${item.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                        </td>
                        <td className="px-5 py-4 text-right text-gray-400">{allocation.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111827]/90 p-6 text-sm text-gray-400">
            <p className="mb-2">Note: This share page is a read-only view of the portfolio on this browser. Currency is read from the query string.</p>
            <p>To share this snapshot with someone else, send the link above. The portfolio will render the saved local holdings.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SharePortfolioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#111827] text-white flex items-center justify-center px-4 py-10">
          <div className="rounded-3xl border border-white/10 bg-[#0B1120]/80 p-8 text-center">
            <p className="text-gray-300">Loading shared portfolio...</p>
          </div>
        </div>
      }
    >
      <SharePortfolioContent />
    </Suspense>
  );
}
