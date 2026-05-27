'use client'
// src/components/ConstellationCanvas.tsx

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Constellation } from '@/types/constellation'

interface Props {
  constellation: Constellation
  size?: number
  showLabels?: boolean
  animateIn?: boolean
  className?: string
}

const PAD = 0.15 // padding fraction on each side

export default function ConstellationCanvas({
  constellation,
  size = 480,
  showLabels = true,
  animateIn = true,
  className = '',
}: Props) {
  const [linesDrawn, setLinesDrawn] = useState(!animateIn)
  const [starsVisible, setStarsVisible] = useState(!animateIn)
  const [key, setKey] = useState(0)

  useEffect(() => {
    if (!animateIn) return
    setLinesDrawn(false)
    setStarsVisible(false)
    setKey((k) => k + 1)

    const t1 = setTimeout(() => setStarsVisible(true), 100)
    const t2 = setTimeout(() => setLinesDrawn(true), 400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [constellation.id, animateIn])

  // Map normalized 0–1 coords to SVG space with padding
  const toSVG = (x: number, y: number) => ({
    cx: PAD * size + x * (size * (1 - 2 * PAD)),
    cy: PAD * size + y * (size * (1 - 2 * PAD)),
  })

  const { stars, lines } = constellation

  // Compute star radii based on magnitude (brighter = bigger)
  const starRadius = (mag?: number) => {
    if (mag === undefined) return 3
    if (mag <= 1) return 5.5
    if (mag <= 2) return 4.5
    if (mag <= 3) return 3.5
    if (mag <= 4) return 2.8
    return 2.2
  }

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Background glow */}
      <div
        className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, rgba(184, 169, 224, 0.15) 0%, transparent 70%)`,
        }}
      />

      <svg
        key={key}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`Star map of ${constellation.name}`}
      >
        <defs>
          {/* Glow filter for named stars */}
          <filter id={`star-glow-${constellation.id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Soft glow for lines */}
          <filter id={`line-glow-${constellation.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Constellation lines */}
        {lines.map((line, i) => {
          const from = stars[line.from]
          const to = stars[line.to]
          if (!from || !to) return null
          const p1 = toSVG(from.x, from.y)
          const p2 = toSVG(to.x, to.y)

          // Compute path length for stroke-dasharray animation
          const dx = p2.cx - p1.cx
          const dy = p2.cy - p1.cy
          const len = Math.sqrt(dx * dx + dy * dy)

          return (
            <line
              key={`line-${i}`}
              x1={p1.cx}
              y1={p1.cy}
              x2={p2.cx}
              y2={p2.cy}
              stroke="rgba(184, 169, 224, 0.4)"
              strokeWidth="1.5"
              strokeLinecap="round"
              filter={`url(#line-glow-${constellation.id})`}
              strokeDasharray={linesDrawn ? undefined : len}
              strokeDashoffset={linesDrawn ? 0 : len}
              style={
                animateIn
                  ? {
                      transition: `stroke-dashoffset 0.6s ease-out ${i * 0.08}s`,
                    }
                  : undefined
              }
            />
          )
        })}

        {/* Stars */}
        {stars.map((star, i) => {
          const pos = toSVG(star.x, star.y)
          const r = starRadius(star.magnitude)
          const isNamed = star.isNamed

          return (
            <g key={`star-${i}`}>
              {/* Outer glow for named stars */}
              {isNamed && (
                <circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r={r + 4}
                  fill="rgba(240, 201, 106, 0.1)"
                  style={
                    animateIn
                      ? { opacity: starsVisible ? 1 : 0, transition: `opacity 0.4s ${i * 0.05}s` }
                      : undefined
                  }
                />
              )}
              {/* Main star dot */}
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={r}
                fill={isNamed ? '#f0c96a' : '#e8e4d9'}
                filter={isNamed ? `url(#star-glow-${constellation.id})` : undefined}
                style={
                  animateIn
                    ? {
                        opacity: starsVisible ? 1 : 0,
                        transition: `opacity 0.3s ease-out ${i * 0.05}s`,
                      }
                    : undefined
                }
              />
            </g>
          )
        })}

        {/* Star name labels */}
        {showLabels &&
          stars
            .filter((s) => s.isNamed)
            .map((star, i) => {
              const pos = toSVG(star.x, star.y)
              // Offset label to avoid overlap with star dot
              const offsetX = pos.cx > size / 2 ? -10 : 10
              const anchor = pos.cx > size / 2 ? 'end' : 'start'

              return (
                <text
                  key={`label-${i}`}
                  x={pos.cx + offsetX}
                  y={pos.cy - 6}
                  textAnchor={anchor}
                  fontSize={10}
                  fontFamily="Space Mono, monospace"
                  fill="rgba(240, 201, 106, 0.75)"
                  letterSpacing="0.05em"
                  style={
                    animateIn
                      ? {
                          opacity: starsVisible ? 1 : 0,
                          transition: `opacity 0.4s 0.8s`,
                        }
                      : undefined
                  }
                >
                  {star.name}
                </text>
              )
            })}
      </svg>
    </div>
  )
}
