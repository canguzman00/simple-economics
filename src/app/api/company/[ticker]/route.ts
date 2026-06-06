/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

async function fetchYahoo(ticker: string) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
  }

  const quoteRes = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
    { headers }
  )
  const quoteData = await quoteRes.json()
  const meta = quoteData?.chart?.result?.[0]?.meta

  const summaryRes = await fetch(
    `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=assetProfile,financialData,defaultKeyStatistics`,
    { headers }
  )
  const summaryData = await summaryRes.json()
  const result = summaryData?.quoteSummary?.result?.[0]

  return { meta, result }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker.toUpperCase()

  try {
    const { meta, result } = await fetchYahoo(ticker)

    if (!meta) {
      return NextResponse.json({ error: 'Ticker not found: ' + ticker }, { status: 404 })
    }

    const profile = result?.assetProfile
    const financials = result?.financialData
    const stats = result?.defaultKeyStatistics

    return NextResponse.json({
      ticker,
      quote: {
        name: meta.longName || meta.shortName || ticker,
        price: meta.regularMarketPrice,
        change: meta.regularMarketPrice - meta.previousClose,
        changePct: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
        marketCap: stats?.marketCap?.raw,
        exchange: meta.exchangeName,
        fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
        fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
      },
      profile: {
        sector: profile?.sector,
        industry: profile?.industry,
        employees: profile?.fullTimeEmployees,
        description: profile?.longBusinessSummary,
        executives: profile?.companyOfficers?.slice(0, 4).map(function(e: any) {
          return { name: e.name, title: e.title }
        }),
      },
      financials: {
        peRatio: stats?.forwardPE?.raw,
        pegRatio: stats?.pegRatio?.raw,
        revenueGrowth: financials?.revenueGrowth?.raw,
        profitMargins: financials?.profitMargins?.raw,
        grossMargins: financials?.grossMargins?.raw,
        totalCash: financials?.totalCash?.raw,
        totalDebt: financials?.totalDebt?.raw,
        freeCashflow: financials?.freeCashflow?.raw,
        returnOnEquity: financials?.returnOnEquity?.raw,
        dividendYield: stats?.trailingAnnualDividendYield?.raw,
        beta: stats?.beta?.raw,
      },
    })
  } catch (error) {
    console.error('Yahoo Finance error:', error)
    return NextResponse.json({ error: 'Could not fetch data for: ' + ticker }, { status: 404 })
  }
}
