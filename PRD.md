# Stellarie — Product Requirements Document

> **"Every star has a story. Find yours."**

---

## 1. Overview

**Stellarie** is a modern constellation directory and discovery tool that solves two distinct but connected problems:

1. **Browsing problem**: Existing constellation resources (Wikipedia, Stellarium, IAU) make you click into each constellation individually, with no fluid flow between them. Stellarie replaces that with a swipeable, sortable gallery — a constellation flipbook.

2. **Recognition problem**: When you see a pattern of stars in the sky and don't know what it is, there's no fast, visual way to look it up by drawing what you see. Stellarie's **StarMatcher** tool lets you place dots on a canvas and instantly surfaces the closest matching constellations.

---

## 2. Problem Space

| Problem | Current Experience | Stellarie Experience |
|---|---|---|
| "I want to browse all constellations" | Click each one in a flat list, wait for page load, go back | Arrow/swipe through all 88 in one continuous view |
| "I want to sort by season / hemisphere" | No sorting available | Sort dropdown: A–Z, hemisphere, best viewing month, zodiac-first |
| "I see a star pattern, what constellation is it?" | Search text or browse manually | Draw dots → instant ranked matches |
| "I want to understand a constellation's shape at a glance" | Varying image quality, inconsistent style | Unified SVG rendering with adjustable line/label overlay |

---

## 3. Target Users

