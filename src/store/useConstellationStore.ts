// src/store/useConstellationStore.ts
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { CONSTELLATIONS, CONSTELLATION_MAP } from '@/data/constellations'
import { matchConstellations } from '@/lib/matchConstellation'
import type {
  ConstellationStore,
  SortKey,
  HemisphereFilter,
  MatchResult,
} from '@/types/constellation'

// ── Sort helpers ──────────────────────────────────────────────────────────────

function sortAndFilter(
  sortKey: SortKey,
  hemisphereFilter: HemisphereFilter
): string[] {
  let list = [...CONSTELLATIONS]

  // Filter
  if (hemisphereFilter !== 'all') {
    list = list.filter(
      (c) => c.hemisphere === hemisphereFilter || c.hemisphere === 'both'
    )
  }

  // Sort
  switch (sortKey) {
    case 'alpha-asc':
      list.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'alpha-desc':
      list.sort((a, b) => b.name.localeCompare(a.name))
      break
    case 'month':
      list.sort((a, b) => a.bestMonth - b.bestMonth)
      break
    case 'hemisphere-north':
      list.sort((a, b) => {
        const score = (h: string) => (h === 'north' ? 0 : h === 'both' ? 1 : 2)
        return score(a.hemisphere) - score(b.hemisphere)
      })
      break
    case 'hemisphere-south':
      list.sort((a, b) => {
        const score = (h: string) => (h === 'south' ? 0 : h === 'both' ? 1 : 2)
        return score(a.hemisphere) - score(b.hemisphere)
      })
      break
    case 'zodiac-first':
      list.sort((a, b) => {
        if (a.isZodiac && !b.isZodiac) return -1
        if (!a.isZodiac && b.isZodiac) return 1
        return a.name.localeCompare(b.name)
      })
      break
    case 'area-desc':
      list.sort((a, b) => (b.area ?? 0) - (a.area ?? 0))
      break
    default:
      list.sort((a, b) => a.name.localeCompare(b.name))
  }

  return list.map((c) => c.id)
}

// ── Store ─────────────────────────────────────────────────────────────────────

const initialSortKey: SortKey = 'alpha-asc'
const initialFilter: HemisphereFilter = 'all'
const initialIds = sortAndFilter(initialSortKey, initialFilter)

export const useConstellationStore = create<ConstellationStore>((set, get) => ({
  // Browser state
  currentIndex: 0,
  sortKey: initialSortKey,
  hemisphereFilter: initialFilter,
  sortedIds: initialIds,

  // StarMatcher state
  matcherOpen: false,
  userDots: [],
  matchResults: [],
  isMatching: false,
  aiAnalysis: null,
  isAnalyzing: false,

  // ── Actions ────────────────────────────────────────────────────────────────

  setCurrentIndex: (index) => set({ currentIndex: index }),

  goNext: () => {
    const { currentIndex, sortedIds } = get()
    set({ currentIndex: (currentIndex + 1) % sortedIds.length })
  },

  goPrev: () => {
    const { currentIndex, sortedIds } = get()
    set({ currentIndex: (currentIndex - 1 + sortedIds.length) % sortedIds.length })
  },

  goToId: (id) => {
    const { sortedIds } = get()
    const index = sortedIds.indexOf(id)
    if (index !== -1) set({ currentIndex: index })
  },

  setSortKey: (key) => {
    const { hemisphereFilter, currentIndex, sortedIds } = get()
    const currentId = sortedIds[currentIndex]
    const newIds = sortAndFilter(key, hemisphereFilter)
    const newIndex = Math.max(0, newIds.indexOf(currentId))
    set({ sortKey: key, sortedIds: newIds, currentIndex: newIndex })
  },

  setHemisphereFilter: (filter) => {
    const { sortKey, currentIndex, sortedIds } = get()
    const currentId = sortedIds[currentIndex]
    const newIds = sortAndFilter(sortKey, filter)
    const newIndex = Math.max(0, newIds.indexOf(currentId))
    set({ hemisphereFilter: filter, sortedIds: newIds, currentIndex: newIndex })
  },

  setMatcherOpen: (open) => set({ matcherOpen: open }),

  addDot: (x, y) => {
    const { userDots } = get()
    if (userDots.length >= 20) return // cap at 20 dots
    set({ userDots: [...userDots, { x, y }], matchResults: [], aiAnalysis: null })
  },

  removeDot: (index) => {
    const { userDots } = get()
    set({
      userDots: userDots.filter((_, i) => i !== index),
      matchResults: [],
      aiAnalysis: null,
    })
  },

  clearDots: () => set({ userDots: [], matchResults: [], aiAnalysis: null }),

  runMatch: () => {
    const { userDots } = get()
    if (userDots.length < 2) return

    set({ isMatching: true })

    // matchConstellations is synchronous but we defer to next tick for UI responsiveness
    setTimeout(() => {
      const results = matchConstellations(userDots, { topN: 5, allowFlip: true })
      set({ matchResults: results, isMatching: false })
    }, 0)
  },

  runAiAnalysis: async () => {
    const { userDots, matchResults } = get()
    if (userDots.length < 2) return

    set({ isAnalyzing: true, aiAnalysis: null })

    try {
      const topMatches = matchResults.slice(0, 3).map((r) => ({
        name: r.constellation.name,
        abbreviation: r.constellation.abbreviation,
        score: r.score,
        rotation: r.rotation,
        flipped: r.flipped,
      }))

      const prompt = `You are an expert astronomer helping a user identify a constellation from a dot pattern they placed on a canvas.

User's dot positions (normalized 0–1 coordinates, origin top-left):
${userDots.map((d, i) => `  Dot ${i + 1}: (${d.x.toFixed(3)}, ${d.y.toFixed(3)})`).join('\n')}

Geometric pattern-matching algorithm's top results:
${topMatches.map((m, i) => `  ${i + 1}. ${m.name} (${m.abbreviation}) — score ${(m.score * 100).toFixed(0)}%, rotation ${m.rotation}°${m.flipped ? ', mirrored' : ''}`).join('\n')}

Please provide:
1. Your assessment of which constellation this most likely represents and why
2. Which specific stars the dots might correspond to
3. One interesting fact about that constellation
4. A brief note on how the viewing angle or hemisphere might explain any rotation/mirroring

Keep the response under 200 words. Write in an engaging, knowledgeable tone.`

      const response = await fetch('/api/claude-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) throw new Error('API request failed')

      const data = await response.json()
      set({ aiAnalysis: data.analysis, isAnalyzing: false })
    } catch (err) {
      console.error('AI analysis failed:', err)
      set({
        aiAnalysis: 'Analysis unavailable. Please check your connection and try again.',
        isAnalyzing: false,
      })
    }
  },
}))

// ── Derived selectors ─────────────────────────────────────────────────────────

export function useCurrentConstellation() {
  return useConstellationStore((s) => {
    const id = s.sortedIds[s.currentIndex]
    return id ? CONSTELLATION_MAP.get(id) ?? null : null
  })
}

export function useSortedConstellations() {
  return useConstellationStore(
    useShallow((s) =>
      s.sortedIds
        .map((id) => CONSTELLATION_MAP.get(id))
        .filter(Boolean)
    )
  )
}
