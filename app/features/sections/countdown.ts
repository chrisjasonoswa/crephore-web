import type { SectionOccasion } from './section.type'
import { computed, onBeforeUnmount, onMounted, ref, toValue, type MaybeRefOrGetter } from 'vue'

// The countdown sections' time maths and date formats. The target is the occasion's start (a UTC instant),
// so the countdown is right wherever the guest is; dates are shown in the occasion's timezone.

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
  // The occasion has started (everything is 0)
  done: boolean
}

/** What's left until `target` (ISO) at `now` (ms), never negative. */
export function countdownParts(target: string, now: number): CountdownParts {
  const remaining = Math.max(0, new Date(target).getTime() - now)
  return {
    days: Math.floor(remaining / DAY),
    hours: Math.floor((remaining % DAY) / HOUR),
    minutes: Math.floor((remaining % HOUR) / MINUTE),
    seconds: Math.floor((remaining % MINUTE) / SECOND),
    done: remaining === 0,
  }
}

export type CountdownUnitKey = 'days' | 'hours' | 'minutes' | 'seconds'

export interface CountdownUnit {
  key: CountdownUnitKey
  // "Days" (plural; layouts writing it in a sentence use `singular` for 1)
  label: string
  singular: string
  // null until the page is in the browser (see useCountdown)
  value: number | null
  // As shown: days as they are ("112"), the rest two digits ("06"), "--" while unknown
  text: string
  // A full ring (progress rings): a year of days, a day of hours, …
  max: number
}

const unitDefinitions: { key: CountdownUnitKey, label: string, singular: string, max: number }[] = [
  { key: 'days', label: 'Days', singular: 'Day', max: 365 },
  { key: 'hours', label: 'Hours', singular: 'Hour', max: 24 },
  { key: 'minutes', label: 'Minutes', singular: 'Minute', max: 60 },
  { key: 'seconds', label: 'Seconds', singular: 'Second', max: 60 },
]

/** The units a countdown shows, in order (seconds only when on). */
export function countdownUnits(parts: CountdownParts | null, showSeconds: boolean): CountdownUnit[] {
  return unitDefinitions
    .filter(unit => showSeconds || unit.key !== 'seconds')
    .map((unit) => {
      const value = parts ? parts[unit.key] : null
      const text = value === null ? '--' : unit.key === 'days' ? String(value) : String(value).padStart(2, '0')
      return { ...unit, value, text }
    })
}

/**
 * A live countdown to the occasion, ticking every second. It starts once mounted: the server and the
 * browser can't agree on "now", so the first render (and server rendering) shows "--" instead of numbers.
 */
export function useCountdown(occasion: MaybeRefOrGetter<SectionOccasion>, showSeconds: MaybeRefOrGetter<boolean>) {
  const now = ref<number | null>(null)
  let timer: ReturnType<typeof setInterval> | undefined

  onMounted(() => {
    now.value = Date.now()
    timer = setInterval(() => (now.value = Date.now()), SECOND)
  })
  onBeforeUnmount(() => clearInterval(timer))

  const parts = computed(() => (now.value === null ? null : countdownParts(toValue(occasion).startsAt, now.value)))
  const units = computed(() => countdownUnits(parts.value, toValue(showSeconds)))

  return { parts, units }
}

/* Dates, in the occasion's timezone */

interface ZonedDate {
  year: number
  month: number // 1–12
  day: number
  weekday: string // "Sunday"
  monthName: string // "February"
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function zonedDate({ startsAt, timezone }: SectionOccasion): ZonedDate {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).formatToParts(new Date(startsAt))
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value ?? ''
  const month = Number(part('month'))

  return { year: Number(part('year')), month, day: Number(part('day')), weekday: part('weekday'), monthName: monthNames[month - 1]! }
}

/** "Sunday, 14 February 2027" (long) or "14 · 02 · 2027" (numeric). */
export function formatOccasionDate(occasion: SectionOccasion, style: 'long' | 'numeric' = 'long'): string {
  const date = zonedDate(occasion)
  if (style === 'numeric')
    return [String(date.day).padStart(2, '0'), String(date.month).padStart(2, '0'), date.year].join(' · ')
  return `${date.weekday}, ${date.day} ${date.monthName} ${date.year}`
}

export interface CalendarMonth {
  // "February 2027"
  title: string
  // Empty cells before the 1st (weeks start on Sunday)
  leadingBlanks: number
  daysInMonth: number
  // The occasion's day of the month
  day: number
}

/** The month page of the occasion's date, for the calendar layout. */
export function calendarMonth(occasion: SectionOccasion): CalendarMonth {
  const date = zonedDate(occasion)
  return {
    title: `${date.monthName} ${date.year}`,
    leadingBlanks: new Date(Date.UTC(date.year, date.month - 1, 1)).getUTCDay(),
    daysInMonth: new Date(Date.UTC(date.year, date.month, 0)).getUTCDate(),
    day: date.day,
  }
}

export const calendarWeekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
