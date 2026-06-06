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
    const quoteRes = await fetch(`${BASE}?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${AV_KEY}`)
    const text = await quoteRes.text()

    return NextResponse.json({
      status: quoteRes.status,
      keyPresent: !!AV_KEY,
      keyPrefix: AV_KEY ? AV_KEY.slice(0, 6) + '...' : 'missing',
      rawResponse: text.slice(0, 500)
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}
