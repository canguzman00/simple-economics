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
    const profileRes = await fetch(`${BASE}/profile/${ticker}?apikey=${FMP_KEY}`)
    const text = await profileRes.text()
    
    return NextResponse.json({ 
      status: profileRes.status,
      keyPresent: !!FMP_KEY,
      keyPrefix: FMP_KEY ? FMP_KEY.slice(0, 6) + '...' : 'missing',
      rawResponse: text.slice(0, 300)
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}
