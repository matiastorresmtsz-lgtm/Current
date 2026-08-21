'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { NavTab, CryptoCoin, PortfolioAsset } from './types';
import { fetchTopCryptos } from './services/coingecko';
import { getUserPortfolio, isSupabaseConfigured, upsertLeaderboardEntry, upsertPortfolioSnapshot } from './lib/supabase';
import {
  INITIAL_COINS,
  INITIAL_PORTFOLIO,
  LEARN_COURSES,
  WHALE_TRANSACTIONS
} from './data/mockData';
import { useNotifications } from './context/NotificationContext';

// Component imports
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RightSidebar, WatchlistItem } from './components/RightSidebar';

// View imports
import { PortfolioView } from './views/PortfolioView';
import { MarketsView } from './views/MarketsView';
import { LeaderboardView } from './views/LeaderboardView';
import { LearnView } from './views/LearnView';
import { InsightsView } from './views/InsightsView';
import { AboutView } from './views/AboutView';
import { AdvisoryView } from './views/AdvisoryView';
import { SettingsView } from './views/SettingsView';
import { TopicView } from './views/TopicView';

// Modal imports
import { AddCryptoModal } from './components/Modals/AddCryptoModal';
import { AddCashCommoditiesModal } from './components/Modals/AddCashCommoditiesModal';
import { HoldingVisibilityModal } from './components/Modals/HoldingVisibilityModal';
import { CoinDetailModal } from './components/Modals/CoinDetailModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { SharePortfolioModal } from './components/Modals/SharePortfolioModal';
import { AddToWatchlistModal } from './components/Modals/AddToWatchlistModal';

const PORTFOLIO_STORAGE_KEY = 'current_crypto_portfolio_v1';
const WATCHLIST_STORAGE_KEY = 'current_crypto_watchlist_v1';

function readStoredPortfolio(): PortfolioAsset[] {
  if (typeof window === 'undefined') return INITIAL_PORTFOLIO;
  try {
    const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_PORTFOLIO;
  } catch {
    return INITIAL_PORTFOLIO;
  }
}

