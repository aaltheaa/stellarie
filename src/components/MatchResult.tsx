'use client'
// src/components/MatchResult.tsx

import { motion } from 'framer-motion'
import { getOverlayPositions } from '@/lib/matchConstellation'
import type { MatchResult as MatchResultType } from '@/types/constellation'
import { useConstellationStore } from '@/store/useConstellationStore'

interface Props {
  result: MatchResultType
  rank: number
  canvasSize: number
  userDots: Array<{ x: number; y: number }>
}

function scoreColor(score: number) {
  if (score >= 0.7) return '#6dcc8a'  // green
  if (score >= 0.45) return '#f0c96a' // gold
  return '#b8a9e0'                     // purple
}

function scoreLabel(score: number) {
  if (score >= 0.7) return 'Strong match'
  if (score >= 0.45) return 'Possible match'
  return 'Partial match'
}

export default function MatchResult({ result, rank, canvasSize, userDots }: Props) {
  const { constellation, score, rotation, flipped, matchedPairs } = result
  const goToId = useConstellationStore((s) => s.goToId)
  const setMatcherOpen = useConstellationStore((s) => s.setMatcherOpen)

  const overlayStars = getOverlayPositions(result, canvasSize, canvasSize)

  const color = scoreColor(score)
  const label = scoreLabel(score)
  const pct = Math.round(score * 100)

  const handleExplore = () => {
    goToId(constellation.id)
    setMatcherOpen(false)
  }

  return (
    <motion.div
      className="rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08 }}
      style={{
        background: rank === 0
          ? 'rgba(90,63,168,0.07)'
          : 'rgba(26,31,46,0.05)',
        border: rank === 0
          ? '1px solid rgba(90,63,168,0.22)'
          : '1px solid rgba(26,31,46,0.1)',
      }}
    >
      <div className="flex items-stretch gap-0">
        {/* Mini overlay SVG preview */}
        <div
          className="relative shrink-0"
          style={{
            width: canvasSize,
            height: canvasSize,
            background: 'rgba(7,11,22,0.82)',
            borderRight: '1px solid rgba(26,31,46,0.1)',
          }}
        >
          <svg
            width={canvasSize}
            height={canvasSize}
            viewBox={`0 0 ${canvasSize} ${canvasSize}`}
          >
            {/* Constellation lines (overlay, dimmed) */}
            {constellation.lines.map((line, i) => {
              const from = overlayStars[line.from]
              const to = overlayStars[line.to]
              if (!from || !to) return null
              return (
                <line
                  key={i}
                  x1={from.x} y1={from.y}
                  x2={to.x} y2={to.y}
                  stroke={`rgba(184,169,224,0.2)`}
                  strokeWidth="1"
                />
              )
            })}

            {/* User dots */}
            {userDots.map((dot, i) => {
              const matched = matchedPairs.find((p) => p.userDotIndex === i)
              return (
                <circle
                  key={`dot-${i}`}
                  cx={dot.x * canvasSize}
                  cy={dot.y * canvasSize}
                  r={matched ? 4 : 3}
                  fill={matched ? color : 'rgba(232,228,217,0.4)'}
                  stroke={matched ? color : 'rgba(232,228,217,0.2)'}
                  strokeWidth="0.5"
                />
              )
            })}

            {/* Constellation stars (matched ones highlighted) */}
            {overlayStars.map((star, i) => {
              const isMatched = matchedPairs.some((p) => p.starIndex === i)
              return (
                <circle
                  key={`star-${i}`}
                  cx={star.x}
                  cy={star.y}
                  r={isMatched ? 2.5 : 1.5}
                  fill={isMatched ? color : 'rgba(184,169,224,0.3)'}
                  opacity={isMatched ? 1 : 0.5}
                />
              )
            })}
          </svg>

          {/* Rank badge */}
          {rank === 0 && (
            <div
              className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono"
              style={{
                background: 'rgba(240,201,106,0.2)',
                border: '1px solid rgba(240,201,106,0.4)',
                color: 'var(--color-highlight)',
                fontSize: '9px',
              }}
            >
              #1
            </div>
          )}
        </div>

        {/* Text content */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <div
                  className="font-cinzel text-sm"
                  style={{ color: '#1a1f2e', fontSize: '14px' }}
                >
                  {constellation.name}
                </div>
                <div
                  className="font-mono text-xs"
                  style={{ color: '#5a5470', fontSize: '11px' }}
                >
                  {constellation.abbreviation}
                  {rotation !== 0 ? ` · ${rotation}° rotated` : ''}
                  {flipped ? ' · mirrored' : ''}
                </div>
              </div>

              {/* Score badge */}
              <div className="text-right shrink-0">
                <div
                  className="font-mono text-lg font-bold leading-none"
                  style={{ color }}
                >
                  {pct}%
                </div>
                <div
                  className="font-mono text-xs"
                  style={{ color, opacity: 0.7, fontSize: '9px' }}
                >
                  {label}
                </div>
              </div>
            </div>

            {/* Score bar */}
            <div
              className="w-full h-0.5 rounded-full overflow-hidden mt-2"
              style={{ background: 'rgba(26,31,46,0.1)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div
              className="text-xs"
              style={{ color: '#5a5470', fontSize: '11px', fontFamily: 'Space Mono, monospace' }}
            >
              {matchedPairs.length}/{constellation.stars.length} stars matched
            </div>

            <button
              onClick={handleExplore}
              className="text-xs font-mono px-2 py-1 rounded transition-all duration-150"
              style={{
                background: 'rgba(90,63,168,0.1)',
                border: '1px solid rgba(90,63,168,0.25)',
                color: '#5a3fa8',
                fontSize: '11px',
                letterSpacing: '0.05em',
              }}
            >
              Explore →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
