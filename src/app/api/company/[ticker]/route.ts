/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker.toUpperCase()

  try {
    const yahooFinance = require('yahoo-finance2').default

    const [quote, summary] = await Promise.all([
      yahooFinance.quote(ticker),
      yahooFinance.quoteSummary(ticker, {
        modules: ['assetProfile', 'financialData', 'defaultKeyStatistics'],
      }),
    ])

    return NextResponse.json({
      ticker,
      quote: {
        name: quote.longName || quote.shortName,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePct: quote.regularMarketChangePercent,
        marketCap: quote.marketCap,
        exchange: quote.fullExchangeName,
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      },
      profile: {
        sector: summary.assetProfile?.sector,
        industry: summary.assetProfile?.industry,
        employees: summary.assetProfile?.fullTimeEmployees,
        description: summary.assetProfile?.longBusinessSummary,
        executives: summary.assetProfile?.companyOfficers?.slice(0, 4).map(function(e: any) {
          return { name: e.name, title: e.title }
        }),
      },
      financials: {
        peRatio: summary.defaultKeyStatistics?.forwardPE,
        pegRatio: summary.defaultKeyStatistics?.pegRatio,
        revenueGrowth: summary.financialData?.revenueGrowth,
        profitMargins: summary.financialData?.profitMargins,
        grossMargins: summary.financialData?.grossMargins,
        totalCash: summary.financialData?.totalCash,
        totalDebt: summary.financialData?.totalDebt,
        freeCashflow: summary.financialData?.freeCashflow,
        returnOnEquity: summary.financialData?.returnOnEquity,
        dividendYield: summary.defaultKeyStatistics?.trailingAnnualDividendYield,
        beta: summary.defaultKeyStatistics?.beta,
      },
    })
  } catch (error) {
    console.error('Yahoo Finance error:', error)
    return NextResponse.json({ error: 'Could not fetch data for: ' + ticker }, { status: 404 })
  }
}
