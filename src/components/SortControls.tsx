'use client'
// src/components/SortControls.tsx

import { useConstellationStore } from '@/store/useConstellationStore'
import type { SortKey, HemisphereFilter } from '@/types/constellation'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'alpha-asc', label: 'A → Z' },
  { value: 'alpha-desc', label: 'Z → A' },
  { value: 'month', label: 'Best Month' },
  { value: 'area-desc', label: 'Largest First' },
  { value: 'zodiac-first', label: 'Zodiac First' },
  { value: 'hemisphere-north', label: 'Northern First' },
  { value: 'hemisphere-south', label: 'Southern First' },
]

const HEMISPHERE_OPTIONS: { value: HemisphereFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'north', label: '↑ North' },
  { value: 'south', label: '↓ South' },
]

const selectStyle = {
  background: 'var(--color-space-mid)',
  border: '1px solid rgba(184,169,224,0.2)',
  color: 'var(--color-star)',
  fontFamily: 'Space Mono, monospace',
  fontSize: '11px',
  borderRadius: '4px',
  padding: '4px 6px',
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none' as const,
  WebkitAppearance: 'none' as const,
  width: '100%',
}

export default function SortControls() {
  const sortKey = useConstellationStore((s) => s.sortKey)
  const hemisphereFilter = useConstellationStore((s) => s.hemisphereFilter)
  const sortedIds = useConstellationStore((s) => s.sortedIds)
  const setSortKey = useConstellationStore((s) => s.setSortKey)
  const setHemisphereFilter = useConstellationStore((s) => s.setHemisphereFilter)

  return (
    <div className="flex flex-col gap-2 px-3 py-2">
      {/* Count badge */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-mono uppercase tracking-widest"
          style={{ color: 'var(--color-star-dim)', fontSize: '10px' }}
        >
          Constellations
        </span>
        <span
          className="font-mono text-xs px-1.5 py-0.5 rounded"
          style={{
            background: 'rgba(184,169,224,0.1)',
            color: 'var(--color-accent)',
            fontSize: '10px',
          }}
        >
          {sortedIds.length}
        </span>
      </div>

      {/* Sort select */}
      <div className="relative">
        <label
          className="block mb-1 font-mono uppercase tracking-wider"
          style={{ color: 'var(--color-star-dim)', fontSize: '9px' }}
        >
          Sort
        </label>
        <div className="relative">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            style={selectStyle}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-accent)', fontSize: '10px' }}
          >
            ▾
          </span>
        </div>
      </div>

      {/* Hemisphere filter */}
      <div>
        <label
          className="block mb-1 font-mono uppercase tracking-wider"
          style={{ color: 'var(--color-star-dim)', fontSize: '9px' }}
        >
          Hemisphere
        </label>
        <div className="flex gap-1">
          {HEMISPHERE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setHemisphereFilter(opt.value)}
              className="flex-1 text-center py-1 rounded transition-all duration-150"
              style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: '10px',
                background:
                  hemisphereFilter === opt.value
                    ? 'rgba(184,169,224,0.2)'
                    : 'transparent',
                color:
                  hemisphereFilter === opt.value
                    ? 'var(--color-accent)'
                    : 'var(--color-star-dim)',
                border:
                  hemisphereFilter === opt.value
                    ? '1px solid rgba(184,169,224,0.4)'
                    : '1px solid rgba(184,169,224,0.1)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
