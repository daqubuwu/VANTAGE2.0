import { Navigate } from 'react-router-dom'
import { DEFAULT_STEAM_ID } from '@/shared/lib/config'

export function HomePage() {
  return <Navigate to={`/player/${DEFAULT_STEAM_ID}`} replace />
}
