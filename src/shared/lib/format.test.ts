import { describe, it, expect } from 'vitest'
import { num, dec, pct, compact, signed, mmss, duration, ago, kda, plural } from './format'

describe('format', () => {
  it('форматирует целые числа по русской локали', () => {
    expect(num(1234567)).toBe('1 234 567'.replace(/ /g, ' '))
    expect(num(null)).toBe('—')
    expect(num(NaN)).toBe('—')
  })

  it('дробные числа с запятой', () => {
    expect(dec(3.456, 2)).toBe('3,46')
    expect(dec(undefined)).toBe('—')
  })

  it('проценты', () => {
    expect(pct(0.5231)).toBe('52,3%')
    expect(pct(null)).toBe('—')
  })

  it('компактная запись тысяч', () => {
    expect(compact(999)).toBe('999')
    expect(compact(15400)).toBe('15,4k')
  })

  it('знак у отклонений', () => {
    expect(signed(120)).toBe('+120')
    expect(signed(-40)).toBe('-40')
  })

  it('время матча', () => {
    expect(mmss(0)).toBe('0:00')
    expect(mmss(605)).toBe('10:05')
    expect(mmss(-90)).toBe('-1:30')
    expect(duration(3725)).toBe('1:02:05')
    expect(duration(605)).toBe('10:05')
  })

  it('относительное время с русскими окончаниями', () => {
    const now = 1_700_000_000_000
    expect(ago(now / 1000 - 10, now)).toBe('только что')
    expect(ago(now / 1000 - 120, now)).toBe('2 минуты назад')
    expect(ago(now / 1000 - 3600 * 5, now)).toBe('5 часов назад')
    expect(ago(now / 1000 - 86400, now)).toBe('1 день назад')
    expect(ago(undefined, now)).toBe('—')
  })

  it('склонения', () => {
    expect(plural(1, 'матч', 'матча', 'матчей')).toBe('матч')
    expect(plural(3, 'матч', 'матча', 'матчей')).toBe('матча')
    expect(plural(11, 'матч', 'матча', 'матчей')).toBe('матчей')
  })

  it('kda не делит на ноль', () => {
    expect(kda(5, 0, 5)).toBe(10)
    expect(kda(4, 2, 6)).toBe(5)
  })
})
