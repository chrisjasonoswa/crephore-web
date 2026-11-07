import type { HeroLifeDates } from './hero.type'
import type { SectionOccasion } from '../section.type'

// "14 February 1948", read as a calendar day (no timezone shifts it)
const fullDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

/**
 * A memorial's life dates: "14 February 1948 – 3 October 2026" (`full`) or "1948 – 2026" (`years`). Undefined unless
 * the occasion has both dates.
 */
export function formatLifeDates(occasion: Pick<SectionOccasion, 'bornOn' | 'diedOn'>, style: HeroLifeDates): string | undefined {
  const { bornOn, diedOn } = occasion
  if (!bornOn || !diedOn)
    return undefined
  const format = (date: string) => (style === 'years' ? date.slice(0, 4) : fullDate.format(new Date(`${date}T00:00:00Z`)))
  return `${format(bornOn)} – ${format(diedOn)}`
}
