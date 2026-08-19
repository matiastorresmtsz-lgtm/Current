'use client';

import React from 'react';

export function AboutView() {
  return (
    <div className="rounded-3xl border border-[#2E2E2E] bg-[#212121] p-8 shadow-2xl text-gray-100">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-[#17C99E]">About Current</p>
          <h1 className="text-3xl font-extrabold text-white">Open source social investing for crypto</h1>
          <p className="text-sm text-gray-400 leading-7">
            Current is built on the belief that investing in crypto should be accessible, social, and transparent for everyone.
            Our platform is fully open source and free to use — supported by non-intrusive ads that help us keep the lights on
            without charging you a dime.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-[#2E2E2E] bg-white/10 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">Open Source</p>
            <p className="text-sm text-gray-200 leading-7">
              The entire codebase is open source and built with transparency in mind. Anyone can explore the code, suggest improvements,
              and see exactly how the product works — no hidden logic, no black boxes.
            </p>
          </div>
          <div className="rounded-3xl border border-[#2E2E2E] bg-white/10 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">Ad-Supported &amp; Free</p>
            <p className="text-sm text-gray-200 leading-7">
              Current is completely free. We include ads to sustain development and keep the platform running.
              No subscriptions, no hidden fees — just a community-driven tool supported by advertising.
            </p>
          </div>
          <div className="rounded-3xl border border-[#2E2E2E] bg-white/10 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">Social Investing</p>
            <p className="text-sm text-gray-200 leading-7">
              We believe social investing should be inclusive. Share ideas, learn from others, and discover new crypto opportunities with confidence.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-[#2E2E2E] bg-white/10 p-6">
          <h2 className="text-xl font-bold text-white">Accessible for all investors</h2>
          <p className="mt-3 text-sm text-gray-300 leading-7">
            Current brings crypto investing tools to everyone — from beginners starting with their first portfolio to experienced builders tracking market trends.
            Our goal is to remove complexity, support open collaboration, and make the growing world of crypto more accessible.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-[#2E2E2E] bg-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Community First</p>
            <p className="mt-2 text-sm text-gray-200 leading-6">Designed for community contribution and peer feedback.</p>
          </div>
          <div className="rounded-3xl border border-[#2E2E2E] bg-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Crypto for Everyone</p>
            <p className="mt-2 text-sm text-gray-200 leading-6">A free, ad-supported starting point for social crypto investing and learning.</p>
          </div>
          <div className="rounded-3xl border border-[#2E2E2E] bg-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Transparent Vision</p>
            <p className="mt-2 text-sm text-gray-200 leading-6">Open source, ad-supported, and built to help users invest smarter together.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
