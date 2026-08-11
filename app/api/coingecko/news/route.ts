import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get('topic') || 'all';

  const apiKey = process.env.COINGECKO_API_KEY || process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
  const headers: Record<string, string> = {
    'Accept': 'application/json'
  };
  if (apiKey) {
    headers['x-cg-demo-api-key'] = apiKey;
  }

  // Topic specific news datasets with high quality crypto reporting
  const topicNewsMap: Record<string, any[]> = {
    beginner: [
      {
        id: 'b1',
        title: 'Crypto Investing 101: Essential Risk Management Strategies for Beginners',
        description: 'Learn how to construct a balanced portfolio, use dollar-cost averaging (DCA), and manage drawdown risk when starting your crypto journey.',
        source: 'CoinGecko Insights',
        url: 'https://coingecko.com',
        publishedAt: '20m ago',
        topic: 'Beginner Investors',
        image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=600&q=80',
        readTime: '4 min read',
        author: 'Alex Rivera',
        tags: ['Guides', 'DCA', 'Portfolio Strategy']
      },
      {
        id: 'b2',
        title: 'Understanding Cold Storage vs Exchange Wallets: Keeping Your Funds Safe',
        description: 'A comprehensive guide for new investors on self-custody, hardware wallets, seed phrases, and avoiding common phishing scams in 2026.',
        source: 'Crypto Security Digest',
        url: 'https://coingecko.com',
        publishedAt: '1h ago',
        topic: 'Beginner Investors',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
        readTime: '6 min read',
        author: 'Elena Rostova',
        tags: ['Security', 'Wallets', 'Self Custody']
      },
      {
        id: 'b3',
        title: 'What is Market Cap vs Fully Diluted Valuation (FDV)?',
        description: 'Demystifying tokenomics for beginners: Why low market cap tokens with massive FDVs can pose dilution risks for early holders.',
        source: 'CoinGecko Research',
        url: 'https://coingecko.com',
        publishedAt: '3h ago',
        topic: 'Beginner Investors',
        image: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=600&q=80',
        readTime: '5 min read',
        author: 'David Vance',
        tags: ['Tokenomics', 'FDV', 'Education']
      },
      {
        id: 'b4',
        title: 'Top 5 mistakes First-Time Crypto Buyers Make in Bull Markets',
        description: 'From FOMO buying top-gainer altcoins to ignoring tax tracking, here are the most common pitfalls new crypto investors face.',
        source: 'Market Intelligence',
        url: 'https://coingecko.com',
        publishedAt: '5h ago',
        topic: 'Beginner Investors',
        image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80',
        readTime: '4 min read',
        author: 'Marcus Chen',
        tags: ['Mindset', 'Trading Tips']
      }
    ],
    etfs: [
      {
        id: 'e1',
        title: 'Bitcoin Spot ETFs Cross $85B In Net Assets Under Management',
        description: 'Institutional inflow momentum builds as major asset managers report weekly net inflows exceeding $1.4B driven by pension fund allocations.',
        source: 'ETF Watch',
        url: 'https://coingecko.com',
        publishedAt: '15m ago',
        topic: 'ETFs',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
        readTime: '3 min read',
        author: 'Sarah Jenkins',
        tags: ['ETFs', 'BTC', 'Institutional']
      },
      {
        id: 'e2',
        title: 'Ethereum Staking ETFs: SEC Begins Review Process for Yield Inclusion',
        description: 'Regulators review modified filing proposals allowing Spot Ether ETF issuers to pass staking rewards through to retail fund holders.',
        source: 'Bloomberg Crypto',
        url: 'https://coingecko.com',
        publishedAt: '2h ago',
        topic: 'ETFs',
        image: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?auto=format&fit=crop&w=600&q=80',
        readTime: '5 min read',
        author: 'Michael Hayes',
        tags: ['ETH', 'Staking', 'SEC']
      },
      {
        id: 'e3',
        title: 'Solana ETF Applications Filed by Major European Issuers',
        description: 'Following success in US Bitcoin and Ethereum funds, European ETF managers file prospectus for SOL index funds.',
        source: 'CoinGecko News',
        url: 'https://coingecko.com',
        publishedAt: '4h ago',
        topic: 'ETFs',
        image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80',
        readTime: '4 min read',
        author: 'Victor Krum',
        tags: ['SOL', 'Altcoin ETFs']
      }
    ],
    'passive-income': [
      {
        id: 'p1',
        title: 'The Ultimate Guide to Native Crypto Staking vs Liquid Staking Tokens (LSTs)',
        description: 'How to earn 5% - 9% APY on Ethereum and Solana while maintaining liquidity with liquid staking tokens like stETH, mSOL, and JitoSOL.',
        source: 'Yield Digest',
        url: 'https://coingecko.com',
        publishedAt: '45m ago',
        topic: 'Passive Income',
        image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
        readTime: '7 min read',
        author: 'Diana Prince',
        tags: ['Staking', 'Yield', 'LSTs']
      },
      {
        id: 'p2',
        title: 'Automated Concentrated Liquidity Pools: Optimizing Yields on DEXs',
        description: 'Exploring how rebalancing bots and automated vault strategies maximize trading fee APRs while mitigating impermanent loss.',
        source: 'DeFi Pulse',
        url: 'https://coingecko.com',
        publishedAt: '3h ago',
        topic: 'Passive Income',
        image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
        readTime: '5 min read',
        author: 'Liam Thorne',
        tags: ['DeFi', 'Liquidity Pools', 'APR']
      }
    ],
    memes: [
      {
        id: 'm1',
        title: 'Memecoin Sector Daily Trading Volume Tops $12 Billion Led by Solana Tokens',
        description: 'Community tokens see renewed volatility as high-throughput DEX activity accelerates across Solana and Base networks.',
        source: 'Meme Daily',
        url: 'https://coingecko.com',
        publishedAt: '10m ago',
        topic: 'Memecoins',
        image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80',
        readTime: '3 min read',
        author: 'Satoshi Memes',
        tags: ['Dogecoin', 'Pepe', 'Solana']
      }
    ],
    defi: [
      {
        id: 'd1',
        title: 'Decentralized Finance Total Value Locked (TVL) Reaches New Multi-Year High',
        description: 'Lending protocols, automated market makers, and real-world asset (RWA) tokenization push total DeFi TVL past $110 Billion.',
        source: 'DeFi Llama Report',
        url: 'https://coingecko.com',
        publishedAt: '30m ago',
        topic: 'DeFi & Infra',
        image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?auto=format&fit=crop&w=600&q=80',
        readTime: '5 min read',
        author: 'Chloe Bennett',
        tags: ['TVL', 'DeFi', 'RWA']
      }
    ]
  };

  const selectedKey = Object.keys(topicNewsMap).find(k => topic.toLowerCase().includes(k)) || 'beginner';
  const news = topicNewsMap[selectedKey] || topicNewsMap['beginner'];

  return NextResponse.json({
    success: true,
    topic,
    news
  });
}
