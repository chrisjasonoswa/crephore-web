import type { Section, SectionOccasion } from '~/features/sections/section.type'
import { describe, expect, it } from 'vitest'
import { createDefaultSection } from '~/features/sections/section.registry'
import { introContentFor, introInitials } from '~/features/site-motion/intro-content'

const occasion: SectionOccasion = { name: 'Bea & Carlo', venue: 'Manila Cathedral', startsAt: '2027-02-14T07:00:00Z', timezone: 'Asia/Manila', program: { items: [] } }
const hero = (content: Record<string, unknown>): Section => {
  const section = createDefaultSection('hero')
  return { ...section, content: { ...section.content, ...content } } as Section
}
const programSection = createDefaultSection('program')
// The event's program, its items on the event's day unless given another
const withProgram = (items: Record<string, unknown>[]): SectionOccasion => ({
  ...occasion,
  program: { items: items.map((item, i) => ({ id: `i${i}`, date: '2027-02-14', title: `Item ${i}`, ...item })) },
})

describe('intro content', () => {
  it('names the event, with its venue and date (month first) and the hero\'s eyebrow', () => {
    const content = introContentFor([hero({ eyebrow: ' Together with their families ' })], occasion, 'wedding')

    expect(content).toMatchObject({
      title: 'Bea & Carlo',
      eyebrow: 'Together with their families',
      initials: 'B & C',
      firstName: 'Bea',
      venue: 'Manila Cathedral',
      dateLong: 'Sunday, February 14, 2027',
      dateNumeric: '02 · 14 · 2027',
      kind: 'wedding',
    })
    expect(content.lifeDates).toBeUndefined()
  })

  it('writes a memorial\'s life dates as its hero shows them, once the event has both dates', () => {
    const memorial = { ...occasion, bornOn: '1938-05-01', diedOn: '2026-10-03' }

    expect(introContentFor([hero({ lifeDates: 'years' })], memorial, 'memorial').lifeDates).toBe('1938 – 2026')
    expect(introContentFor([hero({ lifeDates: 'full' })], memorial, 'memorial').lifeDates).toBe('1 May 1938 – 3 October 2026')
    // The hero leaves them out (None), or there's no hero to say
    expect(introContentFor([hero({})], memorial, 'memorial').lifeDates).toBeUndefined()
    expect(introContentFor([], memorial, 'memorial').lifeDates).toBeUndefined()
    expect(introContentFor([hero({ lifeDates: 'years' })], { ...memorial, diedOn: undefined }, 'memorial').lifeDates).toBeUndefined()
  })

  it('passes on the background the hero renders with: a photo background without a photo is primary', () => {
    const on = (background: string, backgroundPhoto?: string) =>
      introContentFor([{ ...hero({ backgroundPhoto }), background } as Section], occasion, 'party').heroBackground

    expect(on('light')).toBe('light')
    expect(on('secondary')).toBe('secondary')
    expect(on('photo')).toBe('primary')
    expect(on('photo', 'https://example.com/hero.jpg')).toBe('photo')
    expect(introContentFor([], occasion, 'party').heroBackground).toBeUndefined()
  })

  it('leaves out what the site doesn\'t have', () => {
    const content = introContentFor([], { ...occasion, name: 'Northwind Summit 2027', venue: '' }, 'any')

    expect(content).toMatchObject({ title: 'Northwind Summit 2027', initials: 'NS', firstName: 'Northwind', programTitles: [], stats: [] })
    expect(content.eyebrow).toBeUndefined()
    expect(content.venue).toBeUndefined()
    expect(introContentFor([], undefined, 'any')).toMatchObject({ title: '', dateLong: undefined })
  })

  it('takes the event program\'s titles and its numbers when the website has a program section', () => {
    const eventWithProgram = withProgram([
      { title: 'Keynote', speakers: 'Ana Lim, Ben Cruz' },
      { title: 'Workshops', speakers: 'Ana Lim' },
      { title: 'Dinner', date: '2027-02-15' },
      { title: 'Farewell', date: '2027-02-15' },
    ])
    const content = introContentFor([hero({}), programSection], eventWithProgram, 'any')

    expect(content.programTitles).toEqual(['Keynote', 'Workshops', 'Dinner', 'Farewell'])
    expect(content.stats).toEqual([{ value: 2, label: 'days' }, { value: 4, label: 'sessions' }, { value: 2, label: 'speakers' }])
    // Without a program section, the website doesn't show it
    expect(introContentFor([hero({})], eventWithProgram, 'any')).toMatchObject({ programTitles: [], stats: [] })
  })

  it('writes initials for a couple, or the first letters of the title', () => {
    expect(introInitials('ana and paolo')).toBe('A & P')
    expect(introInitials('Mika turns 7!')).toBe('MT')
    expect(introInitials('Lola')).toBe('L')
  })
})
