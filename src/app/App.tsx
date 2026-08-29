import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './Layout'
import { HomePage } from '@/pages/HomePage'
import { PlayerPage } from '@/pages/PlayerPage'
import { MatchPage } from '@/pages/MatchPage'
import { HeroesPage } from '@/pages/HeroesPage'
import { HeroPage } from '@/pages/HeroPage'
import { TeamPage } from '@/pages/TeamPage'
import { EsportsPage } from '@/pages/EsportsPage'
import { ComparePage } from '@/pages/ComparePage'
import { DraftPage } from '@/pages/DraftPage'
import { SearchPage } from '@/pages/SearchPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/player/:id" element={<PlayerPage />} />
        <Route path="/match/:id" element={<MatchPage />} />
        <Route path="/heroes" element={<HeroesPage />} />
        <Route path="/heroes/:id" element={<HeroPage />} />
        <Route path="/team/:id" element={<TeamPage />} />
        <Route path="/esports" element={<EsportsPage />} />
        <Route path="/draft" element={<DraftPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/compare/:a/:b" element={<ComparePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/search/:q" element={<SearchPage />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
