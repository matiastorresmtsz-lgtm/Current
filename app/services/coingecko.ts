import { ChartPoint, CryptoCoin } from '../types';

export async function fetchTopCryptos(): Promise<{ coins: CryptoCoin[]; success: boolean; cached?: boolean }> {
  try {
    const res = await fetch('/api/coingecko/markets', {
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Failed HTTP status: ${res.status}`);
    }

    const data = await res.json();
    if (data.success && Array.isArray(data.coins)) {
      return {
        coins: data.coins,
        success: true,
        cached: data.cached
      };
    }
    return { coins: [], success: false };
  } catch (error) {
    console.error('Failed to fetch top cryptos from CoinGecko API proxy:', error);
    return { coins: [], success: false };
  }
}

export async function searchCoinGecko(query: string): Promise<Array<{ id: string; symbol: string; name: string; rank: number; icon: string }>> {
  try {
    if (!query.trim()) return [];
    const res = await fetch(`/api/coingecko/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.coins || [];
  } catch (error) {
    console.error('Error searching CoinGecko:', error);
    return [];
  }
}

export type ChartRange = '1' | '7' | '30' | '180' | '365' | 'max';

export async function fetchCoinChart(coinId: string, days: ChartRange = '1'): Promise<{ chartData: ChartPoint[] }> {
  try {
    const res = await fetch(`/api/coingecko/chart/${coinId}?days=${days}`);
    if (!res.ok) return { chartData: [] };
    const data = await res.json();
    return {
      chartData: data.chartData || []
    };
  } catch (error) {
    console.error(`Failed to fetch chart for ${coinId}:`, error);
    return { chartData: [] };
  }
}
