import Link from 'next/link';
import { ArrowLeft, BarChart3, GitBranch, Users } from 'lucide-react';

const principles = [
  {
    icon: BarChart3,
    title: 'Clarity over noise',
    description: 'A focused workspace for understanding your portfolio, the market, and the decisions in front of you.',
  },
  {
    icon: Users,
    title: 'Built in the open',
    description: 'Current is open source so the community can inspect the product, contribute ideas, and shape what comes next.',
  },
  {
    icon: GitBranch,
    title: 'Free to use',
    description: 'The core experience stays accessible to everyone, supported by unobtrusive advertising instead of subscriptions.',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#161616] text-gray-100">
      <header className="border-b border-[#2E2E2E]">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="font-extrabold text-2xl tracking-tight text-[#17C99E]" aria-label="Back to Current dashboard">
            current
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-[#2E2E2E] px-3 py-2 text-xs font-bold text-gray-300 transition-colors hover:border-[#17C99E]/50 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
        <section className="max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#17C99E]">About Current</p>
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
            A clearer way to stay current with crypto.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-gray-400 sm:text-lg">
            Current is an open-source social investing workspace for people who want useful context, practical tools, and a better view of their portfolio.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/" className="rounded-lg bg-[#17C99E] px-4 py-2.5 text-sm font-extrabold text-black transition-colors hover:bg-[#14B8A6]">
              Open Current
            </Link>
            <span className="text-xs text-gray-500">Open source. Free to use. Built for the long term.</span>
          </div>
        </section>

        <section className="mt-20 border-t border-[#2E2E2E] pt-8 sm:mt-28" aria-labelledby="principles-heading">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">What guides us</p>
              <h2 id="principles-heading" className="mt-2 text-2xl font-extrabold text-white">Useful by default.</h2>
            </div>
            <span className="hidden text-right text-xs leading-5 text-gray-500 sm:block">Less performance theater.<br />More useful signal.</span>
          </div>

          <div className="mt-8 grid gap-px overflow-hidden border border-[#2E2E2E] bg-[#2E2E2E] md:grid-cols-3">
            {principles.map(({ icon: Icon, title, description }) => (
              <article key={title} className="bg-[#212121] p-6 sm:p-7">
                <Icon className="h-5 w-5 text-[#17C99E]" aria-hidden="true" />
                <h3 className="mt-8 text-sm font-extrabold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 max-w-2xl border-l-2 border-[#17C99E] pl-5 sm:mt-28 sm:pl-6">
          <h2 className="text-xl font-extrabold text-white">Investing is easier when the context is visible.</h2>
          <p className="mt-3 text-sm leading-7 text-gray-400">
            From a first portfolio to a deeper market thesis, Current brings the numbers, learning, and community perspective into one calm place to work.
          </p>
        </section>
      </div>
    </main>
  );
}