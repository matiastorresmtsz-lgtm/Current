'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '@clerk/nextjs';

import {
  Send,
  AlertTriangle,
  RefreshCw,
  Rocket,
  Search,
  TrendingUp,
  Maximize2,
  Minimize2,
  Paperclip,
  Image as ImageIcon,
  X as XIcon,
  Plus,
  MoreHorizontal,
  Edit3,
  Copy,
  Trash2,
  RotateCcw,
  Brain,
  Check,
  PanelLeft,
  Share2
} from 'lucide-react';
import { NavTab, PortfolioAsset, CryptoCoin, AIMessage, AIShortcut, AIThread } from '../types';
import { AIShortcutModal, ShortcutIconRenderer } from '../components/Modals/AIShortcutModal';
import { DeleteShortcutModal } from '../components/Modals/DeleteShortcutModal';
import { AIChatSidebar } from '../components/AIChatSidebar';

const DEFAULT_SHORTCUTS: AIShortcut[] = [
  {
    id: 'builtin-risk-audit',
    name: 'Risk Audit',
    prompt: 'Analyze my portfolio risk & diversification.',
    icon: 'Search',
    isBuiltIn: true
  },
  {
    id: 'builtin-rebalance',
    name: 'Rebalancing Strategy',
    prompt: 'Suggest rebalancing strategies for my portfolio.',
    icon: 'Scale',
    isBuiltIn: true
  },
  {
    id: 'builtin-narratives',
    name: 'Asset Narratives',
    prompt: 'What are the key market narratives driving my assets?',
    icon: 'Rocket',
    isBuiltIn: true
  },
  {
    id: 'builtin-24h',
    name: '24h Summary',
    prompt: 'Give me a 24h performance summary of my holdings.',
    icon: 'TrendingUp',
    isBuiltIn: true
  }
];

export interface AIStyleOption {
  id: 'analyst' | 'deep-research' | 'data-driven' | 'beginner-friendly';
  title: string;
  description: string;
}

export const AI_STYLE_OPTIONS: AIStyleOption[] = [
  {
    id: 'analyst',
    title: 'Analyst',
    description: 'Professional, balanced, evidence-based'
  },
  {
    id: 'deep-research',
    title: 'Deep Research',
    description: 'Detailed analysis, context, sources, risks'
  },
  {
    id: 'data-driven',
    title: 'Data-Driven',
    description: 'Metrics, numbers, trends, and comparisons first'
  },
  {
    id: 'beginner-friendly',
    title: 'Beginner Friendly',
    description: 'Simple explanations without jargon'
  }
];

interface AdvisoryViewProps {
  portfolio: PortfolioAsset[];
  coins: CryptoCoin[];
  onSelectTab?: (tab: NavTab) => void;
  onOpenAddCryptoModal?: () => void;
}

