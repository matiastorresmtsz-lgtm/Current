'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { useNotifications } from '../context/NotificationContext';
import { CryptoCoin, NavTab } from '../types';
import { searchCoinGecko } from '../services/coingecko';

interface NavbarProps {
  coins: CryptoCoin[];
  onOpenAddCryptoModal: () => void;
  onOpenCoinModal: (coin: CryptoCoin) => void;
  onSelectTab: (tab: NavTab) => void;
  onOpenShareModal: () => void;
  holdingsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  coins,
  onOpenAddCryptoModal,
  onOpenCoinModal,
  onSelectTab,
  onOpenShareModal,
  holdingsCount
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CryptoCoin[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, markAllRead, removeNotification } = useNotifications();
  const unreadNotifications = notifications.filter(n => n.unread).length;
  const { isSignedIn, user } = useUser();

  // Dynamic search across all 15,000+ cryptos on CoinGecko
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) return;

    const timer = setTimeout(async () => {
      const results = await searchCoinGecko(query);

      const mapped: CryptoCoin[] = results.map((r) => {
        const existing = coins.find(c => c.id === r.id);
        if (existing) return existing;
        return {
          id: r.id,
          symbol: r.symbol,
          name: r.name,
          rank: r.rank || 9999,
          price: 0,
          change24h: 0,
          volume24h: 0,
          marketCap: 0,
          high24h: 0,
          low24h: 0,
          ath: 0,
          circulatingSupply: 'N/A',
          category: 'other',
          icon: r.icon,
          sparkline: [0, 0],
          chartData1D: [],
          chartData7D: []
        };
      });

      setSearchResults(mapped);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, coins]);

  const localFiltered = searchQuery.trim() === '' ? [] : coins.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.rank && c.rank.toString() === searchQuery.replace('#', ''))
  );

  const existingIds = new Set(localFiltered.map(c => c.id));
  const extraRemote = searchResults.filter(r => !existingIds.has(r.id));
  const filteredCoins = [...localFiltered, ...extraRemote].slice(0, 12);

  // notifications come from NotificationContext

  const userDisplayName = user ? (user.fullName || user.username || 'Trader') : 'Matias Torres';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#161616] border-b border-[#2E2E2E]">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Brand Logo - Current River Logo */}
        <div onClick={() => onSelectTab('portfolio')} className="cursor-pointer shrink-0">
          <span className="font-extrabold text-2xl tracking-tight text-[#17C99E] transition-colors">
            current
          </span>
        </div>

        {/* Search Bar - Center Pill */}
        <div className="relative flex-1 max-w-lg hidden md:block">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Current (BTC, ETH, SOL...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full bg-[#242424] text-gray-100 placeholder-gray-400 pl-11 pr-9 py-2.5 rounded-lg border border-[#2E2E2E] focus:border-[#17C99E]/60 focus:outline-none text-sm transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <span className="w-4 h-4" >✕</span>
              </button>
            )}
          </div>

          {/* Autocomplete Search Dropdown */}
          {isSearchFocused && searchQuery.trim() !== '' && (
            <div className="absolute top-full left-0 right-0 mt-2 glass-dropdown rounded-2xl p-2 z-50">
              <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Cryptocurrency Tickers
              </div>
              {filteredCoins.length > 0 ? (
                filteredCoins.map((coin) => (
                  <div
                    key={coin.id}
                    onClick={() => {
                      onOpenCoinModal(coin);
                      setSearchQuery('');
                    }}
                    className="flex items-center justify-between p-2.5 hover:bg-[#2A2A2A] rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={coin.icon} alt={coin.name} className="w-7 h-7 rounded-full" />
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center space-x-1.5">
                          <span>{coin.name}</span>
                          <span className="text-xs text-gray-400 font-mono">${coin.symbol}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">
                        ${coin.price < 1 ? coin.price.toFixed(6) : coin.price.toLocaleString()}
                      </div>
                      <div className={`text-xs font-semibold ${coin.change24h >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-400">
                  No coins found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center space-x-3">

          {/* Add Holding Action Button (only for signed in users) */}
          {isSignedIn && (
            <button
              onClick={onOpenAddCryptoModal}
              className="flex items-center space-x-1.5 bg-[#17C99E] hover:bg-[#14B8A6] text-black font-extrabold px-3.5 py-2 rounded-lg text-xs transition-colors"
            >
              <span className="w-4 h-4 text-black" >➕</span>
              <span className="hidden sm:inline">Add Holding</span>
            </button>
          )}

          {/* Share Portfolio Button (only for signed in users) */}
          {isSignedIn && (
            <button
              onClick={onOpenShareModal}
              title="Share Portfolio"
              className="flex items-center space-x-1 bg-[#242424] hover:bg-[#2A2A2A] text-[#17C99E] border border-[#2E2E2E] px-3 py-2 rounded-lg text-xs font-bold transition-colors"
            >
              <span className="w-4 h-4" >📤</span>
              <span className="hidden sm:inline">Share</span>
            </button>
          )}

          {/* Notifications Bell (only for signed in users) */}
          {isSignedIn && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  markAllRead();
                }}
                title="Notifications"
                className="w-9 h-9 bg-[#242424] hover:bg-[#2A2A2A] text-gray-300 hover:text-white border border-[#2E2E2E] rounded-lg flex items-center justify-center transition-colors relative"
              >
                <span className="w-5 h-5" >🔔</span>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#17C99E] text-black text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-dropdown rounded-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-[#2E2E2E]">
                    <span className="font-bold text-white text-sm">Notifications</span>
                    <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-white">
                      <span className="w-4 h-4" >✕</span>
                    </button>
                  </div>
                  <div className="divide-y divide-[#2E2E2E] max-h-72 overflow-y-auto">
                    {notifications.length === 0 && (
                      <div className="p-4 text-sm text-gray-400">No notifications</div>
                    )}
                    {notifications.map((n) => (
                      <div key={n.id} className="py-3 px-1 hover:bg-[#242424] rounded-lg transition-colors">
                        <div className="flex items-center justify-between text-xs font-semibold text-[#17C99E]">
                          <span>{n.title}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] text-gray-400">{n.time}</span>
                            <button onClick={() => removeNotification(n.id)} className="text-gray-500 hover:text-white">✕</button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-300 mt-1 leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Clerk Auth Section */}
          {isSignedIn ? (
            <div className="flex items-center space-x-2.5 bg-[#242424] px-2.5 py-1.5 rounded-lg border border-[#2E2E2E]">
              <UserButton />
              <div className="text-left hidden lg:block pr-1">
                <div className="text-xs font-bold text-white leading-tight">{userDisplayName}</div>
                <div className="text-[10px] text-gray-400">{holdingsCount} Holdings</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <SignInButton mode="modal">
                <button className="text-xs font-bold text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-[#17C99E] hover:bg-[#14B8A6] text-black font-extrabold text-xs px-3.5 py-2 rounded-lg transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
