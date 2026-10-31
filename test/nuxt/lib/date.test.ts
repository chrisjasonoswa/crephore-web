import { describe, expect, it } from 'vitest'
import { formatDateTimeRange, formatTimeZone, isOtherTimeZone, timeZoneOptions, toWallClock } from '~/lib/date'

// Event times and the viewer's timezone are passed explicitly, so the output doesn't depend on where the test runs.
describe('formatTimeZone', () => {
  it('names the city and its UTC offset', () => {
    expect(formatTimeZone('Asia/Manila', '2027-06-12T07:00:00Z')).toBe('Manila, GMT+8')
    expect(formatTimeZone('America/Los_Angeles', '2027-01-10T20:00:00Z')).toBe('Los Angeles, GMT-8')
  })

  it('uses the offset at that date (daylight saving)', () => {
    expect(formatTimeZone('America/New_York', '2027-01-10T15:00:00Z')).toBe('New York, GMT-5')
    expect(formatTimeZone('America/New_York', '2027-07-10T15:00:00Z')).toBe('New York, GMT-4')
  })

  it('shows UTC as UTC', () => {
    expect(formatTimeZone('UTC')).toBe('UTC')
  })
})

describe('isOtherTimeZone', () => {
  it('compares UTC offsets at that moment', () => {
    expect(isOtherTimeZone('Asia/Manila', 'Asia/Manila')).toBe(false)
    // Same clock (UTC+8), different city
    expect(isOtherTimeZone('Asia/Manila', 'Asia/Shanghai')).toBe(false)
    expect(isOtherTimeZone('Asia/Manila', 'America/New_York')).toBe(true)
  })

  it('is false while the viewer\'s timezone is unknown (e.g. on the server)', () => {
    expect(isOtherTimeZone('Asia/Manila', null)).toBe(false)
  })
})

describe('formatDateTimeRange', () => {
  it('formats the range in the given timezone', () => {
    expect(formatDateTimeRange('2027-06-12T07:00:00Z', '2027-06-12T08:00:00Z', 'Asia/Manila')).toMatch(/3:00.*4:00\sPM$/)
  })

  it('returns an empty string for an invalid date', () => {
    expect(formatDateTimeRange('not a date', '2027-06-12T08:00:00Z', 'Asia/Manila')).toBe('')
  })
})

describe('timeZoneOptions', () => {
  it('lists IANA timezones with their offsets', () => {
    expect(timeZoneOptions()).toContainEqual({ value: 'Asia/Manila', label: 'Asia/Manila (GMT+8)' })
  })
})

describe('toWallClock', () => {
  it('turns a UTC time into the wall-clock value in the timezone', () => {
    expect(toWallClock('2027-06-12T07:00:00Z', 'Asia/Manila')).toBe('2027-06-12T15:00')
    expect(toWallClock('2027-06-12T04:30:00Z', 'America/New_York')).toBe('2027-06-12T00:30')
  })

  it('returns an empty string for an invalid date', () => {
    expect(toWallClock('not a date', 'Asia/Manila')).toBe('')
  })
})
