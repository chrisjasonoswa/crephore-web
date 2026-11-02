import type { SectionBackground, SectionOccasion } from '../section.type'
import type { ProgramItem } from './program.type'

// Times, days and numbering for the program layouts, and what the editor offers.

// Enough for a long conference day; more would make the page very long
export const programMaxItems = 40

export function blankProgramItem(date: string): ProgramItem {
  return { id: crypto.randomUUID(), date, title: '' }
}

/** Whether a layout shows times (`showTime`, on unless hidden). */
export const showsTime = (options: Record<string, string>) => options.showTime !== 'hide'

/** "15:00" → "3:00 PM"; empty for no time. */
export function formatProgramTime(time?: string): string {
  const parts = programTimeParts(time)
  return parts ? `${parts.clock} ${parts.period}` : ''
}

/** "15:00" → { clock: "3:00", period: "PM" }, for layouts that set the time large; null for no time. */
export function programTimeParts(time?: string): { clock: string, period: string } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time ?? '')
  if (!match)
    return null
  const hours = Number(match[1])
  return { clock: `${hours % 12 || 12}:${match[2]}`, period: hours < 12 ? 'AM' : 'PM' }
}

/** "3:00 PM – 4:00 PM", or just the start; empty without a start. */
export function formatProgramTimeRange(item: Pick<ProgramItem, 'startTime' | 'endTime'>): string {
  const start = formatProgramTime(item.startTime)
  const end = formatProgramTime(item.endTime)
  return start && end ? `${start} – ${end}` : start
}

/** 1 → "01", for layouts that number untimed items. */
export const programNumber = (index: number) => String(index + 1).padStart(2, '0')

/**
 * What a layout that sets the time large (big times, poster, tickets) puts in the time's place: the time, or the item's
 * number when times are hidden or the item has none.
 */
export function programMarker(item: ProgramItem, index: number, timed: boolean): { clock: string, period: string } {
  const time = timed ? programTimeParts(item.startTime) : null
  return time ?? { clock: programNumber(index), period: '' }
}

/** "Ana Lim, Paolo Tan" → ["Ana Lim", "Paolo Tan"]. */
export function programSpeakers(speakers?: string): string[] {
  return (speakers ?? '').split(',').map(name => name.trim()).filter(Boolean)
}

