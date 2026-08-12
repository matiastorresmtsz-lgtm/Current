'use client';

import React, { useState, useEffect } from 'react';
import { ChartPoint, CryptoCoin } from '../../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchCoinChart } from '../../services/coingecko';

interface CoinDetailModalProps {
  coin: CryptoCoin | null;
  onClose: () => void;
  onOpenTradeModalWithTicker: (symbol: string) => void;
}

type TimeframeLabel = '1D' | '1W' | '1M' | '6M' | '1Y' | 'MAX';

type TimeframeMap = {
  [key in TimeframeLabel]: {
    label: string;
    query: '1' | '7' | '30' | '180' | '365' | 'max';
  };
};

const timeframeOptions: TimeframeMap = {
  '1D': { label: '1D', query: '1' },
  '1W': { label: '1W', query: '7' },
  '1M': { label: '1M', query: '30' },
  '6M': { label: '6M', query: '180' },
  '1Y': { label: '1Y', query: '365' },
  'MAX': { label: 'MAX', query: 'max' }
};

export const CoinDetailModal: React.FC<CoinDetailModalProps> = ({
  coin,
  onClose,
  onOpenTradeModalWithTicker
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeLabel>('1D');
  const [fetchedChart, setFetchedChart] = useState<ChartPoint[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState<boolean>(false);

  useEffect(() => {
    if (!coin) return;

    let isMounted = true;

    const loadDynamicChart = async () => {
      setIsLoadingChart(true);
      const query = timeframeOptions[timeframe].query;
      const data = await fetchCoinChart(coin.id, query);
      if (isMounted) {
        setFetchedChart(data.chartData);
        setIsLoadingChart(false);
      }
    };

    loadDynamicChart();

    return () => {
      isMounted = false;
    };
  }, [coin, timeframe]);

  if (!coin) return null;

  const currentChartData = fetchedChart.length > 0 ? fetchedChart : (coin.chartData1D || []);
  const isPositive = coin.change24h >= 0;

  const formatUsd = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#2A2A2A]"
        >
          <span className="w-5 h-5" >✕</span>
        </button>

        <div className="flex items-center space-x-4 mb-6">
          {coin.icon ? (
            <img src={coin.icon} alt={coin.name} className="w-12 h-12 rounded-full ring-2 ring-[#00F0FF]" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#2A2A2A] ring-2 ring-[#00F0FF] flex items-center justify-center text-[#00F0FF] font-extrabold text-lg">
              {coin.symbol.substring(0, 2)}
            </div>
          )}

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-extrabold text-white">{coin.name}</h2>
              <span className="text-sm font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded border border-[#00F0FF]/30 font-mono">
                ${coin.symbol}
              </span>
              {coin.rank && (
                <span className="text-xs font-mono font-bold text-gray-400 bg-[#161616] px-2 py-0.5 rounded-full border border-[#2E2E2E]">
                  #{coin.rank}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 mt-1">
              <span className="text-xl font-extrabold text-white font-mono">
                ${coin.price < 0.0001
                  ? coin.price.toFixed(8)
                  : coin.price < 1
                  ? coin.price.toFixed(4)
                  : coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-sm font-bold font-mono ${isPositive ? 'text-[#17C99E]' : 'text-[#FF4D4D]'}`}>
                {isPositive ? '+' : ''}{coin.change24h.toFixed(2)}% (24h)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3 bg-[#161616] p-2 rounded-xl border border-[#2E2E2E]">
          <div className="flex items-center space-x-2 px-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Interactive Price Chart</span>
            {isLoadingChart && <span className="w-3.5 h-3.5 text-[#00F0FF] animate-spin" >⏳</span>}
          </div>
          <div className="flex flex-wrap gap-1">
            {Object.keys(timeframeOptions).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf as TimeframeLabel)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-[#00F0FF] text-black shadow-md font-extrabold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {timeframeOptions[tf as TimeframeLabel].label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full bg-[#161616] rounded-2xl p-4 border border-[#2E2E2E] mb-6 relative flex items-center justify-center">
          {currentChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentChartData}>
                <defs>
                  <linearGradient id="coinGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? '#17C99E' : '#FF4D4D'} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={isPositive ? '#17C99E' : '#FF4D4D'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#4B5563" fontSize={10} tickLine={false} />
                <YAxis domain={['dataMin', 'dataMax']} stroke="#4B5563" fontSize={10} tickLine={false} orientation="right" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#212121', borderColor: '#2E2E2E', borderRadius: '12px', fontSize: '12px', color: '#FFF' }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? '#17C99E' : '#FF4D4D'}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#coinGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
              <span className="w-6 h-6 animate-spin text-[#00F0FF]" >⏳</span>
              <span className="text-xs">Loading Live Historical Data...</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#161616] p-3 rounded-xl border border-[#2E2E2E]">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Market Cap</div>
            <div className="text-sm font-extrabold text-white mt-0.5 font-mono">{formatUsd(coin.marketCap)}</div>
          </div>

          <div className="bg-[#161616] p-3 rounded-xl border border-[#2E2E2E]">
            <div className="text-[10px] font-bold text-gray-400 uppercase">24h Volume</div>
            <div className="text-sm font-extrabold text-white mt-0.5 font-mono">{formatUsd(coin.volume24h)}</div>
          </div>

          <div className="bg-[#161616] p-3 rounded-xl border border-[#2E2E2E]">
            <div className="text-[10px] font-bold text-gray-400 uppercase">24h High / Low</div>
            <div className="text-xs font-extrabold text-white mt-0.5 font-mono">
              ${coin.high24h.toLocaleString()} / ${coin.low24h.toLocaleString()}
            </div>
          </div>

          <div className="bg-[#161616] p-3 rounded-xl border border-[#2E2E2E]">
            <div className="text-[10px] font-bold text-gray-400 uppercase">All-Time High</div>
            <div className="text-sm font-extrabold text-white mt-0.5 font-mono">${coin.ath.toLocaleString()}</div>
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
            onOpenTradeModalWithTicker(coin.symbol);
          }}
          className="w-full bg-[#17C99E] hover:bg-[#14B8A6] text-black font-extrabold text-sm py-3 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
        >
          <span className="w-4 h-4" >➕</span>
          <span>Add ${coin.symbol} to Portfolio</span>
        </button>

      </div>
    </div>
  );
};
