'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { NavTab } from '../types';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAddCryptoModal?: () => void;
  onOpenSettingsModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab
}) => {
  const router = useRouter();
  const [topicsOpen, setTopicsOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainNavItems = [
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'markets', label: 'Markets' },
    { id: 'insights', label: 'Insights' },
    { id: 'advisory', label: 'AI Advisor' },
  ] as const;

  const aboutItem = { id: 'about', label: 'About' } as const;

  const topics = [
    { id: 'topic-etfs', name: 'ETFs & Inflows' },
    { id: 'topic-passive-income', name: 'Passive Income' },
    { id: 'topic-beginner', name: 'Beginner Investors' },
    { id: 'topic-memes', name: 'Memecoins' },
    { id: 'topic-defi', name: 'DeFi & Infra' },
  ] as const;

  const handleMobileTabClick = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const handleAboutClick = () => {
    router.push('/about');
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar (lg and up) */}
      <aside className="relative w-56 shrink-0 hidden lg:flex py-5 pr-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto flex-col border-r border-[#2E2E2E] justify-start bg-[#161616] before:absolute before:inset-y-0 before:right-full before:w-8 before:bg-[#161616]">
        {/* Primary Navigation Tabs */}
        <div className="space-y-0.5">
          {mainNavItems.slice(0, 5).map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as NavTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${isActive
                    ? 'bg-[#212121] text-[#17C99E] font-extrabold shadow-sm border border-[#17C99E]/30'
                    : 'text-gray-400 hover:text-white hover:bg-[#212121]'
                  }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mt-4" />

        {/* Collapsible Topics Section */}
        <div className="space-y-2 pt-5 border-t border-[#2E2E2E]">
          <button
            onClick={() => setTopicsOpen(!topicsOpen)}
            className="w-full flex items-center justify-between px-3.5 py-1 text-xs font-bold text-gray-400 hover:text-white transition-colors"
          >
            <span className="flex items-center space-x-1.5">
              <span>Topics</span>
            </span>
            {topicsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {topicsOpen && (
            <div className="space-y-1">
              {topics.map((t) => {
                const isActive = activeTab === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTab(t.id as NavTab)}
                    className={`flex items-center space-x-3 px-3.5 py-2 text-xs font-medium rounded-xl cursor-pointer transition-all ${isActive
                        ? 'bg-[#17C99E]/20 text-[#17C99E] font-extrabold border border-[#17C99E]/40'
                        : 'text-gray-300 hover:text-white hover:bg-[#212121]'
                      }`}
                  >
                    <span>{t.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="h-4" />

        {/* About Button */}
        <div className="pt-2 border-t border-[#2E2E2E]">
          {(() => {
            const isActive = activeTab === aboutItem.id;
            return (
              <button
                key={aboutItem.id}
                onClick={handleAboutClick}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${isActive
                    ? 'bg-[#212121] text-[#17C99E] font-extrabold shadow-sm border border-[#17C99E]/30'
                    : 'text-gray-300 hover:text-white hover:bg-[#212121]'
                  }`}
              >
                <span>{aboutItem.label}</span>
              </button>
            );
          })()}
        </div>

        {/* Spacer */}
        <div className="h-4" />

        {/* Settings Button */}
        <div className="pt-2 border-t border-[#2E2E2E]">
          <button
            onClick={() => onSelectTab('settings')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 text-xs font-semibold rounded-2xl transition-all ${activeTab === 'settings'
                ? 'bg-[#17C99E]/20 text-[#17C99E] font-extrabold border border-[#17C99E]/40 shadow'
                : 'text-gray-300 hover:text-white hover:bg-[#212121]'
              }`}
          >
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Mobile Persistent Bottom Navigation Bar (< lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#161616] border-t border-[#2E2E2E] px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => handleMobileTabClick('portfolio')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${activeTab === 'portfolio' ? 'text-[#17C99E]' : 'text-gray-400 hover:text-white'
            }`}
        >
          <span>Portfolio</span>
        </button>

        <button
          onClick={() => handleMobileTabClick('markets')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${activeTab === 'markets' ? 'text-[#17C99E]' : 'text-gray-400 hover:text-white'
            }`}
        >
          <span>Markets</span>
        </button>

        <button
          onClick={() => handleMobileTabClick('insights')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${activeTab === 'insights' ? 'text-[#17C99E]' : 'text-gray-400 hover:text-white'
            }`}
        >
          <span>Insights</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${mobileMenuOpen ? 'text-[#17C99E]' : 'text-gray-400 hover:text-white'
            }`}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </div>

      {/* Mobile Navigation Slide-Over Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 animate-fade-in flex flex-col justify-end">
          <div className="bg-[#161616] border-t border-[#2E2E2E] rounded-t-xl p-5 max-h-[85vh] overflow-y-auto space-y-5">

            <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-extrabold text-xs">
                  C
                </div>
                <span className="font-black text-white text-base tracking-wider uppercase">CURRENT MENU</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full bg-[#212121] text-gray-400 hover:text-white border border-[#2E2E2E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Items in Drawer */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Main Navigation</div>
              {mainNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileTabClick(item.id as NavTab)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${isActive
                        ? 'bg-[#212121] text-[#17C99E] border border-[#17C99E]/40'
                        : 'text-gray-300 hover:bg-[#212121]'
                      }`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Topics Items in Drawer */}
            <div className="space-y-1 pt-4 border-t border-[#2E2E2E]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Explore Topics</div>
              <div className="grid grid-cols-1 gap-1.5">
                {topics.map((t) => {
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleMobileTabClick(t.id as NavTab)}
                      className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${isActive
                          ? 'bg-[#17C99E]/20 text-[#17C99E] border border-[#17C99E]/40'
                          : 'text-gray-300 hover:bg-[#212121]'
                        }`}
                    >
                      <span>{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Settings & Profile Button in Drawer */}
            <div className="pt-4 border-t border-[#2E2E2E]">
              <button
                onClick={() => handleMobileTabClick('settings')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'settings'
                    ? 'bg-[#17C99E] text-black'
                    : 'bg-[#212121] text-gray-200 border border-[#2E2E2E]'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <span>Account & App Settings</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

