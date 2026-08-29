import { describe, expect, it } from 'vitest'
import { findTurningPoints, valueAtMinute } from './timeline'

describe('valueAtMinute', () => {
  it('возвращает значение по индексу минуты, не выходя за границы массива', () => {
    expect(valueAtMinute([10, 20, 30], 1)).toBe(20)
    expect(valueAtMinute([10, 20, 30], 10)).toBe(30)
    expect(valueAtMinute(null, 1)).toBe(null)
  })
})

describe('findTurningPoints', () => {
  it('находит смену лидера, когда знак преимущества меняется', () => {
    const points = findTurningPoints([500, 300, -200, -800])
    expect(points.some((p) => p.kind === 'flip' && p.minute === 2)).toBe(true)
  })

  it('находит резкий отрыв без смены лидера', () => {
    const points = findTurningPoints([0, 500, 5000])
    expect(points.some((p) => p.kind === 'swing' && p.minute === 2)).toBe(true)
  })

  it('не считает мелкие колебания одного знака поворотным моментом', () => {
    const points = findTurningPoints([500, 600, 700])
    expect(points).toHaveLength(0)
  })
})
