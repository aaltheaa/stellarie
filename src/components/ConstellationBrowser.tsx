'use client'
// src/components/ConstellationBrowser.tsx

import { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useConstellationStore, useCurrentConstellation } from '@/store/useConstellationStore'
import { CONSTELLATION_MAP } from '@/data/constellations'
import ConstellationCanvas from './ConstellationCanvas'
import { getExternalImageUrl } from '@/lib/externalImages'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const SEASON_LABEL: Record<string, string> = {
  spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter', 'year-round': 'Year-round',
}

export default function ConstellationBrowser() {
  const currentIndex  = useConstellationStore((s) => s.currentIndex)
  const sortedIds     = useConstellationStore((s) => s.sortedIds)
  const goNext        = useConstellationStore((s) => s.goNext)
  const goPrev        = useConstellationStore((s) => s.goPrev)
  const constellation = useCurrentConstellation()

  const [viewMode, setViewMode] = useState<'generated' | 'photo'>('generated')

  // Keyboard navigation
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goNext() }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goPrev() }
  }, [goNext, goPrev])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (!constellation) return null

  const total           = sortedIds.length
  const prevId          = sortedIds[(currentIndex - 1 + total) % total]
  const nextId          = sortedIds[(currentIndex + 1) % total]
  const prevName        = CONSTELLATION_MAP.get(prevId)?.name ?? ''
  const nextName        = CONSTELLATION_MAP.get(nextId)?.name ?? ''
  const progress        = ((currentIndex + 1) / total) * 100

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Ambient starfield background */}
      <div
        className="starfield-bg"
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: `
            radial-gradient(ellipse 70% 55% at 60% 45%, rgba(176,160,216,0.04) 0%, transparent 65%),
            var(--color-space)
          `,
        }}
      />

      {/* Progress bar */}
      <div style={{ height: '2px', background: 'rgba(176,160,216,0.05)', flexShrink: 0, position: 'relative', zIndex: 1 }}>
        <motion.div
          style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-accent), var(--color-highlight))' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      </div>

      {/* ── Main exhibit area ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>

        {/* Large side navigation buttons — always visible */}
        <button
          onClick={goPrev}
          aria-label="Previous constellation"
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: '64px', zIndex: 10,
            background: 'linear-gradient(to right, rgba(6,9,15,0.5), transparent)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(176,160,216,0.8)',
            fontSize: '22px',
            transition: 'color 0.2s, background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-star)'
            e.currentTarget.style.background = 'linear-gradient(to right, rgba(6,9,15,0.75), transparent)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(176,160,216,0.8)'
            e.currentTarget.style.background = 'linear-gradient(to right, rgba(6,9,15,0.5), transparent)'
          }}
        >‹</button>

        <button
          onClick={goNext}
          aria-label="Next constellation"
          style={{
            position: 'absolute', right: 0, top: 0, bottom: 0,
            width: '64px', zIndex: 10,
            background: 'linear-gradient(to left, rgba(6,9,15,0.5), transparent)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(176,160,216,0.8)',
            fontSize: '22px',
            transition: 'color 0.2s, background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-star)'
            e.currentTarget.style.background = 'linear-gradient(to left, rgba(6,9,15,0.75), transparent)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(176,160,216,0.8)'
            e.currentTarget.style.background = 'linear-gradient(to left, rgba(6,9,15,0.5), transparent)'
          }}
        >›</button>

        <AnimatePresence mode="wait">
          <motion.div
            key={constellation.id}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'clamp(24px, 4vh, 56px) clamp(72px, 7vw, 108px)',
              gap: 'clamp(32px, 5vw, 80px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >

            {/* ── Left column: text info ──────────────────────────────────────── */}
            <div style={{ flex: '1 1 0', maxWidth: '420px', minWidth: 0 }}>

              {/* Pill badges */}
              <motion.div
                style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 }}
              >
                {constellation.isZodiac && (
                  <Pill color="gold">ZODIAC</Pill>
                )}
                <Pill color="accent">
                  {constellation.hemisphere === 'north' ? '↑ Northern'
                    : constellation.hemisphere === 'south' ? '↓ Southern'
                    : '↕ Both Hemispheres'}
                </Pill>
                {constellation.family && (
                  <Pill color="dim">{constellation.family.replace(/-/g, ' ').toUpperCase()}</Pill>
                )}
              </motion.div>

              {/* Name — the hero */}
              <motion.h1
                style={{
                  fontFamily: 'var(--font-cinzel)',
                  fontSize: 'clamp(32px, 4.2vw, 66px)',
                  color: 'var(--color-star)',
                  letterSpacing: '0.06em',
                  lineHeight: 1.0,
                  marginBottom: '10px',
                  textWrap: 'balance',
                }}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.07, duration: 0.38 }}
              >
                {constellation.name}
              </motion.h1>

              {/* Abbreviation + area */}
              <motion.div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.28em',
                  color: 'var(--color-star-dim)',
                  marginBottom: '28px',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.12 }}
              >
                <span>{constellation.abbreviation}</span>
                {constellation.area && (
                  <>
                    <span style={{ opacity: 0.3 }}>·</span>
                    <span style={{ opacity: 0.45, fontSize: '9px' }}>{constellation.area.toFixed(0)} sq°</span>
                  </>
                )}
              </motion.div>

              {/* Metadata grid */}
              <motion.div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '14px 24px',
                  marginBottom: '26px',
                  paddingBottom: '24px',
                  borderBottom: '1px solid rgba(176,160,216,0.08)',
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }}
              >
                <MetaItem label="Best Month" value={MONTH_NAMES[(constellation.bestMonth - 1) % 12]} />
                <MetaItem label="Season"     value={SEASON_LABEL[constellation.season] ?? constellation.season} />
                <MetaItem label="Main Stars"  value={String(constellation.stars.length)} />
                {constellation.area && <MetaItem label="Sky Area" value={`${constellation.area.toFixed(0)} sq°`} />}
              </motion.div>

              {/* Mythology */}
              <motion.p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  lineHeight: 1.8,
                  color: 'var(--color-star-dim)',
                  fontStyle: 'italic',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.18 }}
              >
                {constellation.mythology}
              </motion.p>

              {/* Tags */}
              {constellation.tags && constellation.tags.length > 0 && (
                <motion.div
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '14px' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.22 }}
                >
                  {constellation.tags.map((tag) => (
                    <span key={tag} style={{
                      fontFamily: 'var(--font-mono)', fontSize: '8px',
                      letterSpacing: '0.1em', color: 'rgba(176,168,158,0.7)',
                      border: '1px solid rgba(176,160,216,0.2)',
                      padding: '2px 7px', borderRadius: '2px',
                    }}>{tag}</span>
                  ))}
                </motion.div>
              )}
            </div>

            {/* ── Right: canvas + toggle ───────────────────────────────────────── */}
            <motion.div
              style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.09, duration: 0.42, ease: 'easeOut' }}
            >
              {/* View mode toggle */}
              <div style={{
                display: 'flex',
                borderRadius: '4px',
                border: '1px solid rgba(122,106,176,0.4)',
                overflow: 'hidden',
                alignSelf: 'flex-end',
                background: 'rgba(237,233,224,0.9)',
                backdropFilter: 'blur(4px)',
              }}>
                {(['generated', 'photo'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    style={{
                      padding: '4px 12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      letterSpacing: '0.1em',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      background: viewMode === mode ? 'rgba(122,106,176,0.18)' : 'transparent',
                      color: viewMode === mode ? '#5a3fa8' : '#3a3550',
                      borderRight: mode === 'generated' ? '1px solid rgba(122,106,176,0.3)' : 'none',
                    }}
                  >
                    {mode === 'generated' ? '★ Map' : '⎍ Photo'}
                  </button>
                ))}
              </div>

              {/* Canvas or photo */}
              {viewMode === 'photo' ? (
                <ExternalImage id={constellation.id} size={420} />
              ) : (
                <ConstellationCanvas
                  constellation={constellation}
                  size={420}
                  showLabels={true}
                  animateIn={true}
                />
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom navigation bar ───────────────────────────────────────────────── */}
      <div style={{
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        borderTop: '1px solid rgba(176,160,216,0.35)',
        background: '#ede9e0',
        backdropFilter: 'none',
        flexShrink: 0,
        position: 'relative', zIndex: 2,
      }}>

        {/* Prev */}
        <NavButton onClick={goPrev} direction="prev" label={prevName} />

        {/* Counter */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          color: 'var(--color-star-dim)',
          letterSpacing: '0.08em',
          display: 'flex', alignItems: 'center', gap: '6px',
          userSelect: 'none',
        }}>
          <span style={{ color: '#7a6ab0' }}>{currentIndex + 1}</span>
          <span style={{ color: '#1a1f2e', opacity: 0.35 }}>/</span>
          <span style={{ color: '#1a1f2e' }}>{total}</span>
          <span style={{ color: '#1a1f2e', marginLeft: '10px', opacity: 0.45, fontSize: '8px', letterSpacing: '0.05em' }}>
            ← → navigate
          </span>
        </div>

        {/* Next */}
        <NavButton onClick={goNext} direction="next" label={nextName} />
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Pill({ children, color }: { children: React.ReactNode; color: 'gold' | 'accent' | 'dim' }) {
  const styles: Record<string, React.CSSProperties> = {
    gold: { color: 'var(--color-highlight)', background: 'rgba(232,188,88,0.07)', border: '1px solid rgba(232,188,88,0.2)' },
    accent: { color: 'var(--color-accent)', background: 'rgba(176,160,216,0.06)', border: '1px solid rgba(176,160,216,0.16)' },
    dim: { color: 'rgba(176,168,158,0.8)', background: 'transparent', border: '1px solid rgba(176,160,216,0.18)' },
  }
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: '9px',
      letterSpacing: '0.13em',
      padding: '3px 8px', borderRadius: '2px',
      ...styles[color],
    }}>{children}</span>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '8px',
        letterSpacing: '0.16em', textTransform: 'uppercase',
        color: 'rgba(176,168,158,0.8)', marginBottom: '5px',
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-cinzel)', fontSize: '13px',
        color: 'var(--color-accent)', letterSpacing: '0.04em',
        textTransform: 'capitalize',
      }}>{value}</div>
    </div>
  )
}

