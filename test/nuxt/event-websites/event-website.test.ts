import type { EventWebsite } from '~/features/event-websites/event-website.type'
import type { Event } from '~/features/events/event.type'
import type { CountdownContent } from '~/features/sections/countdown/countdown.type'
import { beforeEach, describe, expect, it, vi } from 'vitest'
// Passes content through; a test checks that loading goes through it
const { upgradeSectionContent } = vi.hoisted(() => ({ upgradeSectionContent: vi.fn((_type: string, content: unknown) => content) }))
vi.mock('~/features/sections/section.upgrade', () => ({ upgradeSectionContent }))

import {
  createBlankWebsite,
  createWebsiteSection,
  duplicateWebsiteSection,
  eventOccasion,
  withSampleProgram,
  isSameWebsite,
  mapWebsiteToRequest,
  moveItem,
  websiteFromApi,
  websiteProblem,
  websiteWarnings,
  withSavedIds,
} from '~/features/event-websites/event-website'
import { getSectionLayout, getSectionType } from '~/features/sections/section.registry'

const event = {
  id: 5,
  name: 'Ana & Marco',
  type: 'Wedding',
  venueName: 'Manila Cathedral',
  // 3 PM in Manila
  startsAt: '2027-06-12T07:00:00Z',
  endsAt: '2027-06-12T13:00:00Z',
  timezone: 'Asia/Manila',
  bornOn: null,
  diedOn: null,
  subdomain: 'ana-and-marco',
  createdAt: '2026-10-01T00:00:00Z',
  access: ['Owner'],
  eventGroup: null,
} satisfies Event

