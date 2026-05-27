// src/lib/matchConstellation.ts
// Geometric pattern-matching algorithm for StarMatcher.
//
// Algorithm overview:
// 1. Normalize user dot positions: translate to centroid, scale by RMS distance
// 2. For each constellation, do the same with its star positions
// 3. Try 24 rotations (every 15°) + horizontal flip for each
// 4. For each rotation/flip: greedy nearest-neighbor matching (user dots → stars)
// 5. Score = 1 / (1 + weighted avg distance); penalize point-count mismatch
// 6. Return top N matches sorted by score

import type { Constellation, MatchResult, NormalizedPoint } from '../types/constellation'
import { CONSTELLATIONS } from '../data/constellations'

// ── Constants ─────────────────────────────────────────────────────────────────

const ROTATION_STEPS = 24           // Try every 15° (360 / 24)
const MIN_DOTS = 3                  // Minimum dots to trigger matching
const TOP_N = 5                     // How many matches to return
const POINT_COUNT_PENALTY = 0.15    // Score penalty per extra unmatched star

// ── Normalization ─────────────────────────────────────────────────────────────

/**
 * Normalize a set of points:
 * - Translate so centroid is at (0, 0)
 * - Scale so RMS distance from centroid = 1
 */
export function normalizePoints(points: Array<{ x: number; y: number }>): NormalizedPoint[] {
  if (points.length === 0) return []

  // Compute centroid
  const cx = points.reduce((s, p) => s + p.x, 0) / points.length
  const cy = points.reduce((s, p) => s + p.y, 0) / points.length

  // Translate
  const translated = points.map(p => ({ x: p.x - cx, y: p.y - cy }))

  // Compute RMS distance
  const rms = Math.sqrt(
    translated.reduce((s, p) => s + p.x * p.x + p.y * p.y, 0) / points.length
  )

  if (rms < 1e-9) {
    // All points collapsed to a single point — can't normalize scale
    return translated
  }

  return translated.map(p => ({ x: p.x / rms, y: p.y / rms }))
}

// ── Rotation ──────────────────────────────────────────────────────────────────

function rotatePoint(p: NormalizedPoint, angleRad: number): NormalizedPoint {
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)
  return {
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos,
  }
}

function flipHorizontal(p: NormalizedPoint): NormalizedPoint {
  return { x: -p.x, y: p.y }
}

// ── Matching ──────────────────────────────────────────────────────────────────

/**
 * Greedy nearest-neighbor matching from user dots to constellation stars.
 * Returns matched pairs and the average distance.
 */
function greedyMatch(
  userDots: NormalizedPoint[],
  stars: NormalizedPoint[]
): {
  pairs: Array<{ userDotIndex: number; starIndex: number; distance: number }>
  avgDistance: number
} {
  const used = new Set<number>()
  const pairs: Array<{ userDotIndex: number; starIndex: number; distance: number }> = []

  for (let i = 0; i < userDots.length; i++) {
    const dot = userDots[i]
    let bestDist = Infinity
    let bestStar = -1

    for (let j = 0; j < stars.length; j++) {
      if (used.has(j)) continue
      const dx = dot.x - stars[j].x
      const dy = dot.y - stars[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < bestDist) {
        bestDist = dist
        bestStar = j
      }
    }

    if (bestStar !== -1) {
      used.add(bestStar)
      pairs.push({ userDotIndex: i, starIndex: bestStar, distance: bestDist })
    }
  }

  const avgDistance = pairs.length > 0
    ? pairs.reduce((s, p) => s + p.distance, 0) / pairs.length
    : Infinity

  return { pairs, avgDistance }
}

// ── Scoring ───────────────────────────────────────────────────────────────────

/**
 * Compute a match score (0–1, higher = better) for a given rotation/flip.
 */
function scoreAlignment(
  userDots: NormalizedPoint[],
  stars: NormalizedPoint[],
  angleRad: number,
  flip: boolean
): {
  score: number
  pairs: Array<{ userDotIndex: number; starIndex: number; distance: number }>
} {
  // Apply rotation and optional flip to constellation stars
  const transformed = stars.map(s => {
    let p = rotatePoint(s, angleRad)
    if (flip) p = flipHorizontal(p)
    return p
  })

  const { pairs, avgDistance } = greedyMatch(userDots, transformed)

  // Penalize point count mismatch: if constellation has many more stars than dots
  const extraStars = Math.max(0, stars.length - userDots.length)
  const penalty = extraStars * POINT_COUNT_PENALTY

  // Score: inverse of average distance, scaled to 0–1
  const rawScore = 1 / (1 + avgDistance)
  const score = Math.max(0, rawScore - penalty * 0.1)

  return { score, pairs }
}

