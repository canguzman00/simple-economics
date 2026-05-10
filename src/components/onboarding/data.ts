// ─── Legacy (used by profile edit page) ──────────────────────────────────────

export const SITUATIONS = [
  { value: "RENTER",        emoji: "🏠", label: "Renter",        sub: "I pay rent every month" },
  { value: "OWNER",         emoji: "🔑", label: "Homeowner",     sub: "I own or have a mortgage" },
  { value: "EMPLOYED",      emoji: "💼", label: "Employed",      sub: "I work for a company" },
  { value: "SELF_EMPLOYED", emoji: "⚡", label: "Self-Employed", sub: "I run my own thing" },
  { value: "STUDENT",       emoji: "📚", label: "Student",       sub: "I'm in school" },
] as const;

export const CONCERNS = [
  { value: "EVERYDAY_COSTS", emoji: "🛒", label: "Everyday Costs",    sub: "Groceries, gas, inflation eating my budget" },
  { value: "HOUSING",        emoji: "📈", label: "Housing Costs",     sub: "Rent, mortgages, buying" },
  { value: "HEALTHCARE",     emoji: "🏥", label: "Healthcare Costs",  sub: "Medical bills, insurance, prescriptions" },
  { value: "JOB_SECURITY",   emoji: "🛡️", label: "Job Security",     sub: "Layoffs, hiring, my industry" },
  { value: "SAVINGS",        emoji: "💰", label: "Building Savings",  sub: "Emergency fund, growing what I have" },
  { value: "DEBT",           emoji: "🔗", label: "Debt Burden",       sub: "Loans, credit cards, interest" },
  { value: "ENERGY_BILLS",   emoji: "⚡", label: "Energy Bills",      sub: "Gas, electricity, utilities" },
  { value: "RETIREMENT",     emoji: "🌅", label: "Retirement",        sub: "Running out of money long-term" },
] as const;

export type Situation = typeof SITUATIONS[number]["value"];
export type Concern   = typeof CONCERNS[number]["value"];

export function situationLabel(v: Situation | null): string {
  return SITUATIONS.find((s) => s.value === v)?.label ?? v ?? "";
}

export function concernLabel(v: Concern | null): string {
  return CONCERNS.find((c) => c.value === v)?.label ?? v ?? "";
}

// ─── Housing + Employment (steps 1–2) ────────────────────────────────────────

export const HOUSING_OPTIONS = [
  { value: "RENTER",             emoji: "🏠", label: "Renter",              sub: "I pay rent each month" },
  { value: "HOMEOWNER",          emoji: "🔑", label: "Homeowner",           sub: "I own or have a mortgage" },
  { value: "LIVING_WITH_OTHERS", emoji: "🤝", label: "Living with others",  sub: "With family, partner, or roommates — no rent" },
  { value: "OTHER_HOUSING",      emoji: "📦", label: "Other",               sub: "My situation is different" },
] as const;

export const EMPLOYMENT_OPTIONS = [
  { value: "EMPLOYED",              emoji: "💼", label: "Employed full-time",        sub: "I work for a company or organization" },
  { value: "SELF_EMPLOYED",         emoji: "⚡", label: "Self-employed",             sub: "I run my own business or freelance" },
  { value: "UNEMPLOYED_LOOKING",    emoji: "🔍", label: "Unemployed — looking",      sub: "I'm actively looking for work" },
  { value: "UNEMPLOYED_NOT_LOOKING",emoji: "🌱", label: "Unemployed — not looking",  sub: "I'm not currently seeking employment" },
  { value: "STUDENT",               emoji: "📚", label: "Student",                   sub: "I'm in school full or part time" },
  { value: "RETIRED",               emoji: "🌅", label: "Retired",                   sub: "I'm retired" },
] as const;

export type HousingStatus    = typeof HOUSING_OPTIONS[number]["value"];
export type EmploymentStatus = typeof EMPLOYMENT_OPTIONS[number]["value"];

export function housingLabel(v: HousingStatus | null): string {
  return HOUSING_OPTIONS.find((h) => h.value === v)?.label ?? v ?? "";
}

