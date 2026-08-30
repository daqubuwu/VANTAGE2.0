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

const PLAYER_ROLE_MATCHES_QUERY = `
  query PlayerRoleMatches($steamAccountId: Long!, $take: Int!, $startDateTime: Long) {
    player(steamAccountId: $steamAccountId) {
      matches(request: { take: $take, startDateTime: $startDateTime }) {
        id
        players(steamAccountId: $steamAccountId) {
          position
          isVictory
          goldPerMinute
          experiencePerMinute
          heroDamage
          kills
          deaths
          assists
        }
      }
    }
  }
`

interface PlayerRoleMatchesResult {
  player: {
    matches: {
      id: number | null
      players: {
        position: string | null
        isVictory: boolean | null
        goldPerMinute: number | null
        experiencePerMinute: number | null
        heroDamage: number | null
        kills: number | null
        deaths: number | null
        assists: number | null
      }[]
    }[]
  } | null
}

export async function stratzPlayerRoleMatches(accountId: number, take: number, startDateTime?: number) {
  const result = await stratz<PlayerRoleMatchesResult>(PLAYER_ROLE_MATCHES_QUERY, {
    steamAccountId: accountId,
    take,
    startDateTime,
  })
  const matches = result.player?.matches ?? []
  return matches.flatMap((match) => match.players.map((player) => ({ ...player, matchId: match.id })))
}
