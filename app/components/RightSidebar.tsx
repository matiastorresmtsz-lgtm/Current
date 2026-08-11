'use client';

import React from 'react';
import { CryptoCoin } from '../types';

interface RightSidebarProps {
  coins: CryptoCoin[];
  onOpenCoinModal: (coin: CryptoCoin) => void;
  onOpenAddCryptoModal: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  coins,
  onOpenCoinModal,
  onOpenAddCryptoModal
}) => {
  return (
    <aside className="w-72 shrink-0 hidden xl:block py-6 px-2 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto space-y-6">

      {/* Watchlist Widget - Exact Blossom Screenshot Match */}
      <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#2E2E2E]">
          <div className="flex items-center space-x-1.5 font-bold text-white text-sm">
            <span>Watchlist</span>
            <span className="text-gray-400 font-bold">• {coins.length}</span>
          </div>
          <button
            onClick={onOpenAddCryptoModal}
            className="text-xs font-bold text-[#17C99E] hover:underline"
          >
            + Add
          </button>
        </div>

        <div className="space-y-3">
          {coins.slice(0, 5).map((coin) => (
            <div
              key={coin.id}
              onClick={() => onOpenCoinModal(coin)}
              className="flex items-center justify-between p-2 rounded-2xl hover:bg-[#2A2A2A] cursor-pointer transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#161616] border border-[#2E2E2E] flex items-center justify-center text-[10px] font-extrabold text-[#17C99E] shrink-0">
                  {coin.symbol.slice(0, 4)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#17C99E] transition-colors">
                    {coin.symbol}
                  </div>
                  <div className="text-[10px] text-gray-400 line-clamp-1 max-w-[100px]">
                    {coin.name}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-block text-[11px] font-extrabold px-2 py-0.5 rounded-lg ${coin.change24h >= 0
                  ? 'bg-[#17C99E]/10 text-[#17C99E]'
                  : 'bg-[#FF4D4D]/10 text-[#FF4D4D]'
                  }`}>
                  {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
};
