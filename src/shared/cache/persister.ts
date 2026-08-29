import { get, set, del, createStore } from 'idb-keyval'
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client'

const store = createStore('vantage', 'query-cache')
const KEY = 'react-query'

export function createIdbPersister(): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      await set(KEY, client, store)
    },
    restoreClient: async () => {
      return get<PersistedClient>(KEY, store)
    },
    removeClient: async () => {
      await del(KEY, store)
    },
  }
}
