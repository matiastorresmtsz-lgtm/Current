'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { ArrowRight, BarChart3, BrainCircuit, Database, Radio, ShieldCheck, Users } from 'lucide-react';
import { NavTab, CryptoCoin, PortfolioAsset } from './types';
import { fetchTopCryptos } from './services/coingecko';
import { getUserPortfolio, isSupabaseConfigured, upsertPortfolioSnapshot } from './lib/supabase';
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

function LandingPage({ onSignUp, onSignIn }: { onSignUp: () => void; onSignIn: () => void }) {
  const productProof = [
    [Database, 'Your data has somewhere to go', 'Portfolio changes are stored locally for instant access and synced to your account when Supabase is connected.'],
    [BarChart3, 'The numbers keep moving', 'Current pulls market prices through a CoinGecko API proxy and refreshes the data in the background.'],
    [BrainCircuit, 'Analysis uses your context', 'Insights and advisory tools evaluate your actual allocation, cost basis, volatility, and concentration.'],
    [Users, 'Learning is part of the workflow', 'Follow topics, explore market narratives, and share a portfolio view instead of investing in isolation.'],
    [ShieldCheck, 'You stay in control', 'You can track positions without handing over exchange credentials or asking Current to trade for you.'],
    [Radio, 'It is built for repeated use', 'Goals, watchlists, notifications, and saved settings turn a visit into an ongoing investing habit.'],
  ] as const;

  return (
    <main className="min-h-screen overflow-hidden bg-[#111313] text-white">
      <section className="relative border-b border-white/10 px-6 pb-20 pt-8 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm font-bold tracking-[0.18em]"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#17C99E] text-sm text-[#111313]">C</span> CURRENT</div>
            <button onClick={onSignIn} className="text-sm font-semibold text-white/70 transition hover:text-white">Sign in</button>
          </nav>
          <div className="grid items-end gap-12 pb-4 pt-24 lg:grid-cols-[1.1fr_0.9fr] lg:pt-32">
            <div>
              <p className="mb-6 text-xs font-bold uppercase tracking-[0.28em] text-[#17C99E]">A working system for crypto decisions</p>
              <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-tight sm:text-7xl">Your portfolio is more than a screenshot.</h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-white/60">Current turns market data, your actual holdings, and useful context into one place to track what you own and make your next move with more clarity.</p>
              <div className="mt-10 flex flex-wrap items-center gap-4"><button onClick={onSignUp} className="inline-flex items-center gap-2 rounded-lg bg-[#17C99E] px-5 py-3 text-sm font-bold text-[#111313] transition hover:bg-[#5ee7c2]">Build your portfolio <ArrowRight className="h-4 w-4" /></button><span className="text-sm text-white/45">Free to use. No brokerage connection required.</span></div>
            </div>
            <div className="relative border-l border-t border-[#17C99E]/40 bg-[#191e1d] p-5 shadow-2xl shadow-[#17C99E]/5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs text-white/45"><span>PORTFOLIO / LIVE VIEW</span><span className="flex items-center gap-1.5 text-[#17C99E]"><Radio className="h-3 w-3" /> synced</span></div>
              <div className="py-8"><p className="text-xs text-white/45">Total value</p><p className="mt-2 text-4xl font-black">$24,680.42</p><p className="mt-2 text-sm text-[#17C99E]">+$1,248.18 <span className="text-white/40">today</span></p></div>
              <div className="flex h-20 items-end gap-1 border-b border-white/10 pb-2">{[28, 36, 30, 44, 40, 54, 49, 65, 58, 73, 68, 84, 78, 96].map((height, index) => <span key={index} className="flex-1 bg-[#17C99E]" style={{ height: `${height}%`, opacity: 0.35 + index / 25 }} />)}</div>
              <div className="grid grid-cols-3 gap-3 pt-5 text-xs"><div><span className="text-white/40">Holdings</span><strong className="mt-1 block text-white">8 assets</strong></div><div><span className="text-white/40">Allocation</span><strong className="mt-1 block text-white">Balanced</strong></div><div><span className="text-white/40">Data</span><strong className="mt-1 block text-white">Real-time</strong></div></div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-16">
        <div className="mb-12 max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.28em] text-[#17C99E]">Not just a UI</p><h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">The interface is the visible part. The product is what happens underneath.</h2></div>
        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3">{productProof.map(([Icon, title, description]) => <article key={title} className="bg-[#191e1d] p-7"><Icon className="h-5 w-5 text-[#17C99E]" /><h3 className="mt-8 text-lg font-bold">{title}</h3><p className="mt-3 text-sm leading-7 text-white/50">{description}</p></article>)}</div>
      </section>
      <section className="border-t border-white/10 bg-[#17C99E] px-6 py-14 text-[#111313] sm:px-10 lg:px-16"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.28em] opacity-60">Start with what you own</p><h2 className="mt-3 text-3xl font-black">Make the next decision less abstract.</h2></div><button onClick={onSignUp} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#111313] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#252c2a]">Create a free account <ArrowRight className="h-4 w-4" /></button></div></section>
    </main>
  );
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
    if (!isSignedIn && !tab.startsWith('topic-')) {
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
    if (!isSignedIn) {
      return;
    }

    const loadCoins = async () => {
      const result = await fetchTopCryptos();
      if (result.success && result.coins.length > 0) {
        setCoins(result.coins);
      }
    };

    loadCoins();
    const interval = setInterval(loadCoins, 60000); // 60s background sync
    return () => clearInterval(interval);
  }, [isSignedIn]);

  if (!isSignedIn) {
    return <LandingPage onSignUp={promptSignUp} onSignIn={() => openSignIn?.()} />;
  }

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

  const handleToggleTopicFollow = (topic: { id: string; name: string }) => {
    const isFollowing = watchlist.some(item => item.coinId === topic.id && item.type === 'topic');
    if (isFollowing) {
      handleRemoveFromWatchlist(topic.id);
      return;
    }

    const newTopic: WatchlistItem = {
      coinId: topic.id,
      symbol: topic.name,
      name: topic.name,
      icon: '',
      type: 'topic',
    };
    const updated = [...watchlist, newTopic];
    setWatchlist(updated);
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
    } catch { /* quota */ }
    addNotification({ title: 'Topic followed', message: `${topic.name} added to your watchlist.`, time: '' });
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

  // Metrics for portfolio and share modal
  const totalValue = pricedPortfolio.reduce((sum, item) => sum + (item.amount * item.currentPrice), 0);
  const totalCost = pricedPortfolio.reduce((sum, item) => sum + (item.amount * item.avgBuyPrice), 0);
  const totalPnlUsd = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnlUsd / totalCost) * 100 : 0;

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
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 flex-1 flex gap-5 pt-2 pb-24 lg:pb-16">

        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleTabSelect}
          onOpenAddCryptoModal={() => handleRequireAuthAction(() => setIsAddCryptoOpen(true))}
          onOpenSettingsModal={() => setIsSettingsOpen(true)}
        />

        {/* Center Main View Area */}
        <main className="flex-1 min-w-0 py-1">
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
              isFollowing={watchlist.some(item => item.coinId === activeTab && item.type === 'topic')}
              onToggleFollow={handleToggleTopicFollow}
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