// ── Main Export ───────────────────────────────────────────────────────────────

/**
 * Match user-placed dots against all 88 constellations.
 * Returns the top N matches sorted by score descending.
 */
export function matchConstellations(
  userDots: Array<{ x: number; y: number }>,
  options: {
    topN?: number
    allowFlip?: boolean
    constellations?: Constellation[]
  } = {}
): MatchResult[] {
  const {
    topN = TOP_N,
    allowFlip = true,
    constellations = CONSTELLATIONS,
  } = options

  if (userDots.length < MIN_DOTS) {
    return []
  }

  const normalizedUserDots = normalizePoints(userDots)
  const results: MatchResult[] = []

  for (const constellation of constellations) {
    if (constellation.stars.length < 2) continue

    const normalizedStars = normalizePoints(constellation.stars)

    let bestScore = -Infinity
    let bestRotation = 0
    let bestFlipped = false
    let bestPairs: Array<{ userDotIndex: number; starIndex: number; distance: number }> = []

    // Try all rotations (and optionally horizontal flip)
    for (let step = 0; step < ROTATION_STEPS; step++) {
      const angleRad = (step / ROTATION_STEPS) * 2 * Math.PI

      // Non-flipped
      const { score, pairs } = scoreAlignment(normalizedUserDots, normalizedStars, angleRad, false)
      if (score > bestScore) {
        bestScore = score
        bestRotation = (step / ROTATION_STEPS) * 360
        bestFlipped = false
        bestPairs = pairs
      }

      // Flipped
      if (allowFlip) {
        const { score: flipScore, pairs: flipPairs } = scoreAlignment(
          normalizedUserDots, normalizedStars, angleRad, true
        )
        if (flipScore > bestScore) {
          bestScore = flipScore
          bestRotation = (step / ROTATION_STEPS) * 360
          bestFlipped = true
          bestPairs = flipPairs
        }
      }
    }

    results.push({
      constellation,
      score: bestScore,
      rotation: bestRotation,
      flipped: bestFlipped,
      matchedPairs: bestPairs,
    })
  }

  // Sort by score descending, return top N
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
}

// ── Utilities ─────────────────────────────────────────────────────────────────

/**
 * Given a MatchResult, return the transformed constellation star positions
 * scaled to fit within a canvas of given size, for overlay rendering.
 */
export function getOverlayPositions(
  match: MatchResult,
  canvasWidth: number,
  canvasHeight: number
): Array<{ x: number; y: number; name: string }> {
  const normalizedStars = normalizePoints(match.constellation.stars)
  const angleRad = (match.rotation / 360) * 2 * Math.PI

  // Find bounding box of transformed stars to fit to canvas
  const transformed = normalizedStars.map(s => {
    let p = rotatePoint(s, angleRad)
    if (match.flipped) p = flipHorizontal(p)
    return p
  })

  const xs = transformed.map(p => p.x)
  const ys = transformed.map(p => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1
  const scale = Math.min(canvasWidth / rangeX, canvasHeight / rangeY) * 0.8

  return transformed.map((p, i) => ({
    x: ((p.x - minX) / rangeX) * canvasWidth * 0.8 + canvasWidth * 0.1,
    y: ((p.y - minY) / rangeY) * canvasHeight * 0.8 + canvasHeight * 0.1,
    name: match.constellation.stars[i].name,
  }))
}

/**
 * Format a score as a human-readable confidence description.
 */
export function formatMatchConfidence(score: number): {
  label: string
  color: string
  percent: number
} {
  const percent = Math.round(Math.min(score * 120, 100)) // scale 0–1 score to 0–100%
  if (percent >= 75) return { label: 'Strong match',    color: '#6ee7b7', percent }
  if (percent >= 55) return { label: 'Good match',      color: '#b8a9e0', percent }
  if (percent >= 35) return { label: 'Possible match',  color: '#f0c96a', percent }
  return             { label: 'Weak match',             color: '#5a6a80', percent }
}
