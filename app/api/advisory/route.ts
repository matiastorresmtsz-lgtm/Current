import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;

  // Check if API Key is configured
  if (!apiKey || apiKey.trim() === '') {
    return NextResponse.json(
      { error: 'API_KEY_MISSING' },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { messages, portfolio } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'messages must be an array' },
        { status: 400 }
      );
    }

    // Format portfolio assets to pass to the system prompt
    let portfolioText = '';
    if (Array.isArray(portfolio) && portfolio.length > 0) {
      const totalValue = portfolio.reduce((sum, item) => sum + (item.amount * (item.currentPrice || 0)), 0);
      portfolioText = portfolio.map((asset, index) => {
        const value = asset.amount * (asset.currentPrice || 0);
        const cost = asset.amount * (asset.avgBuyPrice || 0);
        const pnl = value - cost;
        const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
        const alloc = totalValue > 0 ? (value / totalValue) * 100 : 0;

        return `${index + 1}. **${asset.name}** (${asset.symbol.toUpperCase()})
   - Holdings: ${asset.amount.toLocaleString()} ${asset.symbol.toUpperCase()}
   - Current Price: $${(asset.currentPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
   - Average Purchase Price: $${(asset.avgBuyPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
   - Current Value: $${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
   - Profit/Loss: $${pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%)
   - Allocation: ${alloc.toFixed(1)}%
   - 24h Change: ${asset.change24h ? (asset.change24h >= 0 ? '+' : '') + asset.change24h.toFixed(2) + '%' : 'N/A'}`;
      }).join('\n');

      portfolioText = `User Portfolio Snapshot (Total Value: $${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}):\n${portfolioText}`;
    } else {
      portfolioText = `User Portfolio: No assets added yet. The portfolio is empty.`;
    }

    // Create system prompt injecting the portfolio data
    const systemPrompt = `You are "Current's AI Portfolio Advisor", a premium and highly competent digital asset strategist and cryptocurrency advisor.
Your task is to analyze the user's connected portfolio assets, evaluate their risk exposure, suggest rebalancing, explain market narratives, and answer any general or specific cryptocurrency questions.

Here is the user's connected portfolio data:
${portfolioText}

Strict Guidelines:
1. Provide clear, actionable insights and answers.
2. Speak with authority and financial intellect, yet write in a friendly, concise, and accessible style.
3. Always format your responses cleanly using Markdown (e.g., bold headers, bullet lists, short tables, or inline highlight formatting). Make the visual presentation beautiful.
4. Keep responses direct and reasonably short (maximum 300 words). Do not repeat long financial disclaimers on every message. One simple warning at the start or a very brief disclaimer if they ask for direct buy/sell advice is sufficient.
5. If the user's portfolio is empty, suggest that they add assets (using the Add Crypto modal or button) to unlock personalized, data-backed portfolio advisory services.
`;

    // Map message thread to Groq/OpenAI compatible schema
    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      })),
    ];

    // Call Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: groqMessages,
        temperature: 0.5,
        max_tokens: 1000,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API Error Response:', errorText);
      let detailMsg = errorText;
      try {
        const parsed = JSON.parse(errorText);
        detailMsg = parsed.error?.message || parsed.error || errorText;
      } catch {
        // use fallback text
      }
      return NextResponse.json(
        { error: 'API_ERROR', details: detailMsg },
        { status: groqResponse.status }
      );
    }

    const data = await groqResponse.json();
    const replyText = data.choices?.[0]?.message?.content || 'I could not generate advice at this time.';

    return NextResponse.json({
      success: true,
      text: replyText,
    });
  } catch (error: any) {
    console.error('Advisory API Exception:', error);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
