'use client';

import React from 'react';
import { Bookmark, Sparkles } from 'lucide-react';
import { Post, CryptoCoin } from '../types';
import { PostCard } from '../components/Feed/PostCard';

interface SavedPostsViewProps {
  posts: Post[];
  coins: CryptoCoin[];
  onOpenCoinModal: (coin: CryptoCoin) => void;
  onOpenTradeModalWithTicker: (symbol: string) => void;
}

export const SavedPostsView: React.FC<SavedPostsViewProps> = ({
  posts,
  coins,
  onOpenCoinModal,
  onOpenTradeModalWithTicker
}) => {
  const saved = posts.filter(p => p.bookmarks > 0 || p.isBookmarked);

  return (
    <div className="space-y-6">
      <div className="bg-[#14181D] border border-[#242B35] rounded-3xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF2E55]/10 border border-[#FF2E55]/30 flex items-center justify-center text-[#FF2E55]">
            <Bookmark className="w-5 h-5 fill-[#FF2E55]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Saved Posts & Research</h2>
            <p className="text-xs text-gray-400">Your bookmarked trade setups, charts, and analysis</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-[#FF2E55] bg-[#FF2E55]/10 px-3 py-1 rounded-full border border-[#FF2E55]/30">
          {saved.length} Bookmarks
        </span>
      </div>

      <div className="space-y-4">
        {saved.length > 0 ? (
          saved.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              coins={coins}
              onOpenCoinModal={onOpenCoinModal}
              onOpenTradeModalWithTicker={onOpenTradeModalWithTicker}
            />
          ))
        ) : (
          <div className="bg-[#14181D] border border-[#242B35] rounded-3xl p-12 text-center text-gray-400 space-y-3">
            <Bookmark className="w-12 h-12 mx-auto text-gray-600" />
            <h3 className="text-base font-bold text-white">No Saved Posts Yet</h3>
            <p className="text-xs max-w-sm mx-auto">
              Click the bookmark icon on any community post in your Home feed to save trade setups here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
