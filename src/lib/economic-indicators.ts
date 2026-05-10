import { prisma } from "@/lib/prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IndicatorResult {
  key: string;
  value: string | null;
  date: string | null;
  isCached: boolean;
}

// ─── FRED series config ───────────────────────────────────────────────────────

const FRED_SERIES: Record<string, { seriesId: string; label: string }> = {
  CPI:           { seriesId: "CPIAUCSL",     label: "CPI" },
  FEDFUNDS:      { seriesId: "FEDFUNDS",     label: "Federal Funds Rate" },
  UNRATE:        { seriesId: "UNRATE",        label: "Unemployment Rate" },
  MORTGAGE30US:  { seriesId: "MORTGAGE30US", label: "30-Year Mortgage Rate" },
};

// ─── Date formatter ───────────────────────────────────────────────────────────

function formatFredDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ─── Single-series fetch ──────────────────────────────────────────────────────

async function fetchFromFred(key: string): Promise<{ value: string; date: string } | null> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) return null;

  const series = FRED_SERIES[key];
  if (!series) return null;

  const url =
    `https://api.stlouisfed.org/fred/series/observations` +
    `?series_id=${series.seriesId}` +
    `&api_key=${apiKey}` +
    `&file_type=json` +
    `&sort_order=desc` +
    `&limit=1`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;

  const json = await res.json() as {
    observations?: Array<{ value: string; date: string }>;
  };
  const obs = json.observations?.[0];
  if (!obs || obs.value === ".") return null;

  const numericValue = parseFloat(obs.value);
  if (isNaN(numericValue)) return null;

  return {
    value: `${numericValue.toFixed(2)}%`,
    date: formatFredDate(obs.date),
  };
}

// ─── Fetch with cache fallback ────────────────────────────────────────────────

export async function fetchIndicator(key: string): Promise<IndicatorResult> {
  // 1. Try live FRED fetch
  try {
    const live = await fetchFromFred(key);
    if (live) {
      // Persist to cache (upsert)
      await prisma.economicIndicator.upsert({
        where: { key },
        update: { value: live.value, date: live.date, fetchedAt: new Date() },
        create: { key, value: live.value, date: live.date },
      });
      return { key, value: live.value, date: live.date, isCached: false };
    }
  } catch (err) {
    console.error(`[indicators] FRED fetch failed for ${key}:`, err);
  }

  // 2. Fall back to cached value in database
  try {
    const cached = await prisma.economicIndicator.findUnique({ where: { key } });
    if (cached) {
      return { key, value: cached.value, date: cached.date, isCached: true };
    }
  } catch (err) {
    console.error(`[indicators] cache lookup failed for ${key}:`, err);
  }

  // 3. Both failed
  return { key, value: null, date: null, isCached: false };
}

// ─── Fetch all four in parallel ───────────────────────────────────────────────

export async function fetchAllIndicators(): Promise<Record<string, IndicatorResult>> {
  const keys = Object.keys(FRED_SERIES);
  const results = await Promise.all(keys.map((k) => fetchIndicator(k)));
  return Object.fromEntries(results.map((r) => [r.key, r]));
}
