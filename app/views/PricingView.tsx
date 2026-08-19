'use client';

import React, { useState } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import {
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  Crown,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Lock,
  CheckCircle2,
  X
} from 'lucide-react';
import { NavTab } from '../types';

interface PricingViewProps {
  onSelectTab?: (tab: NavTab) => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onSelectTab }) => {
  const { isSignedIn, user } = useUser();
  const [isProUser, setIsProUser] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('current_user_plan') === 'pro';
    }
    return false;
  });

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Pro Plan Reaction State (Preloaded with 77)
  const [reactionCount, setReactionCount] = useState<number>(77);
  const [hasReacted, setHasReacted] = useState<boolean>(false);
  const [isReacting, setIsReacting] = useState<boolean>(false);
  const [justReactedAnim, setJustReactedAnim] = useState<boolean>(false);

  // Get or initialize client ID for anonymous reactions
  const getClientId = () => {
    if (typeof window === 'undefined') return '';
    let cid = localStorage.getItem('current_pro_reaction_client_id');
    if (!cid) {
      cid = 'client_' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem('current_pro_reaction_client_id', cid);
    }
    return cid;
  };

  // Fetch reactions and sync across accounts
  const fetchReactions = async () => {
    try {
      const res = await fetch('/api/pro-reactions', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.count === 'number') {
          setReactionCount(Math.max(77, data.count));
        }
        if (typeof data.hasReacted === 'boolean') {
          setHasReacted(data.hasReacted);
        }
      }
    } catch (e) {
      // ignore network errors
    }
  };

  // On mount and polling every 8s to sync across all accounts live
  React.useEffect(() => {
    fetchReactions();
    const interval = setInterval(fetchReactions, 8000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleToggleReaction = async () => {
    if (isReacting) return;
    setIsReacting(true);

    // Optimistic UI update
    const nextReacted = !hasReacted;
    const nextCount = nextReacted ? reactionCount + 1 : Math.max(77, reactionCount - 1);
    setHasReacted(nextReacted);
    setReactionCount(nextCount);

    if (nextReacted) {
      setJustReactedAnim(true);
      setTimeout(() => setJustReactedAnim(false), 2000);
    }

    try {
      const clientId = user?.id || getClientId();
      const res = await fetch('/api/pro-reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.count === 'number') {
          setReactionCount(Math.max(77, data.count));
        }
        if (typeof data.hasReacted === 'boolean') {
          setHasReacted(data.hasReacted);
        }
      }
    } catch (e) {
      // rollback on error
      fetchReactions();
    } finally {
      setIsReacting(false);
    }
  };

  const handleUpgradeClick = () => {
    if (!isSignedIn) {
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleConfirmUpgrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsProUser(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('current_user_plan', 'pro');
      }
      setIsCheckoutOpen(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    }, 1200);
  };

  const handleCancelPro = () => {
    if (confirm('Are you sure you want to cancel your Pro membership and return to the Free plan?')) {
      setIsProUser(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem('current_user_plan', 'free');
      }
    }
  };

  const faqs = [
    {
      q: 'Why is Current currently free?',
      a: 'Current is currently 100% free for all traders and community members to explore market intelligence, track multi-asset portfolios, and climb the leaderboard.'
    },
    {
      q: 'When is the Pro plan launching?',
      a: 'The Pro plan is coming soon! React with a 👍 to vote for it and help prioritize new features. In the meantime, Current is 100% free with no subscription required.'
    },
    {
      q: 'Do I need a credit card to use Current?',
      a: 'No credit card or payment method is required. Simply create an account or sign in to track your portfolio and participate in the community.'
    },
    {
      q: 'When will the Pro plan launch?',
      a: 'We are continuously improving Current. When advanced premium features launch in the future, early community members who voted will be notified first.'
    }
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 py-2 animate-fade-in">

      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#17C99E] text-black font-extrabold px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>Welcome to Current Pro! All features are now unlocked.</span>
        </div>
      )}

      {/* Top Notice Banner */}


      {/* Pricing Cards Grid (2 Plans: Free & Pro) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
        {/* PLAN 1: FREE (DEFAULT) */}
        <div className="bg-[#212121] border border-[#17C99E]/50 rounded-3xl p-7 shadow-xl flex flex-col justify-between transition-all relative">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#17C99E]">ALL USERS</span>
                <h2 className="text-2xl font-extrabold text-white mt-1">Free Access</h2>
              </div>
              <span className="bg-[#17C99E]/20 border border-[#17C99E]/40 text-[#17C99E] font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                ACTIVE FOR EVERYONE
              </span>
            </div>

            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              Complete portfolio tracking, real-time cryptocurrency market data, and global leaderboard rankings.
            </p>

            {/* Price */}
            <div className="mt-6 flex items-baseline space-x-1">
              <span className="text-4xl sm:text-5xl font-black font-mono text-white">$0</span>
              <span className="text-xs font-bold text-gray-400">/ forever</span>
            </div>
            <div className="text-[11px] font-bold text-[#17C99E] mt-1">Current is 100% free to use • No payment needed</div>

            {/* Feature List */}
            <div className="mt-8 space-y-3 pt-6 border-t border-[#2E2E2E]">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-3">
                Included with Free Access:
              </div>

              {[
                'Real-time live prices for 15,000+ cryptos',
                'Full Portfolio & Multi-Asset tracking (Crypto, Cash, Commodities)',
                'Global Leaderboard rankings & public profiles',
                'Custom watchlist & market gainers/losers tracking',
                'Interactive live price charts & historical views',
                'PnL performance share cards',
                'Community Learning Center & Beginner modules',
                'Standard support'
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-xs text-gray-300">
                  <Check className="w-4 h-4 text-[#17C99E] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8 pt-4">
            <div className="w-full bg-[#161616] border border-[#17C99E]/40 text-[#17C99E] font-extrabold text-xs py-3.5 rounded-2xl text-center shadow-inner flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Current is Free — Enjoy Full Access</span>
            </div>
          </div>
        </div>

        {/* PLAN 2: PRO (COMING SOON) */}
        <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-7 shadow-xl flex flex-col justify-between transition-all relative overflow-hidden opacity-90">

          {/* Top Banner Tag */}
          <div className="absolute top-0 right-0 bg-[#17C99E]/20 border-b border-l border-[#17C99E]/30 text-[#17C99E] font-black text-[10px] uppercase tracking-wider px-4 py-1 rounded-bl-2xl shadow">
            COMING SOON
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#17C99E] flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" /> COMING SOON
                </span>
                <h2 className="text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
                  <span>Current Pro</span>
                  <span className="text-base text-gray-400">👑</span>
                </h2>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              Advanced institutional-grade whale flow alerts, AI copilot signals, and verified leaderboard crowns.
            </p>

            {/* Price */}
            <div className="mt-6 flex items-baseline space-x-2">
              <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                Coming Soon
              </span>
            </div>
            <div className="text-[11px] font-bold text-[#17C99E] mt-1">
              Pro plan is coming soon • Current is currently free
            </div>

            {/* Feature List */}
            <div className="mt-8 space-y-3 pt-6 border-t border-[#2E2E2E]">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-3">
                Planned Future Pro Features:
              </div>

              {[
                'Unlimited Crypto, Cash & Commodity asset tracking',
                'Live Real-time Whale Transaction Alerts & Flow Feed',
                'AI Crypto Portfolio Copilot & Smart Signals',
                'Verified Pro Crown Badge 👑 on Global Leaderboard',
                'Advanced Multi-Timeframe Allocation & Risk Analytics',
                'Exclusive DeFi, Memecoin & ETF Alpha Research',
                '1-Click Tax & PnL Report CSV Exports',
                'Priority 24/7 VIP Support'
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-xs text-gray-400">
                  <div className="w-4 h-4 rounded-full bg-[#2A2A2A] text-gray-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* React to Get Pro Sooner */}
          <div className="mt-8 pt-4 space-y-3">
            <button
              onClick={handleToggleReaction}
              className={`w-full py-3.5 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center space-x-3 border shadow-lg active:scale-[0.97] ${hasReacted
                  ? 'bg-[#17C99E] text-black border-[#17C99E] shadow-[#17C99E]/20 hover:bg-[#14B8A6]'
                  : 'bg-[#161616] hover:bg-[#2A2A2A] text-white border-[#2E2E2E] hover:border-[#17C99E]/50'
                }`}
            >
              <span className={`text-lg transition-transform ${justReactedAnim ? 'scale-150 animate-bounce' : 'scale-100'}`}>
                👍
              </span>
              <span>{hasReacted ? 'You Voted!' : 'React to Get Pro Sooner'}</span>
              <span className="font-mono bg-black/20 px-2 py-0.5 rounded-lg text-xs">
                {reactionCount}
              </span>
            </button>
            <div className="text-[10px] text-gray-500 text-center">
              {hasReacted ? 'Thanks for your vote! We\'ll notify you when Pro launches.' : 'Vote to help prioritize the Pro plan launch.'}
            </div>
          </div>

        </div>

      </div>

      {/* Trust & Guarantee Badges */}
      <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-6 shadow-xl max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-[#161616] border border-[#2E2E2E] flex items-center justify-center text-[#17C99E]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xs font-extrabold text-white">100% Free Platform</div>
          <div className="text-[11px] text-gray-400">All features are accessible for free during this phase.</div>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-[#161616] border border-[#2E2E2E] flex items-center justify-center text-[#17C99E]">
            <Zap className="w-5 h-5" />
          </div>
          <div className="text-xs font-extrabold text-white">Instant Access</div>
          <div className="text-[11px] text-gray-400">Live prices, portfolio tracking, and leaderboard available right away.</div>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-[#161616] border border-[#2E2E2E] flex items-center justify-center text-[#17C99E]">
            <Lock className="w-5 h-5" />
          </div>
          <div className="text-xs font-extrabold text-white">No Credit Card Needed</div>
          <div className="text-[11px] text-gray-400">No payment information or paid subscription required.</div>
        </div>
      </div>

      {/* Feature Comparison Matrix Table */}
      <div className="max-w-4xl mx-auto bg-[#212121] border border-[#2E2E2E] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-extrabold text-white">Detailed Plan Comparison</h3>
          <p className="text-xs text-gray-400">Current is currently free for all traders.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#2E2E2E] text-gray-400 font-extrabold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Feature</th>
                <th className="py-3 px-4 text-center text-[#17C99E]">Free Access (Active)</th>
                <th className="py-3 px-4 text-center text-gray-400">Current Pro (Coming Soon)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E2E2E] text-gray-300">
              {[
                { name: 'Live Market Data (15,000+ coins)', free: 'Yes', pro: 'Yes' },
                { name: 'Portfolio Holdings Limit', free: 'Up to 10 Assets', pro: 'Unlimited Assets' },
                { name: 'Commodities & Cash Tracking', free: 'Basic', pro: 'Full Support' },
                { name: 'Global Leaderboard Ranking', free: 'Standard', pro: 'Verified Crown 👑' },
                { name: 'Real-time Whale Transaction Alerts', free: '❌', pro: 'Instant Live Feed' },
                { name: 'AI Portfolio Copilot & Insights', free: '❌', pro: 'Unlimited Access' },
                { name: 'Multi-Timeframe Portfolio Analytics', free: 'Basic', pro: 'Advanced Risk & PnL' },
                { name: 'DeFi & ETF Alpha Research Reports', free: 'Limited', pro: 'Full Access' },
                { name: '1-Click CSV Tax / PnL Export', free: '❌', pro: 'Included' },
                { name: 'VIP Priority Support', free: 'Standard', pro: '24/7 Dedicated VIP' }
              ].map((row, i) => (
                <tr key={i} className="hover:bg-[#2A2A2A]/40 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-white">{row.name}</td>
                  <td className="py-3.5 px-4 text-center text-gray-400">{row.free}</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-[#17C99E]">{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-extrabold text-white">Frequently Asked Questions</h3>
          <p className="text-xs text-gray-400">Everything you need to know about Current billing.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="bg-[#212121] border border-[#2E2E2E] rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-[#17C99E] transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#17C99E]" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-gray-400 leading-relaxed border-t border-[#2E2E2E]/50 pt-3 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Checkout Modal Simulation */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#212121] border border-[#2E2E2E] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6 animate-scale-in relative">

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#17C99E]">Upgrade Membership</span>
                <span className="text-xs font-mono font-bold bg-[#161616] border border-[#2E2E2E] px-2.5 py-0.5 rounded-full text-white">
                  Current Pro
                </span>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#2A2A2A] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#161616] border border-[#2E2E2E] p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Current Pro Monthly Membership</span>
                <span className="text-sm font-black font-mono text-[#17C99E]">
                  $19.99 / mo
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Includes 14-day full refund guarantee. Cancel anytime with 1-click.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] font-bold text-gray-400 uppercase">Payment Method</div>
              <div className="p-3 rounded-xl bg-[#161616] border border-[#2E2E2E] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-[#17C99E]" />
                  <div>
                    <div className="text-xs font-bold text-white">Credit / Debit Card</div>
                    <div className="text-[10px] text-gray-400">Visa, Mastercard, Amex, Apple Pay</div>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#17C99E]" />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleConfirmUpgrade}
                disabled={isProcessing}
                className="w-full bg-[#17C99E] hover:bg-[#14B8A6] text-black font-black text-sm py-3.5 rounded-2xl transition-all shadow-xl flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {isProcessing ? (
                  <span>Activating Pro Account...</span>
                ) : (
                  <>
                    <span>Confirm & Pay $19.99</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="text-[11px] text-gray-500 text-center flex items-center justify-center space-x-1.5">
              <Lock className="w-3 h-3" />
              <span>Encrypted with 256-Bit SSL protocol</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
