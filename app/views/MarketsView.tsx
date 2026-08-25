'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { CryptoCoin } from '../types';
import { searchCoinGecko } from '../services/coingecko';

interface MarketsViewProps {
  coins: CryptoCoin[];
  onOpenCoinModal: (coin: CryptoCoin) => void;
  onOpenTradeModalWithTicker: (symbol: string) => void;
}

type SortOption = 'marketCap' | 'change24h' | 'price' | 'volume';

export const MarketsView: React.FC<MarketsViewProps> = ({
  coins,
  onOpenCoinModal,
  onOpenTradeModalWithTicker
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [remoteMatches, setRemoteMatches] = useState<CryptoCoin[]>([]);
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('marketCap');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);

  // Debounced Remote CoinGecko search across ALL 15,000+ cryptos
  useEffect(() => {
    const trimmed = searchFilter.trim();
    if (!trimmed) return;

    const timer = setTimeout(async () => {
      setIsSearchingRemote(true);
      const results = await searchCoinGecko(trimmed);
      setIsSearchingRemote(false);

      const mapped: CryptoCoin[] = results.map((r) => {
        const existing = coins.find(c => c.id === r.id);
        if (existing) return existing;
        return {
          id: r.id,
          symbol: r.symbol,
          name: r.name,
          rank: r.rank || 9999,
          price: 0,
          change24h: 0,
          volume24h: 0,
          marketCap: 0,
          high24h: 0,
          low24h: 0,
          ath: 0,
          circulatingSupply: 'N/A',
          category: 'other',
          icon: r.icon,
          sparkline: [0, 0],
          chartData1D: [],
          chartData7D: []
        };
      });

      setRemoteMatches(mapped);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchFilter, coins]);

  const filteredCoins = useMemo(() => {
    const searchLower = searchFilter.toLowerCase().trim();

    let list = coins;
    if (searchLower) {
      const localFiltered = coins.filter((coin) => {
        return (
          coin.name.toLowerCase().includes(searchLower) ||
          coin.symbol.toLowerCase().includes(searchLower) ||
          (coin.rank && coin.rank.toString() === searchLower.replace('#', ''))
        );
      });

      // Combine local filtered with any extra remote matches not already included
      const existingIds = new Set(localFiltered.map(c => c.id));
      const extraRemote = remoteMatches.filter(r => !existingIds.has(r.id));
      list = [...localFiltered, ...extraRemote];
    } else if (selectedCategory !== 'all') {
      list = coins.filter(coin => coin.category === selectedCategory);
    }

    return list.sort((a, b) => {
      if (sortBy === 'marketCap') return (a.rank || 9999) - (b.rank || 9999);
      if (sortBy === 'change24h') return b.change24h - a.change24h;
      if (sortBy === 'price') return b.price - a.price;
      if (sortBy === 'volume') return b.volume24h - a.volume24h;
      return 0;
    });
  }, [coins, selectedCategory, searchFilter, remoteMatches, sortBy]);

  const totalPages = Math.ceil(filteredCoins.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCoins = filteredCoins.slice(startIndex, startIndex + itemsPerPage);

  const formatUsd = (num: number) => {
    if (num <= 0) return '—';
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">

      {/* Header Info Banner */}


      {/* Category Pills & Search Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Categories */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full lg:w-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: `All Cryptos (${coins.length})` },
            { id: 'l1', label: 'Layer 1s' },
            { id: 'l2', label: 'Layer 2s' },
            { id: 'defi', label: 'DeFi' },
            { id: 'meme', label: 'Memecoins' },
            { id: 'ai', label: 'AI & Data' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat.id
                ? 'bg-[#17C99E] text-black shadow-md shadow-[#17C99E]/20 font-extrabold'
                : 'bg-[#212121] text-gray-400 hover:text-white border border-[#2E2E2E]'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Sorting toolbar */}
        <div className="flex items-center space-x-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search all 15,000+ cryptos..."
              value={searchFilter}
              onChange={(e) => { setSearchFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#212121] text-white text-xs pl-10 pr-8 py-2.5 rounded-2xl border border-[#2E2E2E] focus:outline-none focus:border-[#17C99E] transition-colors"
            />
            {isSearchingRemote && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#17C99E] animate-spin" />
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as SortOption); setCurrentPage(1); }}
            className="bg-[#212121] text-white text-xs font-bold p-2.5 rounded-2xl border border-[#2E2E2E] focus:outline-none cursor-pointer"
          >
            <option value="marketCap">Sort by Rank / MCap</option>
            <option value="change24h">Sort by 24h % Gain</option>
            <option value="price">Sort by Price</option>
            <option value="volume">Sort by 24h Volume</option>
          </select>
        </div>
      </div>

      {/* Markets Table */}
      <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161616] text-gray-400 border-b border-[#2E2E2E] uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                <th className="py-3.5 px-4">Cryptocurrency</th>
                <th className="py-3.5 px-4 text-right">Price (USD)</th>
                <th className="py-3.5 px-4 text-right">24h Change</th>
                <th className="py-3.5 px-4 text-right hidden md:table-cell">24h Volume</th>
                <th className="py-3.5 px-4 text-right hidden lg:table-cell">Market Cap</th>
                <th className="py-3.5 px-4 text-center hidden sm:table-cell">7D Trend</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E2E2E]">
              {paginatedCoins.length > 0 ? (
                paginatedCoins.map((coin, index) => {
                  const displayRank = coin.rank || (startIndex + index + 1);
                  const isPositive = coin.change24h >= 0;

                  return (
                    <tr
                      key={coin.id}
                      onClick={() => onOpenCoinModal(coin)}
                      className="hover:bg-[#2A2A2A] cursor-pointer transition-colors group"
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-center font-mono font-extrabold text-gray-400 text-xs">
                        #{displayRank > 9990 ? '?' : displayRank}
                      </td>

                      {/* Name & Symbol */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          {coin.icon ? (
                            <img src={coin.icon} alt={coin.name} className="w-8 h-8 rounded-full bg-[#161616] p-0.5" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center font-bold text-[#17C99E]">
                              {coin.symbol.substring(0, 2)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-white text-sm group-hover:text-[#17C99E] transition-colors flex items-center space-x-2">
                              <span>{coin.name}</span>
                              <span className="text-xs text-gray-400 font-mono font-normal">${coin.symbol}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 text-right font-extrabold text-white text-sm font-mono">
                        {coin.price > 0
                          ? `$${coin.price < 0.0001
                            ? coin.price.toFixed(8)
                            : coin.price < 1
                              ? coin.price.toFixed(4)
                              : coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : '—'}
                      </td>

                      {/* 24h Change */}
                      <td className="py-3.5 px-4 text-right font-bold">
                        {coin.price > 0 ? (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${isPositive ? 'bg-[#17C99E]/10 text-[#17C99E]' : 'bg-[#FF4D4D]/10 text-[#FF4D4D]'
                            }`}>
                            {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                            {isPositive ? '+' : ''}{coin.change24h.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-gray-500 font-mono text-xs">—</span>
                        )}
                      </td>

                      {/* Volume */}
                      <td className="py-3.5 px-4 text-right font-mono text-gray-300 hidden md:table-cell">
                        {formatUsd(coin.volume24h)}
                      </td>

                      {/* Market Cap */}
                      <td className="py-3.5 px-4 text-right font-mono text-gray-300 hidden lg:table-cell">
                        {formatUsd(coin.marketCap)}
                      </td>

                      {/* Sparkline */}
                      <td className="py-3.5 px-4 text-center hidden sm:table-cell">
                        {coin.sparkline && coin.sparkline.length > 1 && coin.sparkline.some(v => v > 0) ? (
                          <div className="w-20 h-6 mx-auto flex items-center justify-center">
                            <svg className="w-full h-full" viewBox="0 0 100 30">
                              <polyline
                                fill="none"
                                stroke={isPositive ? '#17C99E' : '#FF4D4D'}
                                strokeWidth="2"
                                strokeLinecap="round"
                                points={coin.sparkline.map((val, i) => {
                                  const min = Math.min(...coin.sparkline);
                                  const max = Math.max(...coin.sparkline);
                                  const range = max - min || 1;
                                  const x = (i / (coin.sparkline.length - 1)) * 100;
                                  const y = 30 - ((val - min) / range) * 24 - 3;
                                  return `${x},${y}`;
                                }).join(' ')}
                              />
                            </svg>
                          </div>
                        ) : (
                          <span className="text-gray-600 text-[10px]">—</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenTradeModalWithTicker(coin.symbol);
                          }}
                          className="bg-[#17C99E] hover:bg-[#14B8A6] text-black font-extrabold px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 mx-auto text-xs shadow-sm hover:scale-105"
                        >
                          <span className="w-3.5 h-3.5" >➕</span>
                          <span>Add</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <span className="w-8 h-8 text-[#17C99E] animate-spin" >⏳</span>
                      <p className="font-semibold text-white text-sm">Searching live market library...</p>
                      <p className="text-xs text-gray-400">Loading live data for &quot;{searchFilter}&quot;</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Count Footer */}
        <div className="bg-[#161616] border-t border-[#2E2E2E] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center space-x-3">
            <span>
              Showing <strong className="text-white font-mono">{filteredCoins.length > 0 ? startIndex + 1 : 0}</strong> to{' '}
              <strong className="text-white font-mono">{Math.min(startIndex + itemsPerPage, filteredCoins.length)}</strong> of{' '}
              <strong className="text-[#17C99E] font-mono">{filteredCoins.length}</strong> cryptos
            </span>

            <div className="flex items-center space-x-1 text-[11px]">
              <span>Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-[#212121] text-white font-mono font-bold px-2 py-1 rounded-lg border border-[#2E2E2E] focus:outline-none"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Page Controls */}
          {totalPages > 1 && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-xl bg-[#212121] hover:bg-[#2A2A2A] text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed border border-[#2E2E2E] transition-colors"
              >
                <span className="w-4 h-4" >◀️</span>
              </button>

              <div className="flex items-center space-x-1 px-2">
                <span className="text-gray-400">Page</span>
                <span className="font-mono font-bold text-white bg-[#212121] px-2.5 py-1 rounded-lg border border-[#2E2E2E]">
                  {currentPage}
                </span>
                <span className="text-gray-400">of {totalPages}</span>
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-xl bg-[#212121] hover:bg-[#2A2A2A] text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed border border-[#2E2E2E] transition-colors"
              >
                <span className="w-4 h-4" >▶️</span>
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
