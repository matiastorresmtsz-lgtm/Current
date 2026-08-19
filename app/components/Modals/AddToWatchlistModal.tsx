'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2, Eye, Check } from 'lucide-react';
import { CryptoCoin } from '../../types';
import { searchCoinGecko } from '../../services/coingecko';

type SearchResult = { id: string; symbol: string; name: string; rank: number; icon: string };
type DisplayOption = SearchResult | CryptoCoin;

interface AddToWatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: CryptoCoin[];
  watchlistIds: string[];
  onAddToWatchlist: (coinId: string, coinData: { symbol: string; name: string; icon: string }) => void;
}

export const AddToWatchlistModal: React.FC<AddToWatchlistModalProps> = ({
  isOpen,
  onClose,
  coins,
  watchlistIds,
  onAddToWatchlist
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [justAdded, setJustAdded] = useState<Set<string>>(new Set());

  // Remote CoinGecko search debounce effect
  useEffect(() => {
    const trimmed = searchFilter.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchCoinGecko(trimmed);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchFilter]);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setSearchFilter('');
      setSearchResults([]);
      setJustAdded(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Combine local coins and remote search matches
  const displayOptions: DisplayOption[] = searchFilter.trim() !== ''
    ? searchResults.length > 0
      ? searchResults
      : coins.filter(c =>
        c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        c.symbol.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : coins.slice(0, 50); // Show top 50 by default

  const handleAdd = (option: DisplayOption) => {
    const coinId = option.id;
    const icon = 'icon' in option ? option.icon : '';
    onAddToWatchlist(coinId, {
      symbol: option.symbol,
      name: option.name,
      icon,
    });
    setJustAdded(prev => new Set(prev).add(coinId));
  };

  const isInWatchlist = (id: string) => watchlistIds.includes(id) || justAdded.has(id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] flex flex-col">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#2A2A2A] transition-colors"
        >
          <span className="w-5 h-5">✕</span>
        </button>

        {/* Header */}
        <div className="flex items-center space-x-2.5 mb-4 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#161616] border border-[#2E2E2E] flex items-center justify-center text-[#17C99E]">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Add to Watchlist</h2>
            <p className="text-xs text-gray-400">Search and track any cryptocurrency</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search any crypto (e.g. SOL, PEPE, WIF)..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            autoFocus
            className="w-full bg-[#161616] text-white text-xs pl-9 pr-8 py-2.5 rounded-xl border border-[#2E2E2E] focus:outline-none focus:border-[#17C99E] transition-colors"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#17C99E] animate-spin" />
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 min-h-0" style={{ maxHeight: '400px' }}>
          {displayOptions.length === 0 && !isSearching && searchFilter.trim() !== '' && (
            <div className="text-center text-gray-400 text-xs py-8">
              No results found for &quot;{searchFilter}&quot;
            </div>
          )}

          {displayOptions.slice(0, 100).map((option) => {
            const coinId = option.id;
            const symbol = option.symbol?.toUpperCase() || '';
            const name = option.name || coinId;
            const icon = 'icon' in option ? option.icon : '';
            const price = 'price' in option ? option.price : undefined;
            const change = 'change24h' in option ? option.change24h : undefined;
            const alreadyAdded = isInWatchlist(coinId);

            return (
              <div
                key={coinId}
                className={`flex items-center justify-between p-2.5 rounded-2xl transition-all group ${
                  alreadyAdded
                    ? 'bg-[#17C99E]/5 border border-[#17C99E]/20'
                    : 'hover:bg-[#2A2A2A] border border-transparent cursor-pointer'
                }`}
                onClick={() => !alreadyAdded && handleAdd(option)}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {icon ? (
                    <img src={icon} alt={name} className="w-8 h-8 rounded-full shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#2A2A2A] border border-[#2E2E2E] flex items-center justify-center text-[10px] font-extrabold text-[#17C99E] shrink-0">
                      {symbol.slice(0, 3)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {symbol}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate max-w-[140px]">
                      {name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {/* Price & Change info if available */}
                  {price !== undefined && (
                    <div className="text-right mr-2 hidden sm:block">
                      <div className="text-[11px] font-bold text-white font-mono">
                        ${price < 1 ? price.toFixed(6) : price.toLocaleString()}
                      </div>
                      {change !== undefined && (
                        <div className={`text-[10px] font-bold ${change >= 0 ? 'text-[#17C99E]' : 'text-[#FF4D4D]'}`}>
                          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add / Added Button */}
                  {alreadyAdded ? (
                    <div className="flex items-center space-x-1 text-[#17C99E] text-[10px] font-bold bg-[#17C99E]/10 px-2.5 py-1.5 rounded-xl">
                      <Check className="w-3 h-3" />
                      <span>Added</span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdd(option);
                      }}
                      className="text-[10px] font-bold text-black bg-[#17C99E] hover:bg-[#14B8A6] px-2.5 py-1.5 rounded-xl transition-colors"
                    >
                      + Watch
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-3 pt-3 border-t border-[#2E2E2E] text-center shrink-0">
          <p className="text-[10px] text-gray-500">
            {watchlistIds.length + justAdded.size} coins in your watchlist
          </p>
        </div>

      </div>
    </div>
  );
};
