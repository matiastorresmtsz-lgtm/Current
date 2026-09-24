'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Scale,
  Rocket,
  TrendingUp,
  Zap,
  Target,
  BarChart2,
  Shield,
  Wand2,
  Brain,
  FileText,
  Lightbulb,
  Bot,
  Compass,
  PieChart
} from 'lucide-react';
import { AIShortcut } from '../../types';

interface AIShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shortcut: Omit<AIShortcut, 'id'> & { id?: string }) => void;
  initialShortcut?: AIShortcut | null;
}

export const ICON_OPTIONS = [
  { id: 'Search', label: 'Search', icon: Search, emoji: '⌕' },
  { id: 'Scale', label: 'Rebalance', icon: Scale, emoji: '⚖️' },
  { id: 'Rocket', label: 'Rocket', icon: Rocket, emoji: '🚀' },
  { id: 'TrendingUp', label: 'Trending', icon: TrendingUp, emoji: '↗' },
  { id: 'Zap', label: 'Zap', icon: Zap, emoji: '⚡' },
  { id: 'Target', label: 'Target', icon: Target, emoji: '🎯' },
  { id: 'BarChart2', label: 'Chart', icon: BarChart2, emoji: '📊' },
  { id: 'Shield', label: 'Shield', icon: Shield, emoji: '🛡️' },
  { id: 'Wand2', label: 'Magic Wand', icon: Wand2, emoji: '🪄' },
  { id: 'Brain', label: 'Brain', icon: Brain, emoji: '🧠' },
  { id: 'FileText', label: 'Document', icon: FileText, emoji: '📄' },
  { id: 'Lightbulb', label: 'Insight', icon: Lightbulb, emoji: '💡' },
  { id: 'Bot', label: 'AI Bot', icon: Bot, emoji: '🤖' },
  { id: 'Compass', label: 'Explore', icon: Compass, emoji: '🧭' },
  { id: 'PieChart', label: 'Portfolio', icon: PieChart, emoji: '🥧' }
];

export const ShortcutIconRenderer: React.FC<{ iconName: string; className?: string }> = ({ iconName, className = "h-3.5 w-3.5" }) => {
  const found = ICON_OPTIONS.find((i) => i.id === iconName);
  if (found) {
    const IconComp = found.icon;
    return <IconComp className={className} />;
  }
  return <Brain className={className} />;
};

export const AIShortcutModal: React.FC<AIShortcutModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialShortcut
}) => {
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Search');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialShortcut) {
      setName(initialShortcut.name);
      setPrompt(initialShortcut.prompt);
      setSelectedIcon(initialShortcut.icon || 'Search');
    } else {
      setName('');
      setPrompt('');
      setSelectedIcon('Search');
    }
    setError(null);
  }, [initialShortcut, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a name for your shortcut.');
      return;
    }
    if (!prompt.trim()) {
      setError('Please enter a prompt for your shortcut.');
      return;
    }

    onSave({
      id: initialShortcut?.id,
      name: name.trim(),
      prompt: prompt.trim(),
      icon: selectedIcon,
      isBuiltIn: initialShortcut?.isBuiltIn,
      isCustomized: initialShortcut?.isBuiltIn ? true : undefined
    });

    onClose();
  };

  const isEditing = !!initialShortcut;
  const isBuiltIn = initialShortcut?.isBuiltIn;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl text-gray-900 space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#17C99E]" />
              {isBuiltIn ? 'Customize prompt' : isEditing ? 'Edit AI Shortcut' : 'Create AI Shortcut'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Saved prompts make running recurring portfolio & market queries instant.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weekly Portfolio Review"
              className="w-full bg-gray-50 border border-gray-200 focus:border-[#17C99E] rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none transition-all"
              autoFocus
            />
          </div>

          {/* Prompt Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Analyze my portfolio's biggest changes over the past 7 days and explain what caused them."
              rows={4}
              className="w-full bg-gray-50 border border-gray-200 focus:border-[#17C99E] rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Icon Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              Icon <span className="text-gray-400 font-normal">(Choose icon)</span>
            </label>
            <div className="grid grid-cols-5 gap-2 pt-1 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
              {ICON_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = selectedIcon === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedIcon(opt.id)}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#17C99E]/15 border-[#17C99E] text-[#17C99E] shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    title={opt.label}
                  >
                    <IconComponent className="w-3.5 h-3.5 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#17C99E] hover:bg-[#13A682] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              {isEditing ? 'Save Changes' : 'Create Shortcut'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
