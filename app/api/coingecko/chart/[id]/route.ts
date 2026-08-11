import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing coin id' }, { status: 400 });
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
    const daysParam = req.nextUrl.searchParams.get('days') || '1';
    const validDays = ['1', '7', '30', '180', '365', 'max'];
    const days = validDays.includes(daysParam) ? daysParam : '1';

    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}${keyParam}`,
      { headers, next: { revalidate: 300 } }
    );

    let chartData: { time: string; price: number }[] = [];

    if (res.ok) {
      const data = await res.json();
      if (data.prices && Array.isArray(data.prices)) {
        chartData = data.prices.map(([timestamp, price]: [number, number]) => {
          const date = new Date(timestamp);
          const time = days === '1'
            ? `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
            : days === '7'
            ? `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]} ${date.getHours()}:00`
            : days === '30'
            ? `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`
            : days === '180'
            ? `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`
            : days === '365'
            ? `${date.toLocaleString('default', { month: 'short' })}`
            : `${date.getFullYear()}`;
          return { time, price };
        });
      }
    }

    return NextResponse.json({
      success: true,
      coinId: id,
      chartData
    });
  } catch (error: any) {
    console.error(`Error fetching chart for coin ${id}:`, error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch coin chart' },
      { status: 500 }
    );
  }
}
