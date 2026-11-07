import { describe, expect, it } from 'vitest'
import { addDays, formatProgramDate, joinProgramSpeakers, formatProgramTime, formatProgramTimeRange, occasionDate, programBlockColours, programBlocks, programDateBadge, programDayChoices, programDays, programMarker, programMonthLabel, programNumber, programSpeakers, romanNumeral, sampleProgramItems, showsTime } from '~/features/sections/program/program.helpers'
import { createDefaultSection } from '~/features/sections/section.registry'

// 14 Feb 2027, 2 PM in Manila (06:00 UTC)
const occasion = { startsAt: '2027-02-14T06:00:00Z', timezone: 'Asia/Manila' }

describe('program helpers', () => {
  it('formats times in 12-hour clock, and ranges', () => {
    expect(formatProgramTime('15:00')).toBe('3:00 PM')
    expect(formatProgramTime('00:30')).toBe('12:30 AM')
    expect(formatProgramTime('12:05')).toBe('12:05 PM')
    expect(formatProgramTime(undefined)).toBe('')
    expect(formatProgramTimeRange({ startTime: '21:00', endTime: '00:00' })).toBe('9:00 PM – 12:00 AM')
    expect(formatProgramTimeRange({ startTime: '21:00' })).toBe('9:00 PM')
    expect(formatProgramTimeRange({ endTime: '21:00' })).toBe('')
  })

  it('shows times unless the layout hides them', () => {
    expect(showsTime({ showTime: 'show' })).toBe(true)
    expect(showsTime({})).toBe(true)
    expect(showsTime({ showTime: 'hide' })).toBe(false)
  })

  it('numbers items, with roman numerals for the printed programme', () => {
    expect(programNumber(0)).toBe('01')
    expect(programNumber(11)).toBe('12')
    expect([1, 4, 9, 14, 40, 2027].map(romanNumeral)).toEqual(['I', 'IV', 'IX', 'XIV', 'XL', 'MMXXVII'])
  })

  it('puts the time in the marker, or the number when times are hidden or the item has none', () => {
    expect(programMarker({ id: 'a', date: '', title: 'A', startTime: '15:00' }, 0, true)).toEqual({ clock: '3:00', period: 'PM' })
    expect(programMarker({ id: 'a', date: '', title: 'A', startTime: '15:00' }, 0, false)).toEqual({ clock: '01', period: '' })
    expect(programMarker({ id: 'a', date: '', title: 'A' }, 2, true)).toEqual({ clock: '03', period: '' })
  })

  it('splits speakers on commas, and joins them as a phrase', () => {
    expect(programSpeakers(' Ana Lim, Paolo Tan ,, ')).toEqual(['Ana Lim', 'Paolo Tan'])
    expect(programSpeakers(undefined)).toEqual([])
    expect(joinProgramSpeakers('Ana Lim')).toBe('Ana Lim')
    expect(joinProgramSpeakers('Ana Lim, Paolo Tan')).toBe('Ana Lim & Paolo Tan')
    expect(joinProgramSpeakers('Ana Lim, Paolo Tan, Rina Cruz')).toBe('Ana Lim, Paolo Tan & Rina Cruz')
    expect(joinProgramSpeakers('')).toBe('')
  })

  it('reads the occasion\'s date in its timezone and formats days', () => {
    expect(occasionDate(occasion)).toBe('2027-02-14')
    // 20:00 UTC is already the next day in Manila
    expect(occasionDate({ startsAt: '2027-02-14T20:00:00Z', timezone: 'Asia/Manila' })).toBe('2027-02-15')
    expect(addDays('2027-02-28', 1)).toBe('2027-03-01')
    expect(formatProgramDate('2027-02-15')).toBe('Mon, 15 Feb')
    expect(formatProgramDate('2027-02-15', 'long')).toBe('Monday, 15 February')
    expect(programDateBadge('2027-02-15')).toEqual({ day: '15', month: 'Feb', weekday: 'Mon' })
  })

  it('names the month (or months) the program falls in', () => {
    expect(programMonthLabel([])).toBe('')
    expect(programMonthLabel(['2027-06-20', '2027-06-21'])).toBe('June 2027')
    expect(programMonthLabel(['2027-06-30', '2027-07-01'])).toBe('June – July 2027')
    expect(programMonthLabel(['2027-12-31', '2028-01-01'])).toBe('December 2027 – January 2028')
    expect(programMonthLabel(['2027-06-30', '2027-07-01'], 'short')).toBe('Jun – Jul 2027')
  })

  it('makes a block per item, the first of each day carrying its heading, or a block per day', () => {
    const items = sampleProgramItems('2027-02-14')
    const days = programDays(items)

    const perItem = programBlocks(days, true)
    expect(perItem.map(block => [block.key, block.date, block.dayNumber, block.firstOfDay, block.items.length])).toEqual([
      ['sample-1', '2027-02-14', 1, true, 1],
      ['sample-2', '2027-02-14', 1, false, 1],
      ['sample-3', '2027-02-14', 1, false, 1],
      ['sample-4', '2027-02-14', 1, false, 1],
      ['sample-5', '2027-02-14', 1, false, 1],
      ['sample-6', '2027-02-15', 2, true, 1],
    ])
    expect(programBlocks(days, false).map(block => [block.label, block.items.length])).toEqual([['Sun, 14 Feb', 5], ['Mon, 15 Feb', 1]])
  })

  it('picks two block colours that differ from the section\'s', () => {
    expect(programBlockColours('light')).toEqual(['secondary', 'primary'])
    expect(programBlockColours('primary')).toEqual(['secondary', 'light'])
    expect(programBlockColours('photo')).toEqual(['secondary', 'light'])
    expect(programBlockColours('secondary')).toEqual(['primary', 'light'])
  })

  it('groups items into days where the date changes, in the host\'s order', () => {
    const days = programDays(sampleProgramItems('2027-02-14'))
    expect(days.map(day => day.label)).toEqual(['Sun, 14 Feb', 'Mon, 15 Feb'])
    expect(days[1]!.items.map(({ item, index }) => [item.title, index])).toEqual([['After-party', 5]])

    expect(programDays([
      { id: '1', date: '2027-02-16', title: 'A' },
      { id: '2', date: '2027-02-14', title: 'B' },
    ]).map(day => day.label)).toEqual(['Tue, 16 Feb', 'Sun, 14 Feb'])
    expect(programDays([])).toEqual([])
  })

  it('offers the event\'s days and the day after', () => {
    expect(programDayChoices('2027-02-14T06:00:00Z', '2027-02-14T14:00:00Z', 'Asia/Manila')).toEqual([
      { value: '2027-02-14', label: 'Event day · Sun, 14 Feb' },
      { value: '2027-02-15', label: 'Next day · Mon, 15 Feb' },
    ])
    expect(programDayChoices('2027-02-14T01:00:00Z', '2027-02-16T09:00:00Z', 'Asia/Manila').map(day => day.value))
      .toEqual(['2027-02-14', '2027-02-15', '2027-02-16', '2027-02-17'])
    // Without a set end, the event's day and the day after
    expect(programDayChoices('2027-02-14T06:00:00Z', null, 'Asia/Manila').map(day => day.value)).toEqual(['2027-02-14', '2027-02-15'])
  })

  it('starts a new section with only its text and photos: the venue and items are the event\'s', () => {
    const section = createDefaultSection('program')
    expect(section.layout).toBe('timeline')
    expect(section.content).toEqual({ eyebrow: 'The day', heading: 'Program', venuesHeading: 'Getting there', layoutPhotos: [] })
  })

  it('has a sample program on the given day, the after-party on the next', () => {
    const items = sampleProgramItems('2027-02-14')
    expect(items.map(item => item.title)).toEqual(['Ceremony', 'Cocktails', 'Dinner & toasts', 'First dance', 'Party', 'After-party'])
    expect(items.map(item => item.date)).toEqual([...Array(5).fill('2027-02-14'), '2027-02-15'])
  })
})
