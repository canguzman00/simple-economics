import type { EvidenceCard } from "./types";

// The Published Evidence Card library. Every card here has gone through the
// Draft -> Submitted for Review -> Economist Review -> Approved -> Published
// pipeline (see project docs: evidence-review-workflow.md, answer-contract.md).
// Do NOT hand-edit an answer/claim here without going back through that
// process — this file is the runtime source of truth for what the "Ask the
// Economist" page is allowed to say.
//
// Publication record: SE-001 v0.3, SE-002 v0.3, SE-003-SE-006 v0.2.
// Approved by Carlos 2026-09-04. Published 2026-09-05.

export const EVIDENCE_CARDS: EvidenceCard[] = [
  {
    id: "SE-001",
    version: "0.3",
    question: "How do higher interest rates help reduce inflation?",
    status: "Published",
    evidenceType: "EXPERT_JUDGMENT",
    evidenceSubtype: "Institutional synthesis of monetary transmission",
    claim:
      "Tighter monetary policy generally reduces demand and inflationary pressure relative to what would otherwise have happened. The magnitude and timing vary.",
    finding:
      "Monetary policy affects credit costs, financial conditions, and spending, which influence employment and inflation. Cited explanations support this general mechanism but do not establish a numerical effect for a particular rate increase.",
    causalConfidence:
      "The general mechanism is supported by institutional explanations; these sources alone do not establish the size or timing of a particular policy action's causal effect.",
    evidenceStrength: [
      { dimension: "Source quality", assessment: "High (official central-bank explanation + institutional research)" },
      { dimension: "Methodological quality", assessment: "Appropriate for mechanisms, insufficient for a numerical causal estimate" },
      { dimension: "Causal identification", assessment: "Not independently evaluated in this card" },
      { dimension: "Applicability", assessment: "Broad U.S. macro interpretation" },
      { dimension: "Recency", assessment: "Durable mechanism, not a current policy assessment" },
      { dimension: "External validity", assessment: "Limited for individual household outcomes" },
      { dimension: "Expert agreement", assessment: "Not systematically assessed" },
    ],
    mechanism:
      "Tighter policy -> tighter financial conditions and changes in expectations -> weaker interest-sensitive spending -> less demand pressure -> lower inflation than otherwise.",
    timeHorizon: "Effects unfold over time; no fixed lag supported by this card.",
    population:
      "U.S. economy in aggregate; cross-country evidence supports the general mechanism without establishing identical effects across countries.",
    caveats: [
      "Inflation can stay elevated despite a restraining policy effect.",
      "Supply shocks and other developments also affect inflation.",
      "Expected inflation matters for real borrowing costs.",
      "Policy responds to conditions, so high rates alongside high inflation don't by themselves establish causation or policy failure.",
      "Effects vary with economic conditions and structure.",
    ],
    whatWouldChangeAssessment:
      "Credible causal studies showing monetary tightening consistently fails to reduce demand or inflationary pressure relative to what would otherwise have happened would weaken our confidence. Evidence of structural changes in credit markets or price-setting would prompt reassessment of the mechanism's applicability and timing. A single episode of persistent inflation would not be sufficient.",
    relevantDecisions: "Understanding borrowing conditions; evaluating household budget scenarios.",
    sources: [
      { name: "Federal Reserve — Inflation and employment", url: "https://www.federalreserve.gov/faqs/money_12856.htm", tier: 1 },
      { name: "Bank of England — Monetary policy transmission", url: "https://www.bankofengland.co.uk/quarterly-bulletin/2024/2024/about-a-rate-of-general-interest-how-monetary-policy-transmits", tier: 3, isCrossCheck: true },
    ],
    answerBoundary:
      "Does not establish how much inflation will decline after the next rate increase or when that decline will occur.",
    reviewedBy: "Carlos",
    reviewDate: "2026-09-04",
    publishedVersion: "0.3",
    publishedDate: "2026-09-05",
  },
  {
    id: "SE-002",
    version: "0.3",
    question: "Will a Fed rate cut automatically lower mortgage rates?",
    status: "Published",
    evidenceType: "EXPERT_JUDGMENT",
    evidenceSubtype: "Institutional interpretation of mortgage pricing",
    claim: "A Fed rate cut does not guarantee that new fixed mortgage rates will fall.",
    finding:
      "Fixed mortgage rates reflect longer-term Treasury yields and mortgage-specific spreads. Those components can change independently of the current policy rate, preventing an automatic one-for-one relationship.",
    causalConfidence:
      "The pricing explanation is supported; the effect of a particular Fed announcement on a particular mortgage quote is not identified.",
    evidenceStrength: [
      { dimension: "Source quality", assessment: "High institutional analysis" },
      { dimension: "Methodological quality", assessment: "Appropriate for explaining pricing components" },
      { dimension: "Causal identification", assessment: "No isolated policy-announcement effect established" },
      { dimension: "Applicability", assessment: "Strongest for new U.S. conventional fixed-rate mortgages" },
      { dimension: "Recency", assessment: "Includes 2026 institutional analysis" },
      { dimension: "External validity", assessment: "Limited across borrowers and loan products" },
      { dimension: "Expert agreement", assessment: "Not systematically assessed" },
    ],
    mechanism:
      "Expectations about future interest rates and term premiums affect Treasury yields; mortgage-specific risks and intermediation costs affect the additional rate borrowers pay.",
    timeHorizon: "Quotes can respond quickly to market developments. This card supports no forecast horizon.",
    population: "U.S. borrowers seeking new fixed-rate purchase or refinance loans.",
    caveats: [
      "Anticipated policy changes may already be reflected in rates.",
      "Mortgage rates can rise after a Fed cut; that sequence alone does not mean the cut caused the rise.",
      "Borrower characteristics, loan terms, and lender pricing affect individual quotes.",
      "An existing fixed-rate loan's contractual rate does not reset following a Fed announcement.",
    ],
    whatWouldChangeAssessment:
      "A sustained change in mortgage-market structure that ties new fixed mortgage rates directly to the current Fed policy rate would prompt revision. Robust evidence that expectations, term premiums, or mortgage-specific spreads play a materially different role would change our confidence in the pricing explanation. Mortgage rates falling after a particular Fed cut would not, by itself, establish an automatic relationship.",
    relevantDecisions: "Comparing actual purchase and refinance quotes; evaluating alternative payment scenarios.",
    sources: [
      { name: "Federal Reserve Bank of Boston — Why mortgage rates exceed Treasury yields", url: "https://www.bostonfed.org/publications/current-policy-perspectives/2026/why-mortgage-rates-exceed-treasury-yields", tier: 3 },
      { name: "Fannie Mae — What determines a 30-year mortgage rate?", url: "https://www.fanniemae.com/research-and-insights/publications/housing-insights/rate-30-year-mortgage", tier: 3, isCrossCheck: true },
    ],
    answerBoundary: "Cannot determine whether waiting for the next Fed meeting will produce a better mortgage rate.",
    reviewedBy: "Carlos",
    reviewDate: "2026-09-04",
    publishedVersion: "0.3",
    publishedDate: "2026-09-05",
  },
  {
    id: "SE-003",
    version: "0.2",
    question: "Does the unemployment rate count everyone without a job?",
    status: "Published",
    evidenceType: "FACT",
    evidenceSubtype: "Official statistical definition",
    claim:
      "The headline unemployment rate measures unemployment within the labor force; it does not count every person without a job.",
    finding:
      "BLS generally classifies people as unemployed when they have no employment, are available for work, and actively searched during the previous four weeks. People on temporary layoff expecting recall can qualify without searching. The denominator includes employed and unemployed people, excluding those outside the labor force.",
    causalConfidence: "Not applicable. This is a definition and accounting relationship.",
    evidenceStrength: [
      { dimension: "Source quality", assessment: "High: official statistical methodology" },
      { dimension: "Methodological quality", assessment: "Explicit and appropriate for interpreting the measure" },
      { dimension: "Causal identification", assessment: "Not applicable" },
      { dimension: "Applicability", assessment: "High for the U.S. headline unemployment rate" },
      { dimension: "Recency", assessment: "Maintained official documentation" },
      { dimension: "External validity", assessment: "Does not measure individual job prospects" },
      { dimension: "Expert agreement", assessment: "Not applicable to verifying the official definition" },
    ],
    mechanism:
      "Unemployment rate = unemployed / labor force x 100. If unemployed people stop searching and leave the labor force, the rate can fall without anyone gaining employment.",
    timeHorizon: "Monthly reporting, using specified survey reference periods.",
    population: "U.S. civilian noninstitutional population age 16 and older.",
    caveats: [
      "A falling rate alone cannot establish that hiring improved.",
      "The measure does not capture every form of labor underutilization.",
      "Participation and employment measures provide additional context.",
      "International definitions support the general framework, but BLS governs the U.S.-specific details.",
    ],
    relevantDecisions: "Interpreting labor-market headlines and assessing the broader employment environment.",
    sources: [
      { name: "BLS — Concepts and definitions", url: "https://www.bls.gov/cps/definitions.htm", tier: 1 },
      { name: "ILOSTAT — Labour-force definitions", url: "https://ilostat.ilo.org/methods/concepts-and-definitions/description-labour-force-statistics/", tier: 1, isCrossCheck: true },
    ],
    answerBoundary: "Cannot infer a user's probability of finding work from the national unemployment rate.",
    reviewedBy: "Carlos",
    reviewDate: "2026-09-04",
    publishedVersion: "0.2",
    publishedDate: "2026-09-05",
  },
  {
    id: "SE-004",
    version: "0.2",
    question: "Do lower mortgage rates necessarily make buying a home affordable?",
    status: "Published",
    evidenceType: "MODEL",
    evidenceSubtype: "Deterministic loan-payment calculation",
    claim:
      "A lower interest rate reduces principal-and-interest payments for an otherwise identical fully amortizing fixed-rate loan, but does not establish overall affordability.",
    finding:
      "Holding the amount borrowed and repayment term constant, a lower rate produces a lower scheduled principal-and-interest payment.",
    causalConfidence:
      "Not applicable as empirical identification. The payment relationship follows mathematically from the stated assumptions.",
    evidenceStrength: [
      { dimension: "Source quality", assessment: "High: official consumer guidance" },
      { dimension: "Methodological quality", assessment: "Exact amortization relationship under stated assumptions" },
      { dimension: "Causal identification", assessment: "Not applicable" },
      { dimension: "Applicability", assessment: "High for comparable standard fixed-rate loans" },
      { dimension: "Recency", assessment: "Time-independent arithmetic" },
      { dimension: "External validity", assessment: "Limited for overall household affordability" },
      { dimension: "Expert agreement", assessment: "Not applicable to mathematical verification" },
    ],
    mechanism: "Lower interest rate + unchanged principal and term -> lower scheduled principal-and-interest payment.",
    timeHorizon: "Loan origination and the contractual repayment term.",
    population: "Buyers or refinancing homeowners comparing fully amortizing fixed-rate loans.",
    caveats: [
      "Prices, down payments, loan amounts, and terms may differ.",
      "Taxes, insurance, mortgage insurance, association fees, utilities, maintenance, and other household expenses affect affordability.",
      "A lower quoted rate can involve upfront costs; compare closing costs as well as payments.",
      "The calculation predicts no change in home prices or household income.",
    ],
    relevantDecisions: "Comparing loan scenarios and assessing housing costs against a household budget.",
    sources: [
      { name: "Federal Reserve — Mortgage refinancing guide", url: "https://www.federalreserve.gov/pubs/refinancings/default.htm", tier: 1 },
      { name: "CFPB — Figure out how much you want to spend", url: "https://www.consumerfinance.gov/owning-a-home/prepare/figure-out-how-much-you-want-to-spend/", tier: 1, isCrossCheck: true },
    ],
    answerBoundary: "Cannot answer \"Should I buy now?\" or \"Can I afford this home?\" from the interest rate alone.",
    reviewedBy: "Carlos",
    reviewDate: "2026-09-04",
    publishedVersion: "0.2",
    publishedDate: "2026-09-05",
  },
  {
    id: "SE-005",
    version: "0.2",
    question: "Does a pay raise mean my purchasing power increased?",
    status: "Published",
    evidenceType: "MODEL",
    evidenceSubtype: "Accounting identity",
    claim:
      "Pay's purchasing power rises relative to a specified price index when pay grows faster than that index over the same period.",
    finding:
      "Exact real pay growth is (1 + nominal pay growth) / (1 + price growth) - 1. Using hypothetical inputs, a 4% raise and 3% price increase imply approximately 0.97% real pay growth. BLS documents the use of consumer price indexes to adjust earnings.",
    causalConfidence: "Not applicable. The identity does not explain why wages or prices changed.",
    evidenceStrength: [
      { dimension: "Source quality", assessment: "High: official methodology" },
      { dimension: "Methodological quality", assessment: "Exact accounting relationship" },
      { dimension: "Causal identification", assessment: "Not applicable" },
      { dimension: "Applicability", assessment: "High for consistent pay and price comparisons" },
      { dimension: "Recency", assessment: "Time-independent calculation" },
      { dimension: "External validity", assessment: "Limited by household spending patterns and pay definitions" },
      { dimension: "Expert agreement", assessment: "Not applicable to mathematical verification" },
    ],
    mechanism: "Adjust nominal pay for changes in the selected price index to express purchasing power.",
    timeHorizon: "Matching periods for pay and prices.",
    population:
      "Individual or aggregate earnings comparisons, with the pay measure explicitly specified — for example, hourly wages or weekly earnings.",
    caveats: [
      "Subtracting inflation from nominal pay growth is an approximation.",
      "Hourly wage growth does not necessarily imply weekly earnings growth if hours change.",
      "Taxes, benefits, and household expenses affect financial well-being.",
      "Average earnings can change because the composition of employment changes.",
      "A national price index does not precisely represent every household's expenses.",
    ],
    relevantDecisions: "Evaluating compensation changes and updating household budgets.",
    sources: [
      { name: "BLS — Real earnings technical note", url: "https://www.bls.gov/news.release/realer.tn.htm", tier: 1 },
      { name: "ECB — Wage developments and their determinants", url: "https://www.ecb.europa.eu/press/economic-bulletin/articles/2023/html/ecb.ebart202208_02~2328747465.en.html", tier: 3, isCrossCheck: true },
    ],
    answerBoundary: "Cannot conclude that every worker is better off because average real earnings increased.",
    reviewedBy: "Carlos",
    reviewDate: "2026-09-04",
    publishedVersion: "0.2",
    publishedDate: "2026-09-05",
  },
  {
    id: "SE-006",
    version: "0.2",
    question: "Does rising consumer spending mean people are buying more?",
    status: "Published",
    evidenceType: "FACT",
    evidenceSubtype: "Official measurement distinction",
    claim: "Growth in dollar spending alone does not establish growth in inflation-adjusted consumption.",
    finding:
      "BEA distinguishes current-dollar spending from real spending, which adjusts for estimated price changes. Personal consumption expenditures cover goods and services purchased by or on behalf of U.S. residents.",
    causalConfidence: "Not applicable. The distinction does not identify what caused spending to change.",
    evidenceStrength: [
      { dimension: "Source quality", assessment: "High: official national accounting methodology" },
      { dimension: "Methodological quality", assessment: "Appropriate for distinguishing nominal and real consumption" },
      { dimension: "Causal identification", assessment: "Absent" },
      { dimension: "Applicability", assessment: "High for interpreting national spending headlines" },
      { dimension: "Recency", assessment: "Maintained methodology" },
      { dimension: "External validity", assessment: "Limited for individual households" },
      { dimension: "Expert agreement", assessment: "Not applicable to verifying the measurement distinction" },
    ],
    mechanism:
      "Dollar spending reflects prices and consumption volume. Price adjustment estimates real consumption; further adjustment for population produces a per-capita measure.",
    timeHorizon: "Monthly, quarterly, or annual comparisons using consistent measures.",
    population: "Aggregate U.S. personal consumption expenditures.",
    caveats: [
      "Real spending is an estimate, not a literal item count.",
      "Aggregate consumption can grow because population grows.",
      "Real per-capita spending describes an average, not every household.",
      "Spending figures alone cannot establish household financial health or sustainable financing.",
    ],
    relevantDecisions: "Interpreting consumer-demand headlines and evaluating aggregate consumption trends.",
    sources: [
      { name: "BEA — Personal income and outlays methodology", url: "https://www.bea.gov/news/pio-release-additional-information", tier: 1 },
      { name: "St. Louis Fed (FRED Blog) — Real per-capita consumption", url: "https://fredblog.stlouisfed.org/2024/04/understanding-real-per-capita-personal-consumption-expenditures/", tier: 3, isCrossCheck: true },
    ],
    answerBoundary:
      "Cannot conclude that households are financially healthy, or that every person is consuming more, simply because total spending increased.",
    reviewedBy: "Carlos",
    reviewDate: "2026-09-04",
    publishedVersion: "0.2",
    publishedDate: "2026-09-05",
  },
];

export function getCardById(id: string): EvidenceCard | undefined {
  return EVIDENCE_CARDS.find((c) => c.id === id);
}

// Client-safe (no server-only imports) — the six questions the library can
// currently answer, shown on the page before the user asks anything.
export const STARTER_QUESTIONS = EVIDENCE_CARDS.map((c) => c.question);
