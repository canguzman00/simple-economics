/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Well-known companies we can serve without live data
const KNOWN_COMPANIES: Record<string, any> = {
  AAPL: { name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Consumer Electronics' },
  MSFT: { name: 'Microsoft Corporation', exchange: 'NASDAQ', sector: 'Technology', industry: 'Software' },
  GOOGL: { name: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Internet Services' },
  AMZN: { name: 'Amazon.com Inc.', exchange: 'NASDAQ', sector: 'Consumer Cyclical', industry: 'E-Commerce' },
  TSLA: { name: 'Tesla Inc.', exchange: 'NASDAQ', sector: 'Consumer Cyclical', industry: 'Electric Vehicles' },
  META: { name: 'Meta Platforms Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Social Media' },
  NVDA: { name: 'NVIDIA Corporation', exchange: 'NASDAQ', sector: 'Technology', industry: 'Semiconductors' },
  JPM: { name: 'JPMorgan Chase & Co.', exchange: 'NYSE', sector: 'Financial Services', industry: 'Banking' },
  V: { name: 'Visa Inc.', exchange: 'NYSE', sector: 'Financial Services', industry: 'Payments' },
  WMT: { name: 'Walmart Inc.', exchange: 'NYSE', sector: 'Consumer Defensive', industry: 'Retail' },
  JNJ: { name: 'Johnson & Johnson', exchange: 'NYSE', sector: 'Healthcare', industry: 'Pharmaceuticals' },
  XOM: { name: 'Exxon Mobil Corporation', exchange: 'NYSE', sector: 'Energy', industry: 'Oil & Gas' },
  NFLX: { name: 'Netflix Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Streaming' },
  DIS: { name: 'The Walt Disney Company', exchange: 'NYSE', sector: 'Communication Services', industry: 'Entertainment' },
  UBER: { name: 'Uber Technologies Inc.', exchange: 'NYSE', sector: 'Technology', industry: 'Ride-sharing' },
}

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker.toUpperCase()
  const company = KNOWN_COMPANIES[ticker]

  if (!company) {
    return NextResponse.json({ error: 'Ticker not found: ' + ticker }, { status: 404 })
  }

  return NextResponse.json({
    ticker,
    quote: {
      name: company.name,
      price: null,
      change: null,
      changePct: null,
      marketCap: null,
      exchange: company.exchange,
      fiftyTwoWeekLow: null,
      fiftyTwoWeekHigh: null,
      livePriceUnavailable: true,
    },
    profile: {
      sector: company.sector,
      industry: company.industry,
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
}
