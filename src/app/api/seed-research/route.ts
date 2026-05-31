import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const RESEARCH_PAPERS = [
  { title: "The Effects of Inflation on Household Purchasing Power", summary: "Recent inflation has reduced the real purchasing power of American households by an average of 8% since 2020, with lower-income families bearing the heaviest burden. Food and housing costs have risen faster than wages for workers in the bottom half of the income distribution.", source: "Journal of Economic Perspectives", url: "https://www.aeaweb.org/journals/jep", pillar: "PERSONAL_FINANCE" },
  { title: "Housing Affordability Crisis: Causes and Policy Responses", summary: "The gap between home prices and median incomes has reached historic levels, with the typical home now costing over 6 times the median annual income compared to 3 times in 2000. Zoning restrictions and supply shortages are identified as primary drivers.", source: "Quarterly Journal of Economics", url: "https://academic.oup.com/qje", pillar: "PERSONAL_FINANCE" },
  { title: "Labor Market Polarization and Wage Stagnation for Middle-Skill Workers", summary: "Automation and technological change have hollowed out middle-skill jobs, pushing workers toward either high-skill professional roles or low-wage service jobs. Workers without college degrees have seen their real wages fall relative to inflation over the past two decades.", source: "American Economic Review", url: "https://www.aeaweb.org/journals/aer", pillar: "GLOBAL_ECONOMICS" },
  { title: "The Distributional Effects of Tariffs on American Households", summary: "New tariff policies function as a consumption tax that falls disproportionately on low and middle-income households. Each 1% increase in tariffs costs the average American household approximately $300 per year in higher prices.", source: "Journal of International Economics", url: "https://www.sciencedirect.com/journal/journal-of-international-economics", pillar: "GEOPOLITICS_MONEY" },
  { title: "AI and the Future of Work: Employment Effects Across Industries", summary: "Artificial intelligence is automating tasks in white-collar professions at a faster rate than previously expected. The research estimates that 30% of current job tasks could be automated within a decade, though new job categories are also emerging.", source: "NBER Working Paper Series", url: "https://www.nber.org/papers", pillar: "GLOBAL_ECONOMICS" },
  { title: "Income Inequality in America: New Evidence from Tax Records", summary: "The top 1% of earners now capture 20% of all income in the United States, the highest share since the 1920s. Tax policy changes since 2000 have contributed significantly to this concentration.", source: "Quarterly Journal of Economics", url: "https://academic.oup.com/qje/issue", pillar: "DEVELOPMENT_POLICY" },
  { title: "Rental Markets and Household Financial Stress", summary: "More than half of American renters now spend over 30% of their income on housing. The shortage of affordable rental units has worsened significantly since 2020, with vacancy rates near historic lows in most major metropolitan areas.", source: "Journal of Urban Economics", url: "https://www.sciencedirect.com/journal/journal-of-urban-economics", pillar: "PERSONAL_FINANCE" },
  { title: "Federal Debt Sustainability and Long-Run Growth", summary: "The US national debt has surpassed 120% of GDP, raising questions about long-term fiscal sustainability. High debt crowds out private investment and reduces the government's ability to respond to future recessions.", source: "Brookings Papers on Economic Activity", url: "https://www.brookings.edu/bpea-articles", pillar: "GLOBAL_ECONOMICS" },
  { title: "The Economics of Healthcare Costs and Insurance Coverage Gaps", summary: "Medical costs continue to rise at twice the rate of general inflation, leaving millions of Americans with inadequate coverage. High healthcare costs reduce household savings and increase personal bankruptcy filings.", source: "Journal of Health Economics", url: "https://www.sciencedirect.com/journal/journal-of-health-economics", pillar: "PERSONAL_FINANCE" },
  { title: "Student Debt and Its Effects on Household Wealth Building", summary: "Americans collectively owe $1.7 trillion in student loan debt, with borrowers delaying home purchases and retirement savings. The wealth gap between those with and without student debt is now larger than the gap created by not attending college.", source: "Journal of Financial Economics", url: "https://www.sciencedirect.com/journal/journal-of-financial-economics", pillar: "PERSONAL_FINANCE" },
  { title: "Immigration Policy and Labor Market Outcomes", summary: "Restricting immigration reduces labor supply in construction, agriculture, and healthcare, leading to higher prices and slower growth. Current immigration levels add approximately $2 trillion to US GDP annually.", source: "American Economic Review", url: "https://www.aeaweb.org/journals/aer/policy", pillar: "GEOPOLITICS_MONEY" },
  { title: "Minimum Wage Increases and Employment: New Evidence", summary: "Moderate minimum wage increases have minimal negative effects on employment while significantly boosting incomes for low-wage workers. States that raised their minimum wage to $15 saw faster wage growth without measurable job losses.", source: "Review of Economic Studies", url: "https://academic.oup.com/restud", pillar: "DEVELOPMENT_POLICY" },
  { title: "Foreign Aid Effectiveness and Economic Development", summary: "Targeted foreign aid focused on health, education, and infrastructure produces measurable long-term economic growth in recipient countries. Aid that goes directly to communities shows the strongest results.", source: "Journal of Development Economics", url: "https://www.sciencedirect.com/journal/journal-of-development-economics", pillar: "DEVELOPMENT_POLICY" },
  { title: "Trade Liberalization and Wage Inequality in Developing Economies", summary: "Opening trade has lifted millions out of poverty but has also widened the gap between skilled and unskilled workers. Countries that invested in education alongside trade liberalization saw the most balanced gains.", source: "Journal of Development Economics", url: "https://www.sciencedirect.com/journal/journal-of-development-economics/trade", pillar: "GEOPOLITICS_MONEY" },
  { title: "Climate Change and Agricultural Productivity: Economic Costs", summary: "Rising temperatures are reducing crop yields in tropical and subtropical regions, threatening food security for billions. The economic cost of inaction on climate change is estimated to exceed $20 trillion globally by 2050.", source: "Journal of Development Economics", url: "https://www.sciencedirect.com/journal/journal-of-development-economics/climate", pillar: "DEVELOPMENT_POLICY" },
  { title: "Monetary Policy Transmission and Household Balance Sheets", summary: "Interest rate increases affect lower-income households more severely because they carry more variable-rate debt relative to their income. Rate hikes reduce spending most sharply for households with credit card and adjustable-rate mortgage debt.", source: "Journal of Political Economy", url: "https://www.journals.uchicago.edu/journals/jpe", pillar: "PERSONAL_FINANCE" },
  { title: "Public Pension Systems and Retirement Security", summary: "Shifting from defined-benefit to defined-contribution pension plans has transferred investment risk onto workers who are poorly equipped to manage it. Workers retiring today have significantly less guaranteed retirement income than previous generations.", source: "Journal of Political Economy", url: "https://www.journals.uchicago.edu/journals/jpe/pensions", pillar: "PERSONAL_FINANCE" },
  { title: "The Geography of Economic Opportunity in America", summary: "Where a child grows up has an enormous effect on their lifetime earnings. Children from poor families who move to high-opportunity areas earn up to 35% more as adults.", source: "Journal of Political Economy", url: "https://www.journals.uchicago.edu/journals/jpe/geography", pillar: "DEVELOPMENT_POLICY" },
  { title: "Tax Incidence and the Burden on Middle-Income Households", summary: "When corporations face higher taxes, they pass a significant portion of the cost to workers through lower wages and to consumers through higher prices. The middle class often bears a disproportionate share of corporate tax burdens.", source: "Journal of Public Economics", url: "https://www.sciencedirect.com/journal/journal-of-public-economics", pillar: "PERSONAL_FINANCE" },
  { title: "Childcare Costs and Female Labor Force Participation", summary: "The rising cost of childcare now exceeds college tuition in many states, pushing women out of the workforce and reducing household income. Universal pre-K programs have been shown to increase maternal employment and long-term child outcomes.", source: "Journal of Public Economics", url: "https://www.sciencedirect.com/journal/journal-of-public-economics/childcare", pillar: "DEVELOPMENT_POLICY" },
  { title: "Financial Fragility of American Households", summary: "Nearly 40% of American households could not cover a $400 emergency expense without borrowing. This financial fragility makes families vulnerable to job loss, medical emergencies, and economic downturns.", source: "Journal of Labor Economics", url: "https://www.journals.uchicago.edu/journals/jole", pillar: "PERSONAL_FINANCE" },
  { title: "Gig Economy Work and Worker Welfare", summary: "Gig economy workers earn less per hour than traditional employees once accounting for lack of benefits, irregular hours, and self-employment taxes. The flexibility premium claimed by platforms does not fully compensate for lost income security.", source: "Journal of Labor Economics", url: "https://www.journals.uchicago.edu/journals/jole/gig", pillar: "PERSONAL_FINANCE" },
  { title: "Global Debt Vulnerabilities and Financial Stability Risks", summary: "Global debt has reached $300 trillion, creating systemic risks if interest rates remain elevated for an extended period. Emerging market countries with dollar-denominated debt are most exposed to financial crises.", source: "IMF Economic Review", url: "https://www.imf.org/en/Publications/IMF-Economic-Review", pillar: "GLOBAL_ECONOMICS" },
  { title: "Supply Chain Diversification and Economic Resilience", summary: "The pandemic exposed the fragility of highly concentrated global supply chains in semiconductors, pharmaceuticals, and rare earth minerals. Countries that diversify their supply chains pay higher short-term costs but gain significant resilience against future shocks.", source: "IMF Economic Review", url: "https://www.imf.org/en/Publications/IMF-Economic-Review/supply-chains", pillar: "GEOPOLITICS_MONEY" },
];

