/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  ],
  "executives": [
    { "name": "Full Name", "title": "Exact Title" }
  ]
}

Rules:
1. Use your knowledge of this company — be specific with real numbers
2. 2-4 flag issues
3. verdict must be exactly: undervalued, fair, or overvalued
4. Never tell anyone to buy or sell
5. executives: list the 4 most senior current executives you know for this company. If unsure, list whoever you know.`
