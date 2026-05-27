'use client'
// src/components/Sidebar.tsx — now the top navigation bar

import { useState, useRef, useEffect } from 'react'
import { useConstellationStore } from '@/store/useConstellationStore'
import { CONSTELLATIONS } from '@/data/constellations'
import type { SortKey, HemisphereFilter } from '@/types/constellation'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'alpha-asc',         label: 'A → Z' },
  { value: 'alpha-desc',        label: 'Z → A' },
  { value: 'month',             label: 'Best Month' },
  { value: 'area-desc',         label: 'Largest First' },
  { value: 'zodiac-first',      label: 'Zodiac First' },
  { value: 'hemisphere-north',  label: 'Northern First' },
  { value: 'hemisphere-south',  label: 'Southern First' },
]

export default function Sidebar() {
  const [searchOpen, setSearchOpen]   = useState(false)
  const [filterOpen, setFilterOpen]   = useState(false)
  const [query, setQuery]             = useState('')

  const setMatcherOpen    = useConstellationStore((s) => s.setMatcherOpen)
  const goToId            = useConstellationStore((s) => s.goToId)
  const sortKey           = useConstellationStore((s) => s.sortKey)
  const hemisphereFilter  = useConstellationStore((s) => s.hemisphereFilter)
  const sortedIds         = useConstellationStore((s) => s.sortedIds)
  const setSortKey        = useConstellationStore((s) => s.setSortKey)
  const setHemisphereFilter = useConstellationStore((s) => s.setHemisphereFilter)

  const inputRef    = useRef<HTMLInputElement>(null)
  const filterRef   = useRef<HTMLDivElement>(null)

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  // ⌘K / Ctrl+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setFilterOpen(false)
        setQuery('')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Close filter when clicking outside
  useEffect(() => {
    if (!filterOpen) return
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [filterOpen])

  const results = query.trim().length > 0
    ? CONSTELLATIONS.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.abbreviation.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 9)
    : []

  const handleSelect = (id: string) => {
    goToId(id)
    setSearchOpen(false)
    setQuery('')
  }

  const hasActiveFilter = hemisphereFilter !== 'all' || sortKey !== 'alpha-asc'

  return (
    <>
      {/* ── Top bar ───────────────────────────────────────────────────────────── */}
      <header style={{
        height: '54px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        borderBottom: '1px solid rgba(176,160,216,0.35)',
        background: '#ede9e0',
        backdropFilter: 'none',
        flexShrink: 0,
        position: 'relative',
        zIndex: 40,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#7a6ab0', fontSize: '11px', lineHeight: 1 }}>✦</span>
          <span style={{
            fontFamily: 'var(--font-cinzel)',
            fontSize: '12px',
            letterSpacing: '0.32em',
            color: '#1a1f2e',
            textTransform: 'uppercase',
          }}>Stellarie</span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: '#4a4050',
            letterSpacing: '0.1em',
            marginLeft: '2px',
          }}>88 IAU</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            style={barBtn()}
            onMouseEnter={(e) => hoverOn(e)}
            onMouseLeave={(e) => hoverOff(e)}
          >
            <span>⌕</span>
            <span>Search</span>
            <span style={{ opacity: 0.35, fontSize: '8px', marginLeft: '2px' }}>⌘K</span>
          </button>

          {/* Filter */}
          <div style={{ position: 'relative' }} ref={filterRef}>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              style={{
                ...barBtn(),
                ...(filterOpen || hasActiveFilter ? {
                  background: 'rgba(122,106,176,0.15)',
                  borderColor: 'rgba(122,106,176,0.5)',
                  color: '#5a3fa8',
                } : {}),
              }}
            >
              <span>⊞</span>
              <span>Filter</span>
              {hasActiveFilter && (
                <span style={{
                  width: '5px', height: '5px',
                  borderRadius: '50%',
                  background: 'var(--color-highlight)',
                  flexShrink: 0,
                }} />
              )}
            </button>

            {/* Filter dropdown */}
            {filterOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: 'var(--color-space-mid)',
                border: '1px solid rgba(176,160,216,0.2)',
                borderRadius: '8px',
                padding: '14px',
                width: '230px',
                boxShadow: '0 20px 48px rgba(0,0,0,0.6)',
                zIndex: 100,
              }}>
                <div style={filterSection()}>Sort</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginBottom: '14px' }}>
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortKey(opt.value)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '6px 8px',
                        background: sortKey === opt.value ? 'rgba(176,160,216,0.1)' : 'transparent',
                        border: 'none', borderRadius: '4px',
                        color: sortKey === opt.value ? 'var(--color-accent)' : 'var(--color-star)',
                        fontFamily: 'var(--font-mono)', fontSize: '10px',
                        cursor: 'pointer', textAlign: 'left', width: '100%',
                        transition: 'all 0.1s',
                      }}
                    >
                      {opt.label}
                      {sortKey === opt.value && <span style={{ color: 'var(--color-accent)', fontSize: '9px' }}>✓</span>}
                    </button>
                  ))}
                </div>

                <div style={filterSection()}>Hemisphere</div>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                  {(['all', 'north', 'south'] as HemisphereFilter[]).map((val) => (
                    <button
                      key={val}
                      onClick={() => setHemisphereFilter(val)}
                      style={{
                        flex: 1, padding: '5px 0',
                        background: hemisphereFilter === val ? 'rgba(176,160,216,0.14)' : 'transparent',
                        border: `1px solid ${hemisphereFilter === val ? 'rgba(176,160,216,0.4)' : 'rgba(176,160,216,0.12)'}`,
                        borderRadius: '4px',
                        color: hemisphereFilter === val ? 'var(--color-accent)' : 'var(--color-star)',
                        fontFamily: 'var(--font-mono)', fontSize: '9px',
                        cursor: 'pointer', transition: 'all 0.1s',
                        textTransform: 'capitalize',
                      }}
                    >{val}</button>
                  ))}
                </div>

                <div style={{
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(176,160,216,0.08)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  color: 'rgba(176,168,158,0.65)',
                  textAlign: 'center',
                }}>
                  {sortedIds.length} constellations shown
                </div>
              </div>
            )}
          </div>

          <div style={{ width: '1px', height: '18px', background: 'rgba(26,31,46,0.2)', margin: '0 4px' }} />

          {/* StarMatcher */}
          <button
            onClick={() => setMatcherOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              height: '30px', padding: '0 13px',
              background: 'rgba(180,130,20,0.12)',
              border: '1px solid rgba(180,130,20,0.35)',
              borderRadius: '4px',
              color: '#7a5a00',
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              letterSpacing: '0.07em',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(180,130,20,0.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(180,130,20,0.12)' }}
          >
            <span>⊕</span>
            <span>StarMatcher</span>
          </button>
        </div>
      </header>

      {/* ── Search overlay ────────────────────────────────────────────────────── */}
      {searchOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) { setSearchOpen(false); setQuery('') }
          }}
          style={{
            position: 'fixed', inset: 0, zIndex: 80,
            background: 'rgba(6,9,15,0.82)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: '14vh',
          }}
        >
          <div style={{
            width: '100%', maxWidth: '540px',
            background: '#ede9e0',
            border: '1px solid rgba(122,106,176,0.35)',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
          }}>
            {/* Input row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '16px 20px',
              borderBottom: '1px solid rgba(26,31,46,0.12)',
            }}>
              <span style={{ color: '#7a6ab0', fontSize: '16px', flexShrink: 0 }}>⌕</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && results.length > 0) handleSelect(results[0].id)
                }}
                placeholder="Search by name or abbreviation…"
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: '#1a1f2e',
                  fontFamily: 'var(--font-cinzel)',
                  fontSize: '16px', letterSpacing: '0.04em',
                }}
              />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '9px',
                color: '#5a5560',
                background: 'rgba(26,31,46,0.07)',
                border: '1px solid rgba(26,31,46,0.2)',
                padding: '3px 7px', borderRadius: '3px',
                cursor: 'pointer', flexShrink: 0,
              }}
                onClick={() => { setSearchOpen(false); setQuery('') }}
              >ESC</span>
            </div>

            {/* Results */}
            {results.map((c, i) => (
              <button
                key={c.id}
                onClick={() => handleSelect(c.id)}
                style={{
                  width: '100%', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 20px',
                  background: 'transparent', border: 'none',
                  borderBottom: i < results.length - 1 ? '1px solid rgba(26,31,46,0.08)' : 'none',
                  cursor: 'pointer', transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(122,106,176,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '14px', color: '#1a1f2e', flex: 1 }}>
                  {c.name}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#5a5560', letterSpacing: '0.15em' }}>
                  {c.abbreviation}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#7a6ab0' }}>
                  {c.hemisphere === 'north' ? '↑N' : c.hemisphere === 'south' ? '↓S' : '↕'}
                </span>
                {c.isZodiac && (
                  <span style={{ fontSize: '10px', color: '#a07800' }}>♈</span>
                )}
              </button>
            ))}

            {query.trim().length > 0 && results.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#5a5560' }}>
                No match for &quot;{query}&quot;
              </div>
            )}
            {query.trim().length === 0 && (
              <div style={{ padding: '20px 20px', fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#7a7570', letterSpacing: '0.05em' }}>
                Type to search all 88 IAU constellations · Enter selects the first result
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ── Style helpers ─────────────────────────────────────────────────────────────

function barBtn(): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: '5px',
    height: '30px', padding: '0 11px',
    background: 'rgba(26,31,46,0.07)',
    border: '1px solid rgba(26,31,46,0.2)',
    borderRadius: '4px',
    color: '#1a1f2e',
    fontFamily: 'var(--font-mono)', fontSize: '10px',
    letterSpacing: '0.06em',
    cursor: 'pointer', transition: 'all 0.15s',
  }
}

function hoverOn(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.borderColor = 'rgba(26,31,46,0.4)'
  e.currentTarget.style.background = 'rgba(26,31,46,0.12)'
}
function hoverOff(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.borderColor = 'rgba(26,31,46,0.2)'
  e.currentTarget.style.background = 'rgba(26,31,46,0.07)'
}
function filterSection(): React.CSSProperties {
  return {
    fontFamily: 'var(--font-mono)', fontSize: '8px',
    letterSpacing: '0.18em', textTransform: 'uppercase',
    color: 'rgba(176,168,158,0.7)', marginBottom: '6px',
  }
}