export const AdvisoryView: React.FC<AdvisoryViewProps> = ({
  portfolio,
  coins,
  onSelectTab,
  onOpenAddCryptoModal
}) => {
  const { isSignedIn, user } = useUser();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ dataUrl: string; name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  // Thread management states
  const [threads, setThreads] = useState<AIThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load threads from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rouge_ai_threads');
      if (saved) {
        const parsed: AIThread[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setThreads(parsed);
          const sorted = [...parsed].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          const active = sorted[0];
          setActiveThreadId(active.id);
          setMessages(active.messages);
          return;
        }
      }
    } catch (err) {
      console.error('Failed to load threads from storage:', err);
    }

    const initialThread: AIThread = {
      id: `thread-${Date.now()}`,
      title: 'New Conversation',
      messages: [
        {
          id: 'welcome',
          sender: 'ai',
          text: "👋 Welcome to **Current AI**! I am your automated digital asset advisor.\n\nI can analyze your portfolio risk, track diversification, summarize 24h market movements, and evaluate position allocations.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setThreads([initialThread]);
    setActiveThreadId(initialThread.id);
    setMessages(initialThread.messages);
    try {
      localStorage.setItem('rouge_ai_threads', JSON.stringify([initialThread]));
    } catch (err) { }
  }, []);

  const saveThreadsToStorage = (updatedThreads: AIThread[]) => {
    setThreads(updatedThreads);
    try {
      localStorage.setItem('rouge_ai_threads', JSON.stringify(updatedThreads));
    } catch (err) {
      console.error('Failed to save threads:', err);
    }
  };

  const updateActiveThreadMessages = (newMessages: AIMessage[]) => {
    setMessages(newMessages);
    if (!activeThreadId) return;

    const current = threads.find((t) => t.id === activeThreadId);
    const isDefaultTitle = current && (current.title === 'New Conversation' || !current.title);
    const firstUserMsg = newMessages.find((m) => m.sender === 'user');

    let newTitle = current?.title || 'New Conversation';
    if (isDefaultTitle && firstUserMsg && firstUserMsg.text) {
      newTitle = firstUserMsg.text.trim().slice(0, 28) || 'New Conversation';
    }

    const updated = threads.map((t) => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          title: newTitle,
          messages: newMessages,
          updatedAt: Date.now()
        };
      }
      return t;
    });

    saveThreadsToStorage(updated);
  };

  const handleNewChat = () => {
    const newThread: AIThread = {
      id: `thread-${Date.now()}`,
      title: 'New Conversation',
      messages: [
        {
          id: 'welcome',
          sender: 'ai',
          text: "👋 Welcome to **Current AI**! I am your automated digital asset advisor.\n\nI can analyze your portfolio risk, track diversification, summarize 24h market movements, and evaluate position allocations.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updated = [newThread, ...threads];
    saveThreadsToStorage(updated);
    setActiveThreadId(newThread.id);
    setMessages(newThread.messages);
    setServerError(null);
  };

  const handleSelectThread = (threadId: string) => {
    const target = threads.find((t) => t.id === threadId);
    if (target) {
      setActiveThreadId(threadId);
      setMessages(target.messages);
      setServerError(null);
    }
  };

  const handleRenameThread = (threadId: string, newTitle: string) => {
    const updated = threads.map((t) =>
      t.id === threadId ? { ...t, title: newTitle, updatedAt: Date.now() } : t
    );
    saveThreadsToStorage(updated);
  };

  const handleDeleteThread = (threadId: string) => {
    const updated = threads.filter((t) => t.id !== threadId);
    if (updated.length === 0) {
      const newThread: AIThread = {
        id: `thread-${Date.now()}`,
        title: 'New Conversation',
        messages: [
          {
            id: 'welcome',
            sender: 'ai',
            text: "👋 Welcome to **Current AI**! I am your automated digital asset advisor.\n\nI can analyze your portfolio risk, track diversification, summarize 24h market movements, and evaluate position allocations.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      saveThreadsToStorage([newThread]);
      setActiveThreadId(newThread.id);
      setMessages(newThread.messages);
    } else {
      saveThreadsToStorage(updated);
      if (activeThreadId === threadId) {
        const nextActive = updated[0];
        setActiveThreadId(nextActive.id);
        setMessages(nextActive.messages);
      }
    }
  };
  const [shortcuts, setShortcuts] = useState<AIShortcut[]>(DEFAULT_SHORTCUTS);
  const [activeMenu, setActiveMenu] = useState<{
    id: string;
    rect: { top: number; left: number };
  } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<AIShortcut | null>(null);
  const [deletingShortcut, setDeletingShortcut] = useState<AIShortcut | null>(null);
  // AI Style states
  const [selectedAIStyle, setSelectedAIStyle] = useState<AIStyleOption>(AI_STYLE_OPTIONS[0]);
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [styleMenuRect, setStyleMenuRect] = useState<{ top: number; right: number } | null>(null);

  // Load selected AI style from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rouge_ai_style');
      if (saved) {
        const found = AI_STYLE_OPTIONS.find((s) => s.id === saved);
        if (found) setSelectedAIStyle(found);
      }
    } catch (err) { }
  }, []);

  // Close AI Style dropdown menu on outside click, scroll, resize
  useEffect(() => {
    const handleCloseStyleMenu = () => setIsStyleMenuOpen(false);
    if (isStyleMenuOpen) {
      window.addEventListener('click', handleCloseStyleMenu);
      window.addEventListener('scroll', handleCloseStyleMenu, true);
      window.addEventListener('resize', handleCloseStyleMenu);
    }
    return () => {
      window.removeEventListener('click', handleCloseStyleMenu);
      window.removeEventListener('scroll', handleCloseStyleMenu, true);
      window.removeEventListener('resize', handleCloseStyleMenu);
    };
  }, [isStyleMenuOpen]);

  // Load shortcuts from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rouge_ai_shortcuts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setShortcuts(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load shortcuts from localStorage:', err);
    }
  }, []);

  // Save shortcuts helper
  const saveShortcutsToStorage = (updatedShortcuts: AIShortcut[]) => {
    setShortcuts(updatedShortcuts);
    try {
      localStorage.setItem('rouge_ai_shortcuts', JSON.stringify(updatedShortcuts));
    } catch (err) {
      console.error('Failed to save shortcuts to localStorage:', err);
    }
  };

  // Close active dropdown menu when clicking outside, scrolling, or resizing
  useEffect(() => {
    const handleClose = () => setActiveMenu(null);
    if (activeMenu) {
      window.addEventListener('click', handleClose);
      window.addEventListener('scroll', handleClose, true);
      window.addEventListener('resize', handleClose);
    }
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
    };
  }, [activeMenu]);

  const handleSaveShortcut = (shortcutData: Omit<AIShortcut, 'id'> & { id?: string }) => {
    if (shortcutData.id) {
      const updated = shortcuts.map((s) => {
        if (s.id === shortcutData.id) {
          return {
            ...s,
            name: shortcutData.name,
            prompt: shortcutData.prompt,
            icon: shortcutData.icon,
            isCustomized: s.isBuiltIn ? true : undefined
          };
        }
        return s;
      });
      saveShortcutsToStorage(updated);
    } else {
      const newShortcut: AIShortcut = {
        id: `custom-${Date.now()}`,
        name: shortcutData.name,
        prompt: shortcutData.prompt,
        icon: shortcutData.icon,
        isBuiltIn: false
      };
      saveShortcutsToStorage([...shortcuts, newShortcut]);
    }
  };

  const handleDuplicateShortcut = (shortcut: AIShortcut) => {
    const duplicated: AIShortcut = {
      id: `custom-${Date.now()}`,
      name: `${shortcut.name} (Copy)`,
      prompt: shortcut.prompt,
      icon: shortcut.icon,
      isBuiltIn: false
    };
    saveShortcutsToStorage([...shortcuts, duplicated]);
    setActiveMenu(null);
  };

  const handleConfirmDelete = (shortcutId: string) => {
    const updated = shortcuts.filter((s) => s.id !== shortcutId);
    saveShortcutsToStorage(updated);
    setActiveMenu(null);
  };

  const handleResetBuiltIn = (shortcutId: string) => {
    const defaultVersion = DEFAULT_SHORTCUTS.find((s) => s.id === shortcutId);
    if (!defaultVersion) return;
    const updated = shortcuts.map((s) => (s.id === shortcutId ? { ...defaultVersion } : s));
    saveShortcutsToStorage(updated);
    setActiveMenu(null);
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to the bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle ESC key for fullscreen & modal & lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewImageModal) {
          setPreviewImageModal(null);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };

    if (isFullscreen || previewImageModal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, previewImageModal]);

  // Helper to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // Process file upload & convert to base64 Data URL
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP, GIF).');
      return;
    }

    // Limit to 5MB to avoid payload issues
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setSelectedMedia({
          dataUrl,
          name: file.name,
          size: formatFileSize(file.size),
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Clipboard paste support for screenshots
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          processImageFile(file);
          e.preventDefault();
          break;
        }
      }
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Load welcome message on load
  useEffect(() => {
    const welcomeText = portfolio.length > 0
      ? `Hello ${user?.firstName || 'Trader'}! I have analyzed your portfolio containing **${portfolio.length} assets** worth **$${calculateTotalValue().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**. \n\nHow can I assist you today? You can choose one of the quick options below or type your custom query. I can help evaluate your risk, suggest rebalancing, explain narratives, or audit your diversification.`
      : `Welcome! It looks like you haven't added any assets to your portfolio yet. \n\nTo get customized, AI-powered advisory reports and audits, please add some tokens to your portfolio first. Click the **"Add Crypto Asset"** button below to start building your holdings!`;

    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [portfolio.length, user?.firstName]);

  // Helper values
  const calculateTotalValue = () => {
    return portfolio.reduce((sum, item) => sum + (item.amount * (item.currentPrice || 0)), 0);
  };

  const getDiversificationScore = () => {
    const count = portfolio.length;
    if (count === 0) return { score: 0, label: 'No Assets', color: 'text-gray-500', bg: 'bg-gray-500/10' };
    if (count === 1) return { score: 30, label: 'Low', color: 'text-red-500', bg: 'bg-red-500/10' };
    if (count === 2) return { score: 55, label: 'Fair', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    if (count <= 4) return { score: 78, label: 'Good', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    return { score: 95, label: 'Excellent', color: 'text-[#17C99E]', bg: 'bg-[#17C99E]/10' };
  };

  const getRiskProfile = () => {
    if (portfolio.length === 0) return { label: 'None', color: 'text-gray-500' };

    const totalVal = calculateTotalValue();
    if (totalVal === 0) return { label: 'Low Risk', color: 'text-emerald-500' };

    // Speculative classification: symbols containing doge, shib, pepe, bonk, wif, floki, or name with meme
    let speculativeValue = 0;
    let blueChipValue = 0; // BTC and ETH

    portfolio.forEach(item => {
      const sym = item.symbol.toLowerCase();
      const val = item.amount * (item.currentPrice || 0);

      if (sym === 'btc' || sym === 'eth') {
        blueChipValue += val;
      } else if (
        sym.includes('doge') ||
        sym.includes('shib') ||
        sym.includes('pepe') ||
        sym.includes('bonk') ||
        sym.includes('wif') ||
        sym.includes('floki')
      ) {
        speculativeValue += val;
      }
    });

    const specPercent = (speculativeValue / totalVal) * 100;
    const blueChipPercent = (blueChipValue / totalVal) * 100;

    if (specPercent > 30) {
      return { label: 'High Risk (Speculative)', color: 'text-red-500' };
    }
    if (blueChipPercent > 70) {
      return { label: 'Low Risk (Conservative)', color: 'text-emerald-500' };
    }
    return { label: 'Medium Risk (Balanced)', color: 'text-yellow-500' };
  };

  const getTopAllocations = () => {
    const totalVal = calculateTotalValue();
    if (totalVal === 0) return [];

    return [...portfolio]
      .map(item => ({
        ...item,
        value: item.amount * (item.currentPrice || 0),
        pct: ((item.amount * (item.currentPrice || 0)) / totalVal) * 100
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  };

  // Custom Inline Markdown renderer
  const parseInlineMarkdown = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="text-gray-900 font-extrabold">{part}</strong>;
      }

      const codeParts = part.split(/`([^`]+)`/g);
      return codeParts.map((subPart, j) => {
        if (j % 2 === 1) {
          return (
            <code key={j} className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-[#17C99E] font-mono border border-gray-200">
              {subPart}
            </code>
          );
        }
        return subPart;
      });
    });
  };

  // Custom block Markdown renderer
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      let cleanLine = line;

      if (cleanLine.startsWith('### ')) {
        return <h4 key={index} className="text-xs font-black text-[#17C99E] mt-3 mb-1 uppercase tracking-wider">{cleanLine.replace('### ', '')}</h4>;
      }
      if (cleanLine.startsWith('## ')) {
        return <h3 key={index} className="text-sm font-extrabold text-gray-900 mt-4 mb-1.5 border-b border-gray-200 pb-1">{cleanLine.replace('## ', '')}</h3>;
      }
      if (cleanLine.startsWith('# ')) {
        return <h2 key={index} className="text-base font-black text-gray-900 mt-4 mb-2">{cleanLine.replace('# ', '')}</h2>;
      }

      const isBullet = cleanLine.startsWith('- ') || cleanLine.startsWith('* ') || cleanLine.startsWith('• ');
      if (isBullet) {
        cleanLine = cleanLine.replace(/^[-*•]\s+/, '');
        return (
          <div key={index} className="flex items-start space-x-2 my-1 text-xs text-gray-700 pl-4">
            <span className="text-[#17C99E] mt-1.5">•</span>
            <span className="flex-1">{parseInlineMarkdown(cleanLine)}</span>
          </div>
        );
      }

      if (cleanLine.trim() === '') {
        return <div key={index} className="h-2" />;
      }

      return <p key={index} className="text-xs text-gray-700 leading-relaxed my-1.5">{parseInlineMarkdown(cleanLine)}</p>;
    });
  };

  // Submit chat query to api route
  const handleSendMessage = async (text: string, mediaToAttach = selectedMedia) => {
    const hasText = Boolean(text && text.trim());
    const hasMedia = Boolean(mediaToAttach?.dataUrl);

    if ((!hasText && !hasMedia) || isLoading) return;

    setServerError(null);

    const userMessage: AIMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: hasText ? text.trim() : (hasMedia ? 'Please analyze this uploaded crypto chart/screenshot.' : ''),
      mediaUrl: mediaToAttach?.dataUrl,
      mediaName: mediaToAttach?.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMessage];
    updateActiveThreadMessages(updatedMessages);
    setInputValue('');
    setSelectedMedia(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsLoading(true);

    try {
      const response = await fetch('/api/advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.filter(m => m.id !== 'welcome'),
          portfolio,
          aiStyle: selectedAIStyle.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'API_KEY_MISSING') {
          setServerError('Advisory service is temporarily offline. Please contact support or try again later.');
        } else {
          setServerError(data.details || data.message || 'An error occurred during generating response.');
        }
        setIsLoading(false);
        return;
      }

      if (data.success && data.text) {
        const aiMessage: AIMessage = {
          id: Math.random().toString(),
          sender: 'ai',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        updateActiveThreadMessages([...updatedMessages, aiMessage]);
      }
    } catch (err: any) {
      console.error('Failed to communicate with advisor endpoint:', err);
      setServerError('Unable to reach the advisory API. Please verify your network and check terminal logs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const totalValue = calculateTotalValue();
  const divInfo = getDiversificationScore();
  const riskInfo = getRiskProfile();
  const topAllocations = getTopAllocations();

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 bg-white/95 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-center animate-fade-in"
          : "max-w-[1200px] mx-auto py-2 px-4 space-y-6 animate-fade-in"
      }
    >
      {/* Chat Hub */}
      <div className={isFullscreen ? "w-full max-w-6xl h-full flex flex-col" : "max-w-[1100px] mx-auto w-full"}>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          className={`relative bg-white border flex flex-row shadow-xl overflow-hidden transition-all ${isDragging ? 'border-[#17C99E] ring-2 ring-[#17C99E]/40' : 'border-gray-200'
            } ${isFullscreen ? "h-full rounded-2xl md:rounded-3xl" : "h-[720px] rounded-3xl shadow-xl"
            }`}
        >
          {/* Left Sidebar */}
          <AIChatSidebar
            isOpen={isSidebarOpen}
            onToggleClose={() => setIsSidebarOpen(false)}
            threads={threads}
            activeThreadId={activeThreadId}
            onSelectThread={handleSelectThread}
            onNewChat={handleNewChat}
            onRenameThread={handleRenameThread}
            onDeleteThread={handleDeleteThread}
            onOpenSettings={() => {
              if (onSelectTab) onSelectTab('settings');
            }}
          />

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            {/* Drag Overlay Indicator */}
            {isDragging && (
              <div className="absolute inset-0 z-30 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none space-y-2 border-2 border-dashed border-[#17C99E] rounded-3xl">
                <ImageIcon className="w-10 h-10 text-[#17C99E] animate-bounce" />
                <p className="text-sm font-bold text-gray-900">Drop your chart or image here</p>
                <p className="text-xs text-gray-500">Attach screenshot to AI Advisor</p>
              </div>
            )}

            {/* Chat Header */}
            <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5 min-w-0">
                {!isSidebarOpen && (
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-200 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0"
                    title="Open sidebar"
                  >
                    <PanelLeft className="w-4 h-4 text-[#17C99E]" />
                  </button>
                )}

                {threads.find((t) => t.id === activeThreadId)?.title === 'New Conversation' || !threads.find((t) => t.id === activeThreadId) ? (
                  <span className="font-extrabold text-xl tracking-tight text-[#17C99E]">
                    current
                  </span>
                ) : (
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider truncate">
                    {threads.find((t) => t.id === activeThreadId)?.title}
                  </h3>
                )}
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {messages.length > 1 && (
                  <button
                    onClick={() => {
                      updateActiveThreadMessages([messages[0]]);
                      setServerError(null);
                    }}
                    className="text-[10px] font-bold text-gray-500 hover:text-gray-900 flex items-center space-x-1 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span className="hidden sm:inline">Clear Thread</span>
                  </button>
                )}

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title={isFullscreen ? "Exit Fullscreen (Esc)" : "Expand to Fullscreen"}
                  className="text-[10px] font-bold text-gray-700 hover:text-gray-900 flex items-center space-x-1.5 transition-colors px-2.5 py-1.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 cursor-pointer"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-3.5 h-3.5 text-[#17C99E]" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5 text-[#17C99E]" />
                  )}
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
              {messages.map((msg) => {
                const isAi = msg.sender === 'ai';
                return (
                  <div
                    key={msg.id}
                    className={`max-w-[88%] ${isAi ? 'mr-auto text-left' : 'ml-auto text-left'}`}
                  >
                    {isAi ? (
                      /* AI Message: no avatar, no bg bubble — plain text + actions */
                      <div className="space-y-2">
                        {msg.mediaUrl && (
                          <div className="mb-2.5 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                            <img
                              src={msg.mediaUrl}
                              alt={msg.mediaName || 'Uploaded media'}
                              onClick={() => setPreviewImageModal(msg.mediaUrl || null)}
                              className="w-full max-h-64 object-contain rounded-xl cursor-pointer hover:opacity-90 transition-opacity bg-gray-100"
                            />
                            {msg.mediaName && (
                              <div className="text-[10px] px-2.5 py-1 font-mono text-gray-600 truncate flex items-center gap-1 bg-gray-100">
                                <ImageIcon className="w-3 h-3 shrink-0" />
                                <span className="truncate">{msg.mediaName}</span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="text-xs text-gray-800 leading-relaxed">
                          {renderMarkdown(msg.text)}
                        </div>
                        {/* Action buttons row */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="text-[9px] text-gray-400 font-medium mr-1">{msg.timestamp}</span>
                          <button
                            type="button"
                            onClick={() => navigator.clipboard?.writeText(msg.text)}
                            title="Copy response"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            title="Share"
                            onClick={async () => {
                              const shareText = msg.text;
                              if (navigator.share) {
                                try {
                                  await navigator.share({
                                    title: 'Current AI · Advisory Response',
                                    text: shareText,
                                  });
                                } catch (_) {}
                              } else {
                                await navigator.clipboard?.writeText(shareText);
                              }
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#17C99E] hover:bg-[#17C99E]/10 transition-colors cursor-pointer"
                          >
                            <Share2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* User Message: teal bubble, right-aligned */
                      <div className="flex flex-col items-end space-y-1">
                        <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-[#17C99E] text-white text-xs leading-relaxed font-semibold shadow-sm">
                          {msg.mediaUrl && (
                            <div className="mb-2.5 overflow-hidden rounded-xl border border-white/20 bg-white/10">
                              <img
                                src={msg.mediaUrl}
                                alt={msg.mediaName || 'Uploaded media'}
                                onClick={() => setPreviewImageModal(msg.mediaUrl || null)}
                                className="w-full max-h-64 object-contain rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                              />
                              {msg.mediaName && (
                                <div className="text-[10px] px-2.5 py-1 font-mono text-white/70 truncate flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{msg.mediaName}</span>
                                </div>
                              )}
                            </div>
                          )}
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-gray-400 font-medium px-1">{msg.timestamp}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="max-w-[88%] mr-auto text-left">
                  <div className="flex items-center gap-2 py-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-[#17C99E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#17C99E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#17C99E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">Analyzing...</span>
                  </div>
                </div>
              )}

              {/* Server API Errors */}
              {serverError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start space-x-3.5 my-3 max-w-[90%] mx-auto">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-red-900 block">Advisory Communication Issue</span>
                    <span className="leading-relaxed block">{serverError}</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Suggestion Chips & AI Shortcuts Toolbar */}
            {!isLoading && (
              <div className="px-6 py-2.5 bg-gray-50 border-t border-gray-200 overflow-x-auto whitespace-nowrap flex items-center gap-2 scrollbar-none relative">
                {shortcuts.map((shortcut) => {
                  const isMenuOpen = activeMenu?.id === shortcut.id;
                  return (
                    <div key={shortcut.id} className="relative shrink-0 group">
                      <button
                        type="button"
                        onClick={() => handleSuggestionClick(shortcut.prompt)}
                        title={`Prompt: "${shortcut.prompt}"`}
                        className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900 rounded-xl text-[10px] font-bold border border-gray-200 flex items-center space-x-1.5 transition-all cursor-pointer select-none pr-7 shadow-xs"
                      >
                        <span className="flex items-center gap-1.5 text-gray-800">
                          <ShortcutIconRenderer iconName={shortcut.icon} className="h-3.5 w-3.5 text-[#17C99E]" />
                          {shortcut.name}
                        </span>
                      </button>

                      {/* Menu Trigger Button ⋯ */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isMenuOpen) {
                            setActiveMenu(null);
                          } else {
                            const btn = e.currentTarget;
                            const parentChip = btn.parentElement;
                            const chipRect = parentChip ? parentChip.getBoundingClientRect() : btn.getBoundingClientRect();
                            setActiveMenu({
                              id: shortcut.id,
                              rect: { top: chipRect.top, left: chipRect.left }
                            });
                          }
                        }}
                        className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-all cursor-pointer ${isMenuOpen ? 'opacity-100 bg-gray-200 text-gray-800' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        title="Options (Edit, Duplicate, Delete)"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}

                {/* + Create Button */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingShortcut(null);
                    setIsCreateModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#17C99E]/10 hover:bg-[#17C99E]/20 text-[#17C99E] hover:text-[#13A682] rounded-xl text-[10px] font-bold border border-[#17C99E]/30 flex items-center space-x-1 transition-all shrink-0 cursor-pointer shadow-xs"
                  title="Create new custom AI prompt shortcut"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create</span>
                </button>
              </div>
            )}

            {/* Selected Media Preview Bar */}
            {selectedMedia && (
              <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="relative shrink-0">
                    <img
                      src={selectedMedia.dataUrl}
                      alt={selectedMedia.name}
                      className="w-12 h-12 object-cover rounded-xl border border-[#17C99E]/50 cursor-pointer"
                      onClick={() => setPreviewImageModal(selectedMedia.dataUrl)}
                    />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-gray-900 truncate flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#17C99E] shrink-0" />
                      <span className="truncate">{selectedMedia.name}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {selectedMedia.size} • Attached to prompt
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMedia(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-1.5 rounded-lg bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-200 transition-colors shrink-0 cursor-pointer"
                  title="Remove attachment"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Chat Form Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-3.5 bg-white border-t border-gray-200 flex items-center space-x-2.5"
            >
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
              />

              {/* Media Upload Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || portfolio.length === 0}
                title="Attach chart, screenshot or media (or paste from clipboard with Ctrl+V)"
                className="p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-[#17C99E] border border-gray-200 hover:border-[#17C99E]/40 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading || portfolio.length === 0}
                placeholder={
                  portfolio.length === 0
                    ? "Import assets to unlock AI advisor chat..."
                    : selectedMedia
                      ? "Add a question about this image/chart (or press send)..."
                      : "Ask advisor or paste/upload a chart screenshot..."
                }
                className="flex-1 bg-gray-50 border border-gray-200 focus:border-[#17C99E] focus:ring-1 focus:ring-[#17C99E] rounded-2xl px-4 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none transition-all"
              />

              <button
                type="submit"
                disabled={isLoading || (!inputValue.trim() && !selectedMedia) || portfolio.length === 0}
                className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 ${(!inputValue.trim() && !selectedMedia) || isLoading || portfolio.length === 0
                  ? 'bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed'
                  : 'bg-[#17C99E] text-white hover:bg-[#13A682] hover:shadow-[#17C99E]/10'
                  }`}
              >
                <Send className="w-4 h-4 shrink-0" />
              </button>

              {/* Brain Icon AI Style Selector (Right side of send icon) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isStyleMenuOpen) {
                    setIsStyleMenuOpen(false);
                  } else {
                    const btn = e.currentTarget;
                    const rect = btn.getBoundingClientRect();
                    setStyleMenuRect({ top: rect.top, right: rect.right });
                    setIsStyleMenuOpen(true);
                  }
                }}
                disabled={isLoading || portfolio.length === 0}
                title={`AI Style: ${selectedAIStyle.title} (${selectedAIStyle.description})`}
                className={`p-3 rounded-2xl border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0 relative ${isStyleMenuOpen
                    ? 'bg-[#17C99E]/15 border-[#17C99E] text-[#17C99E]'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-[#17C99E] border-gray-200 hover:border-[#17C99E]/40'
                  }`}
              >
                <Brain className="w-4 h-4" />
                {selectedAIStyle.id !== 'analyst' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#17C99E] rounded-full ring-2 ring-white" />
                )}
              </button>
            </form>

          </div>

        </div>

      </div>

      {/* Lightbox Image Preview Modal */}
      {previewImageModal && (
        <div
          onClick={() => setPreviewImageModal(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <XIcon className="w-5 h-5" />
            </button>
            <img
              src={previewImageModal}
              alt="Expanded chart preview"
              className="w-full h-full max-h-[85vh] object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Portal Dropdown Menu for AI Shortcut */}
      {activeMenu && (
        (() => {
          const activeShortcut = shortcuts.find((s) => s.id === activeMenu.id);
          if (!activeShortcut || typeof document === 'undefined') return null;

          return createPortal(
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                bottom: `${window.innerHeight - activeMenu.rect.top + 8}px`,
                left: `${activeMenu.rect.left}px`,
              }}
              className="z-50 w-44 bg-white border border-gray-200 rounded-2xl shadow-2xl py-1 text-xs text-gray-700 animate-fade-in divide-y divide-gray-100"
            >
              <div className="py-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingShortcut(activeShortcut);
                    setIsCreateModalOpen(true);
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700 hover:text-gray-900 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#17C99E]" />
                  <span>{activeShortcut.isBuiltIn ? 'Customize prompt' : 'Edit prompt'}</span>
                </button>

                {!activeShortcut.isBuiltIn && (
                  <button
                    type="button"
                    onClick={() => handleDuplicateShortcut(activeShortcut)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700 hover:text-gray-900 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-blue-500" />
                    <span>Duplicate</span>
                  </button>
                )}

                {activeShortcut.isBuiltIn && activeShortcut.isCustomized && (
                  <button
                    type="button"
                    onClick={() => handleResetBuiltIn(activeShortcut.id)}
                    className="w-full text-left px-3 py-2 hover:bg-amber-50 flex items-center gap-2 text-amber-600 hover:text-amber-700 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to default</span>
                  </button>
                )}
              </div>

              {!activeShortcut.isBuiltIn && (
                <div className="py-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingShortcut(activeShortcut);
                      setActiveMenu(null);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 hover:text-red-700 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>,
            document.body
          );
        })()
      )}

      {/* Portal Dropdown Menu for AI Style Selector */}
      {isStyleMenuOpen && styleMenuRect && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            bottom: `${window.innerHeight - styleMenuRect.top + 8}px`,
            right: `${window.innerWidth - styleMenuRect.right}px`,
          }}
          className="z-50 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl p-2.5 text-xs text-gray-800 animate-fade-in space-y-1.5"
        >
          <div className="px-2 py-1 border-b border-gray-100 flex items-center justify-between">
            <span className="font-bold text-gray-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-[#17C99E]" />
              AI Style Persona
            </span>
            <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
              {selectedAIStyle.title}
            </span>
          </div>

          <div className="space-y-1">
            {AI_STYLE_OPTIONS.map((style) => {
              const isSelected = selectedAIStyle.id === style.id;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => {
                    setSelectedAIStyle(style);
                    setIsStyleMenuOpen(false);
                    try {
                      localStorage.setItem('rouge_ai_style', style.id);
                    } catch (err) { }
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${isSelected
                      ? 'bg-[#17C99E]/10 border-[#17C99E]/40 text-gray-900 shadow-xs'
                      : 'bg-gray-50 hover:bg-gray-100 border-transparent text-gray-700 hover:text-gray-900'
                    }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isSelected ? 'bg-[#17C99E] text-white' : 'bg-gray-200 text-gray-500'}`}>
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-900">{style.title}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#17C99E] shrink-0" />}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">
                      {style.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}

      {/* Create / Edit Shortcut Modal */}
      <AIShortcutModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingShortcut(null);
        }}
        onSave={handleSaveShortcut}
        initialShortcut={editingShortcut}
      />

      {/* Delete Confirmation Modal */}
      <DeleteShortcutModal
        isOpen={!!deletingShortcut}
        shortcut={deletingShortcut}
        onClose={() => setDeletingShortcut(null)}
        onConfirmDelete={handleConfirmDelete}
      />

    </div>
  );
};

