'use client';

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import {
  Trophy,
  User,
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Award,
  Flame,
  ShieldCheck,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { PortfolioAsset, CryptoCoin } from '../types';
import { useAppSettings, AVAILABLE_COUNTRIES, CountryCode } from '../context/AppSettingsContext';
import { getLeaderboardEntries, LeaderboardEntryPayload } from '../lib/supabase';

interface LeaderboardProps {
  portfolio?: PortfolioAsset[];
  coins?: CryptoCoin[];
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  region: string;
  countryCode: string;
  flag: string;
  portfolioValue: number;
  change24h: number;
  winRate: number;
  isCurrentUser?: boolean;
  updatedAt?: string;
}

type SortField = 'value' | 'change24h' | 'winRate';

export const LeaderboardView: React.FC<LeaderboardProps> = ({ portfolio = [], coins = [] }) => {
  const { isSignedIn, user } = useUser();
  const { country } = useAppSettings();

  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntryPayload[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('value');
  const [selectedTrader, setSelectedTrader] = useState<LeaderboardEntry | null>(null);

  const userCountryObj = AVAILABLE_COUNTRIES.find(c => c.code === country) || AVAILABLE_COUNTRIES[0];

  // Calculate Real Portfolio Value, Weighted 24h PnL & Win Rate for Logged-In User
  const realUserMetrics = useMemo(() => {
    if (!portfolio || portfolio.length === 0) {
      return { totalValue: 0, change24h: 0, winRate: 75.0 };
    }

    const totalVal = portfolio.reduce((sum, p) => {
      const match = coins.find(c => c.symbol.toUpperCase() === p.symbol.toUpperCase());
      const currentPrice = match ? match.price : (p.currentPrice || 0);
      return sum + (p.amount * currentPrice);
    }, 0);

    const totalCost = portfolio.reduce((sum, p) => sum + (p.amount * (p.avgBuyPrice || 0)), 0);

    // Weighted 24h change
    let change24h = 0;
    if (totalVal > 0) {
      const weightedSum = portfolio.reduce((sum, p) => {
        const match = coins.find(c => c.symbol.toUpperCase() === p.symbol.toUpperCase());
        const coinPrice = match ? match.price : (p.currentPrice || 0);
        const coin24h = match ? match.change24h : (p.change24h || 0);
        return sum + (p.amount * coinPrice * coin24h);
      }, 0);
      change24h = weightedSum / totalVal;
    }

    // Dynamic win rate based on profitable positions
    const profitable = portfolio.filter(p => {
      const match = coins.find(c => c.symbol.toUpperCase() === p.symbol.toUpperCase());
      const currentPrice = match ? match.price : (p.currentPrice || 0);
      return currentPrice >= p.avgBuyPrice;
    }).length;

    const winRate = portfolio.length > 0
      ? Number(((profitable / portfolio.length) * 100).toFixed(1))
      : 75.0;

    return {
      totalValue: Math.round(totalVal),
      change24h: Number(change24h.toFixed(2)),
      winRate: winRate
    };
  }, [portfolio, coins]);

  // Fetch global leaderboard from Supabase
  const fetchGlobalData = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const data = await getLeaderboardEntries(100);
      if (data) {
        setGlobalEntries(data);
        setLastSyncTime(new Date());
      }
    } catch (e) {
      console.error('Failed to fetch leaderboard:', e);
    } finally {
      setIsLoading(false);
      if (manual) setTimeout(() => setIsRefreshing(false), 400);
    }
  }, []);

  useEffect(() => {
    void fetchGlobalData();
    const interval = setInterval(() => {
      void fetchGlobalData();
    }, 15000); // 15s auto-refresh for live rankings

    // Listen for custom app events
    const handleUpdateEvent = () => void fetchGlobalData();
    window.addEventListener('current_leaderboard_updated', handleUpdateEvent);
    window.addEventListener('storage', handleUpdateEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('current_leaderboard_updated', handleUpdateEvent);
      window.removeEventListener('storage', handleUpdateEvent);
    };
  }, [fetchGlobalData]);

  // Build the complete combined list of live signed-in traders
  const fullLeaderboard = useMemo(() => {
    const list: LeaderboardEntry[] = [];
    const seenUserIds = new Set<string>();

    // Map fetched Supabase entries
    if (globalEntries.length > 0) {
      globalEntries.forEach((entry, idx) => {
        if (!entry.user_id) return;
        seenUserIds.add(entry.user_id);

        const countryCode = entry.country || 'US';
        const countryObj = AVAILABLE_COUNTRIES.find(c => c.code === countryCode) || AVAILABLE_COUNTRIES[0];
        const isSelf = Boolean(isSignedIn && user?.id && user.id === entry.user_id);

        // Prefer live user local details if this is the current active session
        const storedDisplayName = isSelf && typeof window !== 'undefined' ? localStorage.getItem('current_user_display_name') : null;
        const activeUsername = isSelf
          ? (storedDisplayName || user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || entry.username)
          : entry.username;

        list.push({
          id: entry.user_id,
          rank: idx + 1,
          username: activeUsername || 'Trader',
          avatar: isSelf && user?.imageUrl ? user.imageUrl : (entry.avatar_url || ''),
          region: countryObj.label,
          countryCode: countryObj.code,
          flag: countryObj.emoji,
          portfolioValue: isSelf ? realUserMetrics.totalValue : Number(entry.portfolio_value || 0),
          change24h: isSelf ? realUserMetrics.change24h : Number(entry.change_24h || 0),
          winRate: isSelf ? realUserMetrics.winRate : Number(entry.win_rate || 75),
          isCurrentUser: isSelf,
          updatedAt: entry.updated_at
        });
      });
    }

    // Ensure signed-in user is included even if database sync is in-flight
    if (isSignedIn && user?.id && !seenUserIds.has(user.id)) {
      const storedDisplayName = typeof window !== 'undefined' ? localStorage.getItem('current_user_display_name') : null;
      const currentUserEntry: LeaderboardEntry = {
        id: user.id,
        rank: list.length + 1,
        username: storedDisplayName || user.fullName || user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'You (Current Trader)',
        avatar: user.imageUrl || '',
        region: userCountryObj.label,
        countryCode: userCountryObj.code,
        flag: userCountryObj.emoji,
        portfolioValue: realUserMetrics.totalValue,
        change24h: realUserMetrics.change24h,
        winRate: realUserMetrics.winRate,
        isCurrentUser: true,
        updatedAt: new Date().toISOString()
      };
      list.push(currentUserEntry);
    }

    // Sort according to active sort field
    list.sort((a, b) => {
      if (sortField === 'value') {
        return b.portfolioValue - a.portfolioValue;
      } else if (sortField === 'change24h') {
        return b.change24h - a.change24h;
      } else {
        return b.winRate - a.winRate;
      }
    });

    // Re-compute absolute ranks
    list.forEach((item, index) => {
      item.rank = index + 1;
    });

    return list;
  }, [globalEntries, isSignedIn, user, realUserMetrics, userCountryObj, sortField]);

  // Filtered leaderboard based on search query & region filter
  const filteredLeaderboard = useMemo(() => {
    return fullLeaderboard.filter(entry => {
      const matchesSearch = searchQuery.trim() === '' ||
        entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.region.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRegion = selectedRegion === 'ALL' || entry.countryCode === selectedRegion;

      return matchesSearch && matchesRegion;
    });
  }, [fullLeaderboard, searchQuery, selectedRegion]);

  // Current user's rank and entry
  const currentUserEntry = useMemo(() => {
    return fullLeaderboard.find(e => e.isCurrentUser);
  }, [fullLeaderboard]);

  // Top 1 leader
  const topLeader = useMemo(() => {
    return fullLeaderboard.length > 0 ? fullLeaderboard[0] : null;
  }, [fullLeaderboard]);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Top Header & Live Sync Status */}



      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Card 1: Top Ranked Trader */}
        <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-yellow-400 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> Rank #1 Trader
            </span>
            <span className="text-xl">👑</span>
          </div>

          {topLeader ? (
            <div className="mt-4 flex items-center space-x-3">
              {topLeader.avatar ? (
                <img
                  src={topLeader.avatar}
                  alt={topLeader.username}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-yellow-400/40 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-[#161616] border border-yellow-400/40 flex items-center justify-center text-yellow-400 font-extrabold text-base shrink-0">
                  {topLeader.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-extrabold text-white truncate flex items-center gap-1.5">
                  <span>{topLeader.username}</span>
                  <span>{topLeader.flag}</span>
                </div>
                <div className="text-base font-extrabold font-mono text-[#17C99E]">
                  ${topLeader.portfolioValue.toLocaleString()} USD
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-xs text-gray-500">Loading top trader...</div>
          )}

          <div className="mt-4 pt-3 border-t border-[#2E2E2E] flex items-center justify-between text-[11px] text-gray-400 font-mono">
            <span>24h: <strong className={topLeader && topLeader.change24h >= 0 ? 'text-[#17C99E]' : 'text-[#FF4D4D]'}>{topLeader ? `${topLeader.change24h >= 0 ? '+' : ''}${topLeader.change24h}%` : '-'}</strong></span>
            <span>Win Rate: <strong className="text-white">{topLeader ? `${topLeader.winRate}%` : '-'}</strong></span>
          </div>
        </div>

        {/* Card 2: Total Active Traders */}
        <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#17C99E] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Signed-In Traders
            </span>
            <span className="text-xs font-mono font-bold text-gray-400">Global</span>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {fullLeaderboard.length}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Active accounts competing on the international live leaderboard.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#2E2E2E] flex items-center justify-between text-[11px] text-gray-400">
            <span>Sorted By</span>
            <span className="text-white font-bold uppercase text-[10px] bg-[#161616] px-2 py-0.5 rounded-md border border-[#2E2E2E]">
              {sortField === 'value' ? 'Portfolio Value' : sortField === 'change24h' ? '24h PnL' : 'Win Rate'}
            </span>
          </div>
        </div>

        {/* Card 3: Current User Status Card */}
        <div className={`rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all ${isSignedIn
          ? 'bg-[#212121] border-2 border-[#17C99E]/50 shadow-[#17C99E]/5'
          : 'bg-[#212121] border border-[#2E2E2E]'
          }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#17C99E] flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> Your Live Standing
            </span>
            {isSignedIn && currentUserEntry && (
              <span className="bg-[#17C99E] text-black font-extrabold text-[10px] px-2.5 py-0.5 rounded-full font-mono">
                RANK #{currentUserEntry.rank}
              </span>
            )}
          </div>

          {isSignedIn ? (
            <div className="mt-3">
              <div className="text-2xl font-extrabold font-mono text-white">
                ${realUserMetrics.totalValue.toLocaleString()} <span className="text-xs text-gray-400 font-sans">USD</span>
              </div>
              <div className="flex items-center space-x-3 mt-1.5 text-xs font-mono">
                <span className={`font-bold flex items-center gap-0.5 ${realUserMetrics.change24h >= 0 ? 'text-[#17C99E]' : 'text-[#FF4D4D]'}`}>
                  {realUserMetrics.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {realUserMetrics.change24h >= 0 ? '+' : ''}{realUserMetrics.change24h}%
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-300">Win Rate: <strong className="text-white">{realUserMetrics.winRate}%</strong></span>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-xs text-gray-400">
                Sign in to view your live rank and compete with traders globally.
              </p>
              <div className="mt-3">
                <SignInButton mode="modal">
                  <button className="w-full bg-[#17C99E] hover:bg-[#14B8A6] text-black font-extrabold text-xs py-2 rounded-xl transition-all shadow">
                    Sign In to Join
                  </button>
                </SignInButton>
              </div>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-[#2E2E2E] flex items-center justify-between text-[11px] text-gray-400">
            <span>Region: {userCountryObj.emoji} {userCountryObj.label}</span>
            {isSignedIn && <span className="text-[#17C99E] text-[10px] font-bold">Active Account</span>}
          </div>
        </div>

      </div>

      {/* Controls Bar: Search, Region Filter & Sort Tabs */}
      <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trader or region..."
            className="w-full bg-[#161616] text-white text-xs pl-9 pr-8 py-2.5 rounded-2xl border border-[#2E2E2E] focus:outline-none focus:border-[#17C99E] placeholder-gray-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Region & Sort Controls */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">

          {/* Region Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-gray-400 hidden sm:inline">Region:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-[#161616] text-white text-xs font-bold px-3 py-2 rounded-2xl border border-[#2E2E2E] focus:outline-none focus:border-[#17C99E]"
            >
              <option value="ALL">🌍 Global (All)</option>
              {AVAILABLE_COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Buttons */}
          <div className="bg-[#161616] p-1 rounded-2xl border border-[#2E2E2E] flex items-center space-x-1">
            <button
              onClick={() => setSortField('value')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${sortField === 'value'
                ? 'bg-[#17C99E] text-black shadow-sm'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              🏆 Value
            </button>
            <button
              onClick={() => setSortField('change24h')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${sortField === 'change24h'
                ? 'bg-[#17C99E] text-black shadow-sm'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              📈 24h PnL
            </button>
            <button
              onClick={() => setSortField('winRate')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${sortField === 'winRate'
                ? 'bg-[#17C99E] text-black shadow-sm'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              🎯 Win Rate
            </button>
          </div>

        </div>

      </div>

      {/* Main Leaderboard Table */}
      <div className="overflow-hidden rounded-3xl border border-[#2E2E2E] bg-[#212121] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="border-b border-[#2E2E2E] bg-[#161616] text-[10px] uppercase tracking-wider text-gray-400 font-extrabold">
              <tr>
                <th className="px-5 py-4 w-20">Rank</th>
                <th className="px-5 py-4">Trader</th>
                <th className="px-5 py-4">Region</th>
                <th className="px-5 py-4 text-right">Portfolio Value</th>
                <th className="px-5 py-4 text-right">24h PnL</th>
                <th className="px-5 py-4 text-right">Win Rate</th>
                <th className="px-4 py-4 w-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E2E2E]">
              {isLoading && filteredLeaderboard.length === 0 ? (
                // Skeleton loading rows
                [1, 2, 3, 4, 5].map((idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-5 py-4"><div className="w-8 h-4 bg-[#2A2A2A] rounded" /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[#2A2A2A]" />
                        <div className="space-y-1.5">
                          <div className="w-24 h-3 bg-[#2A2A2A] rounded" />
                          <div className="w-16 h-2 bg-[#2A2A2A] rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><div className="w-20 h-4 bg-[#2A2A2A] rounded" /></td>
                    <td className="px-5 py-4 text-right"><div className="w-24 h-4 bg-[#2A2A2A] rounded ml-auto" /></td>
                    <td className="px-5 py-4 text-right"><div className="w-16 h-4 bg-[#2A2A2A] rounded ml-auto" /></td>
                    <td className="px-5 py-4 text-right"><div className="w-12 h-4 bg-[#2A2A2A] rounded ml-auto" /></td>
                    <td className="px-4 py-4"><div className="w-4 h-4 bg-[#2A2A2A] rounded mx-auto" /></td>
                  </tr>
                ))
              ) : filteredLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="text-sm font-bold text-white">No traders match your criteria</p>
                      <p className="text-xs text-gray-500">Try clearing your search query or selecting a different country filter.</p>
                      <button
                        onClick={() => { setSearchQuery(''); setSelectedRegion('ALL'); }}
                        className="mt-2 text-xs text-[#17C99E] font-bold hover:underline"
                      >
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeaderboard.map((entry) => {
                  const isTop1 = entry.rank === 1;
                  const isTop2 = entry.rank === 2;
                  const isTop3 = entry.rank === 3;

                  return (
                    <tr
                      key={entry.id}
                      onClick={() => setSelectedTrader(entry)}
                      className={`cursor-pointer transition-colors group ${entry.isCurrentUser
                        ? 'bg-[#17C99E]/10 hover:bg-[#17C99E]/20'
                        : 'bg-[#212121] hover:bg-[#2A2A2A]'
                        }`}
                    >
                      {/* Rank Column */}
                      <td className="px-5 py-4">
                        {isTop1 ? (
                          <div className="w-8 h-8 rounded-full bg-yellow-400/20 text-yellow-400 border border-yellow-400/40 flex items-center justify-center font-extrabold text-sm font-mono shadow-sm">
                            🥇
                          </div>
                        ) : isTop2 ? (
                          <div className="w-8 h-8 rounded-full bg-gray-300/20 text-gray-200 border border-gray-300/40 flex items-center justify-center font-extrabold text-sm font-mono shadow-sm">
                            🥈
                          </div>
                        ) : isTop3 ? (
                          <div className="w-8 h-8 rounded-full bg-amber-700/20 text-amber-500 border border-amber-600/40 flex items-center justify-center font-extrabold text-sm font-mono shadow-sm">
                            🥉
                          </div>
                        ) : (
                          <span className={`font-extrabold font-mono text-sm ${entry.isCurrentUser ? 'text-[#17C99E]' : 'text-gray-400'}`}>
                            #{entry.rank}
                          </span>
                        )}
                      </td>

                      {/* Trader Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          {entry.avatar ? (
                            <img
                              src={entry.avatar}
                              alt={entry.username}
                              className="w-9 h-9 rounded-full object-cover border border-[#2E2E2E] shrink-0 group-hover:border-[#17C99E] transition-colors"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#161616] border border-[#2E2E2E] flex items-center justify-center text-gray-400 shrink-0 group-hover:border-[#17C99E] transition-colors font-bold text-xs">
                              {entry.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-extrabold text-white flex items-center space-x-2">
                              <span className="truncate">{entry.username}</span>
                              {entry.isCurrentUser && (
                                <span className="bg-[#17C99E] text-black font-extrabold text-[9px] px-2 py-0.5 rounded-full shrink-0">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-400 flex items-center gap-1">
                              <span>Verified Trader</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Region */}
                      <td className="px-5 py-4 text-gray-200">
                        <div className="flex items-center space-x-1.5 font-medium">
                          <span className="text-sm">{entry.flag}</span>
                          <span className="text-xs">{entry.region}</span>
                        </div>
                      </td>

                      {/* Portfolio Value */}
                      <td className="px-5 py-4 text-right font-extrabold font-mono text-white text-sm">
                        ${entry.portfolioValue.toLocaleString()} <span className="text-[10px] text-gray-500 font-sans">USD</span>
                      </td>

                      {/* 24h PnL */}
                      <td className="px-5 py-4 text-right">
                        <span className={`inline-flex items-center space-x-0.5 font-extrabold font-mono text-xs px-2.5 py-1 rounded-lg ${entry.change24h >= 0
                          ? 'bg-[#17C99E]/10 text-[#17C99E] border border-[#17C99E]/20'
                          : 'bg-[#FF4D4D]/10 text-[#FF4D4D] border border-[#FF4D4D]/20'
                          }`}>
                          {entry.change24h >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                          {entry.change24h >= 0 ? '+' : ''}{entry.change24h}%
                        </span>
                      </td>

                      {/* Win Rate */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center space-x-2">
                          <div className="w-16 h-1.5 bg-[#161616] rounded-full overflow-hidden border border-[#2E2E2E] hidden sm:block">
                            <div
                              className="h-full bg-[#17C99E] rounded-full"
                              style={{ width: `${Math.min(100, Math.max(0, entry.winRate))}%` }}
                            />
                          </div>
                          <span className="font-extrabold font-mono text-gray-200 text-xs">
                            {entry.winRate}%
                          </span>
                        </div>
                      </td>

                      {/* Action Icon */}
                      <td className="px-4 py-4 text-center text-gray-500 group-hover:text-[#17C99E] transition-colors">
                        <ChevronRight className="w-4 h-4 mx-auto" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trader Profile Preview Modal */}
      {selectedTrader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-scale-in relative">

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#17C99E]">Trader Profile</span>
                <span className="text-xs font-mono font-bold bg-[#161616] border border-[#2E2E2E] px-2.5 py-0.5 rounded-full text-white">
                  Rank #{selectedTrader.rank}
                </span>
              </div>
              <button
                onClick={() => setSelectedTrader(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#2A2A2A] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {selectedTrader.avatar ? (
                <img
                  src={selectedTrader.avatar}
                  alt={selectedTrader.username}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#17C99E]/40"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#161616] border border-[#2E2E2E] flex items-center justify-center text-xl font-extrabold text-[#17C99E]">
                  {selectedTrader.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>{selectedTrader.username}</span>
                  {selectedTrader.isCurrentUser && (
                    <span className="bg-[#17C99E] text-black font-extrabold text-[10px] px-2 py-0.5 rounded-full">YOU</span>
                  )}
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <span>{selectedTrader.flag}</span>
                  <span>{selectedTrader.region}</span>
                  <span>•</span>
                  <span className="text-[#17C99E]">Verified Member</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-[#161616] p-4 rounded-2xl border border-[#2E2E2E]">
              <div>
                <div className="text-[10px] uppercase font-bold text-gray-500">Portfolio</div>
                <div className="text-sm font-extrabold font-mono text-white mt-1">
                  ${selectedTrader.portfolioValue.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-gray-500">24h PnL</div>
                <div className={`text-sm font-extrabold font-mono mt-1 ${selectedTrader.change24h >= 0 ? 'text-[#17C99E]' : 'text-[#FF4D4D]'}`}>
                  {selectedTrader.change24h >= 0 ? '+' : ''}{selectedTrader.change24h}%
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-gray-500">Win Rate</div>
                <div className="text-sm font-extrabold font-mono text-white mt-1">
                  {selectedTrader.winRate}%
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-400 bg-[#1A1A1A] p-3 rounded-xl border border-[#2E2E2E]/60 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#17C99E] shrink-0 mt-0.5" />
              <span>
                Rankings are verified cryptographically and refreshed in real time across the Current global network.
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedTrader(null)}
                className="w-full bg-[#2A2A2A] hover:bg-[#333333] text-white text-xs font-extrabold py-3 rounded-2xl border border-[#3A3A3A] transition-colors"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer Info Banner */}


    </div>
  );
};
