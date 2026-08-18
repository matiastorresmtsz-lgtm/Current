'use client';

import React, { useMemo, useState } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { PieChart } from 'lucide-react';
import { WhaleTransaction, PortfolioAsset, CryptoCoin } from '../types';

interface InsightsViewProps {
  whales: WhaleTransaction[];
  portfolio: PortfolioAsset[];
  coins: CryptoCoin[];
}

// ---------- Fear & Greed helpers ----------
const FEAR_GREED = 74;
const getFearGreedLabel = (v: number) => {
  if (v <= 24) return { label: 'Extreme Fear', color: '#EF4444' };
  if (v <= 44) return { label: 'Fear', color: '#F97316' };
  if (v <= 54) return { label: 'Neutral', color: '#EAB308' };
  if (v <= 74) return { label: 'Greed', color: '#22C55E' };
  return { label: 'Extreme Greed', color: '#10B981' };
};

// ---------- Portfolio Rating Engine ----------
interface RatingFactor {
  key: string;
  label: string;
  score: number;   // 0–100
  weight: number;  // weight in overall
  icon: React.ReactNode;
  status: 'good' | 'warn' | 'bad';
  description: string;
  tips: string[];  // actionable improvement steps
}

function computePortfolioRating(
  portfolio: PortfolioAsset[],
  coins: CryptoCoin[]
): { total: number; factors: RatingFactor[] } {
  const n = portfolio.length;
  const totalValue = portfolio.reduce((s, a) => s + a.amount * a.currentPrice, 0);

  // ── 1. Diversification (number of assets & HHI concentration) ──────────────
  let diversScore = 0;
  if (n === 0) {
    diversScore = 0;
  } else if (n === 1) {
    diversScore = 15;
  } else {
    // Herfindahl–Hirschman index 0..1 (lower = more diverse)
    const weights = portfolio.map(a =>
      totalValue > 0 ? (a.amount * a.currentPrice) / totalValue : 0
    );
    const hhi = weights.reduce((s, w) => s + w * w, 0);
    // HHI=1 → concentrated, HHI~0 → very diverse
    diversScore = Math.min(100, Math.round((1 - hhi) * 120));
    // Bonus for asset count
    if (n >= 5) diversScore = Math.min(100, diversScore + 10);
    if (n >= 10) diversScore = Math.min(100, diversScore + 5);
  }

  // ── 2. Profitability (overall all-time return) ─────────────────────────────
  const totalCost = portfolio.reduce((s, a) => s + a.amount * a.avgBuyPrice, 0);
  let profitScore = 50;
  if (totalCost > 0) {
    const pnlPct = ((totalValue - totalCost) / totalCost) * 100;
    if (pnlPct >= 100) profitScore = 100;
    else if (pnlPct >= 50) profitScore = 90;
    else if (pnlPct >= 20) profitScore = 80;
    else if (pnlPct >= 5) profitScore = 70;
    else if (pnlPct >= 0) profitScore = 60;
    else if (pnlPct >= -15) profitScore = 40;
    else if (pnlPct >= -30) profitScore = 25;
    else profitScore = 10;
  }

  // ── 3. Risk (volatility proxy via 24h swings) ──────────────────────────────
  const avgAbsChange = n > 0
    ? portfolio.reduce((s, a) => s + Math.abs(a.change24h), 0) / n
    : 0;
  let riskScore = 100;
  if (avgAbsChange > 15) riskScore = 20;
  else if (avgAbsChange > 10) riskScore = 40;
  else if (avgAbsChange > 7) riskScore = 55;
  else if (avgAbsChange > 4) riskScore = 70;
  else if (avgAbsChange > 2) riskScore = 85;

  // ── 4. Category breadth (large cap vs. alt vs. meme mix) ──────────────────
  let categoryScore = 50;
  if (n > 0) {
    const topCoinsSet = new Set(
      coins.slice(0, 20).map(c => c.symbol.toUpperCase())
    );
    const largeCaps = portfolio.filter(a =>
      topCoinsSet.has(a.symbol.toUpperCase())
    ).length;
    const largeCapRatio = largeCaps / n;
    // Ideal: 40–70% large cap, rest alts
    if (largeCapRatio >= 0.4 && largeCapRatio <= 0.7) categoryScore = 100;
    else if (largeCapRatio >= 0.3 && largeCapRatio <= 0.8) categoryScore = 80;
    else if (largeCapRatio >= 0.2 && largeCapRatio <= 0.9) categoryScore = 65;
    else if (largeCapRatio === 1) categoryScore = 55; // all blue chips, ok
    else categoryScore = 35; // all small caps
  }

  // ── 5. Position sizing (max single asset weighting) ──────────────────────
  let sizingScore = 100;
  if (n > 0 && totalValue > 0) {
    const maxWeight = Math.max(
      ...portfolio.map(a => (a.amount * a.currentPrice) / totalValue)
    );
    if (maxWeight > 0.8) sizingScore = 15;
    else if (maxWeight > 0.6) sizingScore = 35;
    else if (maxWeight > 0.45) sizingScore = 55;
    else if (maxWeight > 0.3) sizingScore = 75;
    else sizingScore = 100;
  }

  const factors: RatingFactor[] = [
    {
      key: 'diversification',
      label: 'Diversification',
      score: diversScore,
      weight: 0.30,
      icon: <PieChart className="w-4 h-4" />,
      status: diversScore >= 70 ? 'good' : diversScore >= 40 ? 'warn' : 'bad',
      description:
        n === 0
          ? 'Add assets to start tracking diversification.'
          : n === 1
          ? 'Single-asset portfolio. Consider diversifying across multiple coins.'
          : diversScore >= 70
          ? 'Well spread across multiple assets — great balance.'
          : 'A few large positions dominate. Consider rebalancing.',
      tips: diversScore >= 70 ? [] : [
        'Aim for at least 5–10 different assets across multiple categories.',
        'Ensure no single coin exceeds 40% of your total portfolio value.',
        'Add assets from different sectors: L1s, DeFi, infrastructure, and stablecoins.',
        'Consider dollar-cost averaging (DCA) into underrepresented assets each week.',
        n === 1 ? 'Start by adding BTC or ETH as a second anchor position.' : 'Rebalance your top position by trimming profits and rotating into smaller assets.',
      ],
    },
    {
      key: 'profitability',
      label: 'Profitability',
      score: profitScore,
      weight: 0.25,
      icon: <span className="w-4 h-4" >📈</span>,
      status: profitScore >= 60 ? 'good' : profitScore >= 40 ? 'warn' : 'bad',
      description:
        totalCost === 0
          ? 'No cost basis recorded yet.'
          : profitScore >= 70
          ? 'Solid all-time returns — keep compounding.'
          : profitScore >= 50
          ? 'Slightly profitable. Consider reviewing underperformers.'
          : 'Portfolio is currently in loss. Review your cost basis.',
      tips: profitScore >= 70 ? [] : [
        'Review each holding\'s all-time return and identify underperformers.',
        'Consider cutting assets that are -30% or more below your cost basis.',
        'Reinvest profits from green positions into assets with higher growth potential.',
        'Use dollar-cost averaging to lower your average buy price on conviction assets.',
        totalCost === 0 ? 'Enter your average buy price for each asset to track real returns.' : 'Set price alerts so you can lock in profits at key resistance levels.',
      ],
    },
    {
      key: 'risk',
      label: 'Volatility Control',
      score: riskScore,
      weight: 0.20,
      icon: <span className="w-4 h-4" >⚠️</span>,
      status: riskScore >= 70 ? 'good' : riskScore >= 45 ? 'warn' : 'bad',
      description:
        n === 0
          ? 'No assets yet.'
          : riskScore >= 70
          ? 'Low average daily swings — a stable portfolio.'
          : riskScore >= 45
          ? 'Moderate volatility. Acceptable for crypto, but watch alts closely.'
          : 'High daily swings detected. Consider adding stablecoins or blue chips.',
      tips: riskScore >= 70 ? [] : [
        'Add 10–20% stablecoin allocation (USDC, USDT) as a volatility buffer.',
        'Increase your BTC and ETH holdings — they have lower relative volatility.',
        'Reduce exposure to micro-cap or meme coins which swing the hardest.',
        'Consider setting stop-loss levels at 15–20% below your buy price.',
        'Rebalance quarterly — taking profits from volatile assets into steadier ones.',
      ],
    },
    {
      key: 'category',
      label: 'Asset Mix',
      score: categoryScore,
      weight: 0.15,
      icon: <span className="w-4 h-4" >🛡️</span>,
      status: categoryScore >= 70 ? 'good' : categoryScore >= 45 ? 'warn' : 'bad',
      description:
        n === 0
          ? 'No assets yet.'
          : categoryScore >= 70
          ? 'Good balance of large caps and altcoins.'
          : categoryScore >= 45
          ? 'Mix could be improved — consider adding BTC or ETH as anchors.'
          : 'Very heavy in small/micro caps. High risk exposure.',
      tips: categoryScore >= 70 ? [] : [
        'Target 40–60% in top-20 coins (BTC, ETH, SOL, BNB) as a foundation.',
        'Allocate 20–30% to mid-cap altcoins with strong fundamentals.',
        'Keep speculative plays (memes, micro-caps) under 15% of total value.',
        'Explore DeFi blue chips like AAVE, UNI, or LINK for sector coverage.',
        'Add at least one Layer-2 token (ARB, OP, MATIC) for ecosystem exposure.',
      ],
    },
    {
      key: 'sizing',
      label: 'Position Sizing',
      score: sizingScore,
      weight: 0.10,
      icon: <span className="w-4 h-4" >⭐</span>,
      status: sizingScore >= 70 ? 'good' : sizingScore >= 45 ? 'warn' : 'bad',
      description:
        n === 0
          ? 'No assets yet.'
          : sizingScore >= 70
          ? 'No single position dominates — healthy sizing.'
          : sizingScore >= 45
          ? 'One position is relatively large. Consider trimming.'
          : 'One asset is over-concentrated. This increases single-asset risk.',
      tips: sizingScore >= 70 ? [] : [
        'No single asset should exceed 30–40% of your total portfolio.',
        'Trim your largest position by 10–15% and rotate into other assets.',
        'Use the 5% rule for high-risk assets — cap each at 5% max.',
        'Set a rebalancing rule: if any asset exceeds your target %, sell the excess.',
        'Add new positions rather than concentrating more into existing ones.',
      ],
    },
  ];

  const total = Math.round(
    factors.reduce((s, f) => s + f.score * f.weight, 0)
  );

  return { total, factors };
}

