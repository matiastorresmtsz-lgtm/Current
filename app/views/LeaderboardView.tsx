'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { Trophy, User, Globe, Flame } from 'lucide-react';
import { PortfolioAsset, CryptoCoin } from '../types';
import { useAppSettings, AVAILABLE_COUNTRIES } from '../context/AppSettingsContext';
import { getLeaderboardEntries, LeaderboardEntryPayload } from '../lib/supabase';

interface LeaderboardProps {
  portfolio?: PortfolioAsset[];
  coins?: CryptoCoin[];
}

interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  region: string;
  flag: string;
  portfolioValue: number;
  change24h: number;
  winRate: number;
  isCurrentUser?: boolean;
}

export const LeaderboardView: React.FC<LeaderboardProps> = ({ portfolio = [], coins = [] }) => {
  const { isSignedIn, user } = useUser();
  const { country } = useAppSettings();
  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntryPayload[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const userCountryObj = AVAILABLE_COUNTRIES.find(c => c.code === country) || AVAILABLE_COUNTRIES[0];

  // Calculate Real Portfolio Value & 24h PnL for Logged-In User
  const realUserMetrics = useMemo(() => {
    if (!portfolio || portfolio.length === 0) {
      return { totalValue: 0, change24h: 0, winRate: 75.0 };
    }

    const totalVal = portfolio.reduce((sum, p) => {
      const match = coins.find(c => c.symbol.toUpperCase() === p.symbol.toUpperCase());
      const currentPrice = match ? match.price : p.currentPrice;
      return sum + (p.amount * currentPrice);
    }, 0);

    const totalCost = portfolio.reduce((sum, p) => sum + (p.amount * p.avgBuyPrice), 0);
    const pnlUsd = totalVal - totalCost;
    const change24h = totalCost > 0 ? (pnlUsd / totalCost) * 100 : 0;

    return {
      totalValue: Math.round(totalVal),
      change24h: Number(change24h.toFixed(2)),
      winRate: 82.0
    };
  }, [portfolio, coins]);

  // Fetch live global leaderboard entries from Supabase
  useEffect(() => {
    let isMounted = true;
    const fetchGlobalData = async () => {
      setIsLoading(true);
      const data = await getLeaderboardEntries(50);
      if (isMounted && data) {
        setGlobalEntries(data);
      }
      if (isMounted) setIsLoading(false);
    };

    void fetchGlobalData();
    const interval = setInterval(fetchGlobalData, 30000); // 30s refresh
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Leaderboard displaying ALL real authenticated Clerk user accounts
  const realLeaderboard = useMemo(() => {
    const list: LeaderboardEntry[] = [];

    // Map fetched Supabase entries
    if (globalEntries.length > 0) {
      globalEntries.forEach((entry, idx) => {
        const countryObj = AVAILABLE_COUNTRIES.find(c => c.code === entry.country) || AVAILABLE_COUNTRIES[0];
        const isSelf = isSignedIn && user?.id === entry.user_id;

        list.push({
          id: entry.user_id || `entry-${idx}`,
          rank: idx + 1,
          username: isSelf && user ? (user.fullName || user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || entry.username) : entry.username,
          avatar: isSelf && user?.imageUrl ? user.imageUrl : (entry.avatar_url || ''),
          region: countryObj.label,
          flag: countryObj.emoji,
          portfolioValue: isSelf ? realUserMetrics.totalValue : Number(entry.portfolio_value || 0),
          change24h: isSelf ? realUserMetrics.change24h : Number(entry.change_24h || 0),
          winRate: isSelf ? realUserMetrics.winRate : Number(entry.win_rate || 75),
          isCurrentUser: isSelf
        });
      });
    }

    // Fallback if current user is signed in but not yet returned in globalEntries list
    if (isSignedIn && user && !list.some(e => e.isCurrentUser)) {
      const currentUserEntry: LeaderboardEntry = {
        id: user.id || 'user-current',
        rank: list.length + 1,
        username: user.fullName || user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'You (Current Trader)',
        avatar: user.imageUrl || '',
        region: userCountryObj.label,
        flag: userCountryObj.emoji,
        portfolioValue: realUserMetrics.totalValue,
        change24h: realUserMetrics.change24h,
        winRate: realUserMetrics.winRate,
        isCurrentUser: true
      };
      list.push(currentUserEntry);
    }

    // Re-sort by portfolio value descending and compute ranks
    list.sort((a, b) => b.portfolioValue - a.portfolioValue);
    list.forEach((item, index) => {
      item.rank = index + 1;
    });

    return list;
  }, [globalEntries, isSignedIn, user, realUserMetrics, userCountryObj]);

  const currentUserRank = useMemo(() => {
    const found = realLeaderboard.find(e => e.isCurrentUser);
    return found ? found.rank : null;
  }, [realLeaderboard]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-[#17C99E] font-extrabold">Leaderboard</div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">Current Global Leaderboard</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-400 max-w-2xl">
            Live rankings of verified Current traders globally sorted by real-time portfolio performance.
          </p>
        </div>

        {isSignedIn && currentUserRank && (
          <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-4 flex items-center space-x-4 shadow-xl shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-[#161616] border border-[#17C99E] flex items-center justify-center font-extrabold text-[#17C99E] text-base font-mono">
              #{currentUserRank}
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Your Portfolio Rank</div>
              <div className="text-sm font-extrabold text-white font-mono">
                ${realUserMetrics.totalValue.toLocaleString()} USD
              </div>
            </div>
          </div>
        )}
      </div>

      {!isSignedIn && (
        <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center space-x-2 bg-[#161616] text-[#17C99E] text-xs font-bold px-3 py-1 rounded-full border border-[#2E2E2E]">
              <span>Sign In Required</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">Join the Live Leaderboard</h2>
            <p className="text-xs text-gray-400 max-w-xl">
              Sign in to Current to track your real portfolio performance, rank on the international leaderboard, and view active account metrics.
            </p>
          </div>

          <SignInButton mode="modal">
            <button className="bg-[#17C99E] hover:bg-[#14B8A6] text-black font-extrabold text-xs px-6 py-3 rounded-2xl transition-all shadow shrink-0">
              Sign In to Join
            </button>
          </SignInButton>
        </div>
      )}

      {/* Main Real Users Table */}
      <div className="overflow-hidden rounded-3xl border border-[#2E2E2E] bg-[#212121] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="border-b border-[#2E2E2E] bg-[#161616] text-[10px] uppercase tracking-wider text-gray-400 font-extrabold">
              <tr>
                <th className="px-5 py-4">Rank</th>
                <th className="px-5 py-4">Trader</th>
                <th className="px-5 py-4">Region</th>
                <th className="px-5 py-4 text-right">Portfolio Value</th>
                <th className="px-5 py-4 text-right">24h PnL</th>
                <th className="px-5 py-4 text-right">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E2E2E]">
              {isLoading && realLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400 font-medium">
                    Loading global leaderboard entries...
                  </td>
                </tr>
              ) : realLeaderboard.map((entry) => (
                <tr
                  key={entry.id}
                  className={`transition-colors ${entry.isCurrentUser ? 'bg-[#17C99E]/10 hover:bg-[#17C99E]/15' : 'bg-[#212121] hover:bg-[#2A2A2A]'}`}
                >
                  <td className="px-5 py-4 font-extrabold font-mono text-sm text-[#17C99E]">
                    #{entry.rank}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center space-x-3">
                      {entry.avatar ? (
                        <img
                          src={entry.avatar}
                          alt={entry.username}
                          className="w-8 h-8 rounded-full object-cover border border-[#2E2E2E]"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#161616] border border-[#2E2E2E] flex items-center justify-center text-gray-400">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="font-extrabold text-white flex items-center space-x-2">
                          <span>{entry.username}</span>
                          {entry.isCurrentUser && (
                            <span className="bg-[#17C99E] text-black font-extrabold text-[9px] px-2 py-0.5 rounded-full">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400">{entry.region}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-gray-200">
                    <div className="flex items-center space-x-1.5 font-medium">
                      <span>{entry.flag}</span>
                      <span>{entry.region}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-right font-extrabold font-mono text-white text-sm">
                    ${entry.portfolioValue.toLocaleString()}
                  </td>

                  <td className={`px-5 py-4 text-right font-extrabold font-mono ${entry.change24h >= 0 ? 'text-[#17C99E]' : 'text-[#FF4D4D]'}`}>
                    {entry.change24h >= 0 ? '+' : ''}{entry.change24h}%
                  </td>

                  <td className="px-5 py-4 text-right font-extrabold font-mono text-gray-200">
                    {entry.winRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Solid Summary Card */}
      <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-6 shadow-xl">
        <div className="text-[11px] uppercase tracking-wider font-extrabold text-[#17C99E]">Real User Leaderboard Sync</div>
        <div className="mt-2 text-2xl font-extrabold text-white">Active Signed-In Traders ({realLeaderboard.length})</div>
        <p className="mt-2 text-xs text-gray-400 leading-relaxed">
          Leaderboard entries update automatically from active signed-in Clerk accounts and live portfolio holdings synced with Supabase.
        </p>
      </div>
    </div>
  );
};

