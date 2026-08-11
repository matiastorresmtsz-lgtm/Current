'use client';

import React, { useState } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Repeat2, 
  Bookmark, 
  ShieldCheck, 
  Send,
  CheckCircle2
} from 'lucide-react';
import { Post, CryptoCoin } from '../../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PostCardProps {
  post: Post;
  coins: CryptoCoin[];
  onOpenCoinModal: (coin: CryptoCoin) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  coins,
  onOpenCoinModal
}) => {
  const [likes, setLikes] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [reposts, setReposts] = useState(post.reposts);
  const [isReposted, setIsReposted] = useState(post.isReposted || false);
  const [bookmarks, setBookmarks] = useState(post.bookmarks);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentsList, setCommentsList] = useState(post.comments || []);
  const [pollData, setPollData] = useState(post.poll);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikes(l => l - 1);
      setIsLiked(false);
    } else {
      setLikes(l => l + 1);
      setIsLiked(true);
    }
  };

  const handleVote = (optionId: string) => {
    if (!pollData || pollData.userVotedOptionId) return;
    const updatedOptions = pollData.options.map(opt => 
      opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
    );
    setPollData({
      ...pollData,
      options: updatedOptions,
      totalVotes: pollData.totalVotes + 1,
      userVotedOptionId: optionId
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    const newC = {
      id: `c-${Date.now()}`,
      authorName: 'Matias Torres',
      authorHandle: 'matiastorressuarez',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      content: commentInput.trim(),
      timestamp: 'Just now',
      likes: 0
    };
    setCommentsList([newC, ...commentsList]);
    setCommentInput('');
  };

  const matchedCoin = post.ticker 
    ? coins.find(c => c.symbol.toUpperCase() === post.ticker?.toUpperCase()) 
    : null;

  return (
    <article className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-5 shadow-xl transition-all hover:border-[#383838]">
      
      {/* Header Info - Matching Screenshot */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-[#2E2E2E]"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-sm hover:underline cursor-pointer">{post.authorName}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#17C99E]" />
              <span className="text-xs text-gray-400">@{post.authorHandle}</span>
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              <span>{post.timestamp}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Ticker Badge */}
          {post.ticker && (
            <button
              onClick={() => matchedCoin && onOpenCoinModal(matchedCoin)}
              className="bg-[#161616] hover:bg-[#2A2A2A] border border-[#2E2E2E] px-2.5 py-1 rounded-xl text-xs font-bold transition-colors"
            >
              <span className="text-[#17C99E]">${post.ticker}</span>
              {post.tickerChange !== undefined && (
                <span className={`ml-1 ${post.tickerChange >= 0 ? 'text-[#17C99E]' : 'text-[#FF4D4D]'}`}>
                  {post.tickerChange >= 0 ? '+' : ''}{post.tickerChange}%
                </span>
              )}
            </button>
          )}

          {/* Follow Button */}
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm ${
              isFollowing
                ? 'bg-[#2A2A2A] text-gray-300 border border-[#2E2E2E]'
                : 'bg-[#17C99E] hover:bg-[#14B8A6] text-black'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>

      {/* Main Post Body */}
      <div className="mt-3.5 text-sm text-gray-200 leading-relaxed font-normal">
        {post.content}
      </div>

      {/* Verified Trade Card if attached */}
      {post.tradeProof && (
        <div className="mt-3.5 bg-[#161616] border border-[#17C99E]/30 rounded-2xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#17C99E]" />
              <span className="text-xs font-bold text-[#17C99E] uppercase tracking-wide">
                Verified Trade Proof
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">{post.tradeProof.timestamp}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-[#2E2E2E]">
            <div>
              <div className="text-[10px] text-gray-400">Action</div>
              <div className="font-bold text-[#17C99E]">{post.tradeProof.type} {post.tradeProof.symbol}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400">Amount</div>
              <div className="font-bold text-white">{post.tradeProof.amount} {post.tradeProof.symbol}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400">Price</div>
              <div className="font-bold text-white">${post.tradeProof.price.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400">Total Value</div>
              <div className="font-bold text-[#17C99E]">${post.tradeProof.totalValue.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Poll Attachment if present */}
      {pollData && (
        <div className="mt-3.5 bg-[#161616] border border-[#2E2E2E] rounded-2xl p-3.5">
          <div className="text-xs font-bold text-white mb-2.5">{pollData.question}</div>
          <div className="space-y-2">
            {pollData.options.map((option) => {
              const percentage = pollData.totalVotes > 0 
                ? Math.round((option.votes / pollData.totalVotes) * 100) 
                : 0;
              const isUserVoted = pollData.userVotedOptionId === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => handleVote(option.id)}
                  disabled={Boolean(pollData.userVotedOptionId)}
                  className={`w-full relative overflow-hidden text-left p-2.5 rounded-xl border transition-all ${
                    isUserVoted 
                      ? 'border-[#17C99E] bg-[#17C99E]/10' 
                      : 'border-[#2E2E2E] hover:border-gray-500 bg-[#212121]'
                  }`}
                >
                  {pollData.userVotedOptionId && (
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-[#17C99E]/20 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                  <div className="relative flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-200">{option.text}</span>
                    {pollData.userVotedOptionId && (
                      <span className="font-bold text-[#17C99E] font-mono">{percentage}%</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="mt-4 pt-3 border-t border-[#2E2E2E] flex items-center justify-between text-gray-400 text-xs">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1.5 hover:text-[#17C99E] transition-colors ${
            isLiked ? 'text-[#17C99E] font-bold' : ''
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#17C99E]' : ''}`} />
          <span>{likes}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1.5 hover:text-white transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{commentsList.length}</span>
        </button>

        <button
          onClick={() => setIsReposted(!isReposted)}
          className={`flex items-center space-x-1.5 hover:text-[#17C99E] transition-colors ${
            isReposted ? 'text-[#17C99E] font-bold' : ''
          }`}
        >
          <Repeat2 className="w-4 h-4" />
          <span>{reposts}</span>
        </button>

        <button
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`flex items-center space-x-1.5 hover:text-[#17C99E] transition-colors ${
            isBookmarked ? 'text-[#17C99E] font-bold' : ''
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#17C99E]' : ''}`} />
          <span>{bookmarks}</span>
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="mt-4 pt-3 border-t border-[#2E2E2E] space-y-3">
          <form onSubmit={handleAddComment} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Add your reply..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="flex-1 bg-[#161616] text-gray-200 placeholder-gray-500 px-3 py-2 rounded-xl border border-[#2E2E2E] focus:outline-none focus:border-[#17C99E] text-xs"
            />
            <button
              type="submit"
              className="bg-[#17C99E] hover:bg-[#14B8A6] text-black font-bold p-2 rounded-xl transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="space-y-2 max-h-56 overflow-y-auto">
            {commentsList.map((c) => (
              <div key={c.id} className="bg-[#161616] p-2.5 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{c.authorName}</span>
                  <span className="text-[10px] text-gray-500">{c.timestamp}</span>
                </div>
                <p className="text-gray-300">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </article>
  );
};
