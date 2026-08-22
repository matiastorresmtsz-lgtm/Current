import Link from 'next/link';
import { ArrowRight, Menu } from 'lucide-react';
import { AboutReveal } from './AboutReveal';

const previewMetrics = [
  { label: 'Today\'s return', value: '-$1,852.24', change: '-0.60%' },
  { label: 'All-time return', value: '+$53,687.94', change: '+21.05%' },
];

const previewWatchlist = [
  ['BTC', 'Bitcoin', '$77,180', '-0.60%'],
  ['ETH', 'Ethereum', '$2,420.53', '+0.80%'],
  ['XRP', 'XRP', '$1.47', '+2.70%'],
  ['SOL', 'Solana', '$93.98', '+1.30%'],
];

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f0ee] text-[#161616]">
      <section
        className="relative min-h-[760px] bg-cover bg-center sm:min-h-screen"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=2400&q=85)' }}
      >
        <div className="absolute inset-0 bg-[#eef4f0]/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-transparent to-[#eef4f0]/90" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-56 bg-gradient-to-b from-transparent via-[#f5f0ee]/55 to-[#f5f0ee]" />

        <header className="relative z-10">
          <div className="mx-auto grid h-20 max-w-[1240px] grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8">
            <Link href="/" className="font-extrabold text-2xl tracking-tight text-[#17C99E]" aria-label="Go to Current dashboard">
              current
            </Link>
            <nav className="hidden items-center justify-self-center gap-8 text-xs font-semibold text-[#303735] md:flex" aria-label="About navigation">
              <a href="#platform" className="transition-colors hover:text-[#087d62]">Platform</a>
              <a href="#principles" className="transition-colors hover:text-[#087d62]">Why Current</a>
              <a href="#faq" className="transition-colors hover:text-[#087d62]">FAQ</a>
            </nav>
            <div className="flex items-center justify-self-end gap-2">
              <Link href="/" className="hidden rounded-lg px-3 py-2 text-xs font-bold text-[#303735] transition-colors hover:text-[#087d62] sm:inline-flex">
                Sign in
              </Link>
              <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-[#161616] px-3.5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#087d62]">
                Open Current
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button className="rounded-lg p-2 text-[#303735] md:hidden" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="relative z-10 mx-auto max-w-[1240px] px-5 pb-16 pt-20 sm:px-8 sm:pb-24 sm:pt-28">
          <div className="max-w-[660px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#17C99E]/35 bg-white/45 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#087d62] backdrop-blur-sm">
              Social investing, made clearer
            </div>
            <h1 className="max-w-[620px] text-5xl font-extrabold leading-[0.98] tracking-tight text-[#101513] sm:text-7xl">
              See your crypto portfolio in a clearer light.
            </h1>
            <p className="mt-7 max-w-[520px] text-base leading-7 text-[#46514d] sm:text-lg">
              Current brings your holdings, market context, and investing community into one calm workspace built for better decisions.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-[#17C99E] px-4 py-3 text-sm font-extrabold text-[#07130f] transition-colors hover:bg-[#0eaf88]">
                Start with Current
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#platform" className="inline-flex items-center gap-2 rounded-lg border border-[#63736d]/35 bg-white/45 px-4 py-3 text-sm font-bold text-[#303735] transition-colors hover:bg-white/70">
                See the platform
              </a>
            </div>
          </div>

          <div id="platform" className="relative z-10 mx-auto mt-16 w-full max-w-[1120px] overflow-hidden rounded-xl border border-white/70 bg-[#141414]/95 shadow-[0_24px_70px_rgba(22,35,31,0.22)] backdrop-blur-md sm:mt-20">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-[#ff6b6b]" />
                <span className="h-2 w-2 rounded-full bg-[#f3c86a]" />
                <span className="h-2 w-2 rounded-full bg-[#17C99E]" />
              </div>
              <span className="rounded-md bg-white/10 px-3 py-1 text-[10px] font-semibold text-white/65">current.app</span>
              <div className="flex items-center gap-2 text-[9px] text-white/55"><span className="hidden sm:inline">+ Add Holding</span><span className="rounded-md bg-[#17C99E] px-2 py-1 font-bold text-black">Share</span><span className="text-sm">◉</span></div>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-[135px_1fr_205px] sm:p-5">
              <aside className="hidden border-r border-white/10 pr-4 text-[10px] text-white/45 sm:block">
                <p className="mb-6 text-xs font-bold text-[#17C99E]">current</p>
                <p className="rounded-md border border-[#17C99E]/50 bg-white/10 px-2 py-2 font-semibold text-[#17C99E]">↻ &nbsp; Portfolio</p>
                <p className="mt-4 px-2">▥ &nbsp; Markets</p>
                <p className="mt-4 px-2">ϟ &nbsp; Insights</p>
                <p className="mt-4 px-2">✧ &nbsp; AI Advisor</p>
                <div className="my-6 border-t border-white/10" />
                <p className="mb-3 px-2 text-[9px] font-bold uppercase tracking-wider text-white/35">Topics</p>
                <p className="px-2">🔮 &nbsp; ETFs &amp; Inflows</p>
                <p className="mt-3 px-2">🔥 &nbsp; Passive Income</p>
                <p className="mt-3 px-2">🌱 &nbsp; Beginners</p>
              </aside>
              <div className="min-w-0">
                <div className="flex items-center gap-3 border-b border-white/10 pb-3 text-[10px] text-white/65">
                  <span className="border-b-2 border-[#17C99E] pb-3 font-bold text-white">All</span>
                  <span className="rounded-full bg-white/10 px-3 py-1">🇺🇸 USD⌄</span>
                  <span className="hidden rounded-full bg-white/10 px-3 py-1 md:inline">Showing: All Accounts</span>
                  <span className="ml-auto hidden text-[#17C99E] md:inline">Goal &nbsp;━━━━━━ 100%</span>
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_1fr]">
                  <div className="flex min-h-[190px] items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] p-4">
                    <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[18px] border-[#3b82f6] border-r-[#17C99E] border-b-[#3b82f6]">
                      <div className="absolute text-center"><p className="text-lg font-extrabold text-white">$308,722.95</p><p className="text-[9px] text-white/55">Portfolio Value</p></div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2">
                  {previewMetrics.map((metric) => (
                    <div key={metric.label} className="rounded-lg border border-white/10 bg-white/[0.07] p-3">
                      <p className="text-[9px] font-semibold uppercase tracking-wide text-white/45">{metric.label}</p>
                      <p className={`mt-2 text-sm font-extrabold ${metric.value.startsWith('-') ? 'text-[#ff5252]' : 'text-[#17C99E]'}`}>{metric.value}</p>
                      <p className={`mt-1 text-[10px] font-bold ${metric.value.startsWith('-') ? 'text-[#ff5252]' : 'text-[#17C99E]'}`}>{metric.change} <span className="font-normal text-white/45">Today</span></p>
                    </div>
                  ))}
                    </div>
                    <div className="grid grid-cols-4 gap-1 rounded-lg border border-white/10 bg-white/[0.05] p-3 text-center text-[8px] text-white/55">
                      <span>🏢<br />Add investments</span><span>🪙<br />Add cash</span><span>◉<br />Visibility</span><span>✎<br />Edit portfolio</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2"><span className="text-sm font-bold text-white">Holdings</span><span className="text-[9px] text-white/45">Sort: <b className="text-white">Total value</b>⌄</span></div>
                  <div className="mt-3 flex items-center justify-between gap-2 text-[9px]"><span className="font-bold text-white">🔵 BTC <em className="not-italic text-white/45">Bitcoin</em></span><span className="text-white/65">100.00%</span><span className="font-bold text-white">$308,720.00</span><span className="font-bold text-[#17C99E]">+$53,687.00</span></div>
                </div>
              </div>
              <aside className="hidden rounded-lg border border-white/10 bg-white/[0.04] p-3 sm:block">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 text-[10px] font-bold text-white"><span><span className="text-[#17C99E]">◉</span> Watchlist · 4</span><span className="text-[#17C99E]">+ Add</span></div>
                <div className="space-y-4 pt-4">
                  {previewWatchlist.map(([symbol, name, price, change]) => (
                    <div key={symbol} className="flex items-center justify-between gap-2 text-[9px]"><div><b className="text-white">{symbol}</b><p className="text-white/40">{name}</p></div><div className="text-right"><b className="text-white">{price}</b><p className={change.startsWith('-') ? 'text-[#ff5252]' : 'text-[#17C99E]'}>{change}</p></div></div>
                  ))}
                </div>
              </aside>
            </div>
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
            <AboutReveal className="grid overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_rgba(45,37,37,0.08)] md:grid-cols-2">
              <div className="p-7 sm:p-12">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#087d62]">Portfolio clarity</p>
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
            </AboutReveal>

            <AboutReveal delay={0.12} className="grid overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_rgba(45,37,37,0.08)] md:grid-cols-2">
              <div className="order-2 flex min-h-[300px] items-center justify-center bg-[#dceee8] p-7 sm:p-10 md:order-1">
                <div className="w-full max-w-[390px] rounded-xl bg-[#18231f] p-5 shadow-[0_16px_30px_rgba(23,54,43,0.18)]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4"><span className="text-[9px] font-bold uppercase tracking-wider text-white/50">Market context</span><span className="rounded-full bg-[#17C99E]/15 px-2 py-1 text-[9px] font-bold text-[#17C99E]">Live</span></div>
                  <div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-lg bg-white/[0.08] p-3"><p className="text-[9px] text-white/45">Market mood</p><p className="mt-2 text-sm font-extrabold text-white">Constructive</p></div><div className="rounded-lg bg-white/[0.08] p-3"><p className="text-[9px] text-white/45">Watchlist</p><p className="mt-2 text-sm font-extrabold text-white">4 assets</p></div></div>
                  <div className="mt-3 rounded-lg bg-white/[0.08] p-3"><p className="text-[9px] text-white/45">Your next signal</p><div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-full w-3/4 rounded-full bg-[#17C99E]" /></div><p className="mt-2 text-[9px] text-white/50">Portfolio trend is improving</p></div>
                </div>
              </div>
              <div className="order-1 p-7 sm:p-12 md:order-2">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#087d62]">Context that helps</p>
                <h3 className="mt-5 max-w-md text-2xl font-extrabold leading-tight text-[#161616] sm:text-3xl">Make decisions with the bigger picture.</h3>
                <p className="mt-5 max-w-md text-sm leading-6 text-[#707a75]">Markets move quickly. Current keeps prices, insights, learning, and your own thesis close together so every update has somewhere to land.</p>
              </div>
            </AboutReveal>
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
              <p className="mt-3 text-sm leading-6 text-[#68736e]">Yes. The core experience is free to use and supported by non-intrusive advertising instead of a subscription.</p>
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
                ['Is Current free to use?', 'Yes. The core product is free to use and supported by non-intrusive advertising rather than a subscription.'],
                ['Is Current open source?', 'Yes. Current is built in the open so the community can inspect the project and help improve it over time.'],
              ].map(([question, answer], index) => (
                <AboutReveal key={question} delay={0.36 + index * 0.1}>
                  <details className="group rounded-xl border border-[#dce5e0] bg-white px-5 py-4 shadow-[0_10px_24px_rgba(45,65,55,0.05)]">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-extrabold text-[#161616] marker:hidden">
                      {question}
                      <span className="text-xl font-normal leading-none text-[#087d62] transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="max-w-2xl pt-3 text-sm leading-6 text-[#68736e]">{answer}</p>
                  </details>
                </AboutReveal>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-5 border-t border-[#cbd9d2] pt-7 sm:flex-row">
            <p className="text-sm font-semibold text-[#52605a]">Ready to see your portfolio more clearly?</p>
            <Link href="/" className="inline-flex shrink-0 items-center gap-2 text-sm font-extrabold text-[#087d62] hover:text-[#161616]">
              Explore the dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}