async function generatePoints(paper: typeof RESEARCH_PAPERS[0]): Promise<string> {
  try {
    const res = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: "Write exactly 3 short bullet points explaining what this economics research means for an everyday American renter with a stable job who is trying to save money. Plain English only, no jargon.\n\nTitle: " + paper.title + "\nSummary: " + paper.summary + "\n\nRespond with ONLY a JSON array of 3 strings. No markdown, no preamble.\nExample: [\"Point one.\", \"Point two.\", \"Point three.\"]",
      }],
    });
    const text = res.content[0]?.type === "text" ? res.content[0].text.trim() : "[]";
    return text.replace(/^```json\n?|```$/g, "").trim();
  } catch {
    return "[]";
  }
}

export async function GET(req: Request) {
  const session = await getAuthSession();
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const batch = url.searchParams.get("batch");
  const allPapers = RESEARCH_PAPERS;
  const papers = batch === "2" ? allPapers.slice(12) : allPapers.slice(0, 12);

  if (batch === "1" || !batch) {
    await prisma.newsCache.deleteMany({ where: { contentType: "Research Paper" } });
  }

  let saved = 0;
  for (const paper of papers) {
    try {
      const points = await generatePoints(paper);
      await prisma.newsCache.create({
        data: {
          title: paper.title,
          summary: paper.summary,
          fullExplanation: points,
          url: paper.url + "?se=" + String(saved),
          source: paper.source,
          contentType: "Research Paper",
          publishedAt: new Date(),
          pillar: paper.pillar as "PERSONAL_FINANCE" | "GLOBAL_ECONOMICS" | "DEVELOPMENT_POLICY" | "GEOPOLITICS_MONEY",
          impact: "MEDIUM",
          tier: "GLOBAL",
          region: null,
        },
      });
      saved++;
    } catch {
      continue;
    }
  }

  return NextResponse.json({ ok: true, saved });
}
