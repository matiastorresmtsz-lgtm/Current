'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { NavTab, CryptoCoin, PortfolioAsset } from './types';
import { fetchTopCryptos } from './services/coingecko';
import {
  INITIAL_COINS,
  INITIAL_PORTFOLIO,
  LEARN_COURSES,
  WHALE_TRANSACTIONS
} from './data/mockData';

// Component imports
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';

// View imports
import { PortfolioView } from './views/PortfolioView';
import { MarketsView } from './views/MarketsView';
import { LeaderboardView } from './views/LeaderboardView';
import { LearnView } from './views/LearnView';
import { InsightsView } from './views/InsightsView';
import { SettingsView } from './views/SettingsView';
import { TopicView } from './views/TopicView';

// Modal imports
import { AddCryptoModal } from './components/Modals/AddCryptoModal';
import { AddCashCommoditiesModal } from './components/Modals/AddCashCommoditiesModal';
import { HoldingVisibilityModal } from './components/Modals/HoldingVisibilityModal';
import { CoinDetailModal } from './components/Modals/CoinDetailModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { SharePortfolioModal } from './components/Modals/SharePortfolioModal';

const PORTFOLIO_STORAGE_KEY = 'stream_crypto_portfolio_v1';

function readStoredPortfolio(): PortfolioAsset[] {
  if (typeof window === 'undefined') return INITIAL_PORTFOLIO;
  try {
    const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_PORTFOLIO;
  } catch {
    return INITIAL_PORTFOLIO;
  }
}

export default function Home() {
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  const [activeTab, setActiveTab] = useState<NavTab>('portfolio');
  const [coins, setCoins] = useState<CryptoCoin[]>(INITIAL_COINS);
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>(readStoredPortfolio);

  // Auth Action Interceptor
  const handleRequireAuthAction = (action: () => void) => {
    if (!isSignedIn) {
      if (openSignIn) {
        openSignIn();
      } else {
        alert('Please sign in to add portfolio assets or access active trading features.');
      }
      return;
    }
    action();
  };

  // Modals state
  const [isAddCryptoOpen, setIsAddCryptoOpen] = useState(false);
  const [isAddCommoditiesOpen, setIsAddCommoditiesOpen] = useState(false);
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);
  const [isPortfolioPublic, setIsPortfolioPublic] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedCoinDetail, setSelectedCoinDetail] = useState<CryptoCoin | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Save portfolio to LocalStorage
  const updateAndSavePortfolio = (newPortfolio: PortfolioAsset[]) => {
    setPortfolio(newPortfolio);
    try {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(newPortfolio));
    } catch {
      // quota fallback
    }
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

    updateAndSavePortfolio(updated);
  };

  const handleRemoveHolding = (coinId: string) => {
    const updated = portfolio.filter(p => p.coinId !== coinId);
    updateAndSavePortfolio(updated);
  };

  // Metrics for share modal
  const totalValue = pricedPortfolio.reduce((sum, item) => sum + (item.amount * item.currentPrice), 0);
  const totalCost = pricedPortfolio.reduce((sum, item) => sum + (item.amount * item.avgBuyPrice), 0);
  const totalPnlUsd = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnlUsd / totalCost) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#161616] text-gray-100 flex flex-col font-sans selection:bg-[#00F0FF] selection:text-black">

      {/* Top Navigation Navbar */}
      <Navbar
        coins={coins}
        onOpenAddCryptoModal={() => handleRequireAuthAction(() => setIsAddCryptoOpen(true))}
        onOpenCoinModal={(coin) => setSelectedCoinDetail(coin)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenShareModal={() => setIsShareOpen(true)}
        holdingsCount={pricedPortfolio.length}
      />

      {/* Main Body Content Layout */}
      <div className="max-w-[1500px] w-full mx-auto px-3 sm:px-6 flex-1 flex gap-6 pt-3 pb-16">

        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
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
              onOpenVisibilityModal={() => setIsVisibilityOpen(true)}
              onRemoveHolding={handleRemoveHolding}
              onOpenCoinModal={(coin) => setSelectedCoinDetail(coin)}
              onOpenShareModal={() => setIsShareOpen(true)}
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

          {activeTab.startsWith('topic-') && (
            <TopicView
              topicId={activeTab}
              coins={coins}
              onOpenCoinModal={(coin) => setSelectedCoinDetail(coin)}
            />
          )}
        </main>

        {/* Right Sidebar Widgets */}
        {activeTab !== 'settings' && (
          <RightSidebar
            coins={coins}
            onOpenCoinModal={(coin) => setSelectedCoinDetail(coin)}
            onOpenAddCryptoModal={() => setIsAddCryptoOpen(true)}
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
        onOpenTradeModalWithTicker={() => setIsAddCryptoOpen(true)}
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

    </div>
  );
}
