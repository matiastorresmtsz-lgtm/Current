'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  BookOpen,
  RefreshCw,
  Zap,
  ChevronDown,
  ChevronRight,
  Settings,
  Flame,
  GraduationCap,
  PieChart,
  Compass,
  Coins,
  Trophy
} from 'lucide-react';
import { NavTab } from '../types';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAddCryptoModal: () => void;
  onOpenSettingsModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab
}) => {
  const [topicsOpen, setTopicsOpen] = useState(true);

  const mainNavItems = [
    { id: 'portfolio', label: 'Portfolio', icon: RefreshCw, badge: null },
    { id: 'markets', label: 'Markets', icon: BarChart3, badge: null },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, badge: null },
    { id: 'learn', label: 'Learn', icon: BookOpen, badge: null },
    { id: 'insights', label: 'Insights', icon: Zap, badge: null },
    { id: 'about', label: 'About', icon: BookOpen, badge: null },
  ] as const;

  const topics = [
    { id: 'topic-etfs', name: 'ETFs & Inflows', icon: PieChart, color: 'text-purple-400', emoji: '🔮' },
    { id: 'topic-passive-income', name: 'Passive Income', icon: Flame, color: 'text-amber-400', emoji: '🔥' },
    { id: 'topic-beginner', name: 'Beginner Investors', icon: GraduationCap, color: 'text-emerald-400', emoji: '🌱' },
    { id: 'topic-memes', name: 'Memecoins', icon: Coins, color: 'text-pink-400', emoji: '🐕' },
    { id: 'topic-defi', name: 'DeFi & Infra', icon: Compass, color: 'text-zinc-400', emoji: '⚡' },
  ] as const;

  return (
    <aside className="w-60 shrink-0 hidden lg:block py-6 px-2 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto flex flex-col justify-between">
      <div className="space-y-6">

        {/* Primary Navigation Tabs */}
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as NavTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#212121] text-[#17C99E] font-extrabold shadow-sm border border-[#17C99E]/30'
                    : 'text-gray-300 hover:text-white hover:bg-[#212121]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#17C99E]' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-white text-black text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Collapsible Topics Section - Exact Blossom Screenshot Match */}
        <div className="space-y-2 pt-2 border-t border-[#2E2E2E]">
          <button
            onClick={() => setTopicsOpen(!topicsOpen)}
            className="w-full flex items-center justify-between px-3.5 py-1 text-xs font-bold text-gray-400 hover:text-white transition-colors"
          >
            <span className="flex items-center space-x-1.5">
              <span>Topics</span>
            </span>
            {topicsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5" >▶️</span>}
          </button>

          {topicsOpen && (
            <div className="space-y-1">
              {topics.map((t) => {
                const isActive = activeTab === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTab(t.id as NavTab)}
                    className={`flex items-center space-x-3 px-3.5 py-2 text-xs font-medium rounded-xl cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#17C99E]/20 text-[#17C99E] font-extrabold border border-[#17C99E]/40'
                        : 'text-gray-300 hover:text-white hover:bg-[#212121]'
                    }`}
                  >
                    <span className="text-sm">{t.emoji}</span>
                    <span>{t.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Settings Navigation Tab Button - Blossom Screenshot Match */}
      <div className="pt-4 border-t border-[#2E2E2E]">
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center space-x-3 px-3.5 py-2.5 text-xs font-semibold rounded-2xl transition-all ${
            activeTab === 'settings'
              ? 'bg-[#17C99E]/20 text-[#17C99E] font-extrabold border border-[#17C99E]/40 shadow'
              : 'text-gray-300 hover:text-white hover:bg-[#212121]'
          }`}
        >
          <span className={`w-4 h-4 ${activeTab === 'settings' ? 'text-[#17C99E]' : 'text-gray-400'}`} >⚙️</span>
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
