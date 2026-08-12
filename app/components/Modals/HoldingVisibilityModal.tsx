'use client';

import React, { useState } from 'react';

interface HoldingVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPublic: boolean;
  onChangeVisibility: (isPublic: boolean) => void;
}

export const HoldingVisibilityModal: React.FC<HoldingVisibilityModalProps> = ({
  isOpen,
  onClose,
  isPublic,
  onChangeVisibility,
}) => {
  const [selected, setSelected] = useState<boolean>(isPublic);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onChangeVisibility(selected);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#2E2E2E]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
              <span className="w-5 h-5" >👁️</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Holding Visibility</h2>
              <p className="text-xs text-gray-400">Control who can see your portfolio</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#2A2A2A] transition-colors">
            <span className="w-5 h-5" >✕</span>
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* Current Status Badge */}
          <div className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl border ${
            selected
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30'
          }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${selected ? 'bg-emerald-400' : 'bg-[#8B5CF6]'}`} />
            <span className="text-xs font-bold text-white">
              Your portfolio is currently <span className={selected ? 'text-emerald-400' : 'text-[#8B5CF6]'}>{selected ? 'Public' : 'Private'}</span>
            </span>
          </div>

          {/* Option Cards */}
          <div className="grid grid-cols-2 gap-3">

            {/* Public Option */}
            <button
              onClick={() => setSelected(true)}
              className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all ${
                selected
                  ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10 scale-[1.02]'
                  : 'bg-[#212121] border-[#2E2E2E] hover:border-[#3E3E3E]'
              }`}
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 ${
                selected ? 'bg-emerald-500/20' : 'bg-[#2A2A2A]'
              }`}>
                <span className={`w-5 h-5 ${selected ? 'text-emerald-400' : 'text-gray-400'}`} >🌐</span>
              </div>
              <span className={`text-sm font-extrabold ${selected ? 'text-white' : 'text-gray-400'}`}>Public</span>
              <span className={`text-[10px] text-center mt-1.5 leading-tight ${selected ? 'text-emerald-400/80' : 'text-gray-500'}`}>
                Anyone can view your holdings & returns
              </span>
              {selected && (
                <span className="mt-2 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ✓ Active
                </span>
              )}
            </button>

            {/* Private Option */}
            <button
              onClick={() => setSelected(false)}
              className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all ${
                !selected
                  ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/50 shadow-lg shadow-[#8B5CF6]/10 scale-[1.02]'
                  : 'bg-[#212121] border-[#2E2E2E] hover:border-[#3E3E3E]'
              }`}
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 ${
                !selected ? 'bg-[#8B5CF6]/20' : 'bg-[#2A2A2A]'
              }`}>
                <span className={`w-5 h-5 ${!selected ? 'text-[#8B5CF6]' : 'text-gray-400'}`} >🔒</span>
              </div>
              <span className={`text-sm font-extrabold ${!selected ? 'text-white' : 'text-gray-400'}`}>Private</span>
              <span className={`text-[10px] text-center mt-1.5 leading-tight ${!selected ? 'text-[#8B5CF6]/80' : 'text-gray-500'}`}>
                Only you can see your portfolio details
              </span>
              {!selected && (
                <span className="mt-2 text-[10px] font-bold bg-[#8B5CF6]/20 text-[#8B5CF6] px-2 py-0.5 rounded-full border border-[#8B5CF6]/30">
                  ✓ Active
                </span>
              )}
            </button>
          </div>

          {/* Privacy Info */}
          <div className="flex items-start space-x-2.5 bg-[#161616] border border-[#2E2E2E] rounded-xl px-4 py-3">
            <span className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" >🛡️</span>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              {selected
                ? 'Your portfolio value, holdings, and returns are visible to other Stream users and the public shareable link.'
                : 'Your portfolio is hidden from public view. Only total value summaries are shown when sharing.'}
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`w-full py-3 font-extrabold rounded-xl transition-all shadow-md text-sm flex items-center justify-center space-x-2 ${
              saved
                ? 'bg-[#10B981] text-white'
                : selected
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                  : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'
            }`}
          >
            {saved ? (
              <span>✓ Saved!</span>
            ) : (
              <>
                {selected ? <span className="w-4 h-4">🌐</span> : <span className="w-4 h-4">👁️</span>}
                <span>Set Portfolio to {selected ? 'Public' : 'Private'}</span>
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
};
