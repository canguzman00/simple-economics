// google-trends-api ships no type declarations (unofficial package, see
// src/lib/trends-fetcher.ts for the tradeoff note). Typed loosely — every
// call site already parses the raw JSON string defensively and wraps
// failures, so a wider surface here wouldn't buy real safety.
declare module "google-trends-api" {
  interface RelatedQueriesOptions {
    keyword: string;
    geo?: string;
    startTime?: Date;
    endTime?: Date;
  }

  interface GoogleTrendsApi {
    relatedQueries(options: RelatedQueriesOptions): Promise<string>;
  }

  const googleTrends: GoogleTrendsApi;

  export default googleTrends;
}
