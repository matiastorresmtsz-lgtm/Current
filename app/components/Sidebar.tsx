'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home,
  Wand2,
  FileText,
  BarChart3,
  Info,
  Settings,
  Menu,
  X,
  ChevronRight,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainNavItems = [
    { id: 'portfolio', label: 'Portfolio', icon: Home },
    { id: 'advisory', label: 'AI Advisor', icon: Wand2 },
    { id: 'insights', label: 'Insights', icon: FileText },
    { id: 'markets', label: 'Markets', icon: BarChart3 },
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
      {/* Desktop Icon-Only Sidebar (lg and up) */}
      <aside className="w-16 shrink-0 hidden lg:flex py-5 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto flex-col items-center justify-between border-r border-gray-200 bg-white z-30">
        {/* Primary Navigation Icons */}
        <div className="flex flex-col items-center space-y-4 w-full px-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as NavTab)}
                title={item.label}
                aria-label={item.label}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#17C99E]/15 text-[#17C99E] border border-[#17C99E]/30 font-extrabold shadow-sm'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-6 h-6 stroke-[2]" />
              </button>
            );
          })}
        </div>

        {/* Secondary Navigation (About & Settings) */}
        <div className="flex flex-col items-center space-y-4 w-full px-2 pt-4 border-t border-gray-200">
          <button
            key="about"
            onClick={handleAboutClick}
            title="About"
            aria-label="About"
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              activeTab === 'about'
                ? 'bg-[#17C99E]/15 text-[#17C99E] border border-[#17C99E]/30 font-extrabold shadow-sm'
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Info className="w-6 h-6 stroke-[2]" />
          </button>

          <button
            key="settings"
            onClick={() => onSelectTab('settings')}
            title="Settings"
            aria-label="Settings"
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              activeTab === 'settings'
                ? 'bg-[#17C99E]/15 text-[#17C99E] border border-[#17C99E]/30 font-extrabold shadow-sm'
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-6 h-6 stroke-[2]" />
          </button>
        </div>
      </aside>

      {/* Mobile Persistent Bottom Navigation Bar (< lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-1.5 flex items-center justify-around shadow-md">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleMobileTabClick(item.id as NavTab)}
              className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${
                isActive ? 'text-[#17C99E]' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${
            mobileMenuOpen ? 'text-[#17C99E]' : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </div>

      {/* Mobile Navigation Slide-Over Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in flex flex-col justify-end">
          <div className="bg-white border-t border-gray-200 rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl">

            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-xl bg-[#17C99E] flex items-center justify-center text-white font-extrabold text-xs">
                  C
                </div>
                <span className="font-black text-gray-900 text-base tracking-wider uppercase">CURRENT MENU</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 border border-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Items in Drawer */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Main Navigation</div>
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileTabClick(item.id as NavTab)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-[#17C99E]/15 text-[#17C99E] border border-[#17C99E]/30'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={handleAboutClick}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === 'about'
                    ? 'bg-[#17C99E]/15 text-[#17C99E] border border-[#17C99E]/30'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Info className="w-5 h-5" />
                <span>About</span>
              </button>
            </div>

            {/* Settings & Profile Button in Drawer */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => handleMobileTabClick('settings')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'settings'
                    ? 'bg-[#17C99E] text-white'
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Settings className="w-4 h-4" />
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


