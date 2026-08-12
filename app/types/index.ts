export type NavTab =
  | 'portfolio'
  | 'markets'
  | 'leaderboard'
  | 'learn'
  | 'insights'
  | 'about'
  | 'ai'
  | 'settings'
  | 'topic-etfs'
  | 'topic-passive-income'
  | 'topic-beginner'
  | 'topic-memes'
  | 'topic-defi';

export interface ChartPoint {
  time: string;
  price: number;
}

export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  ath: number;
  circulatingSupply: string;
  category: string;
  icon: string;
  sparkline: number[];
  chartData1D: { time: string; price: number }[];
  chartData7D: { time: string; price: number }[];
  rank?: number;
}

export interface PortfolioAsset {
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  change24h: number;
  allocationPercent?: number;
  color: string;
}

export interface TopicNewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  topic: string;
  image?: string;
  readTime?: string;
  author?: string;
  tags?: string[];
}

export interface LearnLesson {
  id: string;
  title: string;
  summary: string;
  content: string;
  keyTakeaway: string;
}

export interface LearnCourse {
  id: string;
  title: string;
  category: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  lessonsCount: number;
  xpReward: number;
  image: string;
  description: string;
  lessons: LearnLesson[];
  completed?: boolean;
}

export interface WhaleTransaction {
  id: string;
  coin: string;
  symbol: string;
  amount: string;
  usdValue: string;
  from: string;
  to: string;
  type: 'Transfer' | 'Deposit to Exchange' | 'Withdrawal from Exchange';
  timestamp: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
