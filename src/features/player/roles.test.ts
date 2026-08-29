import { describe, expect, it } from 'vitest'
import { aggregateByRole, positionToRole } from './roles'
import type { StratzRoleMatch } from '@/shared/api/types'

function make(partial: Partial<StratzRoleMatch>): StratzRoleMatch {
  return {
    position: 'POSITION_1',
    isVictory: true,
    goldPerMinute: 500,
    experiencePerMinute: 600,
    heroDamage: 20000,
    kills: 5,
    deaths: 5,
    assists: 10,
    ...partial,
  }
}

describe('positionToRole', () => {
  it('4 и 5 позиции обе идут в поддержку', () => {
    expect(positionToRole('POSITION_4')).toBe('support')
    expect(positionToRole('POSITION_5')).toBe('support')
  })

  it('неизвестная или отсутствующая позиция не попадает ни в одну роль', () => {
    expect(positionToRole('UNKNOWN')).toBe(null)
    expect(positionToRole(null)).toBe(null)
  })
})

describe('aggregateByRole', () => {
  it('раскладывает матчи по ролям и считает средние отдельно', () => {
    const rows = [
      make({ position: 'POSITION_1', goldPerMinute: 600 }),
      make({ position: 'POSITION_1', goldPerMinute: 400 }),
      make({ position: 'POSITION_5', goldPerMinute: 200, isVictory: false }),
    ]
    const byRole = aggregateByRole(rows)

    expect(byRole.safe.games).toBe(2)
    expect(byRole.safe.avgGpm).toBe(500)
    expect(byRole.support.games).toBe(1)
    expect(byRole.support.winrate).toBe(0)
    expect(byRole.mid.games).toBe(0)
    expect(byRole.mid.avgGpm).toBe(null)
  })
})
