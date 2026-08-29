import { getJson } from './http'

const ENDPOINT = '/api/stratz'

export interface GraphqlResult<T> {
  data?: T
  errors?: { message: string }[]
}

export async function stratz<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const result = await getJson<GraphqlResult<T>>(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })

  if (result.errors?.length) {
    throw new Error(result.errors.map((e) => e.message).join('; '))
  }
  if (!result.data) {
    throw new Error('Stratz вернул пустой ответ')
  }
  return result.data
}

export async function stratzAvailable(): Promise<boolean> {
  try {
    await stratz<{ constants: { gameVersions: { id: number }[] } }>(
      '{ constants { gameVersions { id } } }',
    )
    return true
  } catch {
    return false
  }
}
