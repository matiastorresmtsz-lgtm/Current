'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import {
  Sparkles,
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
  X as XIcon
} from 'lucide-react';
import { NavTab, PortfolioAsset, CryptoCoin, AIMessage } from '../types';

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
        return <strong key={i} className="text-white font-extrabold">{part}</strong>;
      }

      const codeParts = part.split(/`([^`]+)`/g);
      return codeParts.map((subPart, j) => {
        if (j % 2 === 1) {
          return (
            <code key={j} className="bg-black/40 px-1.5 py-0.5 rounded text-[10px] text-[#17C99E] font-mono border border-white/5">
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
        return <h3 key={index} className="text-sm font-extrabold text-white mt-4 mb-1.5 border-b border-[#2E2E2E] pb-1">{cleanLine.replace('## ', '')}</h3>;
      }
      if (cleanLine.startsWith('# ')) {
        return <h2 key={index} className="text-base font-black text-white mt-4 mb-2">{cleanLine.replace('# ', '')}</h2>;
      }

      const isBullet = cleanLine.startsWith('- ') || cleanLine.startsWith('* ') || cleanLine.startsWith('• ');
      if (isBullet) {
        cleanLine = cleanLine.replace(/^[-*•]\s+/, '');
        return (
          <div key={index} className="flex items-start space-x-2 my-1 text-xs text-gray-300 pl-4">
            <span className="text-[#17C99E] mt-1.5">•</span>
            <span className="flex-1">{parseInlineMarkdown(cleanLine)}</span>
          </div>
        );
      }

      if (cleanLine.trim() === '') {
        return <div key={index} className="h-2" />;
      }

      return <p key={index} className="text-xs text-gray-300 leading-relaxed my-1.5">{parseInlineMarkdown(cleanLine)}</p>;
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
    setMessages(updatedMessages);
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
          portfolio
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
        setMessages(prev => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: 'ai',
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
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
          ? "fixed inset-0 z-50 bg-[#161616]/95 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-center animate-fade-in"
          : "max-w-[1200px] mx-auto py-2 px-4 space-y-6 animate-fade-in"
      }
    >
      {/* Chat Hub */}
      <div className={isFullscreen ? "w-full max-w-6xl h-full flex flex-col" : "max-w-[900px] mx-auto w-full"}>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          className={`relative bg-[#212121] border flex flex-col shadow-2xl overflow-hidden transition-all ${isDragging ? 'border-[#17C99E] ring-2 ring-[#17C99E]/40' : 'border-[#2E2E2E]'
            } ${isFullscreen ? "h-full rounded-2xl md:rounded-3xl" : "h-[700px] rounded-3xl shadow-xl"
            }`}
        >
          {/* Drag Overlay Indicator */}
          {isDragging && (
            <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none space-y-2 border-2 border-dashed border-[#17C99E] rounded-3xl">
              <ImageIcon className="w-10 h-10 text-[#17C99E] animate-bounce" />
              <p className="text-sm font-bold text-white">Drop your chart or image here</p>
              <p className="text-xs text-gray-400">Attach screenshot to AI Advisor</p>
            </div>
          )}

          {/* Chat Header */}
          <div className="bg-black/25 px-6 py-4 border-b border-[#2E2E2E] flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Current AI</h3>
            </div>

            <div className="flex items-center space-x-2">
              {messages.length > 1 && (
                <button
                  onClick={() => {
                    setMessages(prev => [prev[0]]);
                    setServerError(null);
                  }}
                  className="text-[10px] font-bold text-gray-400 hover:text-white flex items-center space-x-1 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span className="hidden sm:inline">Clear Thread</span>
                </button>
              )}

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit Fullscreen (Esc)" : "Expand to Fullscreen"}
                className="text-[10px] font-bold text-gray-300 hover:text-white flex items-center space-x-1.5 transition-colors px-2.5 py-1.5 rounded-lg bg-black/30 hover:bg-white/10 border border-[#2E2E2E] cursor-pointer"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-[#17C99E]" />
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-[#17C99E]" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-black/10">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3.5 max-w-[85%] ${isAi ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-left'
                    }`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${isAi
                    ? 'bg-[#17C99E]/10 border-[#17C99E]/20 text-[#17C99E]'
                    : 'bg-white/10 border-white/10 text-white'
                    }`}>
                    {isAi ? <Image src="/favicon.ico" alt="Current AI" width={32} height={32} className="w-full h-full rounded-xl object-cover" /> : <span className="text-[11px] font-black uppercase">{user?.firstName?.[0] || 'U'}</span>}
                  </div>

                  {/* Message Bubble */}
                  <div className="space-y-1 flex-1">
                    <div className={`px-4.5 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${isAi
                      ? 'bg-[#2E2E2E] text-gray-200 border border-white/5 rounded-tl-sm'
                      : 'bg-[#17C99E] text-black font-semibold rounded-tr-sm'
                      }`}>
                      {msg.mediaUrl && (
                        <div className="mb-2.5 overflow-hidden rounded-xl border border-black/15 bg-black/20">
                          <img
                            src={msg.mediaUrl}
                            alt={msg.mediaName || "Uploaded media"}
                            onClick={() => setPreviewImageModal(msg.mediaUrl || null)}
                            className="w-full max-h-64 object-contain rounded-xl cursor-pointer hover:opacity-90 transition-opacity bg-black/40"
                          />
                          {msg.mediaName && (
                            <div className="text-[10px] px-2.5 py-1 font-mono text-black/80 truncate flex items-center gap-1 bg-black/10">
                              <ImageIcon className="w-3 h-3 shrink-0" />
                              <span className="truncate">{msg.mediaName}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {isAi ? renderMarkdown(msg.text) : (msg.text ? msg.text : null)}
                    </div>
                    <span className="text-[9px] text-gray-500 font-medium px-1 block text-right">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-3.5 max-w-[80%] mr-auto text-left">
                <div className="w-8 h-8 rounded-xl bg-[#17C99E]/10 border border-[#17C99E]/20 text-[#17C99E] flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  <Image src="/favicon.ico" alt="Current AI" width={32} height={32} className="w-full h-full rounded-xl object-cover animate-bounce" />
                </div>
                <div className="space-y-1">
                  <div className="px-5 py-3.5 bg-[#2E2E2E] text-gray-400 border border-white/5 rounded-2xl rounded-tl-sm text-xs flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-[#17C99E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#17C99E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#17C99E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="font-medium pl-1 text-[11px] text-gray-400">Advisor is analyzing chart and data...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Server API Errors */}
            {serverError && (
              <div className="p-4 bg-red-950/30 border border-red-500/20 rounded-2xl text-xs text-red-300 flex items-start space-x-3.5 my-3 max-w-[90%] mx-auto">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-white block">Advisory Communication Issue</span>
                  <span className="leading-relaxed block">{serverError}</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Suggestion Chips */}
          {portfolio.length > 0 && !isLoading && (
            <div className="px-6 py-2 bg-black/10 border-t border-[#2E2E2E] overflow-x-auto whitespace-nowrap flex items-center gap-2 scrollbar-none">
              <button
                onClick={() => handleSuggestionClick('Analyze my portfolio risk & diversification.')}
                className="px-3 py-1.5 bg-[#2E2E2E] hover:bg-[#3E3E3E] text-gray-300 hover:text-white rounded-xl text-[10px] font-bold border border-white/5 flex items-center space-x-1 transition-all shrink-0 cursor-pointer"
              >
                <span className="flex items-center gap-1.5"><Search className="h-3.5 w-3.5" />Risk Audit</span>
              </button>
              <button
                onClick={() => handleSuggestionClick('Suggest rebalancing strategies for my portfolio.')}
                className="px-3 py-1.5 bg-[#2E2E2E] hover:bg-[#3E3E3E] text-gray-300 hover:text-white rounded-xl text-[10px] font-bold border border-white/5 flex items-center space-x-1 transition-all shrink-0 cursor-pointer"
              >
                <span>⚖️ Rebalancing Strategy</span>
              </button>
              <button
                onClick={() => handleSuggestionClick('What are the key market narratives driving my assets?')}
                className="px-3 py-1.5 bg-[#2E2E2E] hover:bg-[#3E3E3E] text-gray-300 hover:text-white rounded-xl text-[10px] font-bold border border-white/5 flex items-center space-x-1 transition-all shrink-0 cursor-pointer"
              >
                <span className="flex items-center gap-1.5"><Rocket className="h-3.5 w-3.5" />Asset Narratives</span>
              </button>
              <button
                onClick={() => handleSuggestionClick('Give me a 24h performance summary of my holdings.')}
                className="px-3 py-1.5 bg-[#2E2E2E] hover:bg-[#3E3E3E] text-gray-300 hover:text-white rounded-xl text-[10px] font-bold border border-white/5 flex items-center space-x-1 transition-all shrink-0 cursor-pointer"
              >
                <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" />24h Summary</span>
              </button>
            </div>
          )}

          {/* Selected Media Preview Bar */}
          {selectedMedia && (
            <div className="px-4 py-2.5 bg-black/40 border-t border-[#2E2E2E] flex items-center justify-between gap-3 animate-fade-in">
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
                  <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#17C99E] shrink-0" />
                    <span className="truncate">{selectedMedia.name}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
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
                className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/5 transition-colors shrink-0 cursor-pointer"
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
            className="p-3.5 bg-black/20 border-t border-[#2E2E2E] flex items-center space-x-2.5"
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
              className="p-3 rounded-2xl bg-black/40 hover:bg-[#2A2A2A] text-gray-400 hover:text-[#17C99E] border border-[#2E2E2E] hover:border-[#17C99E]/40 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
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
              className="flex-1 bg-black/40 border border-[#2E2E2E] focus:border-[#17C99E]/50 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
            />

            <button
              type="submit"
              disabled={isLoading || (!inputValue.trim() && !selectedMedia) || portfolio.length === 0}
              className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 ${(!inputValue.trim() && !selectedMedia) || isLoading || portfolio.length === 0
                ? 'bg-black/25 text-gray-600 border border-[#2E2E2E] cursor-not-allowed'
                : 'bg-[#17C99E] text-black hover:bg-[#13A682] hover:shadow-[#17C99E]/10'
                }`}
            >
              <Send className="w-4 h-4 shrink-0" />
            </button>
          </form>

        </div>

      </div>

      {/* Lightbox Image Preview Modal */}
      {previewImageModal && (
        <div
          onClick={() => setPreviewImageModal(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#2E2E2E] bg-[#161616]">
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-white hover:text-black transition-colors cursor-pointer"
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

    </div>
  );
};

