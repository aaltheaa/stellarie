// src/app/layout.tsx
import type { Metadata } from 'next'
import { Cinzel, Space_Mono, Crimson_Pro } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel-var',
  display: 'swap',
  weight: ['400', '600', '700'],
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-mono-var',
  display: 'swap',
  weight: ['400', '700'],
})

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-body-var',
  display: 'swap',
  weight: ['400', '600'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Stellarie — Constellation Directory',
  description: 'Browse all 88 IAU constellations and identify star patterns with the StarMatcher tool.',
  keywords: ['constellations', 'astronomy', 'stars', 'stellarium', 'night sky'],
  openGraph: {
    title: 'Stellarie',
    description: 'A modern constellation directory with pattern-matching.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cinzel.variable} ${spaceMono.variable} ${crimsonPro.variable}`}>
      <body className="star-noise">
        {children}
      </body>
    </html>
  )
}
