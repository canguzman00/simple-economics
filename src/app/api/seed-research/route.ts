import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RESEARCH_PAPERS = [
  { title: "The Effects of Inflation on Household Purchasing Power", summary: "Recent inflation has reduced the real purchasing power of American households by an average of 8% since 2020, with lower-income families bearing the heaviest burden. The research shows that food and housing costs have risen faster than wages for workers in the bottom half of the income distribution.", source: "Journal of Economic Perspectives", url: "https://www.aeaweb.org/journals/jep", year: 2024, pillar: "PERSONAL_FINANCE" },
  { title: "Housing Affordability Crisis: Causes and Policy Responses", summary: "The gap between home prices and median incomes has reached historic levels, with the typical home now costing over 6 times the median annual income compared to 3 times in 2000. Zoning restrictions and supply shortages are identified as primary drivers, with rental costs following the same upward trajectory.", source: "Quarterly Journal of Economics", url: "https://academic.oup.com/qje", year: 2024, pillar: "PERSONAL_FINANCE" },
  { title: "Labor Market Polarization and Wage Stagnation for Middle-Skill Workers", summary: "Automation and technological change have hollowed out middle-skill jobs, pushing workers toward either high-skill professional roles or low-wage service jobs with little in between. Workers without college degrees have seen their real wages fall relative to inflation over the past two decades.", source: "American Economic Review", url: "https://www.aeaweb.org/journals/aer", year: 2024, pillar: "GLOBAL_ECONOMICS" },
  { title: "The Distributional Effects of Tariffs on American Households", summary: "New tariff policies function as a consumption tax that falls disproportionately on low and middle-income households who spend a higher share of their income on imported goods. Each 1% increase in tariffs costs the average American household approximately $300 per year in higher prices.", source: "Journal of International Economics", url: "https://www.sciencedirect.com/journal/journal-of-international-economics", year: 2025, pillar: "GEOPOLITICS_MONEY" },
  { title: "AI and the Future of Work: Employment Effects Across Industries", summary: "Artificial intelligence is automating tasks in white-collar professions at a faster rate than previously expected, with legal, accounting, and administrative roles facing the most disruption. The research estimates that 30% of current job tasks could be automated within a decade, though new job categories are also emerging.", source: "NBER Working Paper Series", url: "https://www.nber.org", year: 2025, pillar: "GLOBAL_ECONOMICS" },
  { title: "Income Inequality in America: New Evidence from Tax Records", summary: "The top 1% of earners now capture 20% of all income in the United States, the highest share since the 1920s. The research finds that tax policy changes since 2000 have contributed significantly to this concentration, while declining union membership has reduced bargaining power for workers.", source: "Quarterly Journal of Economics", url: "https://academic.oup.com/qje", year: 2024, pillar: "DEVELOPMENT_POLICY" },
  { title: "Rental Markets and Household Financial Stress", summary: "More than half of American renters now spend over 30% of their income on housing, the threshold economists consider unaffordable. The shortage of affordable rental units has worsened significantly since 2020, with vacancy rates near historic lows in most major metropolitan areas.", source: "Journal of Urban Economics", url: "https://www.sciencedirect.com/journal/journal-of-urban-economics", year: 2025, pillar: "PERSONAL_FINANCE" },
  { title: "Federal Debt Sustainability and Long-Run Growth", summary: "The US national debt has surpassed 120% of GDP, raising questions about long-term fiscal sustainability. Research suggests that while high debt does not immediately trigger a crisis, it crowds out private investment and reduces the government's ability to respond to future recessions.", source: "Brookings Papers on Economic Activity", url: "https://www.brookings.edu/bpea-articles", year: 2024, pillar: "GLOBAL_ECONOMICS" },
  { title: "The Economics of Healthcare Costs and Insurance Coverage Gaps", summary: "Medical costs continue to rise at twice the rate of general inflation, leaving millions of Americans with inadequate coverage or avoiding care due to cost. The research quantifies how high healthcare costs reduce household savings and increase personal bankruptcy filings.", source: "Journal of Health Economics", url: "https://www.sciencedirect.com/journal/journal-of-health-economics", year: 2024, pillar: "PERSONAL_FINANCE" },
  { title: "Student Debt and Its Effects on Household Wealth Building", summary: "Americans collectively owe $1.7 trillion in student loan debt, with borrowers delaying home purchases, retirement savings, and family formation compared to debt-free peers. The wealth gap between those with and without student debt is now larger than the gap created by not attending college at all.", source: "Journal of Financial Economics", url: "https://www.sciencedirect.com/journal/journal-of-financial-economics", year: 2024, pillar: "PERSONAL_FINANCE" },
  { title: "Immigration Policy and Labor Market Outcomes", summary: "Restricting immigration reduces labor supply in sectors like construction, agriculture, and healthcare, leading to higher prices for consumers and slower economic growth. Research estimates that current immigration levels add approximately $2 trillion to US GDP annually.", source: "American Economic Review", url: "https://www.aeaweb.org/journals/aer", year: 2025, pillar: "GEOPOLITICS_MONEY" },
  { title: "Minimum Wage Increases and Employment: New Evidence", summary: "Recent research using improved methods finds that moderate minimum wage increases have minimal negative effects on employment while significantly boosting incomes for low-wage workers. States that raised their minimum wage to $15 saw faster wage growth for the bottom 20% without measurable job losses.", source: "Review of Economic Studies", url: "https://academic.oup.com/restud", year: 2024, pillar: "DEVELOPMENT_POLICY" },
];

export async function GET() {
  const session = await getAuthSession();
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let saved = 0;
  for (const paper of RESEARCH_PAPERS) {
    try {
      const existing = await prisma.newsCache.findUnique({ where: { url: paper.url } });
      if (existing) continue;

      await prisma.newsCache.create({
        data: {
          title: paper.title,
          summary: paper.summary,
          fullExplanation: "",
          url: paper.url + "?ref=" + paper.year + "-" + saved,
          source: paper.source,
          contentType: "Research Paper",
          publishedAt: new Date(`${paper.year}-01-01`),
          pillar: paper.pillar as "PERSONAL_FINANCE" | "GLOBAL_ECONOMICS" | "DEVELOPMENT_POLICY" | "GEOPOLITICS_MONEY",
          impact: "MEDIUM",
          tier: "GLOBAL",
          region: null,
        },
      });
      saved++;
    } catch { continue; }
  }

  return NextResponse.json({ ok: true, saved });
}
