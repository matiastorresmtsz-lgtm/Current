import { NextResponse } from 'next/server';

// Server-side cache
let cachedData: any = null;
let lastCacheTime = 0;
const CACHE_DURATION_MS = 60 * 1000; // 60 seconds cache

// Categorize coins based on symbol/id
function inferCategory(id: string, symbol: string): string {
  const sym = symbol.toLowerCase();
  const coinId = id.toLowerCase();

  const l1s = ['bitcoin', 'ethereum', 'solana', 'cardano', 'avalanche-2', 'polkadot', 'near', 'sui', 'aptos', 'cosmos', 'kaspa', 'tron', 'toncoin', 'monero', 'algorand', 'hedera-hashgraph', 'fantom', 'sei-network'];
  const l2s = ['polygon-ecosystem-token', 'arbitrum', 'optimism', 'mantle', 'starknet', 'immutable-x', 'base', 'op-mainnet', 'blast', 'scroll', 'zksync', 'polygon'];
  const memes = ['dogecoin', 'shiba-inu', 'pepe', 'dogwifhat', 'bonk', 'floki', 'popcat', 'brett', 'mog-coin', 'book-of-meme', 'neiro', 'cats', 'memecoin'];
  const ai = ['render-token', 'fetch-ai', 'bittensor', 'singularitynet', 'akash-network', 'ocean-protocol', 'artificial-superintelligence-alliance', 'io-net', 'grass', 'nosana', 'theta-token'];
  const defi = ['uniswap', 'aave', 'maker', 'lido-dao', 'jupiter-exchange-solana', 'thorchain', 'curve-dao-token', 'pancakeswap-token', 'pendle', 'ethena', 'dydx', 'synthetix-network-token', 'compound-governance-token', 'raydium'];

  if (memes.some(m => coinId.includes(m) || sym.includes(m))) return 'meme';
  if (ai.some(a => coinId.includes(a) || sym.includes(a))) return 'ai';
  if (l2s.some(l => coinId.includes(l) || sym.includes(l))) return 'l2';
  if (defi.some(d => coinId.includes(d) || sym.includes(d))) return 'defi';
  if (l1s.some(l => coinId.includes(l) || sym.includes(l))) return 'l1';
  return 'other';
}

export async function GET() {
  const now = Date.now();

  // Return cached data if fresh
  if (cachedData && now - lastCacheTime < CACHE_DURATION_MS) {
    return NextResponse.json({
      success: true,
      cached: true,
      coins: cachedData,
      updatedAt: new Date(lastCacheTime).toISOString()
    });
  }

  const apiKey = process.env.COINGECKO_API_KEY || process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
  const headers: Record<string, string> = {
    'Accept': 'application/json'
  };
  if (apiKey) {
    headers['x-cg-demo-api-key'] = apiKey;
  }

  const keyParam = apiKey ? `&x_cg_demo_api_key=${encodeURIComponent(apiKey)}` : '';

  try {
    // Fetch Page 1 to Page 4 (Top 1 to 1000)
    const pages = [1, 2, 3, 4];
    const fetchPromises = pages.map(page =>
      fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=true&price_change_percentage=24h${keyParam}`,
        { headers, next: { revalidate: 60 } }
      ).then(res => res.ok ? res.json() : [])
    );

    const pageResults = await Promise.all(fetchPromises);
    const rawCoins = pageResults.flat();

    const normalizedCoins = rawCoins.map((coin: any, index: number) => {
      const price = coin.current_price ?? 0;
      const change24h = Math.round((coin.price_change_percentage_24h ?? 0) * 100) / 100;
      const sparklinePrices = coin.sparkline_in_7d?.price || [];

      // Generate 7D time series points from sparkline
      const sparkline7D = sparklinePrices.length > 0
        ? sparklinePrices.map((p: number, i: number) => ({
            time: `${Math.round((i / sparklinePrices.length) * 7)}d`,
            price: p
          }))
        : [];

      return {
        id: coin.id,
        symbol: (coin.symbol || '').toUpperCase(),
        name: coin.name || coin.id,
        rank: coin.market_cap_rank || index + 1,
        price,
        change24h,
        volume24h: coin.total_volume || 0,
        marketCap: coin.market_cap || 0,
        high24h: coin.high_24h || price,
        low24h: coin.low_24h || price,
        ath: coin.ath || price,
        circulatingSupply: coin.circulating_supply
          ? `${(coin.circulating_supply / 1e6).toFixed(1)}M`
          : 'N/A',
        category: inferCategory(coin.id, coin.symbol),
        icon: coin.image || '',
        sparkline: sparklinePrices.length > 0 ? sparklinePrices : [price, price],
        chartData1D: [], // Loaded on-demand in modal
        chartData7D: sparkline7D
      };
    });

    cachedData = normalizedCoins;
    lastCacheTime = now;

    return NextResponse.json({
      success: true,
      cached: false,
      coins: normalizedCoins,
      updatedAt: new Date(lastCacheTime).toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching CoinGecko markets:', error?.message || error);

    // If cache exists even if expired, return it as fallback
    if (cachedData) {
      return NextResponse.json({
        success: true,
        cached: true,
        stale: true,
        coins: cachedData,
        error: error?.message || 'CoinGecko fetch failed'
      });
    }

    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch coin markets' },
      { status: 500 }
    );
  }
}
