import { describe, expect, it } from 'vitest'
import { formatLifeDates } from '~/features/sections/hero/hero.helpers'

describe('formatLifeDates', () => {
  it('writes the dates of birth and passing in full or as years', () => {
    const dates = { bornOn: '1938-05-01', diedOn: '2026-10-03' }

    expect(formatLifeDates(dates, 'full')).toBe('1 May 1938 – 3 October 2026')
    expect(formatLifeDates(dates, 'years')).toBe('1938 – 2026')
  })

  it('reads the dates as calendar days, so no timezone moves them', () => {
    expect(formatLifeDates({ bornOn: '1938-01-01', diedOn: '2026-12-31' }, 'full')).toBe('1 January 1938 – 31 December 2026')
  })

  it('needs both dates', () => {
    expect(formatLifeDates({ bornOn: '1938-05-01' }, 'years')).toBeUndefined()
    expect(formatLifeDates({ diedOn: '2026-10-03' }, 'full')).toBeUndefined()
    expect(formatLifeDates({}, 'years')).toBeUndefined()
  })
})