function readStoredWatchlist(): WatchlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const { isSignedIn, user } = useUser();
  const { openSignIn, openSignUp } = useClerk();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<NavTab>('portfolio');
  const [coins, setCoins] = useState<CryptoCoin[]>(INITIAL_COINS);
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>(readStoredPortfolio);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(readStoredWatchlist);

  // Auth Action Interceptor
  const promptSignUp = () => {
    if (openSignUp) {
      openSignUp();
      return;
    }
    if (openSignIn) {
      openSignIn();
      return;
    }
    alert('Please sign up to access this feature.');
  };

  const handleRequireAuthAction = (action: () => void) => {
    if (!isSignedIn) {
      promptSignUp();
      return;
    }
    action();
  };

  const handleTabSelect = (tab: NavTab) => {
    if (!isSignedIn) {
      promptSignUp();
      return;
    }
    setActiveTab(tab);
  };

  // Modals state
  const [isAddCryptoOpen, setIsAddCryptoOpen] = useState(false);
  const [isAddCommoditiesOpen, setIsAddCommoditiesOpen] = useState(false);
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);
  const [isPortfolioPublic, setIsPortfolioPublic] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedCoinDetail, setSelectedCoinDetail] = useState<CryptoCoin | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddToWatchlistOpen, setIsAddToWatchlistOpen] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !user?.id || !isSupabaseConfigured()) {
      return;
    }

    const loadRemotePortfolio = async () => {
      const remotePortfolio = await getUserPortfolio(user.id);
      if (remotePortfolio && remotePortfolio.length > 0) {
        setPortfolio(remotePortfolio);
        localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(remotePortfolio));
      }
    };

    void loadRemotePortfolio();
  }, [isSignedIn, user?.id]);

  // Save portfolio to LocalStorage and Supabase
  const updateAndSavePortfolio = async (newPortfolio: PortfolioAsset[]) => {
    setPortfolio(newPortfolio);
    try {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(newPortfolio));
    } catch {
      // quota fallback
    }

    if (!isSignedIn || !user?.id || !isSupabaseConfigured()) {
      return;
    }

    const totalValue = newPortfolio.reduce((sum, item) => sum + (item.amount * item.currentPrice), 0);
    const totalCost = newPortfolio.reduce((sum, item) => sum + (item.amount * item.avgBuyPrice), 0);
    const pnl = totalValue - totalCost;

    await upsertPortfolioSnapshot({
      user_id: user.id,
      holdings: newPortfolio,
      currency: 'USD',
      portfolio_value: totalValue,
      total_cost: totalCost,
      pnl,
      is_latest: true,
    });
  };

  const pricedPortfolio = useMemo(() => {
    return portfolio.map((asset) => {
      const match = coins.find((c) => c.symbol.toUpperCase() === asset.symbol.toUpperCase());
      if (match) {
        return {
          ...asset,
          currentPrice: match.price,
          change24h: match.change24h,
        };
      }
      return asset;
    });
  }, [portfolio, coins]);

  // Fetch top 500 real-time market cryptos from CoinGecko API proxy
  useEffect(() => {
    const loadCoins = async () => {
      const result = await fetchTopCryptos();
      if (result.success && result.coins.length > 0) {
        setCoins(result.coins);
      }
    };

    loadCoins();
    const interval = setInterval(loadCoins, 60000); // 60s background sync
    return () => clearInterval(interval);
  }, []);

  // Handlers for adding/removing portfolio holdings
  const handleAddHolding = (newAsset: PortfolioAsset) => {
    const existingIndex = portfolio.findIndex(p => p.symbol.toUpperCase() === newAsset.symbol.toUpperCase());
    let updated: PortfolioAsset[];

    if (existingIndex >= 0) {
      const existing = portfolio[existingIndex];
      const combinedAmount = existing.amount + newAsset.amount;
      const combinedCost = ((existing.amount * existing.avgBuyPrice) + (newAsset.amount * newAsset.avgBuyPrice)) / combinedAmount;

      updated = portfolio.map((item, idx) => idx === existingIndex ? {
        ...item,
        amount: combinedAmount,
        avgBuyPrice: combinedCost,
        currentPrice: newAsset.currentPrice,
        change24h: newAsset.change24h
      } : item);
    } else {
      updated = [...portfolio, newAsset];
    }

    void updateAndSavePortfolio(updated);

    try {
      const existing = portfolio.find(p => p.symbol.toUpperCase() === newAsset.symbol.toUpperCase());
      if (existing) {
        addNotification({ title: 'Holding updated', message: `Updated ${newAsset.symbol} holding.`, time: '' });
      } else {
        addNotification({ title: 'New holding added', message: `Added ${newAsset.symbol} to your portfolio.`, time: '' });
      }
    } catch (err) {
      // ignore notification errors
    }
  };

  const handleRemoveHolding = (coinId: string) => {
    const updated = portfolio.filter(p => p.coinId !== coinId);
    void updateAndSavePortfolio(updated);
  };

  // Watchlist handlers
  const handleAddToWatchlist = (coinId: string, coinData: { symbol: string; name: string; icon: string }) => {
    if (watchlist.some(w => w.coinId === coinId)) return;
    const newItem: WatchlistItem = {
      coinId,
      symbol: coinData.symbol,
      name: coinData.name,
      icon: coinData.icon,
    };
    const updated = [...watchlist, newItem];
    setWatchlist(updated);
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
    } catch { /* quota */ }
    addNotification({ title: 'Added to watchlist', message: `${coinData.symbol.toUpperCase()} added to your watchlist.`, time: '' });
  };

  const handleRemoveFromWatchlist = (coinId: string) => {
    const removed = watchlist.find(w => w.coinId === coinId);
    const updated = watchlist.filter(w => w.coinId !== coinId);
    setWatchlist(updated);
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
    } catch { /* quota */ }
    if (removed) {
      addNotification({ title: 'Removed from watchlist', message: `${removed.symbol.toUpperCase()} removed from your watchlist.`, time: '' });
    }
  };

  // Metrics for share modal and leaderboard sync
  const totalValue = pricedPortfolio.reduce((sum, item) => sum + (item.amount * item.currentPrice), 0);
  const totalCost = pricedPortfolio.reduce((sum, item) => sum + (item.amount * item.avgBuyPrice), 0);
  const totalPnlUsd = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnlUsd / totalCost) * 100 : 0;

  // Real weighted 24h PnL change
  const weighted24hChange = useMemo(() => {
    if (totalValue <= 0 || pricedPortfolio.length === 0) return 0;
    const weightedSum = pricedPortfolio.reduce((sum, item) => {
      const itemVal = item.amount * item.currentPrice;
      return sum + (itemVal * (item.change24h || 0));
    }, 0);
    return Number((weightedSum / totalValue).toFixed(2));
  }, [pricedPortfolio, totalValue]);

  // Dynamic Win Rate % based on profitable holdings
  const calculatedWinRate = useMemo(() => {
    if (pricedPortfolio.length === 0) return 75.0;
    const profitable = pricedPortfolio.filter(item => item.currentPrice >= item.avgBuyPrice).length;
    return Number(((profitable / pricedPortfolio.length) * 100).toFixed(1));
  }, [pricedPortfolio]);

  useEffect(() => {
    if (!isSignedIn || !user?.id || !isSupabaseConfigured()) {
      return;
    }

    const syncLeaderboard = async () => {
      const storedDisplayName = typeof window !== 'undefined' ? localStorage.getItem('current_user_display_name') : null;
      const storedUsername = typeof window !== 'undefined' ? localStorage.getItem('current_user_username') : null;
      const activeName = storedDisplayName || storedUsername || user.fullName || user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Current Trader';
      const storedCountry = (typeof window !== 'undefined' ? localStorage.getItem('current_user_country') : null) || 'US';

      await upsertLeaderboardEntry({
        user_id: user.id,
        username: activeName,
        avatar_url: user.imageUrl || null,
        country: storedCountry,
        portfolio_value: totalValue,
        change_24h: weighted24hChange,
        win_rate: calculatedWinRate,
        rank: 1,
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('current_leaderboard_updated'));
      }
    };

    void syncLeaderboard();
  }, [isSignedIn, user?.id, user?.fullName, user?.username, user?.imageUrl, totalValue, weighted24hChange, calculatedWinRate]);

  return (
    <div className="min-h-screen bg-[#161616] text-gray-100 flex flex-col font-sans selection:bg-[#17C99E] selection:text-black">

      {/* Top Navigation Navbar */}
      <Navbar
        coins={coins}
        onOpenAddCryptoModal={() => handleRequireAuthAction(() => setIsAddCryptoOpen(true))}
        onOpenCoinModal={(coin) => setSelectedCoinDetail(coin)}
        onSelectTab={handleTabSelect}
        onOpenShareModal={() => handleRequireAuthAction(() => setIsShareOpen(true))}
        holdingsCount={pricedPortfolio.length}
      />

      {/* Main Body Content Layout */}
      <div className="max-w-[1500px] w-full mx-auto px-3 sm:px-6 flex-1 flex gap-6 pt-3 pb-24 lg:pb-16">

        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleTabSelect}
          onOpenAddCryptoModal={() => handleRequireAuthAction(() => setIsAddCryptoOpen(true))}
          onOpenSettingsModal={() => setIsSettingsOpen(true)}
        />

        {/* Center Main View Area */}
        <main className="flex-1 min-w-0 py-3">
          {activeTab === 'portfolio' && (
            <PortfolioView
              portfolio={pricedPortfolio}
              coins={coins}
              onOpenAddCryptoModal={() => handleRequireAuthAction(() => setIsAddCryptoOpen(true))}
              onOpenAddCommoditiesModal={() => handleRequireAuthAction(() => setIsAddCommoditiesOpen(true))}
              onOpenVisibilityModal={() => handleRequireAuthAction(() => setIsVisibilityOpen(true))}
              onRemoveHolding={handleRemoveHolding}
              onOpenCoinModal={(coin) => setSelectedCoinDetail(coin)}
              onOpenShareModal={() => handleRequireAuthAction(() => setIsShareOpen(true))}
            />
          )}

          {activeTab === 'markets' && (
            <MarketsView
              coins={coins}
              onOpenCoinModal={(coin) => setSelectedCoinDetail(coin)}
              onOpenTradeModalWithTicker={() => handleRequireAuthAction(() => setIsAddCryptoOpen(true))}
            />
          )}

          {activeTab === 'learn' && (
            <LearnView
              courses={LEARN_COURSES}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardView
              portfolio={pricedPortfolio}
              coins={coins}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsView
              whales={WHALE_TRANSACTIONS}
              portfolio={pricedPortfolio}
              coins={coins}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}

          {activeTab === 'advisory' && (
            <AdvisoryView
              portfolio={pricedPortfolio}
              coins={coins}
              onSelectTab={handleTabSelect}
              onOpenAddCryptoModal={() => handleRequireAuthAction(() => setIsAddCryptoOpen(true))}
            />
          )}

          {activeTab === 'about' && (
            <AboutView />
          )}

          {activeTab.startsWith('topic-') && (
            <TopicView
              topicId={activeTab}
              coins={coins}
              onOpenCoinModal={(coin) => setSelectedCoinDetail(coin)}
            />
          )}
        </main>

        {/* Right Sidebar Widgets */}
        {activeTab !== 'settings' && isSignedIn && (
          <RightSidebar
            coins={coins}
            watchlist={watchlist}
            onOpenCoinModal={(coin) => setSelectedCoinDetail(coin)}
            onOpenAddToWatchlistModal={() => handleRequireAuthAction(() => setIsAddToWatchlistOpen(true))}
            onRemoveFromWatchlist={handleRemoveFromWatchlist}
          />
        )}

      </div>

      {/* Application Modals */}
      <AddCryptoModal
        isOpen={isAddCryptoOpen}
        onClose={() => setIsAddCryptoOpen(false)}
        coins={coins}
        onAddHolding={handleAddHolding}
      />

      <SharePortfolioModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        portfolio={pricedPortfolio}
        totalValue={totalValue}
        totalPnlPercent={totalPnlPercent}
      />

      <CoinDetailModal
        coin={selectedCoinDetail}
        onClose={() => setSelectedCoinDetail(null)}
        onOpenTradeModalWithTicker={() => handleRequireAuthAction(() => setIsAddCryptoOpen(true))}
      />

      <AddCashCommoditiesModal
        isOpen={isAddCommoditiesOpen}
        onClose={() => setIsAddCommoditiesOpen(false)}
        onAddHolding={handleAddHolding}
      />

      <HoldingVisibilityModal
        isOpen={isVisibilityOpen}
        onClose={() => setIsVisibilityOpen(false)}
        isPublic={isPortfolioPublic}
        onChangeVisibility={(val) => setIsPortfolioPublic(val)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <AddToWatchlistModal
        isOpen={isAddToWatchlistOpen}
        onClose={() => setIsAddToWatchlistOpen(false)}
        coins={coins}
        watchlistIds={watchlist.map(w => w.coinId)}
        onAddToWatchlist={handleAddToWatchlist}
      />

    </div>
  );
}
