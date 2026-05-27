'use client'
// src/components/ConstellationCard.tsx

import { motion } from 'framer-motion'
import ConstellationCanvas from './ConstellationCanvas'
import type { Constellation } from '@/types/constellation'

interface Props {
  constellation: Constellation
  isActive: boolean
  index: number
  onClick: () => void
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function ConstellationCard({ constellation, isActive, index, onClick }: Props) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left relative overflow-hidden"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02, duration: 0.25 }}
      whileTap={{ scale: 0.98 }}
      aria-pressed={isActive}
    >
      <div
        className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200"
        style={{
          background: isActive
            ? 'linear-gradient(90deg, rgba(184,169,224,0.15) 0%, rgba(184,169,224,0.05) 100%)'
            : 'transparent',
          borderLeft: isActive ? '2px solid rgba(184,169,224,0.7)' : '2px solid transparent',
        }}
      >
        {/* Mini canvas preview */}
        <div className="relative shrink-0" style={{ width: 36, height: 36 }}>
          <ConstellationCanvas
            constellation={constellation}
            size={36}
            showLabels={false}
            animateIn={false}
          />
        </div>

        {/* Text info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span
              className="text-sm font-cinzel truncate"
              style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-star)' }}
            >
              {constellation.name}
            </span>
            <span
              className="text-xs font-mono shrink-0"
              style={{ color: 'var(--color-star-dim)' }}
            >
              {constellation.abbreviation}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {constellation.isZodiac && (
              <span
                className="text-xs font-mono px-1 rounded"
                style={{
                  color: 'var(--color-highlight)',
                  background: 'rgba(240,201,106,0.1)',
                  fontSize: '9px',
                }}
              >
                ♈ ZODIAC
              </span>
            )}
            <span
              className="text-xs"
              style={{ color: 'var(--color-star-dim)', fontSize: '11px' }}
            >
              {MONTH_NAMES[(constellation.bestMonth - 1) % 12]}
              {constellation.area ? ` · ${constellation.area.toFixed(0)}°²` : ''}
            </span>
          </div>
        </div>

        {/* Hemisphere indicator */}
        <div
          className="text-xs font-mono shrink-0"
          style={{ color: 'var(--color-star-dim)', fontSize: '10px' }}
          title={`${constellation.hemisphere} hemisphere`}
        >
          {constellation.hemisphere === 'north' ? '↑N' :
           constellation.hemisphere === 'south' ? '↓S' : '↕'}
        </div>
      </div>
    </motion.button>
  )
}