/** The speakers as a phrase: "Ana Lim", "Ana Lim & Paolo Tan", "Ana Lim, Paolo Tan & Rina Cruz"; empty without any. */
export function joinProgramSpeakers(speakers?: string): string {
  const names = programSpeakers(speakers)
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} & ${names.at(-1)}` : names[0] ?? ''
}

/** 4 → "IV" (the printed programme's numbering). */
export function romanNumeral(value: number): string {
  const numerals: [number, string][] = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]
  let rest = value
  return numerals.reduce((text, [amount, numeral]) => {
    while (rest >= amount) {
      text += numeral
      rest -= amount
    }
    return text
  }, '')
}

/** The occasion's calendar date in its timezone, "2027-02-14". */
export function occasionDate(occasion: SectionOccasion): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: occasion.timezone, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date(occasion.startsAt))
}

/** "2027-02-14" + days → "2027-02-15". */
export function addDays(date: string, days: number): string {
  const day = new Date(`${date}T12:00:00Z`)
  day.setUTCDate(day.getUTCDate() + days)
  return day.toISOString().slice(0, 10)
}

/** "2027-02-15" → "Mon, 15 Feb" (or "Monday, 15 February" when long). */
export function formatProgramDate(date: string, style: 'short' | 'long' = 'short'): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: style,
    day: 'numeric',
    month: style,
  }).format(new Date(`${date}T12:00:00Z`)).replace(/^(\w+) /, '$1, ')
}

/** "2027-02-15" → { day: "15", month: "Feb", weekday: "Mon" } (the agenda's date badge, the date-led layouts' big dates). */
export function programDateBadge(date: string): { day: string, month: string, weekday: string } {
  const day = new Date(`${date}T12:00:00Z`)
  const part = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...options }).format(day)
  return { day: String(day.getUTCDate()), month: part({ month: 'short' }), weekday: part({ weekday: 'short' }) }
}

/**
 * The month (or months) the dates fall in, for the badge beside a date-led layout's heading: "June 2027",
 * "June – July 2027", "December 2027 – January 2028" (or "Jun 2027", … when short). Empty without dates.
 */
export function programMonthLabel(dates: string[], style: 'long' | 'short' = 'long'): string {
  if (!dates.length)
    return ''
  const [first, last] = [dates[0]!, dates.at(-1)!].map(date => new Date(`${date}T12:00:00Z`)) as [Date, Date]
  const month = (date: Date, withYear: boolean) =>
    new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', month: style, ...(withYear && { year: 'numeric' }) }).format(date)
  if (first.getUTCFullYear() !== last.getUTCFullYear())
    return `${month(first, true)} – ${month(last, true)}`
  return first.getUTCMonth() === last.getUTCMonth() ? month(first, true) : `${month(first, false)} – ${month(last, true)}`
}

/**
 * The two colours the date-led layouts (date blocks, tab cards) alternate between, chosen so neither is the
 * section's own: the accent and the primary on light, the accent and light on primary (and photo), the primary and
 * light on accent. Pass the resolved background (`resolveBackground`).
 */
export function programBlockColours(background: SectionBackground): [SectionBackground, SectionBackground] {
  if (background === 'accent')
    return ['primary', 'light']
  return background === 'light' ? ['accent', 'primary'] : ['accent', 'light']
}

export interface ProgramDay {
  date: string
  // The date alone, "Mon, 15 Feb" (never "Next day": the date says it)
  label: string
  // The day's items with their place in the whole program (for numbering)
  items: { item: ProgramItem, index: number }[]
}

/**
 * The items grouped into days, in the host's order: a new day starts wherever the date changes. Items without a date
 * belong to the event's day. Layouts show each day's date before its items.
 */
export function programDays(items: ProgramItem[], occasion: SectionOccasion, style: 'short' | 'long' = 'short'): ProgramDay[] {
  const eventDate = occasionDate(occasion)
  const days: ProgramDay[] = []
  items.forEach((item, index) => {
    const date = item.date || eventDate
    const last = days.at(-1)
    if (last?.date === date) {
      last.items.push({ item, index })
      return
    }
    days.push({ date, label: formatProgramDate(date, style), items: [{ item, index }] })
  })
  return days
}

export interface ProgramBlock {
  key: string
  date: string
  // The day's date ("Mon, 15 Feb") and its place in the program (1 for the first day: "Day 1")
  label: string
  dayNumber: number
  // The day's first block, which carries the day's (screen-reader) heading
  firstOfDay: boolean
  items: { item: ProgramItem, index: number }[]
}

/**
 * The blocks of the date-led layouts (date blocks, photo cards, tab cards): one per item (`perItem`, each showing its
 * date), or one per day with that day's items.
 */
export function programBlocks(days: ProgramDay[], perItem: boolean): ProgramBlock[] {
  return days.flatMap((day, dayIndex) => perItem
    ? day.items.map((entry, i) => ({ key: entry.item.id, date: day.date, label: day.label, dayNumber: dayIndex + 1, firstOfDay: i === 0, items: [entry] }))
    : [{ key: day.date, date: day.date, label: day.label, dayNumber: dayIndex + 1, firstOfDay: true, items: day.items }])
}

/** The days an item can be on: from the event's first to its last day, and the day after (an after-party). */
export function programDayChoices(startsAt: string, endsAt: string, timezone: string): { value: string, label: string }[] {
  const first = occasionDate({ startsAt, timezone })
  const last = occasionDate({ startsAt: endsAt, timezone })
  const choices: { value: string, label: string }[] = []
  for (let date = first, day = 0; date <= addDays(last, 1) && day < 31; date = addDays(date, 1), day++) {
    const formatted = formatProgramDate(date)
    choices.push({ value: date, label: date === first ? `Event day · ${formatted}` : date === addDays(first, 1) ? `Next day · ${formatted}` : formatted })
  }
  return choices
}

/**
 * The sample program a new section starts with. Without a date (the registry's default content) every item is on the
 * event's day; with the event's date the after-party moves to the next day.
 */
export function sampleProgramItems(eventDate = ''): ProgramItem[] {
  const next = eventDate ? addDays(eventDate, 1) : ''
  return [
    { id: 'sample-1', date: eventDate, startTime: '15:00', endTime: '16:00', title: 'Ceremony', venue: 'Manila Cathedral', description: 'Please be seated by 2:45.' },
    { id: 'sample-2', date: eventDate, startTime: '18:00', endTime: '19:00', title: 'Cocktails', venue: 'The Manila Hotel', description: 'Drinks and canapés by the pool.' },
    { id: 'sample-3', date: eventDate, startTime: '19:00', title: 'Dinner & toasts', venue: 'Grand Ballroom', speakers: 'Tita Lorna, Migs Cruz' },
    { id: 'sample-4', date: eventDate, startTime: '20:30', title: 'First dance', venue: 'Grand Ballroom' },
    { id: 'sample-5', date: eventDate, startTime: '21:00', endTime: '00:00', title: 'Party', venue: 'Grand Ballroom', description: 'Dance the night away.' },
    { id: 'sample-6', date: next, startTime: '00:30', title: 'After-party', venue: 'Poolside Bar', description: 'For the night owls.' },
  ]
}
