// src/app/page.tsx
import ConstellationBrowser from '@/components/ConstellationBrowser'
import TopBar from '@/components/Sidebar'
import StarMatcher from '@/components/StarMatcher'

export default function Home() {
  return (
    <main style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <TopBar />
      <ConstellationBrowser />
      <StarMatcher />
    </main>
  )
}