export function employmentLabel(v: EmploymentStatus | null): string {
  return EMPLOYMENT_OPTIONS.find((e) => e.value === v)?.label ?? v ?? "";
}

// ─── Life Stage (step 5) ─────────────────────────────────────────────────────

export const LIFE_STAGE_OPTIONS = [
  { value: "EARLY_CAREER",    emoji: "🌱", label: "Early Career",    sub: "Under 35, building my foundation" },
  { value: "MID_CAREER",      emoji: "📈", label: "Mid-Career",      sub: "35–50, growing and planning ahead" },
  { value: "PRE_RETIREMENT",  emoji: "🛡️", label: "Pre-Retirement", sub: "50–65, protecting what I've built" },
  { value: "RETIRED",         emoji: "🌅", label: "Retired",         sub: "65+, preserving and managing income" },
] as const;

export type LifeStage = typeof LIFE_STAGE_OPTIONS[number]["value"];

// ─── Debt Types (step 6 — multi-select) ──────────────────────────────────────

export const DEBT_OPTIONS = [
  { value: "STUDENT_LOANS",     emoji: "🎓", label: "Student Loans",         sub: "Federal or private education debt" },
  { value: "CREDIT_CARD",       emoji: "💳", label: "Credit Card Debt",       sub: "Revolving balance month to month" },
  { value: "CAR_LOAN",          emoji: "🚗", label: "Car Loan",               sub: "Auto financing" },
  { value: "MEDICAL_DEBT",      emoji: "🏥", label: "Medical Debt",           sub: "Healthcare bills or payment plans" },
  { value: "MORTGAGE",          emoji: "🏠", label: "Mortgage",               sub: "Home loan" },
  { value: "NO_SIGNIFICANT_DEBT",emoji: "✅", label: "No Significant Debt",   sub: "I'm debt-free or nearly there" },
] as const;

export type DebtType = typeof DEBT_OPTIONS[number]["value"];

// ─── Industry (step 7) ───────────────────────────────────────────────────────

export const INDUSTRY_OPTIONS = [
  { value: "HEALTHCARE",              emoji: "🏥", label: "Healthcare",                 sub: "Hospitals, clinics, pharma, insurance" },
  { value: "TECHNOLOGY",              emoji: "💻", label: "Technology",                 sub: "Software, hardware, AI, startups" },
  { value: "GOVERNMENT",              emoji: "🏛️", label: "Government & Public Sector", sub: "Federal, state, local government" },
  { value: "EDUCATION",               emoji: "🎓", label: "Education",                  sub: "Schools, universities, training" },
  { value: "RETAIL_SERVICE",          emoji: "🛍️", label: "Retail & Service",          sub: "Stores, restaurants, hospitality" },
  { value: "CONSTRUCTION_TRADES",     emoji: "🔨", label: "Construction & Trades",      sub: "Building, plumbing, electrical, manufacturing" },
  { value: "FINANCE_BANKING",         emoji: "💰", label: "Finance & Banking",          sub: "Banks, insurance, real estate" },
  { value: "LOGISTICS_TRANSPORTATION",emoji: "🚛", label: "Logistics & Transportation", sub: "Trucking, shipping, supply chain" },
  { value: "ENERGY",                  emoji: "⚡", label: "Energy",                     sub: "Oil, gas, renewables, utilities" },
  { value: "AGRICULTURE",             emoji: "🌾", label: "Agriculture",                sub: "Farming, food production" },
  { value: "CREATIVE_MEDIA",          emoji: "🎨", label: "Creative & Media",           sub: "Marketing, journalism, arts, entertainment" },
  { value: "RESEARCH_NONPROFIT",      emoji: "🔬", label: "Research & Nonprofit",       sub: "NGOs, think tanks, academia" },
  { value: "OTHER",                   emoji: "📦", label: "Other",                      sub: "My industry isn't listed" },
  { value: "NOT_APPLICABLE",          emoji: "🚫", label: "Not Applicable",             sub: "I'm not currently working" },
] as const;

export type Industry = typeof INDUSTRY_OPTIONS[number]["value"];
