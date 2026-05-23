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
  "los angeles":     { seriesId: "LAUMT064474000000003", metro: "Los Angeles-Long Beach, CA" },
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
  "nashville":       { seriesId: "LAUMT473800000000003", metro: "Nashville-Davidson, TN" },
  "charlotte":       { seriesId: "LAUMT371604000000003", metro: "Charlotte-Concord, NC-SC" },
  "las vegas":       { seriesId: "LAUMT322900000000003", metro: "Las Vegas-Henderson, NV" },
  "baltimore":       { seriesId: "LAUMT241265000000003", metro: "Baltimore-Columbia, MD" },
  "tampa":           { seriesId: "LAUMT124560000000003", metro: "Tampa-St. Petersburg, FL" },
  "orlando":         { seriesId: "LAUMT123670000000003", metro: "Orlando-Kissimmee, FL" },
  "pittsburgh":      { seriesId: "LAUMT424200000000003", metro: "Pittsburgh, PA" },
  "cleveland":       { seriesId: "LAUMT391840000000003", metro: "Cleveland-Elyria, OH" },
  "columbus":        { seriesId: "LAUMT392180000000003", metro: "Columbus, OH" },
  "indianapolis":    { seriesId: "LAUMT182980000000003", metro: "Indianapolis-Carmel, IN" },
  "kansas city":     { seriesId: "LAUMT292980000000003", metro: "Kansas City, MO-KS" },
  "salt lake city":  { seriesId: "LAUMT494100000000003", metro: "Salt Lake City, UT" },
  "new orleans":     { seriesId: "LAUMT223540000000003", metro: "New Orleans-Metairie, LA" },
  "raleigh":         { seriesId: "LAUMT374400000000003", metro: "Raleigh-Cary, NC" },
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
      status?: string;
      Results?: {
        series?: Array<{
          data?: Array<{ value: string; periodName: string; year: string }>;
        }>;
      };
    };

    // BLS returns status "REQUEST_NOT_PROCESSED" for bad series IDs
    if (json.status === "REQUEST_NOT_PROCESSED") throw new Error("Bad series ID");

    const data = json.Results?.series?.[0]?.data?.[0];
    if (!data) throw new Error("No data");

    return {
      value: parseFloat(data.value).toFixed(1),
      period: `${data.periodName} ${data.year}`,
      metro: metro.metro,
      source: "Bureau of Labor Statistics",
    };
  } catch (err) {
    console.error("[local-indicators] BLS fetch error:", err);
    return { value: null, period: null, metro: metro.metro, source: "Bureau of Labor Statistics" };
  }
}
// ── HUD Fair Market Rents ────────────────────────────────────────────────────

export interface RentIndicator {
  rent_0br: number | null;
  rent_1br: number | null;
  rent_2br: number | null;
  areaname: string | null;
  year: string | null;
}

// Maps cities to HUD entity IDs (CBSA codes)
const CITY_TO_HUD_ENTITY: Record<string, string> = {
  "providence":    "METRO39300N39300",
  "boston":        "METRO14460M14460",
  "new york":      "METRO35620M35620",
  "los angeles":   "METRO31080M31080",
  "chicago":       "METRO16980M16980",
  "houston":       "METRO26420M26420",
  "phoenix":       "METRO38060M38060",
  "philadelphia":  "METRO37980M37980",
  "dallas":        "METRO19100M19100",
  "san antonio":   "METRO41700M41700",
  "san diego":     "METRO41740M41740",
  "san francisco": "METRO41860M41860",
  "seattle":       "METRO42660M42660",
  "denver":        "METRO19740M19740",
  "atlanta":       "METRO12060M12060",
  "miami":         "METRO33100M33100",
  "minneapolis":   "METRO33460M33460",
  "portland":      "METRO38900M38900",
  "detroit":       "METRO19820M19820",
  "austin":        "METRO12420M12420",
  "nashville":     "METRO34980M34980",
  "charlotte":     "METRO16740M16740",
  "las vegas":     "METRO29820M29820",
  "baltimore":     "METRO12580M12580",
  "tampa":         "METRO45300M45300",
  "orlando":       "METRO36740M36740",
  "pittsburgh":    "METRO38300M38300",
  "cleveland":     "METRO17460M17460",
  "columbus":      "METRO18140M18140",
  "indianapolis":  "METRO26900M26900",
  "kansas city":   "METRO28140M28140",
  "salt lake city":"METRO41620M41620",
  "new orleans":   "METRO35380M35380",
  "raleigh":       "METRO39580M39580",
  "st. louis":     "METRO41180M41180",
  "san jose":      "METRO41940M41940",
  "jacksonville":  "METRO27260M27260",
};

export async function fetchFairMarketRent(city: string | null): Promise<RentIndicator> {
  const apiKey = process.env.HUD_API_KEY;
  const empty: RentIndicator = { rent_0br: null, rent_1br: null, rent_2br: null, areaname: null, year: null };

  if (!apiKey) {
    console.error("[local-indicators] HUD_API_KEY not set");
    return empty;
  }

  const normalized = (city ?? "").toLowerCase().trim();
  if (!normalized) return empty;

  let entityId = CITY_TO_HUD_ENTITY[normalized];
  if (!entityId) {
    for (const [key, val] of Object.entries(CITY_TO_HUD_ENTITY)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        entityId = val;
        break;
      }
    }
  }
  if (!entityId) return empty;

  try {
    const url = `https://www.huduser.gov/hudapi/public/fmr/listMetroAreas/${entityId}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "User-Agent": "SimpleEconomics/1.0",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`HUD API ${res.status}`);

    const json = await res.json() as {
      data?: {
        basicdata?: {
          Efficiency: number;
          One_Bedroom: number;
          Two_Bedroom: number;
          areaname: string;
          year: string;
        };
      };
    };

    const d = json.data?.basicdata;
    if (!d) throw new Error("No data");

    return {
      rent_0br: d.Efficiency,
      rent_1br: d.One_Bedroom,
      rent_2br: d.Two_Bedroom,
      areaname: d.areaname,
      year: d.year,
    };
  } catch (err) {
    console.error("[local-indicators] HUD fetch error:", err);
    return empty;
  }
}