// ---------- Rating color/label helpers ----------
const getRatingMeta = (score: number) => {
  if (score >= 85) return { label: 'Excellent', color: '#10B981', bg: 'from-emerald-500/20 to-emerald-500/5', ring: 'border-emerald-500/50' };
  if (score >= 70) return { label: 'Good', color: '#22C55E', bg: 'from-green-500/20 to-green-500/5', ring: 'border-green-500/40' };
  if (score >= 55) return { label: 'Fair', color: '#EAB308', bg: 'from-yellow-500/20 to-yellow-500/5', ring: 'border-yellow-500/40' };
  if (score >= 40) return { label: 'Needs Work', color: '#F97316', bg: 'from-orange-500/20 to-orange-500/5', ring: 'border-orange-500/40' };
  return { label: 'Poor', color: '#EF4444', bg: 'from-red-500/20 to-red-500/5', ring: 'border-red-500/40' };
};

const statusIcon = (s: 'good' | 'warn' | 'bad') => {
  if (s === 'good') return <span className="w-4 h-4 text-[#10B981] shrink-0" >✅</span>;
  if (s === 'warn') return <span className="w-4 h-4 text-[#EAB308] shrink-0" >ℹ️</span>;
  return <span className="w-4 h-4 text-[#EF4444] shrink-0">✕</span>;
};