- **Amateur astronomers** who want a fluid reference tool
- **Astrology enthusiasts** (Althea's audience) who want context beyond the zodiac 12
- **Students** learning the night sky for the first time
- **Stargazers** using a phone in the field who see a pattern and want to ID it

---

## 4. Core Features

### 4.1 — Constellation Browser

The primary view. Displays one constellation at a time, large and centered. Users move between them.

**Navigation:**
- Left/right arrow keys
- Swipe left/right (mobile)
- Click prev/next chevrons
- Jump from sidebar list

**Display per constellation:**
- Full-width SVG star map (rendered from coordinate data, not static images)
- Constellation name + abbreviation
- Hemisphere badge, best-viewing month badge, zodiac badge (if applicable)
- Mythology/lore blurb (2–3 sentences)
- Key stars listed with magnitude
- Subtle background: deep space with faint noise texture

**Sort/Filter (sidebar or top bar):**
- Alphabetical (A→Z, Z→A)
- Best viewing month (by current month default)
- Hemisphere (northern / southern / both)
- Zodiac first, then A–Z
- Constellation family (Ursa Major family, Orion family, etc.)
- Size (largest area first)

### 4.2 — StarMatcher Tool

A dedicated modal or side panel. The user's "I see stars, what is this?" tool.

**Interaction flow:**
1. User opens StarMatcher (button always accessible)
2. A dark square canvas appears with a subtle grid
3. User clicks/taps to place glowing dots (stars they can see)
4. Up to 20 dots supported; dots can be removed by clicking again
5. "Match" button triggers the matching algorithm
6. Results panel shows top 5 constellation matches, each with:
   - Constellation name + abbreviation
   - Match confidence score (as a visual bar, not a raw %)
   - Mini SVG of the constellation overlaid with the user's dot pattern (scaled/rotated to best fit)
   - "View full constellation" link to jump to it in the browser
7. Optional: "AI Analysis" button sends the dot positions to Claude API for a natural language explanation of the match

**Matching algorithm (see `lib/matchConstellation.ts`):**
- Normalize user points: translate to centroid (0,0), scale by max pairwise distance
- For each constellation: normalize its star positions the same way
- For each rotation in 24 steps (0°, 15°, 30°, ...): compute minimum-weight bipartite matching (greedy nearest-neighbor approximation)
- Score = 1 / (1 + avg_matched_distance); penalize large point-count difference
- Return top 5 by score
- Claude API layer: optionally send top 3 results + dot positions for narrative match explanation

### 4.3 — Constellation Detail (expanded state)

Accessible from a "See more" button on the browser card.

- Full lore/mythology
- Neighboring constellations
- Notable deep-sky objects (Messier catalog mentions)
- Historical origin (Greek, Chinese, Indigenous, etc.)
- Best viewing conditions

---

## 5. UX Flows

### Flow A: Browser flow (core)
```
Landing → Browser view (first constellation = Andromeda alphabetically OR most viewed)
→ ← arrows or swipe → next/prev constellation
→ Sidebar: click any constellation → jumps directly to it
→ Sort dropdown → reorders sidebar + resets position to #1 of new sort
```

### Flow B: StarMatcher flow
```
Any view → StarMatcher button (always visible, top-right)
→ Canvas modal opens
→ User places 3–15 dots
→ "Find Match" button → loading state (fast, <200ms for geometric) 
→ Results panel slides in (right side on desktop, bottom sheet on mobile)
→ User taps a result → modal closes, browser jumps to that constellation
```

### Flow C: Direct URL sharing
```
/constellation/orion → Browser opens at Orion
/match?dots=[[0.3,0.2],[0.5,0.5],...] → StarMatcher pre-loaded with encoded dots
```

---

## 6. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | Your existing stack; RSC for constellation data |
| Language | TypeScript | Type safety on constellation data is critical |
| Styling | Tailwind CSS + CSS variables | Dark space theme, consistent design tokens |
| SVG rendering | Custom React component | Full control over star/line rendering, no library lock-in |
| Animation | Framer Motion | Swipe transitions, dot placement animations |
| State | Zustand | Browser position, sort state, StarMatcher dots |
| Fonts | Cinzel (display) + Space Mono (data) | Astronomical/classical feel |
| Claude API | `claude-sonnet-4-20250514` | StarMatcher AI analysis layer |
| Hosting | Vercel | Your likely default |

---

## 7. Data Model

All 88 IAU constellations stored in `src/data/constellations.ts` as a static TypeScript array. No database required for MVP.

```ts
// src/types/constellation.ts

export interface Star {
  name: string
  x: number        // normalized 0–1 (left→right within constellation's bounding box)
  y: number        // normalized 0–1 (top→bottom)
  magnitude?: number  // apparent magnitude; lower = brighter
  isNamed?: boolean   // show label in UI
}

export interface ConstellationLine {
  from: number     // index into stars[]
  to: number       // index into stars[]
}

export type Hemisphere = 'north' | 'south' | 'both'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'year-round'
export type Family = 
  | 'ursa-major' | 'perseus' | 'orion' | 'heavenly-waters'
  | 'hercules' | 'zodiac' | 'bayer' | 'lacaille' | 'ptolemy'

export interface Constellation {
  id: string                // slug e.g. "orion"
  name: string              // "Orion"
  abbreviation: string      // "Ori"
  hemisphere: Hemisphere
  season: Season
  bestMonth: number         // 1–12, peak visibility month
  area: number              // square degrees (IAU official)
  mythology: string         // 1–3 sentence lore blurb
  stars: Star[]
  lines: ConstellationLine[]
  isZodiac?: boolean
  family?: Family
  tags?: string[]           // ['prominent', 'circumpolar', 'southern-cross', etc.]
}
```

---

## 8. Component Architecture

```
src/
├── app/
│   ├── page.tsx                    # Root: renders <ConstellationApp />
│   ├── layout.tsx                  # Fonts, metadata, providers
│   └── globals.css                 # CSS variables, base reset
│
├── components/
│   ├── ConstellationBrowser.tsx    # Main browser: canvas + prev/next + info panel
│   ├── ConstellationCanvas.tsx     # SVG renderer for a single constellation
│   ├── ConstellationCard.tsx       # Compact card for sidebar list
│   ├── Sidebar.tsx                 # Sorted/filtered constellation list
│   ├── StarMatcher.tsx             # Dot-placement tool + results
│   ├── MatchResult.tsx             # Single match result with overlay SVG
│   └── SortControls.tsx            # Sort/filter dropdown controls
│
├── data/
│   └── constellations.ts           # All 88 constellation data objects
│
├── types/
│   └── constellation.ts            # TypeScript interfaces (above)
│
├── lib/
│   ├── matchConstellation.ts       # Geometric matching algorithm
│   ├── normalizePoints.ts          # Point normalization utilities
│   └── claudeMatch.ts             # Claude API call for AI analysis
│
└── store/
    └── useConstellationStore.ts    # Zustand store
```

---

## 9. MVP Scope (v1.0)

**In:**
- All 88 constellations with SVG rendering
- Browser with arrow/swipe navigation
- Sidebar with A–Z, hemisphere, season sorting
- StarMatcher with geometric matching (top 5 results)
- Mobile responsive layout
- URL sharing for constellation views

**Out (v2.0+):**
- Claude AI narrative match explanation
- Actual sky position (real-time RA/Dec integration)
- User accounts / saved favorites
- Augmented reality overlay
- Constellation family tree view
- Quiz/learning mode

---

## 10. Design Tokens

```css
--color-space:      #070b14;   /* deep space background */
--color-canvas:     #0d1220;   /* slightly lighter panels */
--color-star:       #e8e4d9;   /* cream-white for stars */
--color-line:       rgba(180, 210, 255, 0.25); /* faint constellation lines */
--color-accent:     #b8a9e0;   /* soft purple accent */
--color-text:       #c8d4e8;   /* pale blue-white text */
--color-muted:      #5a6a80;   /* secondary text */
--color-highlight:  #f0c96a;   /* gold for selected/active */
--font-display:     'Cinzel', serif;
--font-mono:        'Space Mono', monospace;
--font-body:        'Inter', sans-serif;
```

---

## 11. Non-Functional Requirements

- First contentful paint < 1.5s (static data, no API calls on load)
- SVG constellation renders in < 16ms (no heavy libraries)
- StarMatcher geometric match completes in < 100ms for all 88 constellations
- Mobile-first: all interactions work on 375px viewport with touch
- Accessibility: keyboard navigation throughout browser, ARIA labels on SVGs

---

## 12. Open Questions

1. Should StarMatcher support reflection/flip matching (user drew it mirrored)? → Yes, try horizontal flip in the rotation search
2. What's the minimum dot count to trigger a match? → Recommend 3 minimum, warn below 3
3. Should constellation SVG include the mythological figure outline (like Stellarium's art layer)? → v2 feature
4. Do we pull live star data from an API (HYG catalog) or keep static? → Static for MVP; HYG integration in v2
