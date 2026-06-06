/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const AV_KEY = process.env.ALPHA_VANTAGE_KEY
const BASE = 'https://www.alphavantage.co/query'

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker.toUpperCase()

  try {
    const [quoteRes, overviewRes] = await Promise.all([
      fetch(`${BASE}?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${AV_KEY}`),
      fetch(`${BASE}?function=OVERVIEW&symbol=${ticker}&apikey=${AV_KEY}`),
    ])

    const [quoteData, overviewData] = await Promise.all([
      quoteRes.json(),
      overviewRes.json(),
    ])

    const quote = quoteData?.['Global Quote']
    const overview = overviewData

    if (!quote || !quote['05. price']) {
      return NextResponse.json({ error: 'Ticker not found: ' + ticker }, { status: 404 })
    }

    const price = parseFloat(quote['05. price'])
    const prevClose = parseFloat(quote['08. previous close'])
    const change = parseFloat(quote['09. change'])
    const changePct = parseFloat(quote['10. change percent']?.replace('%', ''))

    return NextResponse.json({
      ticker,
      quote: {
        name: overview.Name || ticker,
        price,
        change,
        changePct,
        marketCap: overview.MarketCapitalization ? parseInt(overview.MarketCapitalization) : null,
        exchange: overview.Exchange,
        fiftyTwoWeekLow: parseFloat(quote['04. low']) || null,
        fiftyTwoWeekHigh: parseFloat(quote['03. high']) || null,
      },
      profile: {
        sector: overview.Sector || null,
        industry: overview.Industry || null,
        employees: overview.FullTimeEmployees ? parseInt(overview.FullTimeEmployees) : null,
        description: overview.Description || null,
        executives: [],
      },
      financials: {
        peRatio: overview.PERatio ? parseFloat(overview.PERatio) : null,
        pegRatio: overview.PEGRatio ? parseFloat(overview.PEGRatio) : null,
        revenueGrowth: overview.QuarterlyRevenueGrowthYOY ? parseFloat(overview.QuarterlyRevenueGrowthYOY) : null,
        profitMargins: overview.ProfitMargin ? parseFloat(overview.ProfitMargin) : null,
        grossMargins: overview.GrossProfitTTM ? parseFloat(overview.GrossProfitTTM) : null,
        totalCash: null,
        totalDebt: null,
        freeCashflow: null,
        returnOnEquity: overview.ReturnOnEquityTTM ? parseFloat(overview.ReturnOnEquityTTM) : null,
        dividendYield: overview.DividendYield ? parseFloat(overview.DividendYield) : null,
        beta: overview.Beta ? parseFloat(overview.Beta) : null,
      },
    })
  } catch (error: any) {
    console.error('Alpha Vantage error:', error)
    return NextResponse.json({ error: 'Could not fetch data for: ' + ticker, detail: error.message }, { status: 500 })
  }
}
