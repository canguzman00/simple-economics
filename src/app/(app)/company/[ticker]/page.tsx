'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface CompanyData {
  ticker: string
  quote: {
    name: string
    price: number
    change: number
    changePct: number
    marketCap: number
    exchange: string
    fiftyTwoWeekLow: number
    fiftyTwoWeekHigh: number
  }
  profile: {
    sector: string
    industry: string
    employees: number
    executives: Array<{ name: string; title: string }>
  }
  financials: {
    peRatio: number
    pegRatio: number
    revenueGrowth: number
    profitMargins: number
    totalCash: number
    totalDebt: number
    freeCashflow: number
    returnOnEquity: number
    dividendYield: number
  }
}

interface Analysis {
  plainEnglishSummary: string
  businessModel: { howItMakesMoney: string; competitiveMoat: string }
  financialHealthInsights: { revenueGrowth: string; margins: string; cashPosition: string; freeCashflow: string }
  valuation: { verdict: string; explanation: string }
  flagIssues: Array<{ title: string; severity: string; description: string }>
  yourAngle: string
  revenueBreakdown: Array<{ segment: string; amount: string; pct: number }>
}

interface SearchResult { symbol: string; name: string; exchange: string }

function fmt(n: number): string {
  if (!n) return 'N/A'
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(1) + 'T'
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M'
  return '$' + n.toFixed(0)
}

function pct(n: number): string {
  if (n == null) return 'N/A'
  return (n * 100).toFixed(1) + '%'
}

function initials(name: string): string {
  return name.split(' ').map(function(w) { return w[0] }).join('').slice(0, 2).toUpperCase()
}

function healthStatus(type: string, financials: CompanyData['financials']): string {
  if (type === 'growth') return financials.revenueGrowth > 0.05 ? 'Healthy' : financials.revenueGrowth > 0 ? 'Watch' : 'Concern'
  if (type === 'margins') return financials.profitMargins > 0.15 ? 'Healthy' : financials.profitMargins > 0.05 ? 'Watch' : 'Concern'
  if (type === 'cash') return financials.totalCash > financials.totalDebt ? 'Healthy' : financials.totalCash > financials.totalDebt * 0.5 ? 'Watch' : 'Concern'
  if (type === 'fcf') return financials.freeCashflow > 0 ? 'Healthy' : 'Concern'
  return 'Watch'
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Healthy: 'bg-green-50 text-green-900 border border-green-700',
    Watch: 'bg-yellow-50 text-yellow-900 border border-yellow-700',
    Concern: 'bg-red-50 text-red-900 border border-red-700',
  }
  return (
    <span className={`inline-block text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 mb-2 ${styles[status] || styles.Watch}`}>
      {status}
    </span>
  )
}

