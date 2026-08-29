import { aggregate } from './aggregate'
import { withinPeriod } from './period'
import type { PlayerAggregate } from './aggregate'
import type { PlayerMatch } from '@/shared/api/types'
import type { PeriodKey } from './period'

export interface AggregateRequest {
  id: number
  matches: PlayerMatch[]
  period: PeriodKey
}

export interface AggregateResponse {
  id: number
  stats: PlayerAggregate
}

self.onmessage = (event: MessageEvent<AggregateRequest>) => {
  const { id, matches, period } = event.data
  const stats = aggregate(withinPeriod(matches, period))
  const response: AggregateResponse = { id, stats }
  self.postMessage(response)
}
