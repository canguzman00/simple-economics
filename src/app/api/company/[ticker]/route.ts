/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker.toUpperCase()

  try {
    // Stooq CSV endpoint — no auth, no rate limit
    const res = await fetch(
      `https://stooq.com/q/l/?s=${ticker.toLowerCase()}.us&f=sd2t2ohlcvn&h&e=csv`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )

    const text = await res.text()
    const lines = text.trim().split('\n')

    if (lines.length < 2) {
      return NextResponse.json({ error: 'Ticker not found: ' + ticker }, { status: 404 })
    }

    const headers = lines[0].split(',')
    const values = lines[1].split(',')
    const row: any = {}
    headers.forEach(function(h, i) { row[h.trim()] = values[i]?.trim() })

    const price = parseFloat(row['Close'])
    const open = parseFloat(row['Open'])

    if (!price || price === 0) {
      return NextResponse.json({ error: 'Ticker not found: ' + ticker }, { status: 404 })
    }

    return NextResponse.json({
      ticker,
      quote: {
        name: row['Name'] || ticker,
        price,
        change: price - open,
        changePct: ((price - open) / open) * 100,
        marketCap: null,
        exchange: 'US',
        fiftyTwoWeekLow: null,
        fiftyTwoWeekHigh: null,
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
    console.error('Stooq error:', error)
    return NextResponse.json({ error: 'Could not fetch data for: ' + ticker, detail: error.message }, { status: 500 })
  }
}
