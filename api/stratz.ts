export const config = { runtime: 'edge' }

const UPSTREAM = 'https://api.stratz.com/graphql'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ errors: [{ message: 'Only POST' }] }, 405)
  }

  const key = process.env.STRATZ_API_KEY
  if (!key) {
    return json({ errors: [{ message: 'STRATZ_API_KEY не задан на сервере' }] }, 500)
  }

  let body: string
  try {
    body = await request.text()
    const parsed = JSON.parse(body) as { query?: unknown }
    if (typeof parsed.query !== 'string') {
      return json({ errors: [{ message: 'Ожидается поле query' }] }, 400)
    }
    if (/\bmutation\b/i.test(parsed.query)) {
      return json({ errors: [{ message: 'Мутации запрещены' }] }, 400)
    }
  } catch {
    return json({ errors: [{ message: 'Некорректный JSON' }] }, 400)
  }

  const upstream = await fetch(UPSTREAM, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${key}`,
      'user-agent': 'STRATZ_API',
    },
    body,
  })

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, s-maxage=60, stale-while-revalidate=600',
    },
  })
}

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}
