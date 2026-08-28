'use client';

import React from 'react';
import { X, Eye } from 'lucide-react';
import { CryptoCoin } from '../types';

export interface WatchlistItem {
  coinId: string;
  symbol: string;
  name: string;
  icon: string;
  type?: 'coin' | 'topic';
}

interface RightSidebarProps {
  coins: CryptoCoin[];
  watchlist: WatchlistItem[];
  onOpenCoinModal: (coin: CryptoCoin) => void;
  onOpenAddToWatchlistModal: () => void;
  onRemoveFromWatchlist: (coinId: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  coins,
  watchlist,
  onOpenCoinModal,
  onOpenAddToWatchlistModal,
  onRemoveFromWatchlist
}) => {
  // Enrich watchlist items with live price data from coins array
  const enrichedWatchlist = watchlist.map(item => {
    const liveData = coins.find(c => c.id === item.coinId);
    return {
      ...item,
      price: liveData?.price,
      change24h: liveData?.change24h,
      icon: liveData?.icon || item.icon,
      liveCoin: liveData,
    };
  });

  return (
    <aside className="w-64 shrink-0 hidden xl:block pt-2 pb-6 pl-1 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto space-y-5">

      {/* Watchlist Widget */}
      <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#2E2E2E]">
          <div className="flex items-center space-x-1.5 font-bold text-white text-sm">
            <Eye className="w-3.5 h-3.5 text-[#17C99E]" />
            <span>Watchlist</span>
            <span className="text-gray-400 font-bold">• {watchlist.length}</span>
          </div>
          <button
            onClick={onOpenAddToWatchlistModal}
            className="text-xs font-bold text-[#17C99E] hover:underline"
          >
            + Add
          </button>
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-gray-500 text-xs mb-3">Your watchlist is empty</div>
            <button
              onClick={onOpenAddToWatchlistModal}
              className="text-[11px] font-bold text-black bg-[#17C99E] hover:bg-[#14B8A6] px-4 py-2 rounded-xl transition-colors"
            >
              + Add Crypto
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {enrichedWatchlist.map((item) => (
              <div
                key={item.coinId}
                className="flex items-center justify-between p-2 rounded-2xl hover:bg-[#2A2A2A] cursor-pointer transition-colors group relative"
                onClick={() => {
                  if (item.type !== 'topic' && item.liveCoin) onOpenCoinModal(item.liveCoin);
                }}
              >
                <div className="flex items-center space-x-3">
                  {item.icon ? (
                    <img src={item.icon} alt={item.name} className="w-8 h-8 rounded-full shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#161616] border border-[#2E2E2E] flex items-center justify-center text-[10px] font-extrabold text-[#17C99E] shrink-0">
                      {item.symbol.slice(0, 4)}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#17C99E] transition-colors">
                      {item.symbol.toUpperCase()}
                    </div>
                    <div className="text-[10px] text-gray-400 line-clamp-1 max-w-[80px]">
                      {item.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {/* Price / Change */}
                  <div className="text-right">
                    {item.type === 'topic' ? (
                      <span className="text-[10px] text-[#17C99E] font-bold">Topic</span>
                    ) : item.price !== undefined ? (
                      <>
                        <div className="text-[10px] font-bold text-white font-mono">
                          ${item.price < 1 ? item.price.toFixed(4) : item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                        {item.change24h !== undefined && (
                          <span className={`inline-block text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg ${item.change24h >= 0
                            ? 'bg-[#17C99E]/10 text-[#17C99E]'
                            : 'bg-[#FF4D4D]/10 text-[#FF4D4D]'
                            }`}>
                            {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] text-gray-500 font-mono">—</span>
                    )}
                  </div>

                  {/* Remove button (visible on hover) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromWatchlist(item.coinId);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-[#FF4D4D]/10 text-gray-500 hover:text-[#FF4D4D] transition-all"
                    title="Remove from watchlist"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </aside>
  );
};
