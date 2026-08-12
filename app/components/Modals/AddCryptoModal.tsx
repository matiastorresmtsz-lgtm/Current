'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { CryptoCoin, PortfolioAsset } from '../../types';
import { searchCoinGecko } from '../../services/coingecko';

type SearchResult = { id: string; symbol: string; name: string; rank: number; icon: string };
type DisplayOption = SearchResult | CryptoCoin;

const ASSET_COLORS = ['#17C99E', '#3B82F6', '#EC4899', '#F59E0B', '#8B5CF6', '#10B981', '#6366F1', '#00F0FF'];

function colorForSymbol(symbol: string): string {
  let hash = 0;
  for (let i = 0; i < symbol.length; i += 1) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ASSET_COLORS[Math.abs(hash) % ASSET_COLORS.length];
}

interface AddCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: CryptoCoin[];
  onAddHolding: (newAsset: PortfolioAsset) => void;
}

export const AddCryptoModal: React.FC<AddCryptoModalProps> = ({
  isOpen,
  onClose,
  coins,
  onAddHolding
}) => {
  const [selectedCoinId, setSelectedCoinId] = useState(coins[0]?.id || 'bitcoin');
  const [searchFilter, setSearchFilter] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [amount, setAmount] = useState('1.0');
  const [buyPrice, setBuyPrice] = useState('');

  // Remote CoinGecko search debounce effect
  useEffect(() => {
    const trimmed = searchFilter.trim();
    if (!trimmed) return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchCoinGecko(trimmed);
      setSearchResults(results);
      setIsSearching(false);

      if (results.length > 0) {
        setSelectedCoinId(results[0].id);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchFilter]);

  if (!isOpen) return null;

  // Local coins list or combined with search results
  const localMatch = coins.find(c => c.id === selectedCoinId);
  const remoteMatch = searchResults.find(r => r.id === selectedCoinId);

  const currentName = localMatch?.name || remoteMatch?.name || selectedCoinId;
  const currentSymbol = localMatch?.symbol || remoteMatch?.symbol || selectedCoinId.toUpperCase();
  const currentPrice = localMatch?.price || (buyPrice ? parseFloat(buyPrice) : 1.00);
  const currentIcon = localMatch?.icon || remoteMatch?.icon || '';

  const effectiveBuyPrice = buyPrice.trim() !== '' ? parseFloat(buyPrice) : currentPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    const assetColor = colorForSymbol(currentSymbol);

    const newAsset: PortfolioAsset = {
      coinId: selectedCoinId,
      symbol: currentSymbol,
      name: currentName,
      amount: parsedAmount,
      avgBuyPrice: effectiveBuyPrice,
      currentPrice,
      change24h: localMatch?.change24h || 0,
      allocationPercent: 0,
      color: assetColor
    };

    onAddHolding(newAsset);
    setAmount('1.0');
    setBuyPrice('');
    setSearchFilter('');
    onClose();
  };

  // Combine local coins and remote search matches
  const displayOptions: DisplayOption[] = searchFilter.trim() !== ''
    ? searchResults.length > 0
      ? searchResults
      : coins.filter(c => c.name.toLowerCase().includes(searchFilter.toLowerCase()) || c.symbol.toLowerCase().includes(searchFilter.toLowerCase()))
    : coins;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] flex flex-col">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#2A2A2A]"
        >
          <span className="w-5 h-5" >✕</span>
        </button>

        {/* Header */}
        <div className="flex items-center space-x-2.5 mb-4 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#17C99E]/10 border border-[#17C99E]/30 flex items-center justify-center text-[#17C99E]">
            <span className="w-5 h-5" >➕</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Add Crypto Holding</h2>
            <p className="text-xs text-gray-400">Search all 15,000+ cryptos live</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1">

          {/* Search Bar across ALL coins */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">
              Search Cryptocurrency
            </label>

            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search any crypto name or ticker (e.g. SOL, PEPE, WIF)..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-[#161616] text-white text-xs pl-9 pr-8 py-2.5 rounded-xl border border-[#2E2E2E] focus:outline-none focus:border-[#17C99E]"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#17C99E] animate-spin" />
              )}
            </div>

            {/* Select Dropdown */}
            <select
              value={selectedCoinId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedCoinId(id);
                const coin = coins.find(c => c.id === id);
                if (coin) setBuyPrice(coin.price.toString());
              }}
              className="w-full bg-[#161616] text-white font-bold text-sm p-3 rounded-xl border border-[#2E2E2E] focus:outline-none focus:border-[#17C99E] max-h-36"
            >
              {displayOptions.slice(0, 200).map((c) => {
                const price = 'price' in c ? c.price : undefined;
                return (
                <option key={c.id} value={c.id}>
                  #{c.rank || '?'} {c.name} (${(c.symbol || '').toUpperCase()})
                  {price ? ` — $${price < 1 ? price.toFixed(6) : price.toLocaleString()}` : ''}
                </option>
              );})}
            </select>
          </div>

          {/* Selected Coin Badge */}
          <div className="flex items-center space-x-3 bg-[#161616] p-3 rounded-xl border border-[#2E2E2E]">
            {currentIcon ? (
              <img src={currentIcon} alt={currentName} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center font-bold text-[#17C99E]">
                {currentSymbol.substring(0, 2)}
              </div>
            )}
            <div className="flex-1">
              <div className="text-sm font-extrabold text-white flex items-center space-x-1.5">
                <span>{currentName}</span>
                <span className="text-xs text-gray-400 font-mono">${currentSymbol}</span>
              </div>
              <div className="text-xs text-[#17C99E] font-mono font-bold">
                Reference Price: ${currentPrice < 1 ? currentPrice.toFixed(6) : currentPrice.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Quantity Held */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Quantity / Tokens Held</label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 10.5"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#161616] text-white font-bold text-base p-3 rounded-xl border border-[#2E2E2E] focus:outline-none focus:border-[#17C99E]"
            />
          </div>

          {/* Average Purchase Price */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase">Average Purchase Price (USD)</label>
              <button
                type="button"
                onClick={() => setBuyPrice(currentPrice.toString())}
                className="text-[10px] text-[#17C99E] font-bold hover:underline"
              >
                Use Reference Price
              </button>
            </div>
            <input
              type="number"
              step="any"
              placeholder={`$${currentPrice}`}
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              className="w-full bg-[#161616] text-white font-bold text-base p-3 rounded-xl border border-[#2E2E2E] focus:outline-none focus:border-[#17C99E]"
            />
          </div>

          {/* Summary */}
          <div className="bg-[#161616] p-3 rounded-xl border border-[#2E2E2E] flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Estimated Value:</span>
            <span className="font-extrabold text-[#17C99E] font-mono text-sm">
              ${((parseFloat(amount) || 0) * effectiveBuyPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-[#17C99E] hover:bg-[#14B8A6] text-black font-extrabold rounded-xl transition-all shadow-md shadow-[#17C99E]/20 text-sm mt-2"
          >
            Save Asset to Portfolio
          </button>

        </form>

      </div>
    </div>
  );
};
