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
