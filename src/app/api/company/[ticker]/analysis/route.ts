/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker.toUpperCase()
  const body = await request.json()
  const { companyData, userProfile } = body

  const personalization = userProfile ? `
The user has this profile:
- Housing: ${userProfile.situation || 'unknown'}
- Employment: ${userProfile.employmentStatus || 'unknown'}
- Industry: ${userProfile.industry || 'unknown'}
- Life stage: ${userProfile.lifeStage || 'unknown'}
- Primary concern: ${userProfile.concern || 'unknown'}
- City: ${userProfile.city || 'unknown'}
Tailor the yourAngle field specifically for this person.
` : 'No user profile — write a general relevance statement for yourAngle.'

  const prompt = `You are an economist writing for everyday people. Analyze ${ticker} — ${companyData.quote?.name}.

Known info: Sector: ${companyData.profile?.sector || 'unknown'}, Industry: ${companyData.profile?.industry || 'unknown'}

${personalization}

Respond ONLY with valid JSON, no markdown, no preamble:

{
  "plainEnglishSummary": "3 sentences. What they do, how they make money, what matters right now.",
  "businessModel": {
    "howItMakesMoney": "2-3 sentences on revenue streams.",
    "competitiveMoat": "2-3 sentences on competitive advantages."
  },
  "financialHealthInsights": {
    "revenueGrowth": "One sentence on revenue growth trends.",
    "margins": "One sentence on profit margins.",
    "cashPosition": "One sentence on cash and debt situation.",
    "freeCashflow": "One sentence on free cash flow."
  },
  "valuation": {
    "verdict": "undervalued OR fair OR overvalued",
    "explanation": "3-4 sentences on valuation with [FACT] [CONSENSUS] [MY TAKE] labels."
  },
  "flagIssues": [
    { "title": "Short title", "severity": "high OR medium OR low", "description": "2 sentences on this risk." }
  ],
  "yourAngle": "2-3 sentences connecting this company to the user.",
  "revenueBreakdown": [
    { "segment": "Segment name", "amount": "$XXB", "pct": 60 }
  ]
}

Rules:
1. Use your knowledge of this company — be specific with real numbers
2. 2-4 flag issues
3. verdict must be exactly: undervalued, fair, or overvalued
4. Never tell anyone to buy or sell`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const rawText = message.content
      .filter(function(block) { return block.type === 'text' })
      .map(function(block) { return block.type === 'text' ? block.text : '' })
      .join('')

    const clean = rawText.replace(/```json|```/g, '').trim()
    const analysis = JSON.parse(clean)

    return NextResponse.json({ ticker, analysis })
  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: 'Failed to generate analysis', detail: error.message }, { status: 500 })
  }
}
