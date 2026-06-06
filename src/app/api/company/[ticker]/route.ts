/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker.toUpperCase()

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Referer': 'https://finance.yahoo.com',
    }

    const quoteRes = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
      { headers }
    )

    if (!quoteRes.ok) {
      return NextResponse.json({ error: 'Ticker not found: ' + ticker }, { status: 404 })
    }

    const quoteData = await quoteRes.json()
    const meta = quoteData?.chart?.result?.[0]?.meta

    if (!meta) {
      return NextResponse.json({ error: 'Ticker not found: ' + ticker }, { status: 404 })
    }

    return NextResponse.json({
      ticker,
      quote: {
        name: meta.longName || meta.shortName || ticker,
        price: meta.regularMarketPrice,
        change: meta.regularMarketPrice - meta.chartPreviousClose,
        changePct: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
        marketCap: meta.marketCap || null,
        exchange: meta.exchangeName,
        fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
        fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
        currency: meta.currency,
      },
      profile: {
        sector: null,
        industry: null,
        employees: null,
        description: null,
        executives: [],
      },
      financials: {
        peRatio: null,
        pegRatio: null,
        revenueGrowth: null,
        profitMargins: null,
        grossMargins: null,
        totalCash: null,
        totalDebt: null,
        freeCashflow: null,
        returnOnEquity: null,
        dividendYield: null,
        beta: null,
      },
    })
  } catch (error: any) {
    console.error('Quote error:', error)
    return NextResponse.json({ error: 'Could not fetch data for: ' + ticker, detail: error.message }, { status: 500 })
  }
}
