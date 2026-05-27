'use client'
// src/components/StarMatcher.tsx

import { useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useConstellationStore } from '@/store/useConstellationStore'
import MatchResult from './MatchResult'

const CANVAS_SIZE = 300

export default function StarMatcher() {
  const matcherOpen   = useConstellationStore((s) => s.matcherOpen)
  const userDots      = useConstellationStore((s) => s.userDots)
  const matchResults  = useConstellationStore((s) => s.matchResults)
  const isMatching    = useConstellationStore((s) => s.isMatching)
  const aiAnalysis    = useConstellationStore((s) => s.aiAnalysis)
  const isAnalyzing   = useConstellationStore((s) => s.isAnalyzing)

  const setMatcherOpen  = useConstellationStore((s) => s.setMatcherOpen)
  const addDot          = useConstellationStore((s) => s.addDot)
  const removeDot       = useConstellationStore((s) => s.removeDot)
  const clearDots       = useConstellationStore((s) => s.clearDots)
  const runMatch        = useConstellationStore((s) => s.runMatch)
  const runAiAnalysis   = useConstellationStore((s) => s.runAiAnalysis)

  const canvasRef = useRef<SVGSVGElement>(null)

  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / CANVAS_SIZE
    const y = (e.clientY - rect.top) / CANVAS_SIZE
    addDot(Math.max(0.02, Math.min(0.98, x)), Math.max(0.02, Math.min(0.98, y)))
  }, [addDot])

  const handleDotRightClick = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    removeDot(index)
  }, [removeDot])

  if (!matcherOpen) return null

  const hasEnoughDots = userDots.length >= 2
  const hasResults    = matchResults.length > 0

  return (
    <AnimatePresence>
      <motion.div
        style={{
          position: 'fixed', inset: 0, zIndex: 70,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
          background: 'rgba(20,24,40,0.72)',
          backdropFilter: 'blur(14px)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && setMatcherOpen(false)}
      >
        <motion.div
          style={{
            position: 'relative', width: '100%', maxWidth: '820px',
            borderRadius: '10px', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            background: '#ede9e0',
            border: '1px solid rgba(26,31,46,0.12)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
            maxHeight: '88dvh',
          }}
          initial={{ scale: 0.96, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 22px',
            borderBottom: '1px solid rgba(26,31,46,0.12)',
            flexShrink: 0,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ color: '#7a5a00', fontSize: '15px' }}>⊕</span>
                <span style={{
                  fontFamily: 'var(--font-cinzel)', fontSize: '15px',
                  letterSpacing: '0.22em', color: '#3a3550',
                  textTransform: 'uppercase',
                }}>StarMatcher</span>
              </div>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                color: '#6a6480', letterSpacing: '0.05em',
              }}>
                Click canvas to place stars · right-click to remove · {userDots.length}/20
              </p>
            </div>

            <button
              onClick={() => setMatcherOpen(false)}
              style={{
                width: '30px', height: '30px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                background: 'none',
                border: '1px solid rgba(26,31,46,0.18)',
                color: '#3a3550',
                cursor: 'pointer', fontSize: '12px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(26,31,46,0.4)'
                e.currentTarget.style.background = 'rgba(26,31,46,0.06)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(26,31,46,0.18)'
                e.currentTarget.style.background = 'none'
              }}
            >✕</button>
          </div>

          {/* Body */}
          <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

            {/* Canvas panel */}
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'space-between',
              padding: '20px',
              borderRight: '1px solid rgba(26,31,46,0.1)',
              flexShrink: 0,
            }}>
              {/* Canvas */}
              <div style={{
                position: 'relative',
                width: CANVAS_SIZE, height: CANVAS_SIZE,
                borderRadius: '6px', overflow: 'hidden',
                cursor: 'crosshair',
                border: '1px solid rgba(176,160,216,0.15)',
              }}>
                {/* Grid */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `
                    linear-gradient(rgba(176,160,216,0.04) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(176,160,216,0.04) 1px, transparent 1px)
                  `,
                  backgroundSize: '30px 30px',
                  backgroundColor: 'rgba(6,9,15,0.85)',
                }} />
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'radial-gradient(ellipse at center, rgba(176,160,216,0.04) 0%, transparent 65%)',
                }} />

                <svg
                  ref={canvasRef}
                  width={CANVAS_SIZE} height={CANVAS_SIZE}
                  viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
                  onClick={handleCanvasClick}
                  style={{ display: 'block', position: 'relative' }}
                >
                  {userDots.map((dot, i) => (
                    <g key={i} onContextMenu={(e) => handleDotRightClick(e, i)}>
                      <circle
                        cx={dot.x * CANVAS_SIZE} cy={dot.y * CANVAS_SIZE} r={9}
                        fill="rgba(232,188,88,0.05)" className="cursor-pointer"
                      />
                      <circle
                        cx={dot.x * CANVAS_SIZE} cy={dot.y * CANVAS_SIZE} r={4}
                        fill="#e8bc58"
                        stroke="rgba(232,188,88,0.35)" strokeWidth="1"
                        className="cursor-pointer"
                        style={{ filter: 'drop-shadow(0 0 4px rgba(232,188,88,0.55))' }}
                      />
                      <text
                        x={dot.x * CANVAS_SIZE + 8} y={dot.y * CANVAS_SIZE - 6}
                        fontSize="7" fontFamily="Space Mono, monospace"
                        fill="rgba(232,188,88,0.55)"
                      >{i + 1}</text>
                    </g>
                  ))}

                  {userDots.length === 0 && (
                    <>
                      <text x={CANVAS_SIZE / 2} y={CANVAS_SIZE / 2 - 14}
                        textAnchor="middle" fontSize="24" fill="rgba(176,160,216,0.18)">✦</text>
                      <text x={CANVAS_SIZE / 2} y={CANVAS_SIZE / 2 + 14}
                        textAnchor="middle" fontSize="10" fontFamily="Space Mono, monospace"
                        fill="rgba(176,160,216,0.22)">click to place stars</text>
                    </>
                  )}
                </svg>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px', width: '100%' }}>
                <button
                  onClick={clearDots}
                  disabled={userDots.length === 0}
                  style={{
                    flex: 1, height: '36px',
                    fontFamily: 'var(--font-mono)', fontSize: '11px',
                    letterSpacing: '0.06em',
                    background: 'rgba(180,60,60,0.07)',
                    border: '1px solid rgba(180,60,60,0.25)',
                    borderRadius: '5px',
                    color: '#a83a3a',
                    cursor: 'pointer', transition: 'all 0.15s',
                    opacity: userDots.length === 0 ? 0.35 : 1,
                  }}
                >Clear</button>

                <button
                  onClick={runMatch}
                  disabled={!hasEnoughDots || isMatching}
                  style={{
                    flex: 1, height: '36px',
                    fontFamily: 'var(--font-mono)', fontSize: '11px',
                    letterSpacing: '0.06em',
                    background: hasEnoughDots ? 'rgba(90,63,168,0.12)' : 'rgba(90,63,168,0.04)',
                    border: `1px solid ${hasEnoughDots ? 'rgba(90,63,168,0.3)' : 'rgba(90,63,168,0.1)'}`,
                    borderRadius: '5px',
                    color: '#5a3fa8',
                    cursor: hasEnoughDots ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s',
                    opacity: (!hasEnoughDots || isMatching) ? 0.5 : 1,
                  }}
                >{isMatching ? 'Matching…' : 'Match'}</button>
              </div>

              {!hasEnoughDots && (
                <p style={{
                  marginTop: '8px',
                  fontFamily: 'var(--font-mono)', fontSize: '11px',
                  color: 'rgba(58,53,80,0.45)',
                  textAlign: 'center',
                }}>Place at least 2 dots to match</p>
              )}
            </div>

            {/* Results panel */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
              {hasResults ? (
                <>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '13px 18px',
                    borderBottom: '1px solid rgba(26,31,46,0.1)',
                    flexShrink: 0,
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '11px',
                      letterSpacing: '0.16em', textTransform: 'uppercase',
                      color: '#3a3550',
                    }}>Top Matches</span>

                    <button
                      onClick={runAiAnalysis}
                      disabled={isAnalyzing}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        height: '28px', padding: '0 12px',
                        fontFamily: 'var(--font-mono)', fontSize: '11px',
                        letterSpacing: '0.07em',
                        background: 'rgba(122,90,0,0.08)',
                        border: '1px solid rgba(122,90,0,0.25)',
                        borderRadius: '4px',
                        color: '#7a5a00',
                        cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                        opacity: isAnalyzing ? 0.6 : 1,
                        transition: 'all 0.15s',
                      }}
                    >
                      {isAnalyzing
                        ? <><span className="animate-spin-slow" style={{ display: 'inline-block' }}>◌</span> Analyzing…</>
                        : <>✦ Ask Claude</>
                      }
                    </button>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {aiAnalysis && (
                      <motion.div
                        style={{
                          padding: '14px 16px',
                          borderRadius: '6px',
                          background: 'rgba(122,90,0,0.06)',
                          border: '1px solid rgba(122,90,0,0.2)',
                          fontFamily: 'var(--font-body)', fontSize: '14px',
                          lineHeight: 1.7, color: '#1a1f2e',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div style={{
                          fontFamily: 'var(--font-mono)', fontSize: '10px',
                          letterSpacing: '0.15em', color: '#7a5a00',
                          marginBottom: '8px',
                        }}>✦ CLAUDE ANALYSIS</div>
                        {aiAnalysis}
                      </motion.div>
                    )}

                    {matchResults.map((result, i) => (
                      <MatchResult
                        key={result.constellation.id}
                        result={result}
                        rank={i}
                        canvasSize={90}
                        userDots={userDots}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '24px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '36px', color: '#3a3550', opacity: 0.18, marginBottom: '14px' }}>✦</div>
                  <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '14px', color: '#3a3550', letterSpacing: '0.1em' }}>
                    Place dots, then match
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(58,53,80,0.45)', marginTop: '8px' }}>
                    Compares against all 88 IAU constellations
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
