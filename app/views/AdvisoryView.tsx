'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Sparkles,
  Send,
  Brain,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Plus,
  RefreshCw,
  Info,
  ShieldCheck,
  Bot,
  Layers,
  MessageSquare
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

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to the bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setServerError(null);

    const userMessage: AIMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
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
    <div className="max-w-[1200px] mx-auto py-2 px-4 space-y-6 animate-fade-in">

      {/* Page Header */}

      {/* Main Grid: Sidebar stats & Chat area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

        {/* Left Column: Automated Portfolio Stats */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">

          {/* Card 1: Diversification & Risk */}
          <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-6 shadow-xl space-y-5">
            <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-[#2E2E2E] pb-3 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#17C99E]" />
              <span>Advisory Metrics</span>
            </h3>

            {portfolio.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <Info className="w-8 h-8 text-gray-500 mx-auto" />
                <p className="text-xs text-gray-400">No assets loaded. Setup your holdings to calculate metrics.</p>
              </div>
            ) : (
              <div className="space-y-6">

                {/* Health Score */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-400">Diversification Rating</span>
                    <span className={`font-black px-2 py-0.5 rounded-md ${divInfo.bg} ${divInfo.color}`}>
                      {divInfo.label}
                    </span>
                  </div>
                  <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden border border-white/5 p-0.5">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-[#17C99E] h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_#17C99E]"
                      style={{ width: `${divInfo.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                    <span>Low</span>
                    <span>Moderate</span>
                    <span>Excellent</span>
                  </div>
                </div>

                {/* Risk profile */}
                <div className="flex items-center justify-between border-t border-[#2E2E2E] pt-4">
                  <span className="text-xs font-semibold text-gray-400">Portfolio Risk Profile</span>
                  <span className={`text-xs font-extrabold ${riskInfo.color}`}>
                    {riskInfo.label}
                  </span>
                </div>

                {/* Allocation breakdown list */}
                <div className="border-t border-[#2E2E2E] pt-4 space-y-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Top Allocations</span>
                  {topAllocations.map(alloc => (
                    <div key={alloc.symbol} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: alloc.color }} />
                          <span className="font-bold text-white uppercase">{alloc.symbol}</span>
                          <span className="text-[10px] text-gray-400 font-medium">({alloc.name})</span>
                        </div>
                        <span className="font-black text-gray-300">{alloc.pct.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            backgroundColor: alloc.color,
                            width: `${alloc.pct}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>

          {/* Card 2: Interactive Tips & Info */}
          <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-6 shadow-xl space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
                <Info className="w-4 h-4 text-[#17C99E]" />
                <span>How it works</span>
              </h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                When you submit a question, we package your current holdings (prices, buys, allocations) and securely transmit them to Groq's high-speed completion engine.
              </p>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                The advisor doesn't have access to your private credentials, wallets, or credit card keys. All insights are educational and based on the mathematical properties of your asset allocation.
              </p>
            </div>

            {portfolio.length === 0 ? (
              <button
                onClick={onOpenAddCryptoModal}
                className="w-full flex items-center justify-center space-x-2 bg-[#17C99E] hover:bg-[#13A682] text-black font-extrabold py-3 px-4 rounded-2xl text-xs transition-all shadow-lg hover:shadow-[#17C99E]/20 mt-4 cursor-pointer"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Add Crypto Asset</span>
              </button>
            ) : (
              <div className="bg-[#17C99E]/10 border border-[#17C99E]/20 rounded-2xl p-4 flex items-start space-x-3 mt-4">
                <ShieldCheck className="w-5 h-5 text-[#17C99E] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">Custody Safeguard</span>
                  <span className="text-[10px] text-gray-400 leading-relaxed block">
                    No real-money trading is supported directly in the Advisory tab. Your funds are 100% safe.
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Chat Hub */}
        <div className="lg:col-span-2 bg-[#212121] border border-[#2E2E2E] rounded-3xl flex flex-col h-[650px] shadow-xl overflow-hidden">

          {/* Chat Header */}
          <div className="bg-black/25 px-6 py-4 border-b border-[#2E2E2E] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#17C99E] animate-pulse" />
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Advisor Chat Room</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Direct line to GPT OSS 20B</p>
              </div>
            </div>

            {messages.length > 1 && (
              <button
                onClick={() => {
                  setMessages(prev => [prev[0]]);
                  setServerError(null);
                }}
                className="text-[10px] font-bold text-gray-400 hover:text-white flex items-center space-x-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Clear Thread</span>
              </button>
            )}
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
                    {isAi ? <Bot className="w-4 h-4" /> : <span className="text-[11px] font-black uppercase">{user?.firstName?.[0] || 'U'}</span>}
                  </div>

                  {/* Message Bubble */}
                  <div className="space-y-1 flex-1">
                    <div className={`px-4.5 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${isAi
                      ? 'bg-[#2E2E2E] text-gray-200 border border-white/5 rounded-tl-sm'
                      : 'bg-[#17C99E] text-black font-semibold rounded-tr-sm'
                      }`}>
                      {isAi ? renderMarkdown(msg.text) : msg.text}
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
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <div className="px-5 py-3.5 bg-[#2E2E2E] text-gray-400 border border-white/5 rounded-2xl rounded-tl-sm text-xs flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-[#17C99E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#17C99E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#17C99E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="font-medium pl-1 text-[11px] text-gray-400">Advisor is compiling analysis...</span>
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
                <span>🔍 Risk Audit</span>
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
                <span>🚀 Asset Narratives</span>
              </button>
              <button
                onClick={() => handleSuggestionClick('Give me a 24h performance summary of my holdings.')}
                className="px-3 py-1.5 bg-[#2E2E2E] hover:bg-[#3E3E3E] text-gray-300 hover:text-white rounded-xl text-[10px] font-bold border border-white/5 flex items-center space-x-1 transition-all shrink-0 cursor-pointer"
              >
                <span>📈 24h Summary</span>
              </button>
            </div>
          )}

          {/* Chat Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-4 bg-black/20 border-t border-[#2E2E2E] flex items-center space-x-3.5"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading || portfolio.length === 0}
              placeholder={
                portfolio.length === 0
                  ? "Import assets to unlock AI advisor chat..."
                  : "Ask a question about your portfolio allocations..."
              }
              className="flex-1 bg-black/40 border border-[#2E2E2E] focus:border-[#17C99E]/50 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim() || portfolio.length === 0}
              className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${!inputValue.trim() || isLoading || portfolio.length === 0
                ? 'bg-black/25 text-gray-600 border border-[#2E2E2E] cursor-not-allowed'
                : 'bg-[#17C99E] text-black hover:bg-[#13A682] hover:shadow-[#17C99E]/10'
                }`}
            >
              <Send className="w-4 h-4 shrink-0" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
