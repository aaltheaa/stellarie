# Stellarie

Stellarie is a small Next.js/TypeScript starter project used for experimentation and demos. It includes app configuration, TypeScript setup, and an example `src/` app directory.

## Features

- Next.js with TypeScript
- Project scaffold and basic configs

## Getting Started

Prerequisites:

- Node.js 18+ and npm

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm run start
```

## Project Structure

- `src/` — application source
- `next.config.ts` — Next.js config
- `tsconfig.json` — TypeScript config
- `PRD.md` — product notes / roadmap

## Project Mission & Value Proposition

Stellarie helps people discover and identify constellations quickly and visually. It combines a browsable, illustrated directory of the 88 IAU constellations with a lightweight, client-side pattern-matching tool (StarMatcher) so users can draw star patterns and find likely constellation matches instantly. The product is valuable for hobbyist astronomers, students, and casual stargazers who want a fast, delightful way to learn the night sky.

Key values:

- Fast and local-first: geometric matching runs in the browser with no external services required for the core feature.
- Clear, educational visuals: consistent SVG rendering for all constellations, with easy-to-read labels and legend.
- Privacy-first AI augmentation: optional natural-language analysis via Claude/Anthropic is gated behind an API key and never required.

## Features (Detailed)

- Constellation Browser: swipeable, keyboard-accessible gallery of all 88 constellations with metadata (hemisphere, best month, notable stars).
- StarMatcher: interactive canvas for placing dots, greedy geometric matching across all constellations with rotation + optional flip, overlay previews, and ranked confidence.
- Lightweight static data: all constellation geometry lives in `src/data/constellations.ts` (no database required for MVP).
- Optional AI analysis: send top matches and dot positions to Claude for a narrative explanation (requires `ANTHROPIC_API_KEY`).

## How It Works (Technical Overview)

- Data: each constellation is a typed object with normalized star coordinates (0–1), lines that connect stars for the SVG, and metadata.
- Matching algorithm: see `src/lib/matchConstellation.ts`.
	- Normalize user dots and constellation star positions by centroid and RMS scale.
	- Try a fixed set of rotations (24 steps → every 15°) and an optional horizontal flip.
	- For each transform, perform a greedy nearest-neighbor matching from user dots to constellation stars and compute an average distance.
	- Score matches by inverse average distance and apply a penalty for unmatched extra stars.
	- Return the top N matches and overlay positions for visualization.

## Local Development

Prerequisites:

- Node.js 18+ and npm

Install and run locally:

```bash
cd stellarie
npm install
npm run dev
# open http://localhost:3000
```

Type-check:

```bash
npm run type-check
```

Build for production:

```bash
npm run build
npm run start
```

## Environment & Secrets

- The optional AI analysis endpoint uses Claude/Anthropic. To enable it, set `ANTHROPIC_API_KEY` in your environment (do not commit keys).
- Important: Do not commit any dotfiles containing secrets (`.env`, `.env.local`, etc.). This repository is configured to keep those files untracked. If any sensitive file was committed earlier, contact collaborators and rotate the secret.

## Testing the StarMatcher

1. Run the app locally: `npm run dev`.
2. Click the `StarMatcher` button, place 3–8 dots roughly matching a constellation shape, and press `Match`.
3. Inspect the top results and click to view the matched constellation.

## CI / Deployment Suggestions

- Add a GitHub Actions workflow to run `npm ci`, `npm run type-check`, and `npm run build` on PRs and `main`. Keep secrets like `ANTHROPIC_API_KEY` in GitHub Actions secrets.
- Deploy to Vercel for automatic Next.js hosting.

## License

This repository is unlicensed by default. Add a `LICENSE` file (MIT or Apache-2.0) if you want to allow reuse.

---

If you'd like, I can: add a `LICENSE`, add a CI workflow, or extract and document the design-agent's Claude session notes into a `design/` folder. Which should I do next?

## Contributing

1. Create an issue or discussion for planned changes.
2. Open a branch for your work.
3. Send a pull request with a descriptive title and tests if applicable.

## License

This repository currently has no license. Add one if you want to allow reuse.

---

If you'd like, I can add a `LICENSE` file (MIT/Apache), a basic GitHub Actions workflow, or update `PRD.md` into a proper README section. Which would you prefer next?
