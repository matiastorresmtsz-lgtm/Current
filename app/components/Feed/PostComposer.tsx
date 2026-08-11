'use client';

import React, { useState } from 'react';
import { 
  BarChart2, 
  ListOrdered, 
  Send, 
  Sparkles,
  Plus
} from 'lucide-react';
import { CryptoCoin, Post } from '../../types';

interface PostComposerProps {
  coins: CryptoCoin[];
  onAddPost: (newPost: Post) => void;
  onOpenFullModal: () => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  coins,
  onAddPost,
  onOpenFullModal
}) => {
  const [content, setContent] = useState('');
  const [selectedTicker, setSelectedTicker] = useState<string>('SOL');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const matched = coins.find(c => c.symbol.toUpperCase() === selectedTicker.toUpperCase());

    const created: Post = {
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
      ticker: selectedTicker,
      tickerChange: matched ? matched.change24h : 3.4,
      comments: []
    };

    onAddPost(created);
    setContent('');
  };

  return (
    <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-4 shadow-xl mb-6">
      <div className="flex space-x-3">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
          alt="Avatar"
          className="w-10 h-10 rounded-full object-cover ring-1 ring-[#17C99E]"
        />

        <div className="flex-1">
          <textarea
            rows={2}
            placeholder="Share your crypto thoughts or trade thesis ($BTC, $SOL)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none text-sm leading-relaxed"
          />

          {/* Quick Toolbar */}
          <div className="flex items-center justify-between pt-3 border-t border-[#2E2E2E] mt-2">
            <div className="flex items-center space-x-2">
              
              <select
                value={selectedTicker}
                onChange={(e) => setSelectedTicker(e.target.value)}
                className="bg-[#161616] text-xs font-bold text-[#17C99E] px-2.5 py-1 rounded-xl border border-[#2E2E2E] focus:outline-none cursor-pointer"
              >
                {coins.map((c) => (
                  <option key={c.id} value={c.symbol}>${c.symbol}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={onOpenFullModal}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded-xl transition-colors flex items-center space-x-1 text-xs"
              >
                <BarChart2 className="w-4 h-4 text-[#17C99E]" />
                <span className="hidden sm:inline">Attach Chart</span>
              </button>

              <button
                type="button"
                onClick={onOpenFullModal}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded-xl transition-colors flex items-center space-x-1 text-xs"
              >
                <ListOrdered className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Poll</span>
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="flex items-center space-x-1.5 bg-[#17C99E] hover:bg-[#14B8A6] disabled:opacity-50 text-black font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow"
            >
              <span>Publish</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
