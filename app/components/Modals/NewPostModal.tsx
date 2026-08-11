'use client';

import React, { useState } from 'react';
import { 
  X, 
  Send, 
  BarChart2, 
  ListOrdered, 
  CheckCircle2, 
  ImageIcon, 
  Sparkles,
  Zap
} from 'lucide-react';
import { CryptoCoin, Post, TradeProof } from '../../types';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: CryptoCoin[];
  onAddPost: (post: Post) => void;
}

export const NewPostModal: React.FC<NewPostModalProps> = ({
  isOpen,
  onClose,
  coins,
  onAddPost
}) => {
  const [content, setContent] = useState('');
  const [ticker, setTicker] = useState('SOL');
  const [attachChart, setAttachChart] = useState(false);
  const [attachTrade, setAttachTrade] = useState(false);
  const [tradeAmount, setTradeAmount] = useState('25.0');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [attachPoll, setAttachPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOpt1, setPollOpt1] = useState('');
  const [pollOpt2, setPollOpt2] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const matchedCoin = coins.find(c => c.symbol.toUpperCase() === ticker.toUpperCase());
    const price = matchedCoin ? matchedCoin.price : 184.20;

    let tradeProofObj: TradeProof | undefined;
    if (attachTrade) {
      const amt = parseFloat(tradeAmount) || 10;
      tradeProofObj = {
        type: tradeType,
        symbol: ticker,
        coinName: matchedCoin ? matchedCoin.name : ticker,
        amount: amt,
        price: price,
        totalValue: amt * price,
        timestamp: 'Just now (Verified)'
      };
    }

    let pollObj = undefined;
    if (attachPoll && pollQuestion.trim() && pollOpt1.trim() && pollOpt2.trim()) {
      pollObj = {
        question: pollQuestion.trim(),
        options: [
          { id: 'po-1', text: pollOpt1.trim(), votes: 1 },
          { id: 'po-2', text: pollOpt2.trim(), votes: 0 }
        ],
        totalVotes: 1,
        expiresIn: '24 hours left'
      };
    }

    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorName: 'Matias Torres',
      authorHandle: 'matiastorressuarez',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      authorBadge: 'Verified Pro',
      content: content.trim(),
      timestamp: 'Just now',
      likes: 1,
      commentsCount: 0,
      reposts: 0,
      bookmarks: 0,
      isLiked: true,
      ticker: ticker,
      tickerChange: matchedCoin ? matchedCoin.change24h : 5.4,
      tradeProof: tradeProofObj,
      chartData: attachChart && matchedCoin ? matchedCoin.chartData1D : undefined,
      poll: pollObj,
      comments: []
    };

    onAddPost(newPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#14181D] border border-[#242B35] rounded-3xl w-full max-w-xl p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#242B35]">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#FF2E55]" />
            <h2 className="text-lg font-bold text-white">Compose Community Post</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1B2028]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          <textarea
            rows={4}
            placeholder="What's happening in crypto? Tag tickers with $ ($BTC, $ETH, $SOL)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-[#0B0E11] text-gray-100 placeholder-gray-500 p-4 rounded-2xl border border-[#242B35] focus:outline-none focus:border-[#FF2E55] text-sm leading-relaxed"
          />

          {/* Ticker Selector */}
          <div className="flex items-center justify-between bg-[#1B2028] p-3 rounded-xl border border-[#242B35]">
            <span className="text-xs font-semibold text-gray-300">Tagged Ticker:</span>
            <select
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="bg-[#0B0E11] text-xs font-bold text-[#FF2E55] px-3 py-1.5 rounded-lg border border-[#242B35] focus:outline-none cursor-pointer"
            >
              {coins.map((c) => (
                <option key={c.id} value={c.symbol}>${c.symbol} - {c.name}</option>
              ))}
            </select>
          </div>

          {/* Attachment Toggles */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setAttachChart(!attachChart)}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                attachChart 
                  ? 'border-[#FF2E55] bg-[#FF2E55]/10 text-[#FF2E55]' 
                  : 'border-[#242B35] bg-[#1B2028] text-gray-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Chart</span>
            </button>

            <button
              type="button"
              onClick={() => setAttachTrade(!attachTrade)}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                attachTrade 
                  ? 'border-[#00D293] bg-[#00D293]/10 text-[#00D293]' 
                  : 'border-[#242B35] bg-[#1B2028] text-gray-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Trade Proof</span>
            </button>

            <button
              type="button"
              onClick={() => setAttachPoll(!attachPoll)}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                attachPoll 
                  ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]' 
                  : 'border-[#242B35] bg-[#1B2028] text-gray-400 hover:text-white'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Poll</span>
            </button>
          </div>

          {/* Attach Trade Config */}
          {attachTrade && (
            <div className="p-3 bg-[#12161B] border border-[#00D293]/30 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-[#00D293]">Attach Verified Trade Proof</div>
              <div className="flex items-center space-x-2">
                <select
                  value={tradeType}
                  onChange={(e) => setTradeType(e.target.value as 'BUY' | 'SELL')}
                  className="bg-[#0B0E11] text-white p-1.5 rounded-lg border border-[#242B35]"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
                <input
                  type="number"
                  placeholder="Amount"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  className="bg-[#0B0E11] text-white p-1.5 rounded-lg border border-[#242B35] w-28"
                />
                <span className="text-gray-400 font-bold">{ticker}</span>
              </div>
            </div>
          )}

          {/* Attach Poll Config */}
          {attachPoll && (
            <div className="p-3 bg-[#12161B] border border-[#3B82F6]/30 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-[#3B82F6]">Create Community Poll</div>
              <input
                type="text"
                placeholder="Poll Question?"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className="w-full bg-[#0B0E11] text-white p-2 rounded-lg border border-[#242B35]"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Option 1"
                  value={pollOpt1}
                  onChange={(e) => setPollOpt1(e.target.value)}
                  className="bg-[#0B0E11] text-white p-2 rounded-lg border border-[#242B35]"
                />
                <input
                  type="text"
                  placeholder="Option 2"
                  value={pollOpt2}
                  onChange={(e) => setPollOpt2(e.target.value)}
                  className="bg-[#0B0E11] text-white p-2 rounded-lg border border-[#242B35]"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={!content.trim()}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#FF2E55] to-[#E02447] disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-[#FF2E55]/20 hover:opacity-95 transition-all"
            >
              <span>Publish Post</span>
              <Send className="w-4 h-4" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
