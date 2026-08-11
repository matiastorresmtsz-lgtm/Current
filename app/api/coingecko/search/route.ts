import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ success: true, coins: [] });
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
    const res = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}${keyParam}`,
      { headers, next: { revalidate: 120 } }
    );

    if (!res.ok) {
      throw new Error(`CoinGecko search HTTP ${res.status}`);
    }

    const data = await res.json();
    const rawCoins = data.coins || [];

    const coins = rawCoins.map((item: any) => ({
      id: item.id,
      symbol: (item.symbol || '').toUpperCase(),
      name: item.name || item.id,
      rank: item.market_cap_rank || 9999,
      icon: item.large || item.thumb || '',
    }));

    return NextResponse.json({
      success: true,
      coins
    });
  } catch (error: any) {
    console.error('Error in CoinGecko search route:', error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Search failed', coins: [] },
      { status: 500 }
    );
  }
}
