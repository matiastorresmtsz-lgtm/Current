'use client';

import React, { useState, useEffect } from 'react';
import { TopicNewsItem } from '../types';

interface TopicViewProps {
  topicId: string;
  isFollowing: boolean;
  onToggleFollow: (topic: { id: string; name: string }) => void;
}

const TOPIC_CONFIGS: Record<string, { title: string; subtitle: string; bannerGradient: string }> = {
  'topic-beginner': {
    title: 'Beginner Investors',
    subtitle: 'Educational guides, risk management strategies, and starter market insights.',
    bannerGradient: 'from-emerald-900/40 via-[#212121] to-[#161616]',
  },
  'topic-etfs': {
    title: 'ETFs & Institutional Flow',
    subtitle: 'Spot Bitcoin, Ethereum & Solana ETF inflows, asset management data, SEC regulatory developments.',
    bannerGradient: 'from-purple-900/40 via-[#212121] to-[#161616]',
  },
  'topic-passive-income': {
    title: 'Passive Income & Yield',
    subtitle: 'Native staking yields, liquid staking (LSTs), lending protocols, automated liquidity pool APRs.',
    bannerGradient: 'from-amber-900/40 via-[#212121] to-[#161616]',
  },
  'topic-memes': {
    title: 'Memecoins & Culture',
    subtitle: 'High velocity community tokens, viral momentum, volume surges across Solana, Base & Ethereum.',
    bannerGradient: 'from-pink-900/40 via-[#212121] to-[#161616]',
  },
  'topic-defi': {
    title: 'DeFi & Infrastructure',
    subtitle: 'Decentralized exchanges, cross-chain bridges, layer 2 scaling, real-world asset tokenization.',
    bannerGradient: 'from-zinc-800/40 via-[#212121] to-[#161616]',
  }
};

export const TopicView: React.FC<TopicViewProps> = ({
  topicId,
  isFollowing,
  onToggleFollow
}) => {
  const [news, setNews] = useState<TopicNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const config = TOPIC_CONFIGS[topicId] || TOPIC_CONFIGS['topic-beginner'];

  const loadTopicNews = async () => {
    setIsLoading(true);
    try {
      const topicParam = topicId.replace('topic-', '');
      const res = await fetch(`/api/coingecko/news?topic=${topicParam}`);
      if (!res.ok) throw new Error('Failed to load news');
      const data = await res.json();
      if (data.news && Array.isArray(data.news)) {
        setNews(data.news);
      }
    } catch (err) {
      console.error('Error fetching topic news:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTopicNews();
  }, [topicId]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">

      {/* Hero Header Banner */}
      <div className="bg-[#212121] p-6 sm:p-8 rounded-3xl border border-[#2E2E2E] shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {config.title}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              {config.subtitle}
            </p>

          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => loadTopicNews()}
              title="Refresh News Feed"
              className="p-2.5 rounded-2xl bg-[#161616] border border-[#2E2E2E] text-gray-400 hover:text-white hover:bg-[#2A2A2A] transition-colors"
            >
              Refresh
            </button>

            <button
              onClick={() => onToggleFollow({ id: topicId, name: config.title })}
              className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center space-x-1.5 shrink-0 ${
                isFollowing
                  ? 'bg-[#17C99E]/20 text-[#17C99E] border border-[#17C99E]/40'
                  : 'bg-[#17C99E] hover:bg-[#14B8A6] text-black shadow-lg shadow-[#17C99E]/20'
              }`}
            >
              {isFollowing ? 'Following Topic' : 'Follow Topic'}
            </button>
          </div>
        </div>
      </div>

      {/* Retrospective Updates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
            <span>Latest {config.title} Updates</span>
            <span className="bg-[#17C99E]/10 text-[#17C99E] text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-[#17C99E]/30">
              Live Updates
            </span>
          </h2>
          <span className="text-xs text-gray-400 font-medium">{news.length} {news.length === 1 ? 'Update' : 'Updates'}</span>
        </div>

        {isLoading ? (
          <div className="py-16 bg-[#212121] border border-[#2E2E2E] rounded-3xl flex flex-col items-center justify-center space-y-3">
            <span className="text-xs text-gray-400 font-medium">Fetching real-time updates...</span>
          </div>
        ) : news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {news.map((item) => (
              <div
                key={item.id}
                className="bg-[#212121] border border-[#2E2E2E] hover:border-[#17C99E]/50 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group transition-all"
              >
                {/* News Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
                      <span className="text-[#17C99E] font-bold uppercase tracking-wider">{item.source}</span>
                      <div className="flex items-center space-x-1">
                        <span>{item.publishedAt}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold text-white leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.tags.map((t) => (
                          <span
                            key={t}
                            className="bg-[#161616] text-gray-400 text-[10px] font-medium px-2 py-0.5 rounded-lg border border-[#2E2E2E]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Meta & Actions */}
                  <div className="pt-3 border-t border-[#2E2E2E] flex items-center justify-between">
                    <div className="flex items-center space-x-2 ml-auto">
                      <button
                        onClick={(e) => toggleBookmark(item.id, e)}
                        title={bookmarkedIds.has(item.id) ? 'Bookmarked' : 'Bookmark update'}
                        className={`rounded-xl border border-[#2E2E2E] px-3 py-2 text-[10px] font-bold transition-colors ${
                          bookmarkedIds.has(item.id)
                            ? 'bg-[#17C99E]/20 text-[#17C99E] border-[#17C99E]/40'
                            : 'bg-[#161616] text-gray-400 hover:text-white'
                        }`}
                      >
                        {bookmarkedIds.has(item.id) ? 'Bookmarked' : 'Bookmark'}
                      </button>

                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 bg-[#212121] border border-[#2E2E2E] rounded-3xl text-center text-gray-400 space-y-3">
            <p className="text-sm">No updates found for this topic right now.</p>
            <button
              onClick={() => loadTopicNews()}
              className="px-4 py-2 bg-[#17C99E] text-black font-bold text-xs rounded-xl hover:bg-[#14B8A6] transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
