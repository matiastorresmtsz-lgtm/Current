'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { PortfolioAsset } from '../../types';

export const dynamic = 'force-dynamic';

const CURRENCY_CONFIG: Record<string, { flag: string; symbol: string; label: string; rate: number }> = {
  USD: { flag: '🇺🇸', symbol: '$', label: 'US Dollar', rate: 1 },
  CAD: { flag: '🇨🇦', symbol: 'CA$', label: 'Canadian Dollar', rate: 1.36 },
  MXN: { flag: '🇲🇽', symbol: 'MX$', label: 'Mexican Peso', rate: 17.15 },
};

type BgPreset = 'cyber-carbon' | 'emerald-bull' | 'midnight-onyx' | 'gold-tier' | 'slate-glass';

const BG_PRESETS: Record<BgPreset, { name: string; style: string; badgeColor: string; accentGlow: string }> = {
  'cyber-carbon': {
    name: 'Cyber Carbon',
    style: 'bg-[#11161B] border-zinc-800 text-white shadow-2xl',
    badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    accentGlow: 'from-zinc-800/40 via-transparent to-transparent',
  },
  'emerald-bull': {
    name: 'Emerald Bull',
    style: 'bg-gradient-to-br from-[#062419] via-[#0B1512] to-[#121A17] border-emerald-900/60 text-white shadow-2xl shadow-emerald-950/50',
    badgeColor: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/50',
    accentGlow: 'from-emerald-500/20 via-transparent to-transparent',
  },
  'midnight-onyx': {
    name: 'Midnight Onyx',
    style: 'bg-black border-zinc-900 text-white shadow-2xl',
    badgeColor: 'bg-zinc-900 text-zinc-400 border-zinc-800',
    accentGlow: 'from-white/10 via-transparent to-transparent',
  },
  'gold-tier': {
    name: 'Gold Tier',
    style: 'bg-gradient-to-br from-[#241A08] via-[#141009] to-[#0D0B07] border-amber-900/60 text-white shadow-2xl shadow-amber-950/50',
    badgeColor: 'bg-amber-950/80 text-amber-400 border-amber-800/50',
    accentGlow: 'from-amber-500/20 via-transparent to-transparent',
  },
  'slate-glass': {
    name: 'Slate Glass',
    style: 'bg-zinc-900/90 backdrop-blur-2xl border-zinc-700 text-white shadow-2xl',
    badgeColor: 'bg-zinc-800/90 text-zinc-200 border-zinc-600',
    accentGlow: 'from-zinc-400/10 via-transparent to-transparent',
  },
};

