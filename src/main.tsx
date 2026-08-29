import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { defaultShouldDehydrateQuery } from '@tanstack/react-query'
import { queryClient } from './app/queryClient'
import { createIdbPersister } from './shared/cache/persister'
import { App } from './app/App'
import './styles/tokens.css'

const container = document.getElementById('root')
if (!container) throw new Error('Не найден корневой элемент')

createRoot(container).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: createIdbPersister(),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        buster: 'v2',
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            defaultShouldDehydrateQuery(query) && query.meta?.persist !== false,
        },
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PersistQueryClientProvider>
  </StrictMode>,
)
