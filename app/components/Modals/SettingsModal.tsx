'use client';

import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [handle, setHandle] = useState('matiastorressuarez');
  const [name, setName] = useState('Matias Torres');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#14181D] border border-[#242B35] rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#242B35]">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 text-[#FF2E55]" >⚙️</span>
            <h2 className="text-lg font-bold text-white">Current Platform Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1B2028]"
          >
            <span className="w-5 h-5" >✕</span>
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex space-x-2 border-b border-[#242B35] mt-4 pb-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-[#FF2E55] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'notifications'
                ? 'bg-[#FF2E55] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'security'
                ? 'bg-[#FF2E55] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Security & Wallet
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4">
          {activeTab === 'profile' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0B0E11] text-white text-xs p-2.5 rounded-xl border border-[#242B35] focus:outline-none focus:border-[#FF2E55]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Username Handle</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">@</span>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full bg-[#0B0E11] text-white text-xs p-2.5 pl-7 rounded-xl border border-[#242B35] focus:outline-none focus:border-[#FF2E55]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Trader Bio</label>
                <textarea
                  rows={3}
                  defaultValue="Crypto analyst & swing trader focusing on Solana & Layer 1 momentum trades."
                  className="w-full bg-[#0B0E11] text-white text-xs p-2.5 rounded-xl border border-[#242B35] focus:outline-none focus:border-[#FF2E55]"
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-[#0B0E11] rounded-xl border border-[#242B35]">
                <div>
                  <div className="font-bold text-white">Price Volatility Alerts</div>
                  <div className="text-gray-400 text-[11px]">Notify on 5%+ price moves in watchlist</div>
                </div>
                <input type="checkbox" defaultChecked className="accent-[#FF2E55] w-4 h-4" />
              </div>

              <div className="flex items-center justify-between p-3 bg-[#0B0E11] rounded-xl border border-[#242B35]">
                <div>
                  <div className="font-bold text-white">Whale Activity Alerts</div>
                  <div className="text-gray-400 text-[11px]">Notify when &gt;$10M moves from exchanges</div>
                </div>
                <input type="checkbox" defaultChecked className="accent-[#FF2E55] w-4 h-4" />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#0B0E11] rounded-xl border border-[#242B35] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center space-x-1.5">
                    <span className="w-4 h-4 text-[#00D293]" >🛡️</span>
                    <span>Two-Factor Authentication (2FA)</span>
                  </div>
                  <div className="text-gray-400 text-[11px]">Enabled via Authenticator App</div>
                </div>
                <span className="bg-[#00D293]/10 text-[#00D293] font-bold px-2 py-0.5 rounded">ACTIVE</span>
              </div>

              <div className="p-3 bg-[#0B0E11] rounded-xl border border-[#242B35] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center space-x-1.5">
                    <span className="w-4 h-4 text-[#FF2E55]" >👛</span>
                    <span>Simulated Paper Account</span>
                  </div>
                  <div className="text-gray-400 text-[11px]">Balance: $50,000.00 USD</div>
                </div>
                <button className="bg-[#1B2028] hover:bg-[#242B35] text-xs font-bold text-white px-2.5 py-1 rounded-lg transition-colors">
                  Reset Balance
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer save */}
        <div className="pt-3 border-t border-[#242B35] flex items-center justify-between">
          {savedSuccess ? (
            <span className="text-xs font-bold text-[#00D293] flex items-center space-x-1">
              <span className="w-4 h-4" >✅</span>
              <span>Settings Saved!</span>
            </span>
          ) : <span />}

          <button
            onClick={handleSave}
            className="bg-[#FF2E55] hover:bg-[#E02447] text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-md shadow-[#FF2E55]/20"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};