const statusBar = (score: number) => {
  const c =
    score >= 70 ? '#10B981' : score >= 45 ? '#EAB308' : '#EF4444';
  return (
    <div className="flex-1 h-1.5 rounded-full bg-[#242B35] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${score}%`, backgroundColor: c }}
      />
    </div>
  );
};

// ---------- Component ----------
export const InsightsView: React.FC<InsightsViewProps> = ({ portfolio, coins }) => {
  const { isSignedIn } = useUser();
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null);
  const fg = getFearGreedLabel(FEAR_GREED);
  const { total, factors } = useMemo(
    () => computePortfolioRating(portfolio, coins),
    [portfolio, coins]
  );
  const meta = getRatingMeta(total);

  if (!isSignedIn) {
    return (
      <div className="space-y-6">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-[#17C99E] font-extrabold">Market Intelligence</div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">Portfolio Analytics & AI Insights</h1>
          <p className="mt-1 text-sm text-gray-400 max-w-xl">
            Real-time portfolio health ratings, risk scoring, category diversification, and whale activity tracking.
          </p>
        </div>

        <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center space-x-2 bg-[#17C99E]/10 text-[#17C99E] text-xs font-extrabold px-3 py-1 rounded-full border border-[#17C99E]/20">
              <span>📊</span>
              <span>Sign In Required for Market Insights</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">Unlock Live Portfolio Ratings & Analytics</h2>
            <p className="text-xs text-gray-300 max-w-xl">
              Sign in to analyze your portfolio health, get personalized diversification advice, and track whale movements.
            </p>
          </div>

          <SignInButton mode="modal">
            <button className="bg-[#17C99E] hover:bg-[#14B8A6] text-black font-extrabold text-xs px-6 py-3 rounded-2xl transition-all shadow-lg shadow-[#17C99E]/20 shrink-0">
              Sign In to View Insights
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Top Row: Fear & Greed + Portfolio Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Fear & Greed Index ── */}
        <div className="bg-[#242424] border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 text-[#FF2E55]" >📊</span>
              <h3 className="font-extrabold text-white text-base">Crypto Fear &amp; Greed</h3>
            </div>
            <span className="text-xs text-gray-400 font-mono">Updated 10m ago</span>
          </div>

          <div className="flex items-center space-x-6">
            {/* Circular Gauge */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  strokeWidth="3.5" stroke="#2E2E2E" fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  strokeDasharray={`${FEAR_GREED}, 100`}
                  strokeWidth="3.5" strokeLinecap="round"
                  stroke={fg.color} fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold" style={{ color: fg.color }}>{FEAR_GREED}</span>
                <div className="text-[10px] font-bold uppercase mt-0.5" style={{ color: fg.color }}>{fg.label}</div>
              </div>
            </div>

            <div className="flex-1 space-y-3 text-xs">
              {/* Gradient scale bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                  <span>Extreme Fear</span>
                  <span>Extreme Greed</span>
                </div>
                <div className="relative h-2 rounded-full overflow-hidden bg-[#2E2E2E]">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-lg"
                    style={{ left: `${FEAR_GREED}%`, transform: 'translate(-50%, -50%)', backgroundColor: fg.color }}
                  />
                </div>
              </div>

              <p className="text-gray-300 leading-relaxed">
                Market sentiment is in{' '}
                <strong style={{ color: fg.color }}>{fg.label} territory</strong>, driven by sustained ETF inflows and altcoin momentum.
              </p>
              <div className="flex justify-between border-t border-[#242B35] pt-2 text-gray-400">
                <span>Yesterday: 71 (Greed)</span>
                <span>Last Week: 64 (Greed)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Portfolio Rating Summary Card ── */}
        <div className="bg-[#242424] border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5" style={{ color: meta.color }} >⭐</span>
              <h3 className="font-extrabold text-white text-base">Portfolio Rating</h3>
            </div>
            <span
              className="text-[10px] font-extrabold px-2.5 py-1 rounded-full border"
              style={{ color: meta.color, borderColor: meta.color + '50', backgroundColor: meta.color + '15' }}
            >
              {meta.label.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center space-x-6">
            {/* Big score circle */}
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path strokeWidth="3" stroke="#242B35" fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  strokeDasharray={`${total}, 100`}
                  strokeWidth="3" strokeLinecap="round"
                  stroke={meta.color} fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-black" style={{ color: meta.color }}>{total}</span>
                <div className="text-[10px] text-gray-400 font-bold">/100</div>
              </div>
            </div>

            <div className="flex-1 text-xs space-y-2">
              <p className="text-gray-300 leading-relaxed">
                Based on <strong className="text-white">5 portfolio health factors</strong> — diversification, returns, risk, asset mix, and position sizing.
              </p>
              <div className="space-y-1.5">
                {factors.map(f => (
                  <div key={f.key} className="flex items-center space-x-2">
                    <span className="text-gray-400 w-24 shrink-0 truncate">{f.label}</span>
                    {statusBar(f.score)}
                    <span className="text-[10px] font-bold w-7 text-right" style={{
                      color: f.score >= 70 ? '#10B981' : f.score >= 45 ? '#EAB308' : '#EF4444'
                    }}>
                      {f.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Detailed Factor Breakdown ── */}
      <div className="bg-[#242424] border border-white/10 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 text-[#17C99E]" >🛡️</span>
            <h3 className="font-extrabold text-white text-base">Portfolio Health Breakdown</h3>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xl font-black" style={{ color: meta.color }}>{total}</span>
            <span className="text-gray-400 text-xs font-semibold">/ 100</span>
            <span
              className="ml-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full border"
              style={{ color: meta.color, borderColor: meta.color + '50', backgroundColor: meta.color + '18' }}
            >
              {meta.label}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {factors.map(f => {
            const isExpanded = expandedFactor === f.key;
            const hasTips = f.tips.length > 0;
            const factorColor = f.status === 'good' ? '#10B981' : f.status === 'warn' ? '#EAB308' : '#EF4444';
            return (
              <div key={f.key} className="bg-[#242424] border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: factorColor + '18', color: factorColor }}>
                        {f.icon}
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-white">{f.label}</div>
                        <div className="text-[11px] text-gray-400">Weight: {Math.round(f.weight * 100)}%</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {statusIcon(f.status)}
                      <div className="text-sm font-black" style={{ color: factorColor }}>{f.score}</div>
                      <div className="text-xs text-gray-400">/100</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="h-2 rounded-full bg-[#1A1F26] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${f.score}%`, backgroundColor: factorColor }} />
                    </div>
                  </div>

                  <p className="mt-4 text-[11px] text-gray-400 leading-relaxed">{f.description}</p>

                  {hasTips && (
                    <button
                      onClick={() => setExpandedFactor(isExpanded ? null : f.key)}
                      className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold text-gray-200"
                    >
                      <span className="w-4 h-4 text-[#EAB308]" >💡</span>
                      <span>{isExpanded ? 'Hide tips' : 'How to improve'}</span>
                    </button>
                  )}

                  {f.status === 'good' && (
                    <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold text-[#10B981]">
                      <span className="w-4 h-4" >✅</span>
                      <span>Looking great — no action needed right now.</span>
                    </div>
                  )}
                </div>

                {isExpanded && hasTips && (
                  <div className="border-t border-white/10 bg-[#242424] px-4 py-4">
                    <div className="flex items-center gap-2 mb-3 text-[11px] uppercase tracking-[0.2em] text-[#EAB308] font-bold">
                      <span className="w-4 h-4" >🚀</span>
                      <span>Improvement Steps</span>
                    </div>
                    <ul className="space-y-2">
                      {f.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[11px] text-gray-300">
                          <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5" style={{ backgroundColor: factorColor + '20', color: factorColor }}>
                            {i + 1}
                          </span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Consolidated Improvement Plan ── */}
        {factors.some(f => f.tips.length > 0) && (
          <div className="mt-4 bg-[#2A2A2A] border border-[#3E3E3E] rounded-2xl p-5">
            <div className="flex items-center space-x-2 mb-4">
              <span className="w-4 h-4 text-yellow-400" >🚀</span>
              <h4 className="text-sm font-extrabold text-white">Your Full Improvement Plan</h4>
              <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30 ml-auto">
                {factors.filter(f => f.tips.length > 0).length} areas to work on
              </span>
            </div>
            <div className="space-y-4">
              {factors
                .filter(f => f.tips.length > 0)
                .sort((a, b) => a.score - b.score) // lowest score first = highest priority
                .map((f, idx) => {
                  const factorColor = f.status === 'warn' ? '#EAB308' : '#EF4444';
                  return (
                    <div key={f.key}>
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span
                          className="text-[10px] font-extrabold px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: factorColor + '20', color: factorColor }}
                        >
                          #{idx + 1} PRIORITY
                        </span>
                        <span className="text-xs font-bold text-white">{f.label}</span>
                        <span className="text-[10px] text-gray-500 ml-auto">Score: {f.score}/100</span>
                      </div>
                      <p className="text-[11px] text-gray-400 pl-1">→ {f.tips[0]}</p>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {portfolio.length === 0 && (
          <div className="mt-4 text-center py-6 text-gray-500 text-sm">
            <span className="w-8 h-8 mx-auto mb-2 opacity-30" >⭐</span>
            Add holdings to your portfolio to get a personalized rating.
          </div>
        )}
      </div>

    </div>
  );
};
