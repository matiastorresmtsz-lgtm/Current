'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { UserButton, useClerk, useUser } from '@clerk/nextjs';
import { ArrowRight, BarChart3, Building2, Coins, Eye, Menu, MessageCircle, Pencil, PieChart, ScanSearch, Sparkles, Upload, X, Zap } from 'lucide-react';
import { animate, motion } from 'motion/react';


export default function AboutPage() {
  const [isHeaderFloating, setIsHeaderFloating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);
  const { openSignIn, openSignUp } = useClerk();
  const { isLoaded, isSignedIn } = useUser();
  const isAuthenticated = isLoaded && isSignedIn;

  useEffect(() => {
    const handleScroll = () => setIsHeaderFloating(window.scrollY > 32);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const targetId = event.currentTarget.getAttribute('href')?.slice(1);
    const target = targetId ? document.getElementById(targetId) : null;

    if (!target) return;

    event.preventDefault();
    const targetPosition = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 24);

    animate(window.scrollY, targetPosition, {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (value) => window.scrollTo(0, value),
    });
  };

  return (
    <main className="landing-page min-h-screen overflow-hidden bg-[#f5f0ee] text-[#161616]">
      <section
        className="relative min-h-[760px] bg-cover bg-center sm:min-h-screen"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=2400&q=85)' }}
      >
        <div className="absolute inset-0 bg-[#eef4f0]/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-transparent to-[#eef4f0]/90" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-56 bg-gradient-to-b from-transparent via-[#f5f0ee]/55 to-[#f5f0ee]" />

        {isAnnouncementVisible && (
          <div className="fixed inset-x-0 top-0 z-50 flex h-10 items-center justify-center bg-[#17C99E] px-12 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-white sm:h-11 sm:text-xs">
            Current Pro <span className="mx-2 text-white/50">|</span> Coming soon
            <button type="button" onClick={() => setIsAnnouncementVisible(false)} className="announcement-dismiss !absolute right-4 top-1/2 -translate-y-1/2 !m-0 !border-0 !bg-transparent !p-1 !text-white/80 !shadow-none !transition-colors hover:!bg-transparent hover:!text-white" aria-label="Dismiss announcement">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <header className={`fixed inset-x-0 z-50 transition-[padding,top] duration-300 ${isAnnouncementVisible ? 'top-10 sm:top-11' : 'top-0'} ${isHeaderFloating ? 'px-3 pt-3 sm:px-6 sm:pt-5' : ''}`}>
          <div className={`mx-auto flex h-20 max-w-[1240px] items-center justify-between border border-transparent px-5 transition-[background-color,border-color,border-radius,box-shadow] duration-300 sm:px-8 ${isHeaderFloating ? 'rounded-2xl border-white/70 bg-white/65 shadow-[0_14px_36px_rgba(45,37,37,0.16)] backdrop-blur-xl' : ''}`}>
            <Link href="/dashboard" className="font-extrabold text-2xl tracking-tight text-[#17C99E]" aria-label="Go to Current dashboard">
              current
            </Link>
            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-xs font-semibold text-[#303735] md:flex" aria-label="About navigation">
              <a href="#platform" onClick={handleNavClick} className="rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-black/[0.06] hover:text-[#087d62]">Features</a>
              <a href="#plans" onClick={handleNavClick} className="rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-black/[0.06] hover:text-[#087d62]">Pricing</a>
              <a href="#faq" onClick={handleNavClick} className="rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-black/[0.06] hover:text-[#087d62]">FAQ</a>
            </nav>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="landing-primary-button inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-xs font-bold">
                    Open dashboard
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <UserButton />
                </>
              ) : (
                <>
                  <button type="button" onClick={() => openSignIn?.()} className="hidden rounded-lg px-3 py-2 text-xs font-bold text-[#303735] transition-colors hover:text-[#087d62] sm:inline-flex">
                    Sign in
                  </button>
                  <button type="button" onClick={() => openSignUp?.()} className="inline-flex items-center gap-2 rounded-lg bg-[#161616] px-3.5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#087d62]">
                    Open Current
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
              <button type="button" onClick={() => setIsMenuOpen((open) => !open)} className="rounded-lg p-2 text-[#303735] md:hidden" aria-label="Open navigation" aria-expanded={isMenuOpen}>
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
          {isMenuOpen && (
            <nav className="mx-auto mt-2 flex max-w-[1240px] flex-col gap-1 rounded-xl border border-white/70 bg-white/85 p-2 text-sm font-semibold text-[#303735] shadow-lg backdrop-blur-xl md:hidden" aria-label="Mobile About navigation">
              <a href="#platform" onClick={(event) => { handleNavClick(event); setIsMenuOpen(false); }} className="rounded-lg px-3 py-2 hover:bg-black/[0.06]">Features</a>
              <a href="#plans" onClick={(event) => { handleNavClick(event); setIsMenuOpen(false); }} className="rounded-lg px-3 py-2 hover:bg-black/[0.06]">Pricing</a>
              <a href="#faq" onClick={(event) => { handleNavClick(event); setIsMenuOpen(false); }} className="rounded-lg px-3 py-2 hover:bg-black/[0.06]">FAQ</a>
              {isAuthenticated ? (
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="landing-primary-button rounded-lg px-3 py-2">Open dashboard</Link>
              ) : (
                <>
                  <button type="button" onClick={() => { openSignIn?.(); setIsMenuOpen(false); }} className="rounded-lg px-3 py-2 text-left hover:bg-black/[0.06]">Sign in</button>
                  <button type="button" onClick={() => { openSignUp?.(); setIsMenuOpen(false); }} className="rounded-lg px-3 py-2 text-left hover:bg-black/[0.06]">Start with Current</button>
                </>
              )}
            </nav>
          )}
        </header>

        <div className="relative z-10 mx-auto max-w-[1240px] px-5 pb-16 pt-40 sm:px-8 sm:pb-24 sm:pt-28">
          <div className="max-w-[660px]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 mb-6 inline-flex max-w-full items-center gap-3 rounded-full px-3 py-2 text-sm text-black  sm:mt-14 sm:gap-4 sm:px-4"
            >
              <span className="flex shrink-0 items-center pl-1" aria-hidden="true">
                <span className="h-8 w-8 rounded-full border-2 border-[#1743a3] bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=160&q=85)' }} />
                <span className="-ml-2 h-8 w-8 rounded-full border-2 border-[#1743a3] bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=160&q=85)' }} />
                <span className="-ml-2 h-8 w-8 rounded-full border-2 border-[#1743a3] bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=160&q=85)' }} />
              </span>
              <span className="min-w-0 leading-5"><strong className="font-extrabold">3,434 people</strong> analyzing their portfolios with Current</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[620px] text-5xl font-extrabold leading-[0.98] tracking-tight text-[#101513] sm:text-7xl"
            >
              The 1# AI Analizer For Crypto Portfolios.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 max-w-[520px] text-base leading-7 text-[#46514d] sm:text-lg"
            >
              Current brings your holdings, market context, and investing community into one calm workspace built for better decisions.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              {isAuthenticated ? (
                <Link href="/dashboard" className="landing-primary-button inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-extrabold">
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <button type="button" onClick={() => openSignUp?.()} className="inline-flex items-center gap-2 rounded-lg bg-[#17C99E] px-4 py-3 text-sm font-extrabold text-[#07130f] transition-colors hover:bg-[#0eaf88]">
                  Start with Current
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
              <a href="#platform" className="inline-flex items-center gap-2 rounded-lg border border-[#63736d]/35 bg-white/45 px-4 py-3 text-sm font-bold text-[#303735] transition-colors hover:bg-white/70">
                See the platform
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            id="platform"
            className="relative z-10 mx-auto mt-16 min-h-[430px] w-full max-w-[1120px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_24px_70px_rgba(22,35,31,0.12)] sm:mt-20 sm:aspect-[2.7/1] sm:min-h-0"
          >
            {/* Browser Chrome Bar */}
            <div className="relative flex items-center justify-between border-b border-gray-200 bg-gray-50/80 px-4 py-2.5 sm:px-5">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#f3c86a]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#17C99E]" />
              </div>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md border border-gray-200 bg-gray-100 px-3 py-1 text-[10px] font-semibold text-gray-500">currentsocial.xyz</span>
              <div className="flex items-center gap-2 text-[9px] text-gray-400"><span className="hidden sm:inline">+ Add Holding</span><span className="h-5 w-5 rounded-full bg-gray-200" /></div>
            </div>

            {/* Dashboard Content */}
            <div className="grid gap-3 p-4 sm:grid-cols-[52px_1fr_185px] sm:p-5">
              {/* Left Icon Sidebar */}
              <aside className="hidden border-r border-gray-200 pr-3 sm:flex flex-col items-center gap-3 pt-1">
                <span className="mb-3 text-xs font-extrabold text-[#17C99E]">c</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#17C99E]/15 text-[#17C99E]"><PieChart className="h-3.5 w-3.5" /></span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400"><Sparkles className="h-3.5 w-3.5" /></span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400"><Zap className="h-3.5 w-3.5" /></span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400"><BarChart3 className="h-3.5 w-3.5" /></span>
              </aside>

              {/* Main Content Area */}
              <div className="min-w-0">
                {/* Top Controls */}
                <div className="flex items-center gap-3 border-b border-gray-200 pb-2.5 text-[10px] text-gray-500">
                  <span className="border-b-2 border-[#17C99E] pb-2.5 font-bold text-gray-900">All</span>
                  <span className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 font-medium text-gray-600">$ USD ⌄</span>
                  <span className="hidden rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-gray-500 md:inline">Showing: All Accounts</span>
                  <span className="ml-auto hidden items-center gap-2 text-[9px] md:flex"><span className="text-gray-400">Goal</span><span className="h-1.5 w-24 rounded-full bg-gray-200 overflow-hidden"><span className="block h-full w-full rounded-full bg-[#17C99E]" /></span><span className="text-gray-500">100%</span></span>
                </div>

                {/* Portfolio Grid */}
                <div className="mt-3 grid gap-2.5 lg:grid-cols-[1.1fr_1fr]">
                  {/* Donut Chart Card */}
                  <div className="flex min-h-[170px] items-center justify-center rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="relative flex h-32 w-32 items-center justify-center">
                      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                        <circle cx="60" cy="60" r="48" fill="none" stroke="#e5e7eb" strokeWidth="16" />
                        <circle cx="60" cy="60" r="48" fill="none" stroke="#3b82f6" strokeWidth="16" strokeDasharray="280 301.59" strokeLinecap="round" />
                        <circle cx="60" cy="60" r="48" fill="none" stroke="#17C99E" strokeWidth="16" strokeDasharray="18 301.59" strokeDashoffset="-280" strokeLinecap="round" />
                      </svg>
                      <div className="absolute text-center">
                        <p className="text-base font-extrabold text-gray-900">$310,550.78</p>
                        <p className="text-[8px] text-gray-400">Portfolio Value</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Cards Stack */}
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Today's Return */}
                      <div className="rounded-2xl border border-gray-200 bg-white p-3">
                        <p className="text-[8px] font-semibold uppercase tracking-wide text-gray-400">Today&apos;s Return ⌄</p>
                        <p className="mt-1.5 text-sm font-extrabold text-[#EF4444]">$-6,770.01</p>
                        <p className="mt-0.5 text-[9px] font-bold text-[#EF4444]">-2.18% <span className="font-normal text-gray-400">Today</span></p>
                      </div>
                      {/* All-Time Return */}
                      <div className="rounded-2xl border border-gray-200 bg-white p-3">
                        <p className="text-[8px] font-semibold uppercase tracking-wide text-gray-400">All-Time Return</p>
                        <p className="mt-1.5 text-sm font-extrabold text-[#10B981]">+$55,515.77</p>
                        <p className="mt-0.5 text-[9px] font-bold text-[#10B981]">+21.77% <span className="font-normal text-gray-400">All time</span></p>
                      </div>
                    </div>
                    {/* Quick Actions */}
                    <div className="grid grid-cols-4 gap-1 rounded-2xl border border-gray-200 bg-white p-2.5 text-center text-[7px] text-gray-500">
                      <span className="flex flex-col items-center gap-1"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#14B8A6]/15 text-[#14B8A6]"><Building2 className="h-3 w-3" /></span>Add Investments</span>
                      <span className="flex flex-col items-center gap-1"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAB308]/15 text-[#EAB308]"><Coins className="h-3 w-3" /></span>Add cash</span>
                      <span className="flex flex-col items-center gap-1"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6]"><Eye className="h-3 w-3" /></span>Visibility</span>
                      <span className="flex flex-col items-center gap-1"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F97316]/15 text-[#F97316]"><Pencil className="h-3 w-3" /></span>Edit portfolio</span>
                    </div>
                  </div>
                </div>

                {/* Holdings Table */}
                <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-3">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2"><span className="text-xs font-bold text-gray-900">Holdings</span><span className="text-[8px] text-gray-400">Sort: <b className="text-gray-700">Total value</b> ⌄</span></div>
                  <div className="mt-2.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-[9px]"><span className="flex items-center gap-1.5"><span className="h-5 w-5 rounded-full bg-[#f7931a] flex items-center justify-center text-[6px] font-bold text-white">₿</span><span><b className="text-gray-900">BTC</b> <span className="text-gray-400">Bitcoin</span></span></span><span className="text-gray-500">100.00%</span><span className="font-bold text-gray-900">$310,548.00</span><span className="font-bold text-[#10B981]">+$55,515.00</span></div>
                    <div className="flex items-center justify-between gap-2 text-[9px]"><span className="flex items-center gap-1.5"><span className="h-5 w-5 rounded-full bg-[#8B5CF6] flex items-center justify-center text-[6px] font-bold text-white">R</span><span><b className="text-gray-900">RAIN</b> <span className="text-gray-400">Rain</span></span></span><span className="text-gray-500">0.00%</span><span className="font-bold text-gray-900">$0.02</span><span className="font-bold text-[#10B981]">+$0.00</span></div>
                  </div>
                </div>
              </div>

              {/* Right Watchlist Sidebar */}
              <aside className="hidden rounded-2xl border border-gray-200 bg-white p-3 sm:block">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2.5 text-[10px] font-bold text-gray-900"><span><span className="text-[#17C99E]">◉</span> Watchlist · 6</span><span className="text-[#17C99E]">+ Add</span></div>
                <div className="space-y-3 pt-3">
                  {[
                    ['₿', 'bg-[#f7931a]', 'BTC', 'Bitcoin', '$77,637', '-2.18%'],
                    ['Ξ', 'bg-[#627eea]', 'ETH', 'Ethereum', '$2,424.93', '-2.19%'],
                    ['✕', 'bg-gray-900', 'XRP', 'XRP', '$1.38', '-2.36%'],
                    ['◎', 'bg-gradient-to-r from-[#9945FF] to-[#14F195]', 'SOL', 'Solana', '$183.37', '-2.61%'],
                  ].map(([icon, bg, symbol, name, price, change]) => (
                    <div key={symbol} className="flex items-center justify-between gap-1.5 text-[9px]">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-5 w-5 flex items-center justify-center rounded-full text-[7px] font-bold text-white ${bg}`}>{icon}</span>
                        <div><b className="text-gray-900">{symbol}</b><p className="text-gray-400 text-[8px]">{name}</p></div>
                      </div>
                      <div className="text-right"><b className="text-gray-900">{price}</b><p className="text-[#EF4444]">{change}</p></div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="process" className="bg-white px-5 py-20 text-[#161616] sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1100px]">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#087d62]">A clearer way to decide</p>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-[#101513] sm:text-6xl">Upload. Analyze. Ask.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#68736e] sm:text-base">In three simple steps, turn your portfolio into a conversation you can act on.</p>
          </div>

          <div className="mx-auto mt-12 max-w-[780px] space-y-4 sm:mt-16 sm:space-y-5">
            <article className="relative overflow-hidden rounded-2xl border border-[#dfe8f5] bg-[#fbfdff] shadow-[0_14px_34px_rgba(54,87,127,0.1)]">
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#dff7ef] to-transparent" />
              <div className="relative flex min-h-[190px] flex-col items-center justify-center px-6 py-10 text-center sm:min-h-[205px]">
                <span className="landing-primary-button inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-extrabold"><Upload className="h-4 w-4" /> Step 1</span>
                <h3 className="mt-5 text-xl font-extrabold sm:text-2xl">Upload your portfolio holdings</h3>
                <p className="mt-2 text-sm text-[#68736e]">Upload your holdings and Current does the organizing.</p>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-2xl border border-[#dfe8f5] bg-[#fbfdff] shadow-[0_14px_34px_rgba(54,87,127,0.1)]">
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#d8f3e9] to-transparent" />
              <div className="relative flex min-h-[190px] flex-col items-center justify-center px-6 py-10 text-center sm:min-h-[205px]">
                <span className="landing-primary-button inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-extrabold"><ScanSearch className="h-4 w-4" /> Step 2</span>
                <h3 className="mt-5 text-xl font-extrabold sm:text-2xl">AI analyzes your portfolio</h3>
                <p className="mt-2 text-sm text-[#68736e]">Current reads your allocation, risk, and market context for useful signals.</p>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-2xl border border-[#dfe8f5] bg-[#fbfdff] shadow-[0_14px_34px_rgba(54,87,127,0.1)]">
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#e1f5ee] to-transparent" />
              <div className="relative flex min-h-[190px] flex-col items-center justify-center px-6 py-10 text-center sm:min-h-[205px]">
                <span className="landing-primary-button inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-extrabold"><MessageCircle className="h-4 w-4" /> Step 3</span>
                <h3 className="mt-5 text-xl font-extrabold sm:text-2xl">Ask questions and get your next move</h3>
                <p className="mt-2 text-sm text-[#68736e]">Ask anything about your portfolio and get clear, personalized direction.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="principles" className="bg-[#f5f0ee] px-5 py-20 text-[#161616] sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1100px]">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#087d62]">What Current does</p>
            <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-[#101513] sm:text-6xl">The hard parts of investing, handled.</h2>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-[#68736e] sm:text-base">The context you need to make sense of your portfolio, without adding another noisy tool to your day.</p>
          </div>

          <div className="mt-14 space-y-6 sm:mt-20">
            <article className="about-card grid overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_rgba(45,37,37,0.08)] md:grid-cols-2">
              <div className="p-7 sm:p-12">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#087d62]">01 · Portfolio tracking</p>
                <h3 className="mt-5 max-w-md text-2xl font-extrabold leading-tight text-[#161616] sm:text-3xl">Know where you stand, at a glance.</h3>
                <p className="mt-5 max-w-md text-sm leading-6 text-[#707a75]">Track holdings, allocation, returns, and goals in one focused view. Less tab switching, more useful signal.</p>
                <ul className="mt-7 space-y-3 text-xs font-semibold text-[#46514d]">
                  <li className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#dff7ef] text-[#087d62]">✓</span>Live portfolio performance</li>
                  <li className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#dff7ef] text-[#087d62]">✓</span>Clear allocation and return data</li>
                  <li className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#dff7ef] text-[#087d62]">✓</span>No spreadsheet maintenance</li>
                </ul>
              </div>
              <div className="flex min-h-[300px] items-center justify-center bg-gradient-to-br from-[#e6c8e2] via-[#e6d5dd] to-[#f3e9b8] p-7 sm:p-10">
                <div className="w-full max-w-[390px] rounded-xl bg-white p-5 shadow-[0_16px_30px_rgba(63,49,63,0.13)]">
                  <div className="flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-wider text-[#7c777e]">Portfolio value</span><span className="text-[9px] font-bold text-[#087d62]">+8.42%</span></div>
                  <p className="mt-3 text-2xl font-extrabold text-[#161616]">$308,722.95</p>
                  <div className="mt-5 flex h-20 items-end gap-1.5 border-b border-[#e8e4e7] pb-1">{[28, 35, 30, 44, 39, 52, 48, 65, 58, 76, 70, 91].map((height, index) => <span key={index} className="flex-1 rounded-t-sm bg-[#17C99E]" style={{ height: `${height}%` }} />)}</div>
                  <div className="mt-4 flex justify-between text-[9px] font-semibold text-[#8a878c]"><span>Jan</span><span>Jun</span><span>Dec</span></div>
                </div>
              </div>
            </article>

            <article className="about-card grid overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_rgba(45,37,37,0.08)] md:grid-cols-2" style={{ animationDelay: '120ms' }}>
              <div className="order-2 flex min-h-[300px] items-center justify-center bg-[#dceee8] p-7 sm:p-10 md:order-1">
                <div className="w-full max-w-[390px] rounded-xl bg-[#18231f] p-5 shadow-[0_16px_30px_rgba(23,54,43,0.18)]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4"><span className="text-[9px] font-bold uppercase tracking-wider text-white/50">Market context</span><span className="rounded-full bg-[#17C99E]/15 px-2 py-1 text-[9px] font-bold text-[#17C99E]">Live</span></div>
                  <div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-lg bg-white/[0.08] p-3"><p className="text-[9px] text-white/45">Market mood</p><p className="mt-2 text-sm font-extrabold text-white">Constructive</p></div><div className="rounded-lg bg-white/[0.08] p-3"><p className="text-[9px] text-white/45">Watchlist</p><p className="mt-2 text-sm font-extrabold text-white">4 assets</p></div></div>
                  <div className="mt-3 rounded-lg bg-white/[0.08] p-3"><p className="text-[9px] text-white/45">Your next signal</p><div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-full w-3/4 rounded-full bg-[#17C99E]" /></div><p className="mt-2 text-[9px] text-white/50">Portfolio trend is improving</p></div>
                </div>
              </div>
              <div className="order-1 p-7 sm:p-12 md:order-2">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#087d62]">02 · Market screening</p>
                <h3 className="mt-5 max-w-md text-2xl font-extrabold leading-tight text-[#161616] sm:text-3xl">Find the signal faster.</h3>
                <p className="mt-5 max-w-md text-sm leading-6 text-[#707a75]">Screen the market by performance, momentum, and the metrics that matter to you.</p>
              </div>
            </article>
            <article className="about-card grid overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_rgba(45,37,37,0.08)] md:grid-cols-2" style={{ animationDelay: '240ms' }}>
              <div className="flex min-h-[300px] items-center justify-center bg-[#e8e5f4] p-7 sm:p-10">
                <div className="w-full max-w-[390px] rounded-xl bg-white p-5 shadow-[0_16px_30px_rgba(63,49,63,0.13)]">
                  <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-[#7c777e]"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#17C99E] text-[#161616]">✦</span> AI portfolio advisory</div>
                  <p className="mt-3 text-xs font-semibold leading-5 text-[#46514d]">Your allocation is diversified, but BTC represents 72% of your total risk.</p>
                  <div className="mt-3 h-2 rounded-full bg-[#e8e4e7]"><div className="h-full w-[72%] rounded-full bg-[#17C99E]" /></div>
                </div>
              </div>
              <div className="p-7 sm:p-12">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#087d62]">03 · AI portfolio advisory</p>
                <h3 className="mt-5 max-w-md text-2xl font-extrabold leading-tight text-[#161616] sm:text-3xl">Turn data into direction.</h3>
                <p className="mt-5 max-w-md text-sm leading-6 text-[#707a75]">Get thoughtful, portfolio-aware guidance that helps you understand your next move.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="plans" className="bg-[#f5f0ee] px-5 py-20 text-[#161616] sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1100px]">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#087d62]">Plans </p>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-[#101513] sm:text-6xl">Choose how clearly you want to see.</h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-[#68736e] sm:text-base">Start with the essentials, or give your investing a third eye with deeper portfolio-aware guidance.</p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
            <article className="flex min-h-[500px] flex-col rounded-2xl border border-[#161616]/20 bg-white p-7 text-[#161616] shadow-[0_14px_32px_rgba(22,22,22,0.06)] sm:p-9">
              <p className="text-sm font-medium uppercase tracking-[0.12em] text-[#68736e]">The essentials</p>
              <h3 className="mt-8 text-2xl font-extrabold">Current Free</h3>
              <p className="mt-6 text-5xl font-extrabold tracking-tight">$0</p>
              <p className="mt-2 text-base text-[#68736e]">forever</p>
              <p className="mt-8 text-sm leading-6 text-[#68736e]">A calm home for your portfolio, market discovery, and investing education.</p>
              <ul className="mt-8 space-y-5 text-sm font-medium text-[#46514d]">
                <li className="flex gap-3"><span aria-hidden="true">✓</span>Portfolio tracking and allocation</li>
                <li className="flex gap-3"><span aria-hidden="true">✓</span>Market discovery and watchlists</li>
                <li className="flex gap-3"><span aria-hidden="true">✓</span>Insights, topics, and learning</li>
              </ul>
              {isAuthenticated ? (
                <Link href="/dashboard" style={{ marginTop: '40px' }} className="landing-primary-button inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-extrabold">Open dashboard</Link>
              ) : (
                <button type="button" onClick={() => openSignUp?.()} style={{ marginTop: '40px' }} className="inline-flex w-full items-center justify-center rounded-full border border-[#161616]/65 px-4 py-3 text-sm font-extrabold text-[#161616] transition-colors hover:bg-[#161616] hover:text-white">Start free</button>
              )}
            </article>

            <article className="flex min-h-[500px] flex-col rounded-2xl border border-[#161616]/20 bg-white p-7 text-[#161616] shadow-[0_14px_32px_rgba(22,22,22,0.06)] sm:p-9">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-medium uppercase tracking-[0.12em] text-[#68736e]">The third eye</p>
                <span className="rounded-full border border-[#161616]/35 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#161616]">Coming soon</span>
              </div>
              <h3 className="mt-8 text-2xl font-extrabold">Current Pro</h3>
              <p className="mt-6 text-5xl font-extrabold tracking-tight">$9.99</p>
              <p className="mt-2 text-base text-[#68736e]">per month</p>
              <p className="mt-8 text-sm leading-6 text-[#68736e]">Your third eye for investing: sharper context, clearer signals, and guidance that understands your portfolio.</p>
              <ul className="mt-8 space-y-5 text-sm font-medium text-[#46514d]">
                <li className="flex gap-3"><span aria-hidden="true">✓</span>Everything in Current Free</li>
                <li className="flex gap-3"><span aria-hidden="true">✓</span>Portfolio-aware AI advisory</li>
                <li className="flex gap-3"><span aria-hidden="true">✓</span>Deeper signals and market context</li>
              </ul>
              <span className="mt-auto inline-flex w-full items-center justify-center rounded-full bg-[#161616] px-4 py-3 text-sm font-extrabold text-white/65">Coming soon</span>
            </article>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-[#eef3f0] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#087d62]">A simple starting point</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#101513] sm:text-5xl">Everything you need to get oriented.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#52605a]">Current keeps the important parts of crypto investing close, understandable, and ready when you need them.</p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <article className="about-card rounded-2xl border border-[#dce5e0] bg-white p-6 shadow-[0_14px_32px_rgba(45,65,55,0.06)] sm:p-7">
              <span className="text-xs font-bold text-[#087d62]">01</span>
              <h3 className="mt-8 text-lg font-extrabold text-[#161616]">What is Current?</h3>
              <p className="mt-3 text-sm leading-6 text-[#68736e]">An open-source workspace for tracking a crypto portfolio, learning the market, and making more informed decisions.</p>
            </article>
            <article className="about-card rounded-2xl border border-[#dce5e0] bg-white p-6 shadow-[0_14px_32px_rgba(45,65,55,0.06)] sm:p-7" style={{ animationDelay: '120ms' }}>
              <span className="text-xs font-bold text-[#087d62]">02</span>
              <h3 className="mt-8 text-lg font-extrabold text-[#161616]">How do I use it?</h3>
              <p className="mt-3 text-sm leading-6 text-[#68736e]">Start with your portfolio, use Markets to explore assets, and follow Insights and Topics as your perspective develops.</p>
            </article>
            <article className="about-card rounded-2xl border border-[#dce5e0] bg-white p-6 shadow-[0_14px_32px_rgba(45,65,55,0.06)] sm:p-7" style={{ animationDelay: '240ms' }}>
              <span className="text-xs font-bold text-[#087d62]">03</span>
              <h3 className="mt-8 text-lg font-extrabold text-[#161616]">Is it free?</h3>
              <p className="mt-3 text-sm leading-6 text-[#68736e]">Yes. The core experience is free to use, with Current Pro available for deeper portfolio-aware guidance.</p>
            </article>
          </div>

          <div className="mx-auto mt-16 max-w-3xl" aria-labelledby="faq-heading">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#087d62]">FAQ</p>
              <h3 id="faq-heading" className="mt-3 text-2xl font-extrabold text-[#101513] sm:text-3xl">A few quick answers.</h3>
            </div>
            <div className="mt-8 space-y-3">
              {[
                ['What is Current?', 'Current is a social investing workspace for tracking your crypto portfolio, exploring markets, and learning with more context.'],
                ['How do I get started?', 'Open the dashboard, add your holdings, and use the portfolio view to see value, allocation, and performance in one place.'],
                ['Do I need to connect a wallet?', 'No. You can add holdings manually, so your portfolio stays under your control and no wallet connection is required.'],
                ['Is Current free to use?', 'Yes. The core product is free to use, and Current Pro is available for investors who want deeper guidance and context.'],
                ['Is Current open source?', 'Yes. Current is built in the open so the community can inspect the project and help improve it over time.'],
              ].map(([question, answer], index) => (
                <details key={question} className="about-card group rounded-xl border border-[#dce5e0] bg-white px-5 py-4 shadow-[0_10px_24px_rgba(45,65,55,0.05)]" style={{ animationDelay: `${360 + index * 100}ms` }}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-extrabold text-[#161616] marker:hidden">
                    {question}
                    <span className="text-xl font-normal leading-none text-[#087d62] transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="max-w-2xl pt-3 text-sm leading-6 text-[#68736e]">{answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-5 border-t border-[#cbd9d2] pt-7 sm:flex-row">
            <p className="text-sm font-semibold text-[#52605a]">Ready to see your portfolio more clearly?</p>
            <Link href="/dashboard" className="inline-flex shrink-0 items-center gap-2 text-sm font-extrabold text-[#087d62] hover:text-[#161616]">
              Explore the dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}