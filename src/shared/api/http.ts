export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly url: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const RETRY_STATUS = new Set([429, 500, 502, 503, 504])

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getJson<T>(url: string, init?: RequestInit, attempt = 0): Promise<T> {
  const res = await fetch(url, { ...init, headers: { accept: 'application/json', ...init?.headers } })

  if (!res.ok) {
    if (RETRY_STATUS.has(res.status) && attempt < 3) {
      await delay(400 * 2 ** attempt)
      return getJson<T>(url, init, attempt + 1)
    }
    throw new ApiError(res.status, url, describe(res.status))
  }

  return res.json() as Promise<T>
}

function describe(status: number) {
  if (status === 404) return 'Данные не найдены'
  if (status === 429) return 'Слишком много запросов, попробуйте через минуту'
  if (status >= 500) return 'Источник данных не отвечает'
  return `Ошибка запроса (${status})`
}
