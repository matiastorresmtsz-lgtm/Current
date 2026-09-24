'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { AIShortcut } from '../../types';

interface DeleteShortcutModalProps {
  isOpen: boolean;
  shortcut: AIShortcut | null;
  onClose: () => void;
  onConfirmDelete: (shortcutId: string) => void;
}

export const DeleteShortcutModal: React.FC<DeleteShortcutModalProps> = ({
  isOpen,
  shortcut,
  onClose,
  onConfirmDelete
}) => {
  if (!isOpen || !shortcut) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl text-gray-900 space-y-4"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Delete shortcut?</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                This will remove the shortcut from your AI toolbar.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Display shortcut preview */}
        <div className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 flex items-center gap-2">
          <span className="font-semibold text-gray-900">{shortcut.name}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(shortcut.id);
              onClose();
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
