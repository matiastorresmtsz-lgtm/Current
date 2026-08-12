'use client';

import React, { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { User, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAppSettings, AVAILABLE_COUNTRIES } from '../context/AppSettingsContext';

export const SettingsView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'account' | 'display'>('account');
  const { theme, setTheme } = useTheme();
  const { country, setCountry } = useAppSettings();

  // Clerk Auth integration
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  // Profile Form state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || 'Matias Torres');
  const [username, setUsername] = useState(user?.username || 'matiastorres');
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || 'matiasttorres@gmail.com');
  const [bio, setBio] = useState('Crypto trader & long-term investor building my portfolio on Stream.');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingProfile(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">

      {/* Main Settings Grid - Matching Blossom Social Screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left / Center Column: Primary Settings Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Account Section Card */}
          <div id="account" className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-6 shadow-xl space-y-6">
            <h2 className="text-xl font-extrabold text-white">Account</h2>

            <div className="divide-y divide-[#2E2E2E]">

              {/* Edit Profile Item */}
              <div className="py-4 first:pt-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">✍️</span>
                      <h3 className="text-sm font-bold text-white">Edit Profile</h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Edit your profile picture, name, username, bio, external link, and your country / city badge.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="bg-[#2A2A2A] hover:bg-[#333333] text-white text-xs font-bold px-4 py-2 rounded-full border border-[#3A3A3A] transition-all shrink-0"
                  >
                    {isEditingProfile ? 'Close' : 'Edit'}
                  </button>
                </div>

                {/* Expanded Profile Form */}
                {isEditingProfile && (
                  <form onSubmit={handleSaveProfile} className="mt-4 p-4 bg-[#161616] rounded-2xl border border-[#2E2E2E] space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Full Name</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-[#212121] text-white text-xs p-2.5 rounded-xl border border-[#2E2E2E] focus:outline-none focus:border-[#17C99E]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Username</label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-[#212121] text-white text-xs p-2.5 rounded-xl border border-[#2E2E2E] focus:outline-none focus:border-[#17C99E]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Bio</label>
                      <textarea
                        rows={2}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-[#212121] text-white text-xs p-2.5 rounded-xl border border-[#2E2E2E] focus:outline-none focus:border-[#17C99E]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-[#17C99E] hover:bg-[#14B8A6] text-black font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow"
                    >
                      Save Profile Changes
                    </button>
                  </form>
                )}
              </div>

              {/* Change Password Item */}
              <div className="py-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">🔒</span>
                      <h3 className="text-sm font-bold text-white">Change Password</h3>
                    </div>
                    <div className="text-xs text-gray-400 font-mono tracking-widest pt-0.5">
                      ••••••••
                    </div>
                  </div>
                  <button
                    onClick={() => alert('Password reset link sent to your email!')}
                    className="bg-[#2A2A2A] hover:bg-[#333333] text-white text-xs font-bold px-4 py-2 rounded-full border border-[#3A3A3A] transition-all shrink-0"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Change Email Item */}
              <div className="py-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">✉️</span>
                      <h3 className="text-sm font-bold text-white">Change Email</h3>
                    </div>
                    <div className="text-xs text-gray-300 font-mono">
                      {email}
                    </div>
                  </div>
                  <button
                    onClick={() => alert('Manage email in Clerk account security setting')}
                    className="bg-[#2A2A2A] hover:bg-[#333333] text-white text-xs font-bold px-4 py-2 rounded-full border border-[#3A3A3A] transition-all shrink-0"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Regional Profile Badge */}
              <div className="py-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">🌐</span>
                      <h3 className="text-sm font-bold text-white">Profile Flag / Region</h3>
                    </div>
                    <p className="text-xs text-gray-400">
                      Select your flag icon displayed on the 1 Global International Leaderboard.
                    </p>
                  </div>
                  <div className="w-full max-w-[220px]">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value as any)}
                      className="w-full bg-[#212121] border border-[#2E2E2E] rounded-2xl px-4 py-3 text-sm text-white outline-none"
                    >
                      {AVAILABLE_COUNTRIES.map((option) => (
                        <option
                          key={option.code}
                          value={option.code}
                          className="bg-[#0B0E11] text-white"
                        >
                          {option.emoji} {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Log out Item */}
              <div className="py-4 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">🗑️</span>
                      <h3 className="text-sm font-bold text-white">Delete Account</h3>
                    </div>
                    <p className="text-xs text-gray-400">
                      This will permanently erase your account and cannot be undone
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to permanently delete your account?')) {
                        alert('Account deletion request submitted.');
                      }
                    }}
                    className="bg-transparent hover:bg-[#FF4D4D]/10 text-[#FF4D4D] text-xs font-bold px-5 py-2 rounded-full border border-[#FF4D4D]/40 transition-all shrink-0"
                  >
                    Delete
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Display Section Card - Matching Screenshot */}
          <div id="display" className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-6 shadow-xl space-y-5">
            <h2 className="text-xl font-extrabold text-white">Display</h2>

            <div>
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-base">🎨</span>
                <h3 className="text-sm font-bold text-white">Appearance</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setTheme('light')}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                    theme === 'light'
                      ? 'bg-white text-black border-[#17C99E] ring-2 ring-[#17C99E]'
                      : 'bg-[#161616] text-gray-400 border-[#2E2E2E] hover:border-gray-500'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-500">
                    <span className="w-6 h-6" >☀️</span>
                  </div>
                  <span className="text-xs font-extrabold">Light Mode</span>
                </div>

                <div
                  onClick={() => setTheme('dark')}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                    theme === 'dark'
                      ? 'bg-[#161616] text-white border-[#17C99E] ring-2 ring-[#17C99E] shadow-lg shadow-[#17C99E]/10'
                      : 'bg-[#161616] text-gray-400 border-[#2E2E2E] hover:border-gray-500'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                    <span className="w-6 h-6" >🌙</span>
                  </div>
                  <span className="text-xs font-extrabold">Dark Mode</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Sub-Navigation Sidebar (4 cols) - Matching Screenshot */}
        <div className="lg:col-span-4">
          <div className="sticky top-20 bg-[#212121] border border-[#2E2E2E] rounded-3xl p-4 shadow-xl space-y-2">
            <div className="px-3 py-2 text-xs font-extrabold text-gray-400 uppercase tracking-wider">
              Settings Navigation
            </div>

            {[
              { id: 'account', label: 'Account', icon: User },
              { id: 'display', label: 'Display', icon: Moon }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id as any);
                    const el = document.getElementById(item.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-[#161616] text-white border border-[#17C99E] shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#17C99E]' : 'text-gray-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <div className="w-2 h-2 rounded-full bg-[#17C99E]" />}
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