describe('event website', () => {
  it('starts a blank website with the default theme and no sections', () => {
    expect(createBlankWebsite()).toEqual({
      theme: { primaryColor: '#1E2A44', secondaryColor: '#E8A598', fontPairingKey: 'serif_classic', cornerStyle: 'soft', motion: { intro: 'shutter' as const, intensity: 'bold' as const } },
      sections: [],
    })
  })

  it('starts a blank website with the colours that suit the kind of event', () => {
    expect(createBlankWebsite('Birthday').theme).toMatchObject({ primaryColor: '#F26B1D', secondaryColor: '#FFD23F' })
    expect(createBlankWebsite('Conference').theme).toMatchObject({ primaryColor: '#334155', secondaryColor: '#DCE7F3' })
    expect(createBlankWebsite('Wedding').theme).not.toHaveProperty('accentColor')
  })

  it('starts a blank website with the motion that suits the kind of event', () => {
    expect(createBlankWebsite('Wedding').theme.motion).toEqual({ intro: 'envelope', intensity: 'bold' })
    expect(createBlankWebsite('Memorial').theme.motion).toEqual({ intro: 'wreath-seal', intensity: 'bold' })
    expect(createBlankWebsite().theme.motion).toEqual({ intro: 'shutter', intensity: 'bold' })
  })

  it('takes the occasion from the event, with its program (none unless given)', () => {
    expect(eventOccasion(event)).toEqual({ name: 'Ana & Marco', venue: 'Manila Cathedral', startsAt: '2027-06-12T07:00:00Z', timezone: 'Asia/Manila', program: { items: [], venues: [] } })
    const program = { venue: 'Manila Cathedral', items: [{ id: 'item-1', date: '2027-06-12', title: 'Ceremony' }] }
    expect(eventOccasion(event, program).program).toBe(program)
    expect(eventOccasion({ ...event, bornOn: '1938-05-01', diedOn: '2026-10-03' })).toMatchObject({ bornOn: '1938-05-01', diedOn: '2026-10-03' })
  })

  it('gives thumbnails the sample program and its venues on the event\'s day while the event has none', () => {
    const empty = withSampleProgram(eventOccasion(event))
    expect(empty.program.venue).toBe('Manila Cathedral')
    expect(empty.program.items.map(item => item.date)).toEqual([...Array(5).fill('2027-06-12'), '2027-06-13'])
    expect(empty.program.venues!.map(venue => venue.name)).toEqual(['Manila Cathedral', 'The Manila Hotel'])

    const withItems = eventOccasion(event, { items: [{ id: 'item-1', date: '2027-06-12', title: 'Ceremony' }] })
    expect(withSampleProgram(withItems)).toBe(withItems)
  })

  it('starts a memorial\'s new hero with the years under the name (never the dates themselves)', () => {
    const memorial = { ...event, type: 'Memorial' as const, bornOn: '1938-05-01', diedOn: '2026-10-03' }

    expect(createWebsiteSection('hero', memorial).content).toEqual({ ...getSectionType('hero').defaultContent, lifeDates: 'years' })
    expect(createWebsiteSection('hero', event).content.lifeDates).toBeUndefined()
  })

  it('starts a new program section with only its text and photos, never the event\'s program', () => {
    expect(createWebsiteSection('program', event).content).toEqual({ ...getSectionType('program').defaultContent })
  })

  it('starts a new hero with the default content, never storing the event\'s name, date or venue', () => {
    const hero = createWebsiteSection('hero', event)

    expect(hero).toMatchObject({ type: 'hero', layout: 'fullscreen', background: 'photo', isVisible: true })
    expect(hero.content).toEqual({ ...getSectionType('hero').defaultContent })
    expect(JSON.stringify(hero.content)).not.toContain('Ana & Marco')
    expect(JSON.stringify(hero.content)).not.toContain('Manila Cathedral')
  })

  it('starts a new message with a generic signature', () => {
    expect(createWebsiteSection('message', event).content).toMatchObject({ signature: 'With love, from us', heading: 'Welcome, family & friends' })
  })

  it('starts a new countdown with the default content, never storing the event\'s name', () => {
    expect(createWebsiteSection('countdown', event).content).toEqual({ ...getSectionType('countdown').defaultContent })
  })

  it('gives every section its own key', () => {
    expect(createWebsiteSection('hero', event).key).not.toBe(createWebsiteSection('hero', event).key)
  })

  it('duplicates a section as an independent copy with a new key', () => {
    const hero = createWebsiteSection('hero', event)
    const copy = duplicateWebsiteSection(hero)

    expect(copy.key).not.toBe(hero.key)
    expect({ ...copy, key: hero.key }).toEqual(hero)
    copy.content.layoutPhotos.push('https://example.com/photo.jpg')
    expect(hero.content.layoutPhotos).toEqual([])
  })

  it('moves an item without changing the original list', () => {
    const items = ['a', 'b', 'c']

    expect(moveItem(items, 0, 2)).toEqual(['b', 'c', 'a'])
    expect(moveItem(items, 2, 0)).toEqual(['c', 'a', 'b'])
    expect(items).toEqual(['a', 'b', 'c'])
  })

  describe('websiteWarnings', () => {
    it('lists the visible sections missing content their layout needs, by type and layout', () => {
      const hero = createWebsiteSection('hero', event)
      const message = { ...createWebsiteSection('message', event), content: { body: '  ', layoutPhotos: [] } }
      const about = { ...createWebsiteSection('about', event), layout: 'timeline-zigzag', content: { timeline: [], layoutPhotos: [] } }
      const hiddenPeople = { ...createWebsiteSection('people', event), content: { heading: 'People', people: [] }, isVisible: false }

      expect(websiteWarnings({ ...createBlankWebsite(), sections: [hero, message, about, hiddenPeople] })).toEqual([
        `Message (${getSectionType('message').layouts[0]!.name}): This layout needs a message.`,
        `About (${getSectionLayout('about', 'timeline-zigzag')!.name}): This layout needs at least one chapter.`,
      ])
      expect(websiteWarnings({ ...createBlankWebsite(), sections: [hero] })).toEqual([])
    })
  })

  describe('websiteProblem', () => {
    const hero = createWebsiteSection('hero', event)
    const countdown = createWebsiteSection('countdown', event)

    it('accepts a website with exactly one hero, shown or hidden', () => {
      expect(websiteProblem({ ...createBlankWebsite(), sections: [hero, countdown] })).toBeNull()
      expect(websiteProblem({ ...createBlankWebsite(), sections: [countdown, { ...hero, isVisible: false }] })).toBeNull()
    })

    it('asks for a hero when there is none', () => {
      expect(websiteProblem(createBlankWebsite())).toBe('Add a hero section: every website needs one.')
      expect(websiteProblem({ ...createBlankWebsite(), sections: [countdown] })).toBe('Add a hero section: every website needs one.')
    })

    it('allows only one hero', () => {
      expect(websiteProblem({ ...createBlankWebsite(), sections: [hero, duplicateWebsiteSection(hero)] })).toBe('A website can only have one hero section.')
    })
  })

  describe('saving', () => {
    const saved: EventWebsite = {
      id: 3,
      eventId: 5,
      theme: { primaryColor: '#5E7A63', secondaryColor: '#E9DFC8', accentColor: null, backgroundColor: null, fontPairingKey: 'romantic', cornerStyle: 'round', motion: { intro: 'shutter' as const, intensity: 'normal' as const } },
      sections: [
        { id: 11, type: 'hero', layout: 'split', background: 'light', options: { photoSide: 'left' }, content: { eyebrow: 'Together', layoutPhotos: [] }, contentVersion: 2, isVisible: true, visibility: 'Always' },
        { id: 12, type: 'countdown', layout: 'boxes', background: 'primary', options: {}, content: { eyebrow: 'Soon', showSeconds: false, layoutPhotos: [] }, contentVersion: 2, isVisible: false, visibility: 'Always' },
      ],
      publishedAt: null,
      hasUnpublishedChanges: false,
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-02T00:00:00Z',
    }

    it('loads a saved website into the editor, each section with a key and its id', () => {
      const website = websiteFromApi(saved)

      // No background colour: unset, like a new website
      expect(website.theme).toEqual({ primaryColor: '#5E7A63', secondaryColor: '#E9DFC8', fontPairingKey: 'romantic', cornerStyle: 'round', motion: { intro: 'shutter' as const, intensity: 'normal' as const } })
      expect(website.sections.map(section => [section.key, section.id, section.layout, section.isVisible]))
        .toEqual([['section-11', 11, 'split', true], ['section-12', 12, 'boxes', false]])
      expect(websiteFromApi({ ...saved, theme: { ...saved.theme, backgroundColor: '#FFFCF4' } }).theme.backgroundColor).toBe('#FFFCF4')
    })

    it('saves only the options a section\'s layout has', () => {
      const website = websiteFromApi(saved)
      const hero = { ...website.sections[0]!, options: { ...website.sections[0]!.options, removedOption: 'x' } }

      expect(mapWebsiteToRequest({ ...website, sections: [hero] }).sections[0]!.options).toEqual(saved.sections[0]!.options)
    })

    it('opens a section saved in a removed layout in its replacement', () => {
      const program = { ...saved.sections[0]!, type: 'program' as const, layout: 'tab-cards', content: { heading: 'Program', venuesHeading: 'Getting there', layoutPhotos: [] }, contentVersion: 4 }

      expect(websiteFromApi({ ...saved, sections: [program] }).sections[0]!.layout).toBe('cards')
    })

    it('gives a website saved before motion existed the default motion, and saves the motion', () => {
      const { motion: _, ...oldTheme } = saved.theme
      const website = websiteFromApi({ ...saved, theme: oldTheme as typeof saved.theme })
      expect(website.theme.motion).toEqual({ intro: 'shutter', intensity: 'bold' })

      const changed = { ...website, theme: { ...website.theme, motion: { intro: 'orbit' as const, intensity: 'bold' as const } } }
      expect(mapWebsiteToRequest(changed).theme.motion).toEqual({ intro: 'orbit', intensity: 'bold' })
      expect(isSameWebsite(changed, website)).toBe(false)
    })

    it('leaves out colours the API sends as null, and sends unset ones as null', () => {
      const website = websiteFromApi({ ...saved, theme: { ...saved.theme, secondaryColor: null, accentColor: null } })

      expect(website.theme).not.toHaveProperty('secondaryColor')
      expect(website.theme).not.toHaveProperty('accentColor')
      expect(mapWebsiteToRequest(website).theme).toMatchObject({ secondaryColor: null, accentColor: null })
      expect(websiteFromApi({ ...saved, theme: { ...saved.theme, accentColor: '#C9A54C' } }).theme.accentColor).toBe('#C9A54C')
      expect(mapWebsiteToRequest({ ...website, theme: { ...website.theme, accentColor: '#C9A54C' } }).theme.accentColor).toBe('#C9A54C')
    })

    it('upgrades saved content from its content version', () => {
      const upgraded: CountdownContent = { eyebrow: 'Upgraded', showSeconds: false, layoutPhotos: [] }
      upgradeSectionContent.mockReturnValueOnce(upgraded)
      const website = websiteFromApi({ ...saved, sections: [{ ...saved.sections[1]!, contentVersion: 1 }] })

      expect(upgradeSectionContent).toHaveBeenCalledWith('countdown', saved.sections[1]!.content, 1)
      expect(website.sections[0]!.content).toBe(upgraded)
    })

    it('saves without the photos a section doesn\'t show, keeping them in the draft for switching back', () => {
      const photo = 'https://example.com/a.jpg'
      const hero = { ...createWebsiteSection('hero', event), background: 'light' as const, content: { ...createWebsiteSection('hero', event).content, backgroundPhoto: photo } }
      const draft = { ...createBlankWebsite(), sections: [hero] }

      expect(mapWebsiteToRequest(draft).sections[0]!.content).not.toHaveProperty('backgroundPhoto')
      // The draft still has it, so switching back to the photo background shows it without a new upload
      expect(draft.sections[0]!.content.backgroundPhoto).toBe(photo)
      expect(mapWebsiteToRequest({ ...draft, sections: [{ ...hero, background: 'photo' }] }).sections[0]!.content).toMatchObject({ backgroundPhoto: photo })
    })

    it('counts a website with only unused photos added as unchanged', () => {
      const hero = { ...createWebsiteSection('hero', event), background: 'light' as const }
      const withUnused = { ...hero, content: { ...hero.content, backgroundPhoto: 'https://example.com/a.jpg' } }

      expect(isSameWebsite({ ...createBlankWebsite(), sections: [hero] }, { ...createBlankWebsite(), sections: [withUnused] })).toBe(true)
    })

    it('saves the whole website in page order: saved sections by id, new ones without, no editor keys', () => {
      const website = websiteFromApi(saved)
      const added = createWebsiteSection('hero', event)

      const request = mapWebsiteToRequest({ ...website, sections: [added, website.sections[0]!] })

      expect(request.theme).toEqual({ ...saved.theme })
      expect(request.sections.map(section => section.id)).toEqual([null, 11])
      expect(request.sections[0]).toMatchObject({ type: 'hero', layout: 'fullscreen', contentVersion: 2, isVisible: true, visibility: 'Always' })
      expect(request.sections[1]).toEqual({ ...saved.sections[0] })
      expect(JSON.stringify(request)).not.toContain(added.key)
    })

    it('compares websites by what would be saved, whatever order the content fields are in', () => {
      const website = websiteFromApi(saved)
      const hero = website.sections[0]!
      const reordered = { ...hero, content: { layoutPhotos: [], eyebrow: 'Together' } }

      expect(isSameWebsite({ ...website, sections: [reordered, website.sections[1]!] }, website)).toBe(true)
      expect(isSameWebsite({ ...website, sections: [{ ...hero, key: 'other' }, website.sections[1]!] }, website)).toBe(true)
      expect(isSameWebsite({ ...website, sections: [{ ...hero, layout: 'arch' }, website.sections[1]!] }, website)).toBe(false)
      expect(isSameWebsite({ ...website, theme: { ...website.theme, cornerStyle: 'sharp' } }, website)).toBe(false)
    })

    it('gives saved sections their new ids by key, keeping sections added while saving', () => {
      const first = createWebsiteSection('hero', event)
      const second = createWebsiteSection('countdown', event)
      const sent = { ...createBlankWebsite(), sections: [first, second] }
      const addedWhileSaving = createWebsiteSection('hero', event)
      const current = { ...sent, sections: [second, addedWhileSaving, first] }
      const response = { ...saved, sections: [{ ...saved.sections[0]!, id: 21 }, { ...saved.sections[1]!, id: 22 }] }

      const next = withSavedIds(current, sent, response)

      expect(next.sections.map(section => [section.key, section.id]))
        .toEqual([[second.key, 22], [addedWhileSaving.key, undefined], [first.key, 21]])
    })

    it('starts new sections on Always and keeps a saved section\'s visibility when saving it again', () => {
      const website = websiteFromApi({ ...saved, sections: [{ ...saved.sections[0]!, visibility: 'BeforeEvent' }] })

      expect(createWebsiteSection('hero', event).visibility).toBe('Always')
      expect(mapWebsiteToRequest(website).sections[0]!.visibility).toBe('BeforeEvent')
    })

    it('makes a duplicate a new, unsaved section', () => {
      const [hero] = websiteFromApi(saved).sections

      expect(duplicateWebsiteSection(hero!)).not.toHaveProperty('id')
    })
  })
})
