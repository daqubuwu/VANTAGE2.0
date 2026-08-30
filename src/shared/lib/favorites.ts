import { useSyncExternalStore } from 'react'

export interface FavoriteAccount {
  accountId: number
  name: string
  avatar: string | null
}

const KEY = 'vantage:favorites'
const EVENT = 'vantage:favorites-changed'

function read(): FavoriteAccount[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is FavoriteAccount =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as FavoriteAccount).accountId === 'number',
    )
  } catch {
    return []
  }
}

function write(list: FavoriteAccount[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
    window.dispatchEvent(new Event(EVENT))
  } catch {
    // localStorage unavailable - favorites simply won't persist
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

let cache: FavoriteAccount[] = read()

function getSnapshot() {
  return cache
}

export function useFavorites() {
  const favorites = useSyncExternalStore(
    (callback) =>
      subscribe(() => {
        cache = read()
        callback()
      }),
    getSnapshot,
    () => [],
  )

  function isFavorite(accountId: number) {
    return favorites.some((item) => item.accountId === accountId)
  }

  function toggle(account: FavoriteAccount) {
    const list = read()
    const exists = list.some((item) => item.accountId === account.accountId)
    const next = exists
      ? list.filter((item) => item.accountId !== account.accountId)
      : [...list, account]
    cache = next
    write(next)
  }

  function remove(accountId: number) {
    const next = read().filter((item) => item.accountId !== accountId)
    cache = next
    write(next)
  }

  return { favorites, isFavorite, toggle, remove }
}
