import { CryptoCoin, PortfolioAsset, LearnCourse, WhaleTransaction } from '../types';

export const INITIAL_COINS: CryptoCoin[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 67450.20,
    change24h: 3.42,
    volume24h: 34850920000,
    marketCap: 1324000000000,
    high24h: 68120.00,
    low24h: 65100.50,
    ath: 73750.07,
    circulatingSupply: '19.7M BTC',
    category: 'l1',
    icon: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    sparkline: [64200, 64800, 65100, 64900, 66200, 66900, 67450],
    chartData1D: [
      { time: '00:00', price: 65100 },
      { time: '04:00', price: 65400 },
      { time: '08:00', price: 66200 },
      { time: '12:00', price: 65900 },
      { time: '16:00', price: 66800 },
      { time: '20:00', price: 67200 },
      { time: '24:00', price: 67450 },
    ],
    chartData7D: [
      { time: 'Mon', price: 62100 },
      { time: 'Tue', price: 63400 },
      { time: 'Wed', price: 64100 },
      { time: 'Thu', price: 63800 },
      { time: 'Fri', price: 65900 },
      { time: 'Sat', price: 66500 },
      { time: 'Sun', price: 67450 },
    ],
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3480.75,
    change24h: 5.18,
    volume24h: 19420000000,
    marketCap: 418500000000,
    high24h: 3520.10,
    low24h: 3310.00,
    ath: 4878.26,
    circulatingSupply: '120.2M ETH',
    category: 'l1',
    icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    sparkline: [3300, 3340, 3380, 3360, 3420, 3450, 3480],
    chartData1D: [
      { time: '00:00', price: 3310 },
      { time: '04:00', price: 3340 },
      { time: '08:00', price: 3390 },
      { time: '12:00', price: 3410 },
      { time: '16:00', price: 3440 },
      { time: '20:00', price: 3465 },
      { time: '24:00', price: 3480 },
    ],
    chartData7D: [
      { time: 'Mon', price: 3120 },
      { time: 'Tue', price: 3200 },
      { time: 'Wed', price: 3280 },
      { time: 'Thu', price: 3300 },
      { time: 'Fri', price: 3410 },
      { time: 'Sat', price: 3440 },
      { time: 'Sun', price: 3480 },
    ],
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    price: 184.20,
    change24h: 8.95,
    volume24h: 6840000000,
    marketCap: 86400000000,
    high24h: 188.50,
    low24h: 168.00,
    ath: 259.96,
    circulatingSupply: '468.9M SOL',
    category: 'l1',
    icon: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    sparkline: [168, 172, 175, 178, 181, 183, 184],
    chartData1D: [
      { time: '00:00', price: 168 },
      { time: '04:00', price: 172 },
      { time: '08:00', price: 176 },
      { time: '12:00', price: 179 },
      { time: '16:00', price: 182 },
      { time: '20:00', price: 183 },
      { time: '24:00', price: 184.20 },
    ],
    chartData7D: [
      { time: 'Mon', price: 152 },
      { time: 'Tue', price: 158 },
      { time: 'Wed', price: 164 },
      { time: 'Thu', price: 170 },
      { time: 'Fri', price: 178 },
      { time: 'Sat', price: 181 },
      { time: 'Sun', price: 184.20 },
    ],
  },
  {
    id: 'sui',
    symbol: 'SUI',
    name: 'Sui Network',
    price: 2.15,
    change24h: 14.30,
    volume24h: 1420000000,
    marketCap: 6100000000,
    high24h: 2.22,
    low24h: 1.84,
    ath: 2.36,
    circulatingSupply: '2.8B SUI',
    category: 'l1',
    icon: 'https://assets.coingecko.com/coins/images/26375/large/sui_asset.png',
    sparkline: [1.84, 1.90, 1.95, 2.02, 2.08, 2.12, 2.15],
    chartData1D: [
      { time: '00:00', price: 1.85 },
      { time: '04:00', price: 1.92 },
      { time: '08:00', price: 1.98 },
      { time: '12:00', price: 2.05 },
      { time: '16:00', price: 2.10 },
      { time: '20:00', price: 2.13 },
      { time: '24:00', price: 2.15 },
    ],
    chartData7D: [
      { time: 'Mon', price: 1.62 },
      { time: 'Tue', price: 1.70 },
      { time: 'Wed', price: 1.81 },
      { time: 'Thu', price: 1.89 },
      { time: 'Fri', price: 2.01 },
      { time: 'Sat', price: 2.10 },
      { time: 'Sun', price: 2.15 },
    ],
  },
  {
    id: 'nvidia-token',
    symbol: 'NVDA',
    name: 'NVIDIA Tokenized',
    price: 217.55,
    change24h: -2.86,
    volume24h: 520000000,
    marketCap: 2800000000,
    high24h: 224.10,
    low24h: 215.00,
    ath: 240.00,
    circulatingSupply: '12.8M NVDA',
    category: 'ai',
    icon: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
    sparkline: [224, 222, 220, 219, 218, 217, 217.55],
    chartData1D: [
      { time: '00:00', price: 224 },
      { time: '04:00', price: 222 },
      { time: '08:00', price: 220 },
      { time: '12:00', price: 218 },
      { time: '16:00', price: 216 },
      { time: '20:00', price: 217 },
      { time: '24:00', price: 217.55 },
    ],
    chartData7D: [
      { time: 'Mon', price: 210 },
      { time: 'Tue', price: 214 },
      { time: 'Wed', price: 218 },
      { time: 'Thu', price: 222 },
      { time: 'Fri', price: 224 },
      { time: 'Sat', price: 220 },
      { time: 'Sun', price: 217.55 },
    ],
  }
];