function ExternalImage({ id, size }: { id: string; size: number }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const url = getExternalImageUrl(id)

  return (
    <div style={{
      width: size, height: size,
      borderRadius: '8px',
      overflow: 'hidden',
      background: 'rgba(6,9,15,0.6)',
      border: '1px solid rgba(176,160,216,0.12)',
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {status === 'loading' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '10px',
        }}>
          <div style={{
            width: '20px', height: '20px',
            border: '1px solid rgba(176,160,216,0.15)',
            borderTopColor: 'var(--color-accent)',
            borderRadius: '50%',
          }} className="animate-spin-slow" />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '9px',
            color: 'rgba(176,160,216,0.35)', letterSpacing: '0.1em',
          }}>Loading…</span>
        </div>
      )}

      {status === 'error' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ fontSize: '24px', opacity: 0.2 }}>✦</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '9px',
            color: 'rgba(176,160,216,0.35)', letterSpacing: '0.08em',
          }}>Photo unavailable</span>
        </div>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={id}
        src={url}
        alt={`IAU chart for ${id}`}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        style={{
          width: '100%', height: '100%',
          objectFit: 'contain',
          opacity: status === 'loaded' ? 1 : 0,
          transition: 'opacity 0.35s ease',
          position: 'absolute', inset: 0,
        }}
      />
    </div>
  )
}

function NavButton({ onClick, direction, label }: {
  onClick: () => void
  direction: 'prev' | 'next'
  label: string
}) {
  const isPrev = direction === 'prev'
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center',
        gap: '10px',
        background: 'none', border: 'none',
        cursor: 'pointer', padding: '6px 10px',
        borderRadius: '5px',
        transition: 'background 0.15s',
        minWidth: '120px',
        justifyContent: isPrev ? 'flex-start' : 'flex-end',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(26,31,46,0.08)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
    >
      {isPrev && <span style={{ color: '#7a6ab0', fontSize: '13px', flexShrink: 0 }}>←</span>}
      <span style={{
        fontFamily: 'var(--font-cinzel)', fontSize: '11px',
        letterSpacing: '0.07em',
        color: '#1a1f2e',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{label}</span>
      {!isPrev && <span style={{ color: '#7a6ab0', fontSize: '13px', flexShrink: 0 }}>→</span>}
    </button>
  )
}
