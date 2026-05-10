const CITY_STATE_MAP: Record<string, string> = {
  providence:      "Rhode Island",
  boston:          "Massachusetts",
  "new york":      "New York",
  "new york city": "New York",
  chicago:         "Illinois",
  austin:          "Texas",
  dallas:          "Texas",
  houston:         "Texas",
  "los angeles":   "California",
  "san francisco": "California",
  seattle:         "Washington",
  miami:           "Florida",
  atlanta:         "Georgia",
  denver:          "Colorado",
  phoenix:         "Arizona",
  philadelphia:    "Pennsylvania",
  minneapolis:     "Minnesota",
  portland:        "Oregon",
  nashville:       "Tennessee",
  charlotte:       "North Carolina",
};

export function cityToStateName(city: string): string | null {
  return CITY_STATE_MAP[city.toLowerCase().trim()] ?? null;
}

interface StateInfo { state: string; blsUrl: string | null }

const CITY_BLS: Record<string, StateInfo> = {
  providence:      { state: "Rhode Island",   blsUrl: "https://www.bls.gov/regions/new-england/rhode_island.htm" },
  boston:          { state: "Massachusetts",  blsUrl: "https://www.bls.gov/regions/new-england/massachusetts.htm" },
  "new york":      { state: "New York",       blsUrl: "https://www.bls.gov/regions/new-york-new-jersey/new_york.htm" },
  "new york city": { state: "New York",       blsUrl: "https://www.bls.gov/regions/new-york-new-jersey/new_york.htm" },
  chicago:         { state: "Illinois",       blsUrl: "https://www.bls.gov/regions/midwest/illinois.htm" },
  austin:          { state: "Texas",          blsUrl: "https://www.bls.gov/regions/southwest/texas.htm" },
  dallas:          { state: "Texas",          blsUrl: "https://www.bls.gov/regions/southwest/texas.htm" },
  houston:         { state: "Texas",          blsUrl: "https://www.bls.gov/regions/southwest/texas.htm" },
  "los angeles":   { state: "California",     blsUrl: "https://www.bls.gov/regions/west/california.htm" },
  "san francisco": { state: "California",     blsUrl: "https://www.bls.gov/regions/west/california.htm" },
  seattle:         { state: "Washington",     blsUrl: "https://www.bls.gov/regions/west/washington.htm" },
  miami:           { state: "Florida",        blsUrl: "https://www.bls.gov/regions/southeast/florida.htm" },
  atlanta:         { state: "Georgia",        blsUrl: "https://www.bls.gov/regions/southeast/georgia.htm" },
  denver:          { state: "Colorado",       blsUrl: "https://www.bls.gov/regions/mountain-plains/colorado.htm" },
  phoenix:         { state: "Arizona",        blsUrl: "https://www.bls.gov/regions/west/arizona.htm" },
  philadelphia:    { state: "Pennsylvania",   blsUrl: "https://www.bls.gov/regions/mid-atlantic/pennsylvania.htm" },
  minneapolis:     { state: "Minnesota",      blsUrl: "https://www.bls.gov/regions/midwest/minnesota.htm" },
  portland:        { state: "Oregon",         blsUrl: "https://www.bls.gov/regions/west/oregon.htm" },
  nashville:       { state: "Tennessee",      blsUrl: "https://www.bls.gov/regions/southeast/tennessee.htm" },
  charlotte:       { state: "North Carolina", blsUrl: "https://www.bls.gov/regions/southeast/north_carolina.htm" },
};

export function cityToState(city: string | null): StateInfo {
  if (!city) return { state: "your state", blsUrl: null };
  return CITY_BLS[city.toLowerCase().trim()] ?? { state: city, blsUrl: null };
}