export default function CompanyPage() {
  const params = useParams()
  const router = useRouter()
  const ticker = (params.ticker as string).toUpperCase()

  const [searchInput, setSearchInput] = useState(ticker)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [companyData, setCompanyData] = useState<CompanyData | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [loadingAnalysis, setLoadingAnalysis] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCompany = useCallback(async function(t: string) {
    setLoadingData(true)
    setLoadingAnalysis(true)
    setError(null)
    setCompanyData(null)
    setAnalysis(null)

    try {
      const dataRes = await fetch('/api/company/' + t)
      if (!dataRes.ok) throw new Error('Not found')
      const data = await dataRes.json()
      setCompanyData(data)
      setLoadingData(false)

      const userProfile = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('se_profile') || 'null')
        : null

      const analysisRes = await fetch('/api/company/' + t + '/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyData: data, userProfile }),
      })
      const analysisData = await analysisRes.json()
      setAnalysis(analysisData.analysis)
      setLoadingAnalysis(false)
    } catch {
      setError('Could not find data for "' + t + '". Check the ticker and try again.')
      setLoadingData(false)
      setLoadingAnalysis(false)
    }
  }, [])

  useEffect(function() { fetchCompany(ticker) }, [ticker, fetchCompany])

  useEffect(function() {
    if (!searchInput || searchInput.length < 2) { setSearchResults([]); setShowDropdown(false); return }
    const timer = setTimeout(async function() {
      try {
        const res = await fetch('/api/company/search?q=' + encodeURIComponent(searchInput))
        const data = await res.json()
        setSearchResults(data)
        setShowDropdown(data.length > 0)
      } catch {
        setShowDropdown(false)
      }
    }, 300)
    return function() { clearTimeout(timer) }
  }, [searchInput])

  function handleSearch() {
    if (searchInput.trim()) {
      setShowDropdown(false)
      router.push('/company/' + searchInput.trim().toUpperCase())
    }
  }

  function selectResult(symbol: string) {
    setSearchInput(symbol)
    setShowDropdown(false)
    router.push('/company/' + symbol)
  }

  const up = companyData && companyData.quote.change >= 0

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* SEARCH */}
      <div className="bg-black border-b-2 border-black px-5 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-[10px] font-black tracking-[0.15em] uppercase text-[#F5C800] mb-2"
               style={{ fontFamily: 'Unbounded, sans-serif' }}>
            ↗ Company Intelligence
          </div>
          <div className="relative">
            <div className="flex border-2 border-white">
              <input
                type="text"
                value={searchInput}
                onChange={function(e) { setSearchInput(e.target.value) }}
                onKeyDown={function(e) { if (e.key === 'Enter') handleSearch() }}
                placeholder="AAPL or Apple Inc."
                className="flex-1 bg-black text-white px-4 py-3 text-xl font-bold tracking-wide outline-none border-none"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              />
              <button
                onClick={handleSearch}
                className="bg-[#E63329] hover:bg-red-700 text-white px-6 border-l-2 border-white text-[10px] font-black tracking-widest uppercase"
                style={{ fontFamily: 'Unbounded, sans-serif' }}>
                Analyze →
              </button>
            </div>
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 bg-white border-2 border-black border-t-0 z-50">
                {searchResults.map(function(r) {
                  return (
                    <button key={r.symbol} onClick={function() { selectResult(r.symbol) }}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 text-left">
                      <span className="font-mono font-bold text-sm text-black">{r.symbol}</span>
                      <span className="text-sm text-gray-600">{r.name}</span>
                      <span className="ml-auto text-xs text-gray-400">{r.exchange}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <div className="text-[11px] text-gray-500 mt-2">
            Search by ticker <span className="text-gray-400">(AAPL)</span> or company name <span className="text-gray-400">(Apple Inc.)</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-3xl mx-auto px-5 py-12 text-center">
          <div className="border-2 border-black p-8">
            <div className="text-[#E63329] font-bold text-lg mb-2">Not Found</div>
            <div className="text-gray-600">{error}</div>
          </div>
        </div>
      )}

      {loadingData && !error && (
        <div className="max-w-3xl mx-auto px-5 py-10 animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 w-1/3"></div>
          <div className="h-4 bg-gray-200 w-1/2"></div>
          <div className="h-32 bg-gray-200"></div>
          <div className="h-24 bg-gray-200"></div>
        </div>
      )}

      {companyData && (
        <>
          {/* COMPANY HEADER */}
          <div className="border-b-2 border-black bg-white">
            <div className="max-w-3xl mx-auto px-5 pt-6 pb-0 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="inline-block bg-black text-white px-3 py-1 text-[9px] font-bold tracking-widest uppercase mb-2"
                     style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {companyData.ticker} · {companyData.quote.exchange}
                </div>
                <div className="text-2xl font-black tracking-tight mb-2"
                     style={{ fontFamily: 'Unbounded, sans-serif' }}>
                  {companyData.quote.name}
                </div>
                <div className="flex gap-4 flex-wrap">
                  {[
                    { l: 'Sector', v: companyData.profile.sector },
                    { l: 'Industry', v: companyData.profile.industry },
                    { l: 'Market Cap', v: fmt(companyData.quote.marketCap) },
                  ].map(function(item) {
                    return (
                      <span key={item.l} className="text-[11px] text-gray-500 uppercase tracking-wide">
                        <strong className="text-black">{item.l}</strong> {item.v || 'N/A'}
                      </span>
                    )
                  })}
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="text-3xl font-semibold tracking-tight mb-1"
                     style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  ${companyData.quote.price?.toFixed(2)}
                </div>
                <span className={`inline-block px-2 py-0.5 text-[11px] font-bold border ${up ? 'bg-green-50 text-green-900 border-green-700' : 'bg-red-50 text-red-900 border-red-700'}`}
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {up ? '▲' : '▼'} {Math.abs(companyData.quote.change || 0).toFixed(2)} ({Math.abs(companyData.quote.changePct || 0).toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* STAT STRIP */}
            <div className="max-w-3xl mx-auto mt-4 grid grid-cols-3 md:grid-cols-6 border-t-2 border-l-2 border-black">
              {[
                { l: 'P/E Ratio', v: companyData.financials.peRatio ? companyData.financials.peRatio.toFixed(1) + '×' : 'N/A' },
                { l: 'Net Margin', v: pct(companyData.financials.profitMargins) },
                { l: 'Free Cash Flow', v: fmt(companyData.financials.freeCashflow) },
                { l: 'Total Cash', v: fmt(companyData.financials.totalCash) },
                { l: 'Dividend', v: companyData.financials.dividendYield ? pct(companyData.financials.dividendYield) : 'None' },
                { l: '52-Wk Range', v: '$' + companyData.quote.fiftyTwoWeekLow?.toFixed(0) + '–$' + companyData.quote.fiftyTwoWeekHigh?.toFixed(0) },
              ].map(function(item) {
                return (
                  <div key={item.l} className="border-r-2 border-b-2 border-black p-2.5">
                    <div className="text-[8px] font-bold uppercase tracking-widest text-gray-500 mb-1">{item.l}</div>
                    <div className="text-[13px] font-semibold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{item.v}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="max-w-3xl mx-auto px-5 pb-16">

            {/* PLAIN ENGLISH */}
            <div className="bg-[#F5C800] border-2 border-black border-t-0 p-5">
              <div className="text-[8px] font-black tracking-[0.15em] uppercase mb-2 flex items-center gap-2"
                   style={{ fontFamily: 'Unbounded, sans-serif' }}>
                <span className="inline-block w-2 h-2 bg-black"></span>Plain English Summary
              </div>
              {loadingAnalysis
                ? <div className="space-y-2 animate-pulse"><div className="h-4 bg-yellow-300 rounded w-full"></div><div className="h-4 bg-yellow-300 rounded w-5/6"></div><div className="h-4 bg-yellow-300 rounded w-4/5"></div></div>
                : <div className="text-[15px] font-medium leading-relaxed">{analysis?.plainEnglishSummary}</div>
              }
            </div>

            {/* YOUR ANGLE */}
            {!loadingAnalysis && analysis?.yourAngle && (
              <div className="flex items-start gap-3 bg-[#1B4FD8] text-white border-2 border-black border-t-0 p-4">
                <div className="w-6 h-6 bg-white text-[#1B4FD8] rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">👤</div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest opacity-70 mb-1">Your Angle</div>
                  <div className="text-[13px] leading-relaxed">{analysis.yourAngle}</div>
                </div>
              </div>
            )}

            {/* BUSINESS MODEL */}
            <div className="flex items-center border-t-2 border-l-2 border-r-2 border-black mt-6">
              <div className="px-4 py-2 text-[9px] font-black tracking-[0.15em] uppercase flex-1"
                   style={{ fontFamily: 'Unbounded, sans-serif' }}>Business Model & Moat</div>
              <div className="px-3 py-2 border-l-2 border-black text-[8px] tracking-wider text-gray-500 uppercase"
                   style={{ fontFamily: 'JetBrains Mono, monospace' }}>AI · FACT / MY TAKE</div>
            </div>
            <div className="border-2 border-black border-t-0">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-4 md:border-r-2 border-b-2 md:border-b-0 border-black">
                  <div className="text-[8px] font-bold uppercase tracking-widest text-gray-500 mb-2">How It Makes Money</div>
                  <div className="text-[13px] leading-relaxed text-gray-800">
                    {loadingAnalysis
                      ? <div className="animate-pulse space-y-2"><div className="h-3 bg-gray-200 rounded w-full"></div><div className="h-3 bg-gray-200 rounded w-5/6"></div></div>
                      : analysis?.businessModel.howItMakesMoney}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-[8px] font-bold uppercase tracking-widest text-gray-500 mb-2">Competitive Moat</div>
                  <div className="text-[13px] leading-relaxed text-gray-800">
                    {loadingAnalysis
                      ? <div className="animate-pulse space-y-2"><div className="h-3 bg-gray-200 rounded w-full"></div><div className="h-3 bg-gray-200 rounded w-4/5"></div></div>
                      : analysis?.businessModel.competitiveMoat}
                  </div>
                </div>
              </div>
              {analysis?.revenueBreakdown && analysis.revenueBreakdown.length > 0 && (
                <div className="border-t-2 border-black p-4">
                  <div className="text-[8px] font-bold uppercase tracking-widest text-gray-500 mb-3">Revenue Breakdown</div>
                  {analysis.revenueBreakdown.map(function(seg) {
                    return (
                      <div key={seg.segment} className="flex items-center gap-3 mb-2.5 last:mb-0">
                        <div className="text-[11px] font-semibold w-24 flex-shrink-0">{seg.segment}</div>
                        <div className="flex-1 h-2 bg-gray-100 border border-gray-200">
                          <div className="h-full bg-[#1B4FD8]" style={{ width: seg.pct + '%' }}></div>
                        </div>
                        <div className="text-[11px] font-semibold w-12 text-right flex-shrink-0"
                             style={{ fontFamily: 'JetBrains Mono, monospace' }}>{seg.amount}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* FINANCIAL HEALTH */}
            <div className="flex items-center border-t-2 border-l-2 border-r-2 border-black mt-6">
              <div className="px-4 py-2 text-[9px] font-black tracking-[0.15em] uppercase flex-1"
                   style={{ fontFamily: 'Unbounded, sans-serif' }}>Financial Health</div>
              <div className="px-3 py-2 border-l-2 border-black text-[8px] tracking-wider text-gray-500 uppercase"
                   style={{ fontFamily: 'JetBrains Mono, monospace' }}>Yahoo Finance · Live</div>
            </div>
            <div className="border-2 border-black border-t-0 grid grid-cols-2">
              {loadingAnalysis
                ? Array.from({ length: 4 }).map(function(_, i) {
                    return (
                      <div key={i} className="p-4 border-r-2 border-b-2 border-black animate-pulse">
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                      </div>
                    )
                  })
                : [
                    { l: 'Revenue Growth', t: 'growth', v: pct(companyData.financials.revenueGrowth), note: analysis?.financialHealthInsights.revenueGrowth },
                    { l: 'Profit Margin', t: 'margins', v: pct(companyData.financials.profitMargins), note: analysis?.financialHealthInsights.margins },
                    { l: 'Cash Position', t: 'cash', v: fmt(companyData.financials.totalCash), note: analysis?.financialHealthInsights.cashPosition },
                    { l: 'Free Cash Flow', t: 'fcf', v: fmt(companyData.financials.freeCashflow), note: analysis?.financialHealthInsights.freeCashflow },
                  ].map(function(item, i) {
                    const status = healthStatus(item.t, companyData.financials)
                    return (
                      <div key={item.l} className={`p-4 border-b-2 border-black ${i % 2 === 0 ? 'border-r-2' : ''} ${i >= 2 ? 'border-b-0' : ''}`}>
                        <div className="text-[8px] font-bold uppercase tracking-widest text-gray-500 mb-1">{item.l}</div>
                        <div className="text-lg font-semibold mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{item.v}</div>
                        <StatusBadge status={status} />
                        <div className="text-[12px] text-gray-600 leading-relaxed">{item.note}</div>
                      </div>
                    )
                  })
              }
            </div>

            {/* VALUATION */}
            <div className="flex items-center border-t-2 border-l-2 border-r-2 border-black mt-6">
              <div className="px-4 py-2 text-[9px] font-black tracking-[0.15em] uppercase flex-1"
                   style={{ fontFamily: 'Unbounded, sans-serif' }}>Valuation</div>
              <div className="px-3 py-2 border-l-2 border-black text-[8px] tracking-wider text-gray-500 uppercase"
                   style={{ fontFamily: 'JetBrains Mono, monospace' }}>AI Analysis</div>
            </div>
            <div className="border-2 border-black border-t-0 p-5">
              {loadingAnalysis
                ? <div className="animate-pulse space-y-3"><div className="h-4 bg-gray-200 rounded w-1/4"></div><div className="h-3 bg-gray-200 rounded w-full"></div></div>
                : analysis && (
                  <>
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border-2 border-black ${analysis.valuation.verdict === 'undervalued' ? 'bg-green-200' : analysis.valuation.verdict === 'overvalued' ? 'bg-[#E63329] text-white' : 'bg-[#F5C800]'}`}
                            style={{ fontFamily: 'Unbounded, sans-serif' }}>
                        {analysis.valuation.verdict}
                      </span>
                      <span className="text-[11px] text-gray-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        P/E: {companyData.financials.peRatio?.toFixed(1)}× · PEG: {companyData.financials.pegRatio?.toFixed(2)}
                      </span>
                    </div>
                    <div className="relative h-2.5 border-2 border-black mb-1.5"
                         style={{ background: 'linear-gradient(to right, #bbf7d0, #fef9c3, #fecaca)' }}>
                      <div className="absolute top-[-4px] w-0.5 h-5 bg-black"
                           style={{ left: analysis.valuation.verdict === 'undervalued' ? '20%' : analysis.valuation.verdict === 'overvalued' ? '75%' : '50%', transform: 'translateX(-50%)' }}></div>
                    </div>
                    <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider text-gray-400 mb-4">
                      <span>Undervalued</span><span>Fair Value</span><span>Overvalued</span>
                    </div>
                    <div className="text-[13px] leading-relaxed text-gray-800">{analysis.valuation.explanation}</div>
                  </>
                )
              }
            </div>

            {/* LEADERSHIP + FLAGS */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-2 border-black mt-6">
              <div className="md:border-r-2 border-b-2 md:border-b-0 border-black">
                <div className="px-4 py-2.5 border-b-2 border-black bg-black">
                  <span className="text-[9px] font-black tracking-[0.15em] uppercase text-white"
                        style={{ fontFamily: 'Unbounded, sans-serif' }}>Leadership</span>
                </div>
                {companyData.profile.executives?.map(function(exec) {
                  return (
                    <div key={exec.name} className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 last:border-b-0">
                      <div className="w-8 h-8 bg-gray-100 border-2 border-black flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                           style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {initials(exec.name)}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold">{exec.name}</div>
                        <div className="text-[11px] text-gray-500">{exec.title}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div>
                <div className="px-4 py-2.5 border-b-2 border-black bg-[#E63329]">
                  <span className="text-[9px] font-black tracking-[0.15em] uppercase text-white"
                        style={{ fontFamily: 'Unbounded, sans-serif' }}>⚑ Flag Issues</span>
                </div>
                {loadingAnalysis
                  ? <div className="p-5 animate-pulse space-y-3"><div className="h-4 bg-gray-200 rounded w-3/4"></div><div className="h-3 bg-gray-200 rounded w-full"></div></div>
                  : analysis?.flagIssues.map(function(flag) {
                      return (
                        <div key={flag.title} className="flex gap-3 p-4 border-b border-gray-200 last:border-b-0">
                          <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center text-sm border-2 border-black ${flag.severity === 'high' ? 'bg-red-100' : 'bg-yellow-50'}`}>
                            {flag.severity === 'high' ? '⚠' : '⚑'}
                          </div>
                          <div>
                            <div className="text-[13px] font-semibold mb-1">{flag.title}</div>
                            <div className="text-[12px] text-gray-600 leading-relaxed">{flag.description}</div>
                          </div>
                        </div>
                      )
                    })
                }
              </div>
            </div>

            {/* DISCLAIMER */}
            <div className="bg-gray-100 border-2 border-black p-4 mt-8 flex gap-3 text-[12px] text-gray-600">
              <span className="text-base flex-shrink-0">ⓘ</span>
              <div><strong>Educational analysis only — not investment advice.</strong> Generated from live financial data. Always consult a licensed financial advisor before making investment decisions.</div>
            </div>

          </div>
        </>
      )}
    </div>
  )
}
