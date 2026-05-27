// src/types/constellation.ts

export interface Star {
  name: string
  x: number        // normalized 0–1 (left→right within bounding box)
  y: number        // normalized 0–1 (top→bottom, SVG convention)
  magnitude?: number  // apparent magnitude; lower = brighter; optional for data completeness
  isNamed?: boolean   // whether to show label in UI
}

export interface ConstellationLine {
  from: number     // index into the stars[] array
  to: number       // index into the stars[] array
}

export type Hemisphere = 'north' | 'south' | 'both'

export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'year-round'

export type Family =
  | 'ursa-major'
  | 'perseus'
  | 'orion'
  | 'heavenly-waters'
  | 'hercules'
  | 'zodiac'
  | 'bayer'           // Johann Bayer's 1603 Uranometria additions
  | 'lacaille'        // Nicolas Louis de Lacaille's 14 southern additions
  | 'ptolemy'         // Ptolemy's original 48

export interface Constellation {
  id: string                  // URL-safe slug, e.g. "orion", "ursa-major"
  name: string                // Display name, e.g. "Orion"
  abbreviation: string        // IAU 3-letter code, e.g. "Ori"
  hemisphere: Hemisphere
  season: Season              // Best visibility season (Northern Hemisphere reference)
  bestMonth: number           // 1–12, month of peak evening visibility
  area?: number               // Area in square degrees (IAU official)
  mythology: string           // 1–3 sentence lore/context blurb
  stars: Star[]               // Key stars defining the stick figure shape
  lines: ConstellationLine[]  // Which stars to connect with lines
  isZodiac?: boolean
  family?: Family
  tags?: string[]             // e.g. ['prominent', 'circumpolar', 'southern-cross']
}

// ── Matching Types ────────────────────────────────────────────────────────────

export interface NormalizedPoint {
  x: number    // centered and scaled; centroid = (0,0), max distance = 1
  y: number
}

export interface MatchResult {
  constellation: Constellation
  score: number          // 0–1, higher = better match
  rotation: number       // degrees of rotation applied for best fit
  flipped: boolean       // whether horizontal flip was applied
  matchedPairs: Array<{
    userDotIndex: number
    starIndex: number
    distance: number
  }>
}

// ── Store Types ───────────────────────────────────────────────────────────────

export type SortKey =
  | 'alpha-asc'
  | 'alpha-desc'
  | 'month'
  | 'hemisphere-north'
  | 'hemisphere-south'
  | 'zodiac-first'
  | 'area-desc'

export type HemisphereFilter = 'all' | 'north' | 'south'

export interface ConstellationStore {
  // Browser state
  currentIndex: number
  sortKey: SortKey
  hemisphereFilter: HemisphereFilter
  sortedIds: string[]

  // StarMatcher state
  matcherOpen: boolean
  userDots: Array<{ x: number; y: number }>
  matchResults: MatchResult[]
  isMatching: boolean
  aiAnalysis: string | null
  isAnalyzing: boolean

  // Actions
  setCurrentIndex: (index: number) => void
  goNext: () => void
  goPrev: () => void
  goToId: (id: string) => void
  setSortKey: (key: SortKey) => void
  setHemisphereFilter: (filter: HemisphereFilter) => void

  setMatcherOpen: (open: boolean) => void
  addDot: (x: number, y: number) => void
  removeDot: (index: number) => void
  clearDots: () => void
  runMatch: () => void
  runAiAnalysis: () => Promise<void>
}
