// ─── Legacy (used by profile edit page) ──────────────────────────────────────

export const SITUATIONS = [
  { value: "RENTER",        emoji: "🏠", label: "Renter",        sub: "I pay rent every month" },
  { value: "OWNER",         emoji: "🔑", label: "Homeowner",     sub: "I own or have a mortgage" },
  { value: "EMPLOYED",      emoji: "💼", label: "Employed",      sub: "I work for a company" },
  { value: "SELF_EMPLOYED", emoji: "⚡", label: "Self-Employed", sub: "I run my own thing" },
  { value: "STUDENT",       emoji: "📚", label: "Student",       sub: "I'm in school" },
] as const;

export const CONCERNS = [
  { value: "HOUSING",      emoji: "📈", label: "Housing Costs",    sub: "Rent, mortgages, buying" },
  { value: "JOB_SECURITY", emoji: "🛡️", label: "Job Security",    sub: "Layoffs, hiring, my industry" },
  { value: "SAVINGS",      emoji: "💰", label: "Building Savings", sub: "Growing what I have" },
  { value: "DEBT",         emoji: "🔗", label: "Debt Burden",      sub: "Loans, credit, interest" },
  { value: "RETIREMENT",   emoji: "🌅", label: "Retirement",       sub: "Long-term security" },
] as const;

export type Situation = typeof SITUATIONS[number]["value"];
export type Concern   = typeof CONCERNS[number]["value"];

export function situationLabel(v: Situation | null): string {
  return SITUATIONS.find((s) => s.value === v)?.label ?? v ?? "";
}

export function concernLabel(v: Concern | null): string {
  return CONCERNS.find((c) => c.value === v)?.label ?? v ?? "";
}

// ─── New onboarding (housing + employment as separate fields) ─────────────────

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
