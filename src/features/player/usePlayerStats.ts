import { useEffect, useRef, useState } from 'react'
import { aggregate } from './aggregate'
import { withinPeriod } from './period'
import type { PlayerAggregate } from './aggregate'
import type { AggregateRequest, AggregateResponse } from './aggregate.worker'
import type { PlayerMatch } from '@/shared/api/types'
import type { PeriodKey } from './period'

const WORKER_THRESHOLD = 80

export function usePlayerStats(matches: PlayerMatch[], period: PeriodKey): PlayerAggregate {
  const workerRef = useRef<Worker | null>(null)
  const requestId = useRef(0)
  const useWorker = typeof Worker !== 'undefined' && matches.length >= WORKER_THRESHOLD
  const [stats, setStats] = useState<PlayerAggregate>(() => aggregate(withinPeriod(matches, period)))

  useEffect(() => {
    if (!useWorker) return
    const worker = new Worker(new URL('./aggregate.worker.ts', import.meta.url), { type: 'module' })
    workerRef.current = worker
    worker.onmessage = (event: MessageEvent<AggregateResponse>) => {
      if (event.data.id !== requestId.current) return
      setStats(event.data.stats)
    }
    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [useWorker])

  useEffect(() => {
    if (workerRef.current && useWorker) {
      requestId.current += 1
      const request: AggregateRequest = { id: requestId.current, matches, period }
      workerRef.current.postMessage(request)
      return
    }
    setStats(aggregate(withinPeriod(matches, period)))
  }, [matches, period, useWorker])

  return stats
}
