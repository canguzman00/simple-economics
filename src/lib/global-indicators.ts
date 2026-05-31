import { prisma } from "@/lib/prisma";

export interface GlobalIndicator {
  key: string;
  value: string | null;
  year: number | null;
  source: "IMF" | "World Bank";
}

export interface GlobalIndicators {
  [key: string]: GlobalIndicator;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function fetchIMFIndicator(
  indicatorCode: string,
  key: string
): Promise<GlobalIndicator> {
  try {
    const url = `https://www.imf.org/external/datamapper/api/v1/${indicatorCode}/USA`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": "SimpleEconomics/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`IMF API ${res.status}`);
    const json = await res.json() as {
      values?: Record<string, Record<string, Record<string, number>>>;
    };
    const countryData = json.values?.[indicatorCode]?.["USA"];
    if (!countryData) throw new Error("No USA data");
    const years = Object.keys(countryData).map(Number).filter((y) => !isNaN(y)).sort((a, b) => b - a);
    const latestYear = years[0];
    const rawValue = countryData[String(latestYear)];
    if (rawValue === null || rawValue === undefined) throw new Error("Null value");
    return { key, value: rawValue.toFixed(1), year: latestYear, source: "IMF" };
  } catch (err) {
    console.error(`[global-indicators] IMF ${indicatorCode} failed:`, err);
    return { key, value: null, year: null, source: "IMF" };
  }
}

async function fetchWorldBankIndicator(
  indicatorCode: string,
  key: string
): Promise<GlobalIndicator> {
  try {
    const url = `https://api.worldbank.org/v2/country/US/indicator/${indicatorCode}?format=json&mrv=1&per_page=1`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": "SimpleEconomics/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`World Bank API ${res.status}`);
    const json = await res.json() as [unknown, Array<{ value: number | null; date: string }>];
    const record = json[1]?.[0];
    if (!record || record.value === null || record.value === undefined) throw new Error("No data");
    return { key, value: String(record.value), year: parseInt(record.date), source: "World Bank" };
  } catch (err) {
    console.error(`[global-indicators] World Bank ${indicatorCode} failed:`, err);
    return { key, value: null, year: null, source: "World Bank" };
  }
}

const INDICATOR_SOURCES: Record<string, "IMF" | "World Bank"> = {
  GDP_GROWTH: "IMF",
  INFLATION_IMF: "IMF",
  UNEMPLOYMENT_IMF: "IMF",
  GOVT_DEBT: "IMF",
  CURRENT_ACCOUNT: "IMF",
  GDP_PER_CAPITA: "World Bank",
  GINI: "World Bank",
  POVERTY_RATE: "World Bank",
};

export async function fetchGlobalIndicators(): Promise<GlobalIndicators> {
  const cacheKey = "global_indicators_bundle";

  try {
    const cached = await prisma.economicIndicator.findUnique({ where: { key: cacheKey } });
    if (cached) {
      const age = Date.now() - cached.fetchedAt.getTime();
      if (age < CACHE_TTL_MS) {
        const parsed = JSON.parse(cached.value) as GlobalIndicators;
        console.log("[global-indicators] Returning cached data");
        return parsed;
      }
    }
  } catch (err) {
    console.error("[global-indicators] Cache read failed:", err);
  }

  console.log("[global-indicators] Fetching fresh data from IMF + World Bank");
  const results = await Promise.allSettled([
    fetchIMFIndicator("NGDP_RPCH", "GDP_GROWTH"),
    fetchIMFIndicator("PCPIPCH", "INFLATION_IMF"),
    fetchIMFIndicator("LUR", "UNEMPLOYMENT_IMF"),
    fetchIMFIndicator("GGXWDG_NGDP", "GOVT_DEBT"),
    fetchIMFIndicator("BCA_NGDPD", "CURRENT_ACCOUNT"),
    fetchWorldBankIndicator("NY.GDP.PCAP.CD", "GDP_PER_CAPITA"),
    fetchWorldBankIndicator("SI.POV.GINI", "GINI"),
    fetchWorldBankIndicator("SI.POV.NAHC", "POVERTY_RATE"),
  ]);

  const indicators: GlobalIndicators = {};
  for (const result of results) {
    if (result.status === "fulfilled" && result.value.value !== null) {
      indicators[result.value.key] = result.value;
    }
  }

  try {
    await prisma.economicIndicator.upsert({
      where: { key: cacheKey },
      update: { value: JSON.stringify(indicators), date: new Date().toISOString().split("T")[0], fetchedAt: new Date() },
      create: { key: cacheKey, value: JSON.stringify(indicators), date: new Date().toISOString().split("T")[0] },
    });
    console.log("[global-indicators] Cached successfully");
  } catch (err) {
    console.error("[global-indicators] Cache write failed:", err);
  }

  return indicators;
}

export function formatGlobalValue(key: string, value: string | null): string {
  if (!value || value === "null") return "N/A";
  const num = parseFloat(value);
  if (isNaN(num)) return "N/A";
  switch (key) {
    case "GDP_GROWTH":
    case "INFLATION_IMF":
    case "UNEMPLOYMENT_IMF":
    case "POVERTY_RATE":
      return `${num.toFixed(1)}%`;
    case "GOVT_DEBT":
      return `${Math.round(num)}%`;
    case "CURRENT_ACCOUNT":
      return `${num.toFixed(1)}%`;
    case "GDP_PER_CAPITA":
      return `$${Math.round(num / 1000)}K`;
    case "GINI":
      return num.toFixed(2);
    default:
      return num.toFixed(1);
  }
}

export function getIndicatorSource(key: string): "IMF" | "World Bank" {
  return INDICATOR_SOURCES[key] ?? "IMF";
}
