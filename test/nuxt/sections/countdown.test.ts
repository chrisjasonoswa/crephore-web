import { describe, expect, it } from 'vitest'
import { calendarMonth, countdownParts, countdownUnits, formatOccasionDate } from '~/features/sections/countdown'
import { sampleOccasion } from '~/features/sections/section.type'

const now = Date.parse('2026-10-27T00:00:00Z')

describe('countdownParts', () => {
  it('splits what is left into days, hours, minutes and seconds', () => {
    expect(countdownParts(sampleOccasion(now).startsAt, now)).toEqual({ days: 112, hours: 6, minutes: 45, seconds: 20, done: false })
  })

  it('stops at zero once the occasion has started', () => {
    expect(countdownParts('2026-10-26T00:00:00Z', now)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true })
  })
})

describe('countdownUnits', () => {
  const parts = { days: 112, hours: 6, minutes: 5, seconds: 0, done: false }

  it('shows days as they are and the rest with two digits', () => {
    expect(countdownUnits(parts, true).map(unit => [unit.label, unit.text])).toEqual([
      ['Days', '112'],
      ['Hours', '06'],
      ['Minutes', '05'],
      ['Seconds', '00'],
    ])
  })

  it('leaves out seconds when they are off', () => {
    expect(countdownUnits(parts, false).map(unit => unit.key)).toEqual(['days', 'hours', 'minutes'])
  })

  it('shows "--" before the countdown starts (server rendering)', () => {
    expect(countdownUnits(null, true).map(unit => unit.text)).toEqual(['--', '--', '--', '--'])
  })
})

describe('occasion dates', () => {
  // 13 Feb 16:30 UTC is already 14 Feb in Manila (GMT+8)
  const occasion = { startsAt: '2027-02-13T16:30:00Z', timezone: 'Asia/Manila' }

  it('formats the date in the occasion\'s timezone', () => {
    expect(formatOccasionDate(occasion)).toBe('Sunday, 14 February 2027')
    expect(formatOccasionDate(occasion, 'numeric')).toBe('14 · 02 · 2027')
    expect(formatOccasionDate({ ...occasion, timezone: 'America/New_York' })).toBe('Saturday, 13 February 2027')
  })

  it('builds the calendar page of its month (weeks start on Sunday)', () => {
    // 1 February 2027 is a Monday
    expect(calendarMonth(occasion)).toEqual({ title: 'February 2027', leadingBlanks: 1, daysInMonth: 28, day: 14 })
  })
})
