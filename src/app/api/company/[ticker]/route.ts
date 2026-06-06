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
    const res = await fetch(
      `https://stooq.com/q/l/?s=${ticker.toLowerCase()}.us&f=sd2t2ohlcvn&h&e=csv`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )

    const text = await res.text()

    return NextResponse.json({
      status: res.status,
      raw: text.slice(0, 300)
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}
