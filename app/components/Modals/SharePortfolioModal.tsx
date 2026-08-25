'use client';

import React, { useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Camera, Check, ChevronDown, Clipboard, DollarSign, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { PortfolioAsset } from '../../types';

interface SharePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: PortfolioAsset[];
  totalValue: number;
  totalPnlPercent: number;
}

type Currency = 'USD' | 'CAD' | 'MXN';
type BgPreset = 'cyber-carbon' | 'emerald-bull' | 'midnight-onyx' | 'gold-tier' | 'slate-glass';

const CURRENCY_CONFIG: Record<Currency, { symbol: string; label: string; rate: number }> = {
  USD: { symbol: '$', label: 'US Dollar', rate: 1 },
  CAD: { symbol: 'CA$', label: 'Canadian Dollar', rate: 1.36 },
  MXN: { symbol: 'MX$', label: 'Mexican Peso', rate: 17.15 },
};

const BG_PRESETS: Record<BgPreset, { name: string; style: string; badgeColor: string }> = {
  'cyber-carbon': {
    name: 'Cyber Carbon',
    style: 'bg-[#11161B] border-zinc-800 text-white',
    badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  },
  'emerald-bull': {
    name: 'Emerald Bull',
    style: 'bg-gradient-to-br from-[#062419] via-[#0B1512] to-[#121A17] border-emerald-900/60 text-white',
    badgeColor: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/50',
  },
  'midnight-onyx': {
    name: 'Midnight Onyx',
    style: 'bg-black border-zinc-900 text-white',
    badgeColor: 'bg-zinc-900 text-zinc-400 border-zinc-800',
  },
  'gold-tier': {
    name: 'Gold Tier',
    style: 'bg-gradient-to-br from-[#241A08] via-[#141009] to-[#0D0B07] border-amber-900/60 text-white',
    badgeColor: 'bg-amber-950/80 text-amber-400 border-amber-800/50',
  },
  'slate-glass': {
    name: 'Slate Glass',
    style: 'bg-zinc-900/90 backdrop-blur-2xl border-zinc-700 text-white',
    badgeColor: 'bg-zinc-800/90 text-zinc-200 border-zinc-600',
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

    // Footer with Site Domain https://currentsocial.vercel.app/
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

export const SharePortfolioModal: React.FC<SharePortfolioModalProps> = ({
  isOpen,
  onClose,
  portfolio,
  totalValue,
  totalPnlPercent
}) => {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [bgPreset, setBgPreset] = useState<BgPreset>('cyber-carbon');
  const [customBgImage, setCustomBgImage] = useState<string>('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const storedDisplayName = typeof window !== 'undefined' ? localStorage.getItem('current_user_display_name') : null;
  const storedUsername = typeof window !== 'undefined' ? localStorage.getItem('current_user_username') : null;
  const activeUsername = storedDisplayName || (storedUsername ? `@${storedUsername.replace(/^@/, '')}` : null) || user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Trader';

  const curr = CURRENCY_CONFIG[currency];
  const convertedValue = totalValue * curr.rate;
  const totalCost = portfolio.reduce((sum, p) => sum + p.amount * p.avgBuyPrice, 0);
  const totalPnlUsd = totalValue - totalCost;

  const serializeSnapshot = (value: any) => {
    try {
      const json = JSON.stringify(value);
      return typeof window !== 'undefined'
        ? window.btoa(unescape(encodeURIComponent(json)))
        : '';
    } catch {
      return '';
    }
  };

  const snapshot = serializeSnapshot({
    currency,
    portfolio,
    username: activeUsername,
    bg: bgPreset,
  });

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/share/portfolio?snapshot=${encodeURIComponent(snapshot)}`
    : `https://currentsocial.vercel.app/share/portfolio?snapshot=${encodeURIComponent(snapshot)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCustomBgImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const topHoldingsFormatted = portfolio.slice(0, 6).map((item) => {
    const itemVal = item.amount * item.currentPrice * curr.rate;
    const alloc = convertedValue > 0 ? ((itemVal / convertedValue) * 100).toFixed(1) : '0';
    return { symbol: item.symbol, alloc };
  });

  const handleDownloadExactImage = () => {
    downloadCardAsPngImage({
      roiStr: `${totalPnlPercent >= 0 ? '+' : ''}${totalPnlPercent.toFixed(2)}%`,
      pnlStr: `${totalPnlUsd * curr.rate >= 0 ? '+' : '-'}${curr.symbol}${Math.abs(totalPnlUsd * curr.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
      isPositive: totalPnlPercent >= 0,
      portfolioSize: `${curr.symbol}${convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      holdingsCount: `${portfolio.length} Assets`,
      accountAge: 'Active Trader',
      username: activeUsername,
      topHoldings: topHoldingsFormatted,
      customBgUrl: customBgImage,
      bgPresetStyle: bgPreset,
      filename: `${activeUsername}-Current-PnL.png`
    });
  };

  const presetStyle = BG_PRESETS[bgPreset];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#2E2E2E]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#161616] border border-[#2E2E2E] flex items-center justify-center text-white font-black text-sm">
              C
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Share Trading PnL Card</h2>
              <p className="text-xs text-gray-400">Generate a custom exchange-style trading card</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#2A2A2A] transition-colors">
            <span className="w-5 h-5" >✕</span>
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">

          {/* Background Controls */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase">Card Background Theme</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleCustomImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-[#17C99E] hover:underline flex items-center space-x-1"
              >
                <ImageIcon className="h-4 w-4" />
                <span>{customBgImage ? 'Change Image' : 'Upload Custom BG'}</span>
              </button>
            </div>

            {customBgImage && (
              <div className="mb-2.5 flex items-center justify-between bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-700 text-xs">
                <span className="text-emerald-400 font-bold">Custom Image Active</span>
                <button onClick={() => setCustomBgImage('')} className="text-rose-400 font-bold hover:underline">Clear</button>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(BG_PRESETS) as BgPreset[]).map((key) => (
                <button
                  key={key}
                  onClick={() => { setBgPreset(key); setCustomBgImage(''); }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border text-left ${
                    bgPreset === key && !customBgImage
                      ? 'bg-[#17C99E] text-black border-[#17C99E]'
                      : 'bg-[#212121] text-gray-300 border-[#2E2E2E] hover:bg-[#2A2A2A]'
                  }`}
                >
                  {BG_PRESETS[key].name}
                </button>
              ))}
            </div>
          </div>

          {/* Currency Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Display Currency</label>
            <div className="relative">
              <button
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="w-full flex items-center justify-between bg-[#212121] border border-[#2E2E2E] hover:border-[#3E3E3E] rounded-xl px-4 py-2.5 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div className="text-left">
                    <span className="text-sm font-bold text-white">{currency}</span>
                    <span className="text-xs text-gray-400 ml-2">· {curr.label}</span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showCurrencyDropdown && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowCurrencyDropdown(false)} />
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#212121] border border-[#2E2E2E] rounded-xl overflow-hidden z-30 shadow-2xl">
                    {(Object.entries(CURRENCY_CONFIG) as [Currency, typeof CURRENCY_CONFIG[Currency]][]).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => { setCurrency(key); setShowCurrencyDropdown(false); }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors ${currency === key ? 'bg-[#2A2A2A]' : ''}`}
                      >
                        <DollarSign className="h-5 w-5 text-gray-400" />
                        <div className="text-left flex-1">
                          <span className="text-sm font-bold text-white">{key}</span>
                          <span className="text-xs text-gray-400 ml-2">· {cfg.label}</span>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">1 USD = {cfg.rate} {key}</span>
                        {currency === key && <Check className="h-4 w-4 text-[#17C99E]" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Shareable Card Preview */}
          <div
            style={customBgImage ? { backgroundImage: `url(${customBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            className={`border rounded-2xl p-6 shadow-xl space-y-4 relative overflow-hidden transition-all ${customBgImage ? 'border-zinc-700' : presetStyle.style}`}
          >
            {customBgImage && <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] pointer-events-none" />}

            <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <span className="font-black text-white text-base tracking-wider uppercase">CURRENT</span>
              </div>
              <span className="text-xs font-bold text-[#17C99E] bg-[#17C99E]/10 border border-[#17C99E]/30 px-3 py-1 rounded-full font-mono">
                @{activeUsername.replace(/^@/, '')}
              </span>
            </div>

            <div className="relative z-10 pt-1">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Total Return (ROI)
              </div>
              <div className={`text-3xl font-black font-mono tracking-tight ${totalPnlPercent >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}%
              </div>
              <div className={`text-xs font-bold font-mono mt-0.5 ${totalPnlUsd * curr.rate >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {totalPnlUsd * curr.rate >= 0 ? '+' : '-'}{curr.symbol}{Math.abs(totalPnlUsd * curr.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
              </div>
            </div>

            {/* Holdings & Size */}
            <div className="relative z-10 grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 block font-semibold uppercase">Portfolio Size</span>
                <span className="font-extrabold font-mono text-white">{curr.symbol}{convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-semibold uppercase">Holdings</span>
                <span className="font-extrabold font-mono text-white">{portfolio.length} Assets</span>
              </div>
            </div>

            {/* Domain Footer */}
            <div className="relative z-10 pt-2 text-[11px] font-mono text-[#17C99E]">
              https://currentsocial.vercel.app/
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopy}
              className={`flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-xs transition-all border ${
                copied
                  ? 'bg-[#10B981]/10 border-[#10B981]/40 text-[#10B981]'
                  : 'bg-[#212121] border-[#2E2E2E] text-gray-200 hover:border-[#3E3E3E] hover:text-white'
              }`}
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
              <span>{copied ? 'Copied Link!' : 'Copy PnL Link'}</span>
            </button>

            {/* Download Exact Card Image PNG */}
            <button
              onClick={handleDownloadExactImage}
              className="flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-xs bg-[#17C99E] hover:bg-[#14B8A6] text-black transition-all shadow-md"
            >
              <Camera className="w-4 h-4" />
              <span>Download Card Image</span>
            </button>
          </div>

          {/* Share Link Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Shareable PnL Link</label>
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full bg-[#161616] text-gray-300 text-xs p-3 rounded-xl border border-[#2E2E2E] focus:outline-none font-mono truncate"
            />
          </div>

        </div>
      </div>
    </div>
  );
};



