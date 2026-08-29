import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/shared/api/http'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 7 * 24 * 60 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status === 404) return false
        return failureCount < 2
      },
    },
  },
})