export const INITIAL_PORTFOLIO: PortfolioAsset[] = [
  {
    coinId: 'nvidia-token',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    amount: 1.00,
    avgBuyPrice: 214.02,
    currentPrice: 217.55,
    change24h: -2.86,
    allocationPercent: 56.69,
    color: '#10B981' // Mint Green segment
  },
  {
    coinId: 'bitcoin',
    symbol: 'BTC',
    name: 'iShares Bitcoin ETF',
    amount: 0.0025,
    avgBuyPrice: 65100.00,
    currentPrice: 67450.20,
    change24h: 3.42,
    allocationPercent: 43.31,
    color: '#8B5CF6' // Purple segment
  }
];

export const LEARN_COURSES: LearnCourse[] = [
  {
    id: 'course-1',
    title: 'Crypto Portfolio Fundamentals',
    category: 'Basics',
    duration: '10 mins',
    level: 'Beginner',
    lessonsCount: 3,
    xpReward: 150,
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&auto=format&fit=crop&q=80',
    description: 'Learn the essentials of asset allocation, dollar-cost averaging (DCA), and balancing risk across crypto assets.',
    lessons: [
      {
        id: 'c1-l1',
        title: 'Lesson 1: What is Asset Allocation?',
        summary: 'Dividing investments across Bitcoin, Layer 1s, and stablecoins based on your risk tolerance.',
        content: 'Asset allocation is the cornerstone of building a resilient portfolio. By spreading capital across core holdings like Bitcoin (lower risk), major Layer 1s like Solana and Ethereum (moderate risk), and yield-generating assets, you protect yourself against sudden single-token drawdowns.',
        keyTakeaway: 'Never allocate 100% of your portfolio to a single speculative coin. Maintain a core anchor asset.'
      },
      {
        id: 'c1-l2',
        title: 'Lesson 2: Dollar-Cost Averaging (DCA)',
        summary: 'How buying fixed amounts at regular intervals eliminates market timing stress.',
        content: 'Dollar-Cost Averaging involves purchasing a set dollar amount of a crypto asset on a recurring schedule (e.g. $50 every Monday), regardless of price fluctuations. This reduces emotional trading decisions during market volatility.',
        keyTakeaway: 'DCA lowers your average purchase price over long periods without requiring you to top or bottom tick the market.'
      },
      {
        id: 'c1-l3',
        title: 'Lesson 3: Rebalancing Your Holdings',
        summary: 'When and how to sell outperforming assets to buy undervalued ones.',
        content: 'When an asset surges and becomes an outsized percentage of your total portfolio value (e.g. growing from 10% to 50%), rebalancing allows you to take partial profits and reinvest into high-conviction assets that haven’t run yet.',
        keyTakeaway: 'Rebalance quarterly or whenever any single asset breaches 40% of your total allocation.'
      }
    ]
  },
  {
    id: 'course-2',
    title: 'Cold Storage & Self-Custody Safety',
    category: 'Security',
    duration: '15 mins',
    level: 'Beginner',
    lessonsCount: 3,
    xpReward: 200,
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=80',
    description: 'Protect your assets from exchange bankruptcies, smart contract exploits, and phishing attacks.',
    lessons: [
      {
        id: 'c2-l1',
        title: 'Lesson 1: Hardware Wallets vs Exchange Storage',
        summary: 'Not your keys, not your coins. Understanding self-custody principles.',
        content: 'Keeping assets on centralized exchanges exposes you to third-party risk. A hardware wallet (like Ledger or Trezor) stores your private keys offline on an encrypted chip, ensuring only you have access to sign transactions.',
        keyTakeaway: 'Store long-term holdings on a hardware wallet; keep only active trading funds on exchanges.'
      },
      {
        id: 'c2-l2',
        title: 'Lesson 2: Seed Phrase Physical Security',
        summary: 'Best practices for storing your 12 or 24-word recovery phrase safely.',
        content: 'Your seed phrase is the master key to your funds. Never save it as a digital screenshot, plain text document, or cloud note. Write it down on paper or stamp it into stainless steel plate and store it in a secure location.',
        keyTakeaway: 'Anyone who gets access to your seed phrase has immediate access to your entire wallet.'
      },
      {
        id: 'c2-l3',
        title: 'Lesson 3: Smart Contract Approvals & Revoking',
        summary: 'How to prevent malicious dApps from draining your wallet.',
        content: 'Interacting with DeFi protocols requires granting token allowances. Always inspect transaction popups carefully and use tools like Revoke.cash periodically to clear old smart contract permissions.',
        keyTakeaway: 'Revoke token permissions for protocols you no longer actively use.'
      }
    ]
  },
  {
    id: 'course-3',
    title: 'Understanding Crypto Market Cycles',
    category: 'Economics',
    duration: '20 mins',
    level: 'Intermediate',
    lessonsCount: 2,
    xpReward: 250,
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&auto=format&fit=crop&q=80',
    description: 'Identify macro liquidity trends, Bitcoin halving effects, and altcoin rotation periods.',
    lessons: [
      {
        id: 'c3-l1',
        title: 'Lesson 1: The Bitcoin Halving Cycle',
        summary: 'How supply reduction every 210,000 blocks shapes global supply and demand.',
        content: 'Every 4 years, Bitcoin miner rewards cut in half. Historically, supply constraint paired with steady demand creates upward price pressure over the 12–18 months following a halving.',
        keyTakeaway: 'Halvings reduce new daily supply creation, laying the foundation for long-term expansion phases.'
      },
      {
        id: 'c3-l2',
        title: 'Lesson 2: Capital Rotation: BTC → L1s → Altcoins',
        summary: 'Tracing the path of profits through the crypto asset hierarchy.',
        content: 'Bull markets typically begin with Bitcoin outperforming (rising BTC Dominance). As BTC consolidates at higher levels, profits flow into major Layer 1s (Ethereum, Solana), and eventually into lower market cap altcoins.',
        keyTakeaway: 'Monitor Bitcoin Dominance to identify when capital is shifting into high-beta altcoins.'
      }
    ]
  }
];

export const WHALE_TRANSACTIONS: WhaleTransaction[] = [
  {
    id: 'w-1',
    coin: 'Bitcoin',
    symbol: 'BTC',
    amount: '1,450 BTC',
    usdValue: '$97,802,790',
    from: 'Unknown Whale Wallet',
    to: 'Coinbase Custody',
    type: 'Transfer',
    timestamp: '4m ago'
  },
  {
    id: 'w-2',
    coin: 'Ethereum',
    symbol: 'ETH',
    amount: '18,200 ETH',
    usdValue: '$63,349,660',
    from: 'Binance Hot Wallet',
    to: 'Fresh Staking Wallet',
    type: 'Withdrawal from Exchange',
    timestamp: '15m ago'
  }
];
