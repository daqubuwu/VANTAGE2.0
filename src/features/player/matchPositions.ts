import type { StratzRoleMatch } from '@/shared/api/types'
import { positionToRole, ROLES } from './roles'
import type { RoleKey } from './roles'

export interface MatchPosition {
  role: RoleKey
  number: number | null
  label: string
}

function positionNumber(position: string | null) {
  if (!position) return null
  const match = /POSITION_(\d)/.exec(position)
  return match ? Number(match[1]) : null
}

const ROLE_LABEL = new Map(ROLES.map((role) => [role.key, role.label]))

export function buildMatchPositions(rows: StratzRoleMatch[] | undefined): Map<number, MatchPosition> {
  const map = new Map<number, MatchPosition>()
  if (!rows) return map
  for (const row of rows) {
    if (row.matchId === null) continue
    const role = positionToRole(row.position)
    if (!role) continue
    map.set(row.matchId, { role, number: positionNumber(row.position), label: ROLE_LABEL.get(role) ?? role })
  }
  return map
}
