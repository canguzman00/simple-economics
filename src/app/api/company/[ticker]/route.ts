/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const FMP_KEY = process.env.FMP_API_KEY
const BASE = 'https://financialmodelingprep.com/api/v3'

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker.toUpperCase()

  try {
    const [profileRes, quoteRes, metricsRes] = await Promise.all([
      fetch(`${BASE}/profile/${ticker}?apikey=${FMP_KEY}`),
      fetch(`${BASE}/quote/${ticker}?apikey=${FMP_KEY}`),
      fetch(`${BASE}/key-metrics-ttm/${ticker}?apikey=${FMP_KEY}`),
    ])

    const [profileData, quoteData, metricsData] = await Promise.all([
      profileRes.json(),
      quoteRes.json(),
      metricsRes.json(),
    ])

    const profile = profileData?.[0]
    const quote = quoteData?.[0]
    const metrics = metricsData?.[0]

    if (!profile || !quote) {
      return NextResponse.json({ error: 'Ticker not found: ' + ticker }, { status: 404 })
    }

    return NextResponse.json({
      ticker,
      quote: {
        name: profile.companyName,
        price: quote.price,
        change: quote.change,
        changePct: quote.changesPercentage,
        marketCap: profile.mktCap,
        exchange: profile.exchangeShortName,
        fiftyTwoWeekLow: quote.yearLow,
        fiftyTwoWeekHigh: quote.yearHigh,
      },
      profile: {
        sector: profile.sector,
        industry: profile.industry,
        employees: profile.fullTimeEmployees,
        description: profile.description,
        website: profile.website,
        executives: [],
      },
      financials: {
        peRatio: quote.pe,
        pegRatio: metrics?.pegRatioTTM,
        revenueGrowth: metrics?.revenueGrowthTTM,
        profitMargins: profile.profitMargin ? parseFloat(profile.profitMargin) / 100 : null,
        grossMargins: metrics?.grossProfitMarginTTM,
        totalCash: metrics?.cashPerShareTTM ? metrics.cashPerShareTTM * quote.sharesOutstanding : null,
        totalDebt: metrics?.debtToEquityTTM,
        freeCashflow: metrics?.freeCashFlowPerShareTTM ? metrics.freeCashFlowPerShareTTM * quote.sharesOutstanding : null,
        returnOnEquity: metrics?.roeTTM,
        dividendYield: profile.lastDiv ? profile.lastDiv / quote.price : null,
        beta: profile.beta,
      },
    })
  } catch (error: any) {
    console.error('FMP error:', error)
    return NextResponse.json({ error: 'Could not fetch data for: ' + ticker, detail: error.message }, { status: 500 })
  }
}
