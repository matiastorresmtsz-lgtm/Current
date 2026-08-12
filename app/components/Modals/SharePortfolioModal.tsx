'use client';

import React, { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { PortfolioAsset } from '../../types';

interface SharePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: PortfolioAsset[];
  totalValue: number;
  totalPnlPercent: number;
}

type Currency = 'USD' | 'CAD' | 'MXN';

const CURRENCY_CONFIG: Record<Currency, { flag: string; symbol: string; label: string; rate: number }> = {
  USD: { flag: '🇺🇸', symbol: '$', label: 'US Dollar', rate: 1 },
  CAD: { flag: '🇨🇦', symbol: 'CA$', label: 'Canadian Dollar', rate: 1.36 },
  MXN: { flag: '🇲🇽', symbol: 'MX$', label: 'Mexican Peso', rate: 17.15 },
};

export const SharePortfolioModal: React.FC<SharePortfolioModalProps> = ({
  isOpen,
  onClose,
  portfolio,
  totalValue,
  totalPnlPercent
}) => {
  const [copied, setCopied] = useState(false);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const curr = CURRENCY_CONFIG[currency];
  const convertedValue = totalValue * curr.rate;

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

  const snapshot = serializeSnapshot({ currency, portfolio });
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/share/portfolio?snapshot=${encodeURIComponent(snapshot)}`
    : `https://stream.crypto/share/portfolio?snapshot=${encodeURIComponent(snapshot)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);

    const shareTotalValue = portfolio.reduce((sum, item) => sum + item.amount * item.currentPrice * curr.rate, 0);
    const chartColors = ['#10B981', '#8B5CF6', '#3B82F6', '#EC4899', '#F59E0B', '#14B8A6', '#0EA5E9', '#F472B6'];
    let angleStart = 0;
    const chartSegments = portfolio.slice(0, 6).map((item, idx) => {
      const value = item.amount * item.currentPrice * curr.rate;
      const percent = shareTotalValue > 0 ? value / shareTotalValue : 0;
      const angle = percent * Math.PI * 2;
      const x1 = 150 + 100 * Math.cos(angleStart - Math.PI / 2);
      const y1 = 150 + 100 * Math.sin(angleStart - Math.PI / 2);
      angleStart += angle;
      const x2 = 150 + 100 * Math.cos(angleStart - Math.PI / 2);
      const y2 = 150 + 100 * Math.sin(angleStart - Math.PI / 2);
      const largeArc = angle > Math.PI ? 1 : 0;
      return `
        <path d="M150 150 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${chartColors[idx % chartColors.length]}" />`;
    }).join('');

    const portfolioRows = portfolio
      .slice(0, 10)
      .map(item => {
        const val = item.amount * item.currentPrice * curr.rate;
        const pnl = ((item.currentPrice - item.avgBuyPrice) / item.avgBuyPrice * 100);
        const alloc = shareTotalValue > 0
          ? ((item.amount * item.currentPrice * curr.rate / shareTotalValue) * 100).toFixed(1)
          : '0';
        return `
          <tr style="border-bottom:1px solid #2E2E2E;">
            <td style="padding:10px 12px;font-weight:700;color:#fff;">${item.symbol}</td>
            <td style="padding:10px 12px;color:#9CA3AF;">${item.name}</td>
            <td style="padding:10px 12px;color:#9CA3AF;">${item.amount.toFixed(4)}</td>
            <td style="padding:10px 12px;color:#fff;font-weight:700;">${curr.symbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td style="padding:10px 12px;color:${pnl >= 0 ? '#10B981' : '#EF4444'};font-weight:700;">${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}%</td>
            <td style="padding:10px 12px;color:#9CA3AF;">${alloc}%</td>
          </tr>`;
      }).join('');

    const totalCost = portfolio.reduce((s, i) => s + i.amount * i.avgBuyPrice, 0);
    const totalPnlUsd = totalValue - totalCost;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Stream Portfolio Report</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#111;color:#fff;padding:40px;}
    .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;}
    .logo{font-size:24px;font-weight:900;letter-spacing:-0.5px;color:#EF4444;}
    .badge{background:#EF4444/20;border:1px solid #EF4444/40;border-radius:999px;padding:4px 14px;font-size:11px;font-weight:700;color:#EF4444;letter-spacing:1px;}
    .metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px;}
    .metric-card{background:#1A1A1A;border:1px solid #2E2E2E;border-radius:16px;padding:20px;}
    .metric-label{font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;}
    .metric-value{font-size:22px;font-weight:900;color:#fff;}
    .metric-sub{font-size:12px;font-weight:700;margin-top:4px;}
    .chart-card{background:#1A1A1A;border:1px solid #2E2E2E;border-radius:16px;padding:20px;margin-bottom:32px;text-align:center;}
    .chart-label{font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;}
    .chart-value{font-size:28px;font-weight:900;color:#fff;margin-bottom:14px;}
    .table-wrap{background:#1A1A1A;border:1px solid #2E2E2E;border-radius:16px;overflow:hidden;}
    table{width:100%;border-collapse:collapse;}
    thead tr{background:#212121;}
    th{padding:12px;font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;text-align:left;font-weight:700;}
    .footer{margin-top:24px;font-size:11px;color:#4B5563;text-align:center;}
  </style>
</head>
<body>
  <div class="header">
    <span class="logo">Stream</span>
    <div style="text-align:right;">
      <div class="badge">PORTFOLIO REPORT</div>
      <div style="font-size:11px;color:#6B7280;margin-top:6px;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>
  </div>

  <div class="metrics">
    <div class="metric-card">
      <div class="metric-label">Portfolio Value</div>
      <div class="metric-value">${curr.symbol}${convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      <div class="metric-sub">in ${currency}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">All-Time Return</div>
      <div class="metric-value" style="color:${totalPnlPercent >= 0 ? '#10B981' : '#EF4444'};">${totalPnlPercent >= 0 ? '+' : ''}${totalPnlPercent.toFixed(2)}%</div>
      <div class="metric-sub" style="color:${totalPnlUsd * curr.rate >= 0 ? '#10B981' : '#EF4444'};">${totalPnlUsd * curr.rate >= 0 ? '+' : ''}${curr.symbol}${Math.abs(totalPnlUsd * curr.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Holdings</div>
      <div class="metric-value">${portfolio.length}</div>
      <div class="metric-sub">Assets tracked</div>
    </div>
  </div>

  <div class="chart-card">
    <div class="chart-label">Portfolio Distribution</div>
    <div class="chart-value">Donut Graph</div>
    <svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      <circle cx="150" cy="150" r="100" fill="#111" />
      ${chartSegments}
      <circle cx="150" cy="150" r="60" fill="#111" />
    </svg>
  </div>

  <div class="table-wrap">
    <table>
      <thead><tr>
        <th>Symbol</th><th>Name</th><th>Amount</th><th>Value (${currency})</th><th>P&L</th><th>Allocation</th>
      </tr></thead>
      <tbody>${portfolioRows}</tbody>
    </table>
  </div>

  <div class="footer">Generated by Stream Crypto Platform · stream.crypto · Values in ${currency} (1 USD = ${curr.rate} ${currency})</div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => {
        win.print();
        setIsDownloading(false);
      }, 500);
    } else {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#2E2E2E]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
              <span className="w-5 h-5" >📤</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Share Portfolio</h2>
              <p className="text-xs text-gray-400">Export or share your verified holdings</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#2A2A2A] transition-colors">
            <span className="w-5 h-5" >✕</span>
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Currency Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Display Currency</label>
            <div className="relative">
              <button
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="w-full flex items-center justify-between bg-[#212121] border border-[#2E2E2E] hover:border-[#3E3E3E] rounded-xl px-4 py-3 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-base">{curr.flag}</span>
                  <div className="text-left">
                    <span className="text-sm font-bold text-white">{currency}</span>
                    <span className="text-xs text-gray-400 ml-2">· {curr.label}</span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showCurrencyDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#212121] border border-[#2E2E2E] rounded-xl overflow-hidden z-10 shadow-xl">
                  {(Object.entries(CURRENCY_CONFIG) as [Currency, typeof CURRENCY_CONFIG[Currency]][]).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => { setCurrency(key); setShowCurrencyDropdown(false); }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors ${currency === key ? 'bg-[#2A2A2A]' : ''}`}
                    >
                      <span className="text-lg">{cfg.flag}</span>
                      <div className="text-left flex-1">
                        <span className="text-sm font-bold text-white">{key}</span>
                        <span className="text-xs text-gray-400 ml-2">· {cfg.label}</span>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">1 USD = {cfg.rate} {key}</span>
                      {currency === key && <span className="text-[#00F0FF] text-xs font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Shareable Card Preview */}
          <div
            ref={cardRef}
            className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F0FF]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-white text-base tracking-tight">Stream</span>
              </div>
              <span className="bg-[#EF4444]/20 text-[#EF4444] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#EF4444]/30">
                VERIFIED PORTFOLIO
              </span>
            </div>

            <div className="pt-2 border-t border-[#2E2E2E]">
              <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                Total Portfolio Value · {currency}
              </div>
              <div className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
                {curr.symbol}{convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-xs font-extrabold mt-1 flex items-center space-x-1 ${totalPnlPercent >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                <span className="w-3.5 h-3.5" >📈</span>
                <span>{totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}% All-Time Return</span>
              </div>
            </div>

            {/* Allocation Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {portfolio.slice(0, 5).map((item) => (
                <span
                  key={item.coinId}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#2A2A2A] text-gray-200 border border-[#383838]"
                >
                  {item.symbol}: {totalValue > 0 ? ((item.amount * item.currentPrice / totalValue) * 100).toFixed(1) : 0}%
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Copy Link */}
            <button
              onClick={handleCopy}
              className={`flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-xs transition-all border ${
                copied
                  ? 'bg-[#10B981]/10 border-[#10B981]/40 text-[#10B981]'
                  : 'bg-[#212121] border-[#2E2E2E] text-gray-200 hover:border-[#3E3E3E] hover:text-white'
              }`}
            >
              {copied ? <span className="w-4 h-4" >✅</span> : <span className="w-4 h-4" >📋</span>}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            {/* Download PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-xs bg-[#00F0FF] hover:bg-[#00D8E6] text-black transition-all shadow-md shadow-[#00F0FF]/20 disabled:opacity-60"
            >
              <span className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} >⬇️</span>
              <span>{isDownloading ? 'Preparing...' : 'Download PDF'}</span>
            </button>
          </div>

          {/* Share Link Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Shareable Link</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-[#161616] text-gray-300 text-xs p-3 rounded-xl border border-[#2E2E2E] focus:outline-none font-mono"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
