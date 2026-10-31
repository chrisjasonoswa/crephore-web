// Dates come from the API as ISO strings in UTC.
// Event times are always shown in the event's own timezone, e.g. "Jun 12, 2027, 3:00 PM", through CDateTime,
// which adds a muted "(Manila, GMT+8)" only when the viewer's timezone differs.
// The viewer's timezone is only known in the browser: on server-rendered pages pass null until mounted
// (the label then appears after hydration), so the server and browser render the same.

const dateTimeOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
}

const toDate = (isoString: string) => {
  const date = new Date(isoString)
  return Number.isNaN(date.getTime()) ? null : date
}

// e.g. "Jun 12, 2027, 3:00 PM" (viewer's locale); in `timeZone` when given, else the viewer's
export function formatDateTime(isoString: string, timeZone?: string): string {
  const date = toDate(isoString)
  return date ? new Intl.DateTimeFormat(undefined, { ...dateTimeOptions, timeZone }).format(date) : ''
}

// e.g. "Manila, GMT+8": the IANA id's city plus its UTC offset at `isoString`
// (the offset can change during the year with daylight saving). Shown muted after event times by CDateTime.
export function formatTimeZone(timeZone: string, isoString?: string): string {
  if (timeZone === 'UTC' || timeZone === 'Etc/UTC')
    return 'UTC'
  const date = (isoString && toDate(isoString)) || new Date()
  const offset = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
    .formatToParts(date)
    .find(part => part.type === 'timeZoneName')
    ?.value
  const city = timeZone.split('/').at(-1)!.replace(/_/g, ' ')
  return offset ? `${city}, ${offset}` : city
}

const utcOffset = (timeZone: string, date: Date) =>
  new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(date)
    .find(part => part.type === 'timeZoneName')
    ?.value

// Whether a viewer in `viewerTimeZone` reads a different clock than the event at `isoString`.
// Compared by UTC offset, so e.g. Asia/Manila and Asia/Shanghai (both UTC+8) count as the same.
// False while the viewer's timezone is unknown (null, e.g. on the server).
export function isOtherTimeZone(timeZone: string, viewerTimeZone: string | null, isoString?: string): boolean {
  if (!viewerTimeZone)
    return false
  const date = (isoString && toDate(isoString)) || new Date()
  return utcOffset(timeZone, date) !== utcOffset(viewerTimeZone, date)
}

// e.g. "Jun 12, 2027, 3:00 – 4:00 PM" (viewer's locale) in `timeZone`
export function formatDateTimeRange(startIso: string, endIso: string, timeZone?: string): string {
  const start = toDate(startIso)
  const end = toDate(endIso)
  return start && end ? new Intl.DateTimeFormat(undefined, { ...dateTimeOptions, timeZone }).formatRange(start, end) : ''
}

// A UTC ISO string → the wall-clock value in `timeZone` ("2027-06-12T15:00"), for editing an event's times
export function toWallClock(isoString: string, timeZone: string): string {
  const date = toDate(isoString)
  if (!date)
    return ''
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date).map(part => [part.type, part.value]),
  )
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
}

// The viewer's IANA timezone, e.g. "Asia/Manila" (the default for new events)
export function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

// Every IANA timezone the browser knows, labelled e.g. "Asia/Manila (GMT+8)"
export function timeZoneOptions(): { value: string, label: string }[] {
  const zones = Intl.supportedValuesOf('timeZone')
  if (!zones.includes('UTC'))
    zones.push('UTC')

  return zones.map((zone) => {
    const offset = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'shortOffset' })
      .formatToParts(new Date())
      .find(part => part.type === 'timeZoneName')
      ?.value
    return { value: zone, label: offset ? `${zone.replace(/_/g, ' ')} (${offset})` : zone }
  })
}