function downloadCardAsPngImage({
  roiStr,
  pnlStr,
  isPositive,
  portfolioSize,
  holdingsCount,
  accountAge,
  username,
  topHoldings,
  customBgUrl,
  bgPresetStyle,
  filename = 'Current-Trading-PnL.png'
}: {
  roiStr: string;
  pnlStr: string;
  isPositive: boolean;
  portfolioSize: string;
  holdingsCount: string;
  accountAge: string;
  username: string;
  topHoldings: { symbol: string; alloc: string }[];
  customBgUrl: string;
  bgPresetStyle: string;
  filename?: string;
}) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const drawDetails = () => {
    // Outer Frame Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Header Logo
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 38px sans-serif';
    ctx.fillText('CURRENT', 60, 90);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '600 16px monospace';
    ctx.fillText('CRYPTO TRADING PnL SNAPSHOT', 60, 118);

    // Username Badge (Top Right)
    const userBadgeText = `@${username.replace(/^@/, '')}`;
    ctx.font = '800 18px monospace';
    const textWidth = ctx.measureText(userBadgeText).width;
    const badgeW = Math.max(180, textWidth + 40);

    ctx.fillStyle = 'rgba(23, 201, 158, 0.15)';
    ctx.fillRect(1140 - badgeW, 55, badgeW, 45);
    ctx.strokeStyle = '#17C99E';
    ctx.lineWidth = 2;
    ctx.strokeRect(1140 - badgeW, 55, badgeW, 45);

    ctx.fillStyle = '#17C99E';
    ctx.fillText(userBadgeText, 1140 - badgeW + 20, 84);

    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(60, 145);
    ctx.lineTo(1140, 145);
    ctx.stroke();

    // ROI Title
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '800 18px sans-serif';
    ctx.fillText('TOTAL RETURN (ROI)', 60, 195);

    // ROI Value
    ctx.fillStyle = isPositive ? '#10B981' : '#EF4444';
    ctx.font = '900 84px monospace';
    ctx.fillText(roiStr, 60, 285);

    // Net PnL
    ctx.font = '800 28px monospace';
    ctx.fillText(pnlStr, 60, 335);

    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(60, 370);
    ctx.lineTo(1140, 370);
    ctx.stroke();

    // Stats Grid Box
    // 1. Portfolio Size
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(60, 400, 340, 120);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.strokeRect(60, 400, 340, 120);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '700 16px sans-serif';
    ctx.fillText('PORTFOLIO SIZE', 85, 435);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 28px monospace';
    ctx.fillText(portfolioSize, 85, 485);

    // 2. Holdings Count
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(430, 400, 340, 120);
    ctx.strokeRect(430, 400, 340, 120);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '700 16px sans-serif';
    ctx.fillText('HOLDINGS COUNT', 455, 435);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 28px monospace';
    ctx.fillText(holdingsCount, 455, 485);

    // 3. Account Age
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(800, 400, 340, 120);
    ctx.strokeRect(800, 400, 340, 120);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '700 16px sans-serif';
    ctx.fillText('ACCOUNT AGE', 825, 435);
    ctx.fillStyle = '#17C99E';
    ctx.font = '900 28px monospace';
    ctx.fillText(accountAge, 825, 485);

    // Top Assets Row
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '700 16px sans-serif';
    ctx.fillText('TOP ASSETS:', 60, 575);

    let chipX = 200;
    topHoldings.slice(0, 5).forEach((h) => {
      const text = `${h.symbol} (${h.alloc}%)`;
      ctx.font = '800 15px monospace';
      const tw = ctx.measureText(text).width;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(chipX, 550, tw + 24, 36);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.strokeRect(chipX, 550, tw + 24, 36);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(text, chipX + 12, 574);
      chipX += tw + 36;
    });

    // Footer with Domain https://currentsocial.vercel.app/
    ctx.fillStyle = '#17C99E';
    ctx.font = '700 16px monospace';
    ctx.fillText('https://currentsocial.vercel.app/', 60, 645);

    ctx.fillStyle = '#9CA3AF';
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    ctx.fillText(dateStr, 980, 645);

    // Trigger image download
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const drawFallbackBg = () => {
    if (bgPresetStyle === 'emerald-bull') {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#062419');
      grad.addColorStop(0.5, '#0B1512');
      grad.addColorStop(1, '#121A17');
      ctx.fillStyle = grad;
    } else if (bgPresetStyle === 'gold-tier') {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#241A08');
      grad.addColorStop(0.5, '#141009');
      grad.addColorStop(1, '#0D0B07');
      ctx.fillStyle = grad;
    } else if (bgPresetStyle === 'midnight-onyx') {
      ctx.fillStyle = '#050505';
    } else {
      ctx.fillStyle = '#11161B';
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  if (customBgUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      ctx.fillStyle = 'rgba(11, 14, 17, 0.75)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawDetails();
    };
    img.onerror = () => {
      drawFallbackBg();
      drawDetails();
    };
    img.src = customBgUrl;
  } else {
    drawFallbackBg();
    drawDetails();
  }
}

function SharePortfolioContent() {
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const [displayCurrency, setDisplayCurrency] = useState<string>('USD');
  const [activeBgPreset, setActiveBgPreset] = useState<BgPreset>('cyber-carbon');
  const [customBgImage, setCustomBgImage] = useState<string>('');
  const [username, setUsername] = useState<string>('Trader');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const decodeSnapshot = (snapshot: string) => {
    try {
      const decoded = decodeURIComponent(snapshot);
      const jsonString = typeof window !== 'undefined'
        ? decodeURIComponent(escape(window.atob(decoded)))
        : decoded;
      return JSON.parse(jsonString) as {
        currency?: string;
        portfolio: PortfolioAsset[];
        username?: string;
        bg?: BgPreset;
        customBg?: string;
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const snapshot = params.get('snapshot');
    const currency = params.get('currency')?.toUpperCase() || 'USD';
    const bgParam = (params.get('bg') || 'cyber-carbon') as BgPreset;

    if (BG_PRESETS[bgParam]) {
      setActiveBgPreset(bgParam);
    }

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
    if (parsed.username) setUsername(parsed.username);
    if (parsed.bg && BG_PRESETS[parsed.bg]) setActiveBgPreset(parsed.bg);
    if (parsed.customBg) setCustomBgImage(parsed.customBg);

    setLoading(false);
  }, []);

  const curr = CURRENCY_CONFIG[displayCurrency] || CURRENCY_CONFIG.USD;
  const totalValue = useMemo(() => portfolio.reduce((sum, item) => sum + item.amount * item.currentPrice, 0), [portfolio]);
  const convertedValue = totalValue * curr.rate;
  const totalCost = useMemo(() => portfolio.reduce((sum, item) => sum + item.amount * item.avgBuyPrice, 0), [portfolio]);
  const convertedPnl = (totalValue - totalCost) * curr.rate;
  const totalPnlPercent = totalCost > 0 ? (totalValue - totalCost) / totalCost * 100 : 0;

  const topHoldingsFormatted = useMemo(() => {
    return portfolio.slice(0, 6).map((item) => {
      const itemVal = item.amount * item.currentPrice * curr.rate;
      const alloc = convertedValue > 0 ? ((itemVal / convertedValue) * 100).toFixed(1) : '0';
      return { symbol: item.symbol, alloc };
    });
  }, [portfolio, curr.rate, convertedValue]);

  const handleExportExactImage = () => {
    downloadCardAsPngImage({
      roiStr: `${totalPnlPercent >= 0 ? '+' : ''}${totalPnlPercent.toFixed(2)}%`,
      pnlStr: `${convertedPnl >= 0 ? '+' : '-'}${curr.symbol}${Math.abs(convertedPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${displayCurrency}`,
      isPositive: totalPnlPercent >= 0,
      portfolioSize: `${curr.symbol}${convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      holdingsCount: `${portfolio.length} Assets`,
      accountAge: 'Active Trader',
      username,
      topHoldings: topHoldingsFormatted,
      customBgUrl: customBgImage,
      bgPresetStyle: activeBgPreset,
      filename: `${username}-Current-PnL.png`
    });
  };

  const presetStyle = BG_PRESETS[activeBgPreset];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161616] text-white flex items-center justify-center px-4 py-10 font-sans">
        <div className="rounded-3xl border border-zinc-800 bg-[#212121] p-8 text-center">
          <p className="text-zinc-400">Loading trading PnL card...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#161616] text-white flex items-center justify-center px-4 py-10 font-sans">
        <div className="rounded-3xl border border-rose-500/30 bg-[#212121] p-8 text-center max-w-md">
          <h1 className="text-2xl font-extrabold text-white">Invalid Share Link</h1>
          <p className="mt-3 text-sm text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#161616] text-white px-4 py-10 sm:px-6 lg:px-10 font-sans selection:bg-[#17C99E] selection:text-black">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header Action Row for Spectators */}
        <div className="flex items-center justify-between bg-[#212121] border border-zinc-800 rounded-3xl px-6 py-4 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-[#161616] border border-zinc-700 flex items-center justify-center font-black text-white text-sm">
              C
            </div>
            <div>
              <div className="text-sm font-bold text-white">@{username.replace(/^@/, '')}'s Trading PnL Card</div>
              <div className="text-xs text-[#17C99E] font-mono">https://currentsocial.vercel.app/</div>
            </div>
          </div>

          <button
            onClick={handleExportExactImage}
            className="bg-[#17C99E] hover:bg-[#14B8A6] text-black font-extrabold text-xs px-5 py-2.5 rounded-2xl transition-all shadow-md flex items-center space-x-1.5 shrink-0"
          >
            <span>📸</span>
            <span>Download Card Image</span>
          </button>
        </div>

        {/* Trading PnL Card Component */}
        <div
          style={customBgImage ? { backgroundImage: `url(${customBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          className={`rounded-[32px] border p-8 sm:p-10 relative overflow-hidden transition-all duration-300 ${customBgImage ? 'border-zinc-700 shadow-2xl' : presetStyle.style}`}
        >
          {/* Custom Overlay for Readability */}
          {customBgImage && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] pointer-events-none" />
          )}

          {/* Ambient Glow */}
          {!customBgImage && (
            <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${presetStyle.accentGlow} rounded-full blur-3xl pointer-events-none`} />
          )}

          {/* Card Top Header: App Logo & Username Badge */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-extrabold text-white text-xl tracking-tighter shadow-inner">
                C
              </div>
              <div>
                <span className="text-xl font-black tracking-wider uppercase text-white">CURRENT</span>
                <span className="block text-[10px] text-zinc-400 font-mono tracking-widest uppercase">Crypto Trading PnL</span>
              </div>
            </div>

            <div className="text-xs font-extrabold text-[#17C99E] bg-[#17C99E]/10 border border-[#17C99E]/30 px-3.5 py-1.5 rounded-full font-mono">
              @{username.replace(/^@/, '')}
            </div>
          </div>

          {/* Main ROI % Display */}
          <div className="relative z-10 py-8 text-center sm:text-left space-y-2">
            <div className="text-xs uppercase font-extrabold tracking-[0.3em] text-zinc-400">
              Total Return (ROI)
            </div>
            <div className={`text-5xl sm:text-7xl font-black font-mono tracking-tight ${totalPnlPercent >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}%
            </div>
            <div className={`text-lg sm:text-xl font-bold font-mono ${convertedPnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {convertedPnl >= 0 ? '+' : '-'}{curr.symbol}{Math.abs(convertedPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {displayCurrency}
            </div>
          </div>

          {/* Stats Grid: Size, Holdings, Account Age */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
            <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Portfolio Size</div>
              <div className="text-lg sm:text-xl font-extrabold font-mono text-white mt-1">
                {curr.symbol}{convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Holdings Count</div>
              <div className="text-lg sm:text-xl font-extrabold font-mono text-white mt-1">
                {portfolio.length} Assets
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-black/40 border border-white/10 rounded-2xl p-4">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Account Age</div>
              <div className="text-lg sm:text-xl font-extrabold font-mono text-[#17C99E] mt-1">
                Active Trader
              </div>
            </div>
          </div>

          {/* Top Asset Allocation Chips */}
          <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mr-2">Top Holdings:</span>
            {portfolio.slice(0, 6).map((item) => {
              const itemVal = item.amount * item.currentPrice * curr.rate;
              const alloc = convertedValue > 0 ? (itemVal / convertedValue) * 100 : 0;
              return (
                <div
                  key={item.coinId}
                  className="bg-white/10 border border-white/10 px-3 py-1 rounded-xl text-xs font-bold font-mono text-zinc-200 flex items-center space-x-1.5"
                >
                  <span className="text-white">{item.symbol}</span>
                  <span className="text-zinc-400">({alloc.toFixed(1)}%)</span>
                </div>
              );
            })}
          </div>

          {/* Footer Timestamp & Site Domain */}
          <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#17C99E] font-bold">https://currentsocial.vercel.app/</span>
            <span className="text-zinc-400">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Detailed Holdings Table */}
        <div className="bg-[#212121] border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-zinc-800 font-extrabold text-sm text-white flex items-center justify-between">
            <span>Portfolio Asset breakdown ({displayCurrency})</span>
            <button
              onClick={handleExportExactImage}
              className="bg-[#17C99E] hover:bg-[#14B8A6] text-black font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-sm flex items-center space-x-1"
            >
              <span>📸 Download Image</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#161616] border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                <tr>
                  <th className="px-5 py-4">Asset</th>
                  <th className="px-5 py-4 text-right">Value ({displayCurrency})</th>
                  <th className="px-5 py-4 text-right">24h Change</th>
                  <th className="px-5 py-4 text-right">Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {portfolio.map((item) => {
                  const currentVal = item.amount * item.currentPrice * curr.rate;
                  const allocation = convertedValue > 0 ? (currentVal / convertedValue) * 100 : 0;
                  return (
                    <tr key={item.coinId} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-5 py-4 font-bold text-white">
                        <div>{item.symbol}</div>
                        <div className="text-[10px] text-zinc-400 font-normal">{item.name}</div>
                      </td>
                      <td className="px-5 py-4 text-right font-extrabold font-mono text-white">
                        {curr.symbol}{currentVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`px-5 py-4 text-right font-extrabold font-mono ${item.change24h >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-zinc-400">{allocation.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
        <div className="min-h-screen bg-[#161616] text-white flex items-center justify-center px-4 py-10 font-sans">
          <div className="rounded-3xl border border-zinc-800 bg-[#212121] p-8 text-center">
            <p className="text-zinc-400">Loading trading PnL card...</p>
          </div>
        </div>
      }
    >
      <SharePortfolioContent />
    </Suspense>
  );
}


