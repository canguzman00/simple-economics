export interface LocalIndicator {
  value: string | null;
  period: string | null;
  metro: string | null;
  source: string;
}

const CITY_TO_BLS_SERIES: Record<string, { seriesId: string; metro: string }> = {
  "providence":      { seriesId: "LAUMT443930000000003", metro: "Providence-Warwick, RI-MA" },
  "boston":          { seriesId: "LAUMT251484000000003", metro: "Boston-Cambridge, MA-NH" },
  "new york":        { seriesId: "LAUMT356935600000003", metro: "New York-Newark, NY-NJ-CT" },
  "los angeles":     { seriesId: "LAUMT064749000000003", metro: "Los Angeles-Long Beach, CA" },
  "chicago":         { seriesId: "LAUMT171698000000003", metro: "Chicago-Naperville, IL-IN-WI" },
  "houston":         { seriesId: "LAUMT483910000000003", metro: "Houston-The Woodlands, TX" },
  "phoenix":         { seriesId: "LAUMT043800000000003", metro: "Phoenix-Mesa-Chandler, AZ" },
  "philadelphia":    { seriesId: "LAUMT426264000000003", metro: "Philadelphia-Camden, PA-NJ" },
  "san antonio":     { seriesId: "LAUMT484140000000003", metro: "San Antonio-New Braunfels, TX" },
  "dallas":          { seriesId: "LAUMT191240000000003", metro: "Dallas-Fort Worth-Arlington, TX" },
  "san diego":       { seriesId: "LAUMT067260000000003", metro: "San Diego-Chula Vista, CA" },
  "san francisco":   { seriesId: "LAUMT064185000000003", metro: "San Francisco-Oakland, CA" },
  "seattle":         { seriesId: "LAUMT539200000000003", metro: "Seattle-Tacoma-Bellevue, WA" },
  "denver":          { seriesId: "LAUMT082330000000003", metro: "Denver-Aurora-Lakewood, CO" },
  "atlanta":         { seriesId: "LAUMT131204000000003", metro: "Atlanta-Sandy Springs, GA" },
  "miami":           { seriesId: "LAUMT123310000000003", metro: "Miami-Fort Lauderdale, FL" },
  "minneapolis":     { seriesId: "LAUMT274874000000003", metro: "Minneapolis-St. Paul, MN-WI" },
  "portland":        { seriesId: "LAUMT413900000000003", metro: "Portland-Vancouver, OR-WA" },
  "detroit":         { seriesId: "LAUMT261980000000003", metro: "Detroit-Warren-Dearborn, MI" },
  "austin":          { seriesId: "LAUMT481820000000003", metro: "Austin-Round Rock-Georgetown, TX" },
  "nashville":       { seriesId: "LAUMT473800000000003", metro: "Nashville-Davidson-Murfreesboro, TN" },
  "charlotte":       { seriesId: "LAUMT371604000000003", metro: "Charlotte-Concord-Gastonia, NC-SC" },
  "las vegas":       { seriesId: "LAUMT322900000000003", metro: "Las Vegas-Henderson-Paradise, NV" },
  "baltimore":       { seriesId: "LAUMT241265000000003", metro: "Baltimore-Columbia-Towson, MD" },
  "tampa":           { seriesId: "LAUMT124560000000003", metro: "Tampa-St. Petersburg-Clearwater, FL" },
  "orlando":         { seriesId: "LAUMT123670000000003", metro: "Orlando-Kissimmee-Sanford, FL" },
  "pittsburgh":      { seriesId: "LAUMT424200000000003", metro: "Pittsburgh, PA" },
  "cleveland":       { seriesId: "LAUMT391840000000003", metro: "Cleveland-Elyria, OH" },
  "columbus":        { seriesId: "LAUMT392180000000003", metro: "Columbus, OH" },
  "indianapolis":    { seriesId: "LAUMT182980000000003", metro: "Indianapolis-Carmel-Anderson, IN" },
  "kansas city":     { seriesId: "LAUMT292980000000003", metro: "Kansas City, MO-KS" },
  "salt lake city":  { seriesId: "LAUMT494000000000003", metro: "Salt Lake City, UT" },
  "new orleans":     { seriesId: "LAUMT223540000000003", metro: "New Orleans-Metairie, LA" },
  "raleigh":         { seriesId: "LAUMT374000000000003", metro: "Raleigh-Cary, NC" },
  "st. louis":       { seriesId: "LAUMT294120000000003", metro: "St. Louis, MO-IL" },
  "san jose":        { seriesId: "LAUMT067400000000003", metro: "San Jose-Sunnyvale, CA" },
  "jacksonville":    { seriesId: "LAUMT122600000000003", metro: "Jacksonville, FL" },
};

function normalizeCity(city: string | null): string {
  return (city ?? "").toLowerCase().trim();
}

export function getMetroForCity(city: string | null): { seriesId: string; metro: string } | null {
  const normalized = normalizeCity(city);
  if (!normalized) return null;
  if (CITY_TO_BLS_SERIES[normalized]) return CITY_TO_BLS_SERIES[normalized];
  for (const [key, val] of Object.entries(CITY_TO_BLS_SERIES)) {
    if (normalized.includes(key) || key.includes(normalized)) return val;
  }
  return null;
}

export async function fetchMetroUnemployment(city: string | null): Promise<LocalIndicator> {
  const metro = getMetroForCity(city);
  if (!metro) {
    return { value: null, period: null, metro: null, source: "Bureau of Labor Statistics" };
  }

  try {
    const url = `https://api.bls.gov/publicAPI/v1/timeseries/data/${metro.seriesId}?latest=true`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": "SimpleEconomics/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`BLS API ${res.status}`);

    const json = await res.json() as {
      Results?: {
        series?: Array<{
          data?: Array<{ value: string; periodName: string; year: string }>;
        }>;
      };
    };

    const data = json.Results?.series?.[0]?.data?.[0];
    if (!data) throw new Error("No data");

    return {
      value: data.value,
      period: `${data.periodName} ${data.year}`,
      metro: metro.metro,
      source: "Bureau of Labor Statistics",
    };
  } catch (err) {
    console.error("[local-indicators] BLS fetch error:", err);
    return { value: null, period: null, metro: metro.metro, source: "Bureau of Labor Statistics" };
  }
}
