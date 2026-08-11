'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowUpRight, 
  Wallet, 
  CheckCircle2, 
  Zap,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CryptoCoin, PortfolioAsset } from '../../types';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: CryptoCoin[];
  preselectedSymbol?: string;
  onExecuteTrade: (
    type: 'BUY' | 'SELL',
    coin: CryptoCoin,
    amount: number,
    totalUsd: number
  ) => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  coins,
  preselectedSymbol,
  onExecuteTrade
}) => {
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [selectedSymbol, setSelectedSymbol] = useState(preselectedSymbol || 'SOL');
  const [amount, setAmount] = useState('10');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (preselectedSymbol) {
      setSelectedSymbol(preselectedSymbol);
    }
  }, [preselectedSymbol]);

  if (!isOpen) return null;

  const currentCoin = coins.find(c => c.symbol.toUpperCase() === selectedSymbol.toUpperCase()) || coins[0];
  const parsedAmount = parseFloat(amount) || 0;
  const totalUsd = parsedAmount * (currentCoin ? currentCoin.price : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0 || !currentCoin) return;

    onExecuteTrade(tradeType, currentCoin, parsedAmount, totalUsd);

    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#14181D] border border-[#242B35] rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        
        {/* Glowing background accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FF2E55]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1B2028]"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-[#00D293]/20 rounded-full flex items-center justify-center mx-auto text-[#00D293] animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Trade Executed!</h3>
            <p className="text-sm text-gray-300">
              Successfully {tradeType === 'BUY' ? 'purchased' : 'sold'} {parsedAmount} {currentCoin.symbol} for ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-5 h-5 text-[#FF2E55]" />
              <h2 className="text-lg font-extrabold text-white">Simulated Trade Order</h2>
            </div>

            {/* Buy / Sell Toggle Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#0B0E11] rounded-2xl border border-[#242B35] mb-5">
              <button
                type="button"
                onClick={() => setTradeType('BUY')}
                className={`py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                  tradeType === 'BUY'
                    ? 'bg-[#00D293] text-black shadow-md shadow-[#00D293]/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                BUY {selectedSymbol}
              </button>
              <button
                type="button"
                onClick={() => setTradeType('SELL')}
                className={`py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                  tradeType === 'SELL'
                    ? 'bg-[#FF4D4D] text-white shadow-md shadow-[#FF4D4D]/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                SELL {selectedSymbol}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Select Coin Ticker */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Select Asset</label>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="w-full bg-[#0B0E11] text-white font-bold text-sm p-3 rounded-xl border border-[#242B35] focus:outline-none focus:border-[#FF2E55]"
                >
                  {coins.map((c) => (
                    <option key={c.id} value={c.symbol}>
                      {c.name} (${c.symbol}) — ${c.price < 1 ? c.price.toFixed(6) : c.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Amount ({selectedSymbol})</label>
                  <span className="text-[10px] text-gray-500 font-mono">Available Sim Cash: $50,000.00</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#0B0E11] text-white font-extrabold text-lg p-3 pr-16 rounded-xl border border-[#242B35] focus:outline-none focus:border-[#FF2E55]"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    {selectedSymbol}
                  </span>
                </div>
              </div>

              {/* Quick Amount Presets */}
              <div className="grid grid-cols-4 gap-2">
                {['1', '10', '50', '100'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className="py-1.5 bg-[#1B2028] hover:bg-[#242B35] border border-[#242B35] rounded-lg text-xs font-bold text-gray-300 hover:text-white transition-colors"
                  >
                    +{preset}
                  </button>
                ))}
              </div>

              {/* Order Summary Box */}
              <div className="bg-[#0B0E11] p-3.5 rounded-xl border border-[#242B35] space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Unit Price</span>
                  <span className="font-bold text-white">${currentCoin.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Est. Trading Fee (Simulated)</span>
                  <span className="font-bold text-[#00D293]">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold border-t border-[#242B35] pt-2 text-white">
                  <span>Total USD</span>
                  <span className="text-[#FF2E55]">
                    ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-lg ${
                  tradeType === 'BUY'
                    ? 'bg-[#00D293] hover:opacity-90 text-black shadow-[#00D293]/20'
                    : 'bg-[#FF4D4D] hover:opacity-90 text-white shadow-[#FF4D4D]/20'
                }`}
              >
                Confirm {tradeType} Order
              </button>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
