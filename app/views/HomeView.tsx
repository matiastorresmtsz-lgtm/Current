'use client';

import React, { useState } from 'react';
import { FeedTab, Post, CryptoCoin, NewsItem } from '../types';
import { PostComposer } from '../components/Feed/PostComposer';
import { PostCard } from '../components/Feed/PostCard';
import { Sparkles, Users, Newspaper, ExternalLink, Clock } from 'lucide-react';

interface HomeViewProps {
  posts: Post[];
  news: NewsItem[];
  coins: CryptoCoin[];
  onAddPost: (post: Post) => void;
  onOpenComposeModal: () => void;
  onOpenCoinModal: (coin: CryptoCoin) => void;
  onOpenTradeModalWithTicker: (symbol: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  posts,
  news,
  coins,
  onAddPost,
  onOpenComposeModal,
  onOpenCoinModal,
  onOpenTradeModalWithTicker
}) => {
  const [activeFeedTab, setActiveFeedTab] = useState<FeedTab>('for-you');

  return (
    <div className="space-y-6">
      
      {/* Feed Sub-Tabs Header (Blossom Social feed navigation) */}
      <div className="flex items-center space-x-2 border-b border-[#2E2E2E] pb-2">
        <button
          onClick={() => setActiveFeedTab('for-you')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-2xl font-bold text-sm transition-all ${
            activeFeedTab === 'for-you'
              ? 'bg-[#17C99E] text-black shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-[#212121]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>For You</span>
        </button>

        <button
          onClick={() => setActiveFeedTab('following')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-2xl font-bold text-sm transition-all ${
            activeFeedTab === 'following'
              ? 'bg-[#17C99E] text-black shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-[#212121]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Following</span>
        </button>

        <button
          onClick={() => setActiveFeedTab('news')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-2xl font-bold text-sm transition-all ${
            activeFeedTab === 'news'
              ? 'bg-[#17C99E] text-black shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-[#212121]'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>Live News</span>
        </button>
      </div>

      {/* Main Feed Content */}
      {activeFeedTab === 'news' ? (
        <div className="space-y-4">
          {news.map((item) => (
            <div 
              key={item.id}
              className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-4 flex flex-col sm:flex-row gap-4 hover:border-[#17C99E]/40 transition-all group"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full sm:w-44 h-32 rounded-2xl object-cover"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="bg-[#17C99E]/10 text-[#17C99E] font-extrabold px-2 py-0.5 rounded-full border border-[#17C99E]/20">
                      {item.category}
                    </span>
                    <div className="flex items-center space-x-2 text-gray-400 text-[11px]">
                      <span>{item.source}</span>
                      <span>•</span>
                      <span>{item.timeAgo}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-[#17C99E] transition-colors leading-snug mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>{item.readTime}</span>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-[#17C99E] font-bold hover:underline"
                  >
                    <span>Read Story</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Post Composer */}
          <PostComposer
            coins={coins}
            onAddPost={onAddPost}
            onOpenFullModal={onOpenComposeModal}
          />

          {/* Social Feed List */}
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                coins={coins}
                onOpenCoinModal={onOpenCoinModal}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
