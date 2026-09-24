'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  MessageSquare,
  Search,
  Settings,
  MoreHorizontal,
  Edit3,
  Trash2,
  ChevronLeft,
  X,
  Check
} from 'lucide-react';
import { AIThread } from '../types';
import { createPortal } from 'react-dom';

interface AIChatSidebarProps {
  isOpen: boolean;
  onToggleClose: () => void;
  threads: AIThread[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onNewChat: () => void;
  onRenameThread: (threadId: string, newTitle: string) => void;
  onDeleteThread: (threadId: string) => void;
  onOpenSettings?: () => void;
}

export const AIChatSidebar: React.FC<AIChatSidebarProps> = ({
  isOpen,
  onToggleClose,
  threads,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onRenameThread,
  onDeleteThread,
  onOpenSettings
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuRect, setMenuRect] = useState<{ top: number; left: number } | null>(null);

  // Filter threads by search query
  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threads;
    const q = searchQuery.toLowerCase();
    return threads.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.messages.some((m) => m.text.toLowerCase().includes(q))
    );
  }, [threads, searchQuery]);

  // Group threads by date
  const groupedThreads = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const startOf7DaysAgo = startOfToday - 6 * 24 * 60 * 60 * 1000;

    const groups: {
      today: AIThread[];
      yesterday: AIThread[];
      last7Days: AIThread[];
      older: AIThread[];
    } = {
      today: [],
      yesterday: [],
      last7Days: [],
      older: []
    };

    // Sort threads descending by updatedAt / createdAt
    const sorted = [...filteredThreads].sort(
      (a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)
    );

    sorted.forEach((thread) => {
      const time = thread.updatedAt || thread.createdAt;
      if (time >= startOfToday) {
        groups.today.push(thread);
      } else if (time >= startOfYesterday) {
        groups.yesterday.push(thread);
      } else if (time >= startOf7DaysAgo) {
        groups.last7Days.push(thread);
      } else {
        groups.older.push(thread);
      }
    });

    return groups;
  }, [filteredThreads]);

  const handleStartRename = (thread: AIThread) => {
    setEditingThreadId(thread.id);
    setEditTitleInput(thread.title);
    setActiveMenuId(null);
  };

  const handleSaveRename = (threadId: string) => {
    if (editTitleInput.trim()) {
      onRenameThread(threadId, editTitleInput.trim());
    }
    setEditingThreadId(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Sidebar Mobile Backdrop Overlay */}
      <div
        onClick={onToggleClose}
        className="md:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-xs animate-fade-in"
      />

      {/* Main Sidebar Container */}
      <aside className="w-64 md:w-60 lg:w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full shrink-0 z-30 select-none animate-fade-in text-gray-700">
        {/* Top Header */}
        <div className="px-4 py-3.5 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center">
            <span className="font-extrabold text-xl tracking-tight text-[#17C99E]">
              current
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors cursor-pointer"
            title="Collapse sidebar (‹)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              setActiveMenuId(null);
            }}
            className="w-full bg-[#17C99E] hover:bg-[#13A682] text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Section Header */}
        <div className="px-4 pt-1 pb-1 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
            Recent
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            {filteredThreads.length}
          </span>
        </div>

        {/* Scrollable Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-3 scrollbar-thin">
          {filteredThreads.length === 0 ? (
            /* Empty State */
            <div className="py-10 px-3 text-center space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto text-gray-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-900">No conversations yet</p>
                <p className="text-[10px] text-gray-500 leading-relaxed px-2">
                  Start a new conversation to research your portfolio.
                </p>
              </div>
              <button
                type="button"
                onClick={onNewChat}
                className="px-3.5 py-1.5 bg-white hover:bg-gray-50 text-[#17C99E] rounded-xl text-[11px] font-bold border border-gray-200 hover:border-[#17C99E]/30 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Chat</span>
              </button>
            </div>
          ) : (
            <>
              {/* Group: Today */}
              {groupedThreads.today.length > 0 && (
                <ThreadGroupSection
                  label="Today"
                  threads={groupedThreads.today}
                  activeThreadId={activeThreadId}
                  editingThreadId={editingThreadId}
                  editTitleInput={editTitleInput}
                  setEditTitleInput={setEditTitleInput}
                  onSelectThread={onSelectThread}
                  onSaveRename={handleSaveRename}
                  onStartRename={handleStartRename}
                  onDeleteThread={onDeleteThread}
                  activeMenuId={activeMenuId}
                  setActiveMenuId={setActiveMenuId}
                  setMenuRect={setMenuRect}
                />
              )}

              {/* Group: Yesterday */}
              {groupedThreads.yesterday.length > 0 && (
                <ThreadGroupSection
                  label="Yesterday"
                  threads={groupedThreads.yesterday}
                  activeThreadId={activeThreadId}
                  editingThreadId={editingThreadId}
                  editTitleInput={editTitleInput}
                  setEditTitleInput={setEditTitleInput}
                  onSelectThread={onSelectThread}
                  onSaveRename={handleSaveRename}
                  onStartRename={handleStartRename}
                  onDeleteThread={onDeleteThread}
                  activeMenuId={activeMenuId}
                  setActiveMenuId={setActiveMenuId}
                  setMenuRect={setMenuRect}
                />
              )}

              {/* Group: Previous 7 Days */}
              {groupedThreads.last7Days.length > 0 && (
                <ThreadGroupSection
                  label="Previous 7 Days"
                  threads={groupedThreads.last7Days}
                  activeThreadId={activeThreadId}
                  editingThreadId={editingThreadId}
                  editTitleInput={editTitleInput}
                  setEditTitleInput={setEditTitleInput}
                  onSelectThread={onSelectThread}
                  onSaveRename={handleSaveRename}
                  onStartRename={handleStartRename}
                  onDeleteThread={onDeleteThread}
                  activeMenuId={activeMenuId}
                  setActiveMenuId={setActiveMenuId}
                  setMenuRect={setMenuRect}
                />
              )}

              {/* Group: Older */}
              {groupedThreads.older.length > 0 && (
                <ThreadGroupSection
                  label="Older"
                  threads={groupedThreads.older}
                  activeThreadId={activeThreadId}
                  editingThreadId={editingThreadId}
                  editTitleInput={editTitleInput}
                  setEditTitleInput={setEditTitleInput}
                  onSelectThread={onSelectThread}
                  onSaveRename={handleSaveRename}
                  onStartRename={handleStartRename}
                  onDeleteThread={onDeleteThread}
                  activeMenuId={activeMenuId}
                  setActiveMenuId={setActiveMenuId}
                  setMenuRect={setMenuRect}
                />
              )}
            </>
          )}
        </div>

        {/* Footer Area: Search & Settings */}
        <div className="p-3 border-t border-gray-200 space-y-2 shrink-0 bg-gray-50">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-white border border-gray-200 focus:border-[#17C99E] rounded-xl pl-8 pr-7 py-2 text-[11px] text-gray-900 placeholder-gray-400 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Settings Button */}
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-full px-3 py-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center space-x-2 text-[11px] font-medium cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-gray-400" />
              <span>Settings</span>
            </button>
          )}
        </div>
      </aside>

      {/* Portal Dropdown Menu for Thread Options (Rename / Delete) */}
      {activeMenuId && menuRect && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: `${menuRect.top}px`,
            left: `${menuRect.left}px`,
          }}
          className="z-50 w-36 bg-white border border-gray-200 rounded-xl shadow-xl py-1 text-xs text-gray-700 animate-fade-in divide-y divide-gray-100"
        >
          <div className="py-0.5">
            <button
              type="button"
              onClick={() => {
                const target = threads.find((t) => t.id === activeMenuId);
                if (target) handleStartRename(target);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center gap-2 text-gray-700 hover:text-gray-900 cursor-pointer transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#17C99E]" />
              <span>Rename</span>
            </button>
          </div>
          <div className="py-0.5">
            <button
              type="button"
              onClick={() => {
                onDeleteThread(activeMenuId);
                setActiveMenuId(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 hover:text-red-700 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

// Helper component for grouping threads by section
interface ThreadGroupSectionProps {
  label: string;
  threads: AIThread[];
  activeThreadId: string | null;
  editingThreadId: string | null;
  editTitleInput: string;
  setEditTitleInput: (val: string) => void;
  onSelectThread: (id: string) => void;
  onSaveRename: (id: string) => void;
  onStartRename: (thread: AIThread) => void;
  onDeleteThread: (id: string) => void;
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
  setMenuRect: (rect: { top: number; left: number } | null) => void;
}

const ThreadGroupSection: React.FC<ThreadGroupSectionProps> = ({
  label,
  threads,
  activeThreadId,
  editingThreadId,
  editTitleInput,
  setEditTitleInput,
  onSelectThread,
  onSaveRename,
  onStartRename,
  onDeleteThread,
  activeMenuId,
  setActiveMenuId,
  setMenuRect
}) => {
  return (
    <div className="space-y-1">
      <div className="px-2 pt-1.5 pb-0.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </div>
      {threads.map((thread) => {
        const isActive = thread.id === activeThreadId;
        const isEditing = thread.id === editingThreadId;
        const isMenuOpen = activeMenuId === thread.id;

        return (
          <div
            key={thread.id}
            className={`group relative rounded-xl transition-all flex items-center text-xs select-none pr-7 ${
              isActive
                ? 'bg-[#17C99E]/15 text-gray-900 border-l-2 border-[#17C99E] font-extrabold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {isEditing ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSaveRename(thread.id);
                }}
                className="flex items-center space-x-1.5 w-full p-1.5"
              >
                <input
                  type="text"
                  value={editTitleInput}
                  onChange={(e) => setEditTitleInput(e.target.value)}
                  onBlur={() => onSaveRename(thread.id)}
                  autoFocus
                  className="w-full bg-white border border-[#17C99E] rounded-lg px-2 py-1 text-xs text-gray-900 focus:outline-none"
                />
                <button
                  type="submit"
                  className="p-1 text-[#17C99E] hover:text-[#13A682] shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => onSelectThread(thread.id)}
                className="w-full text-left px-2.5 py-2 flex items-center gap-2 truncate cursor-pointer"
                title={thread.title}
              >
                <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#17C99E]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className="truncate text-[11px]">{thread.title}</span>
              </button>
            )}

            {/* Menu trigger button ⋯ */}
            {!isEditing && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isMenuOpen) {
                    setActiveMenuId(null);
                  } else {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMenuRect({ top: rect.bottom + 4, left: rect.left - 100 });
                    setActiveMenuId(thread.id);
                  }
                }}
                className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-opacity cursor-pointer ${
                  isMenuOpen ? 'opacity-100 bg-gray-200 text-gray-700' : 'opacity-0 group-hover:opacity-100'
                }`}
                title="Options (Rename, Delete)"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
