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
  isSameWebsite,
  mapWebsiteToRequest,
  moveItem,
  websiteFromApi,
  websiteProblem,
  withSavedIds,
} from '~/features/event-websites/event-website'
import { getSectionType } from '~/features/sections/section.registry'

const event = {
  id: 5,
  name: 'Ana & Marco',
  description: null,
  type: 'Wedding',
  venueName: 'Manila Cathedral',
  venueAddress: 'Intramuros, Manila',
  venueLatitude: null,
  venueLongitude: null,
  venueGooglePlaceId: null,
  // 3 PM in Manila
  startsAt: '2027-06-12T07:00:00Z',
  endsAt: '2027-06-12T13:00:00Z',
  timezone: 'Asia/Manila',
  subdomain: 'ana-and-marco',
  createdAt: '2026-10-01T00:00:00Z',
  access: ['Owner'],
  eventGroup: null,
} satisfies Event

describe('event website', () => {
  it('starts a blank website with the default theme and no sections', () => {
    expect(createBlankWebsite()).toEqual({
      theme: { primaryColor: '#1E2A44', accentColor: '#E8A598', fontPairingKey: 'serif_classic', cornerStyle: 'soft' },
      sections: [],
    })
  })

  it('takes the occasion from the event', () => {
    expect(eventOccasion(event)).toEqual({ startsAt: '2027-06-12T07:00:00Z', timezone: 'Asia/Manila' })
  })

  it('fills a new hero with the event\'s name, date (in its timezone) and venue', () => {
    const hero = createWebsiteSection('hero', event)

    expect(hero).toMatchObject({ type: 'hero', layout: 'fullscreen', background: 'photo', isVisible: true })
    expect(hero.content).toMatchObject({
      heading: 'Ana & Marco',
      date: 'Saturday, 12 June 2027',
      venue: 'Manila Cathedral',
      eyebrow: getSectionType('hero').defaultContent.eyebrow,
      layoutPhotos: [],
    })
  })

  it('leaves the hero venue out when the event has none', () => {
    expect(createWebsiteSection('hero', { ...event, venueName: '' }).content.venue).toBeUndefined()
  })

  it('starts a new message with a generic signature', () => {
    expect(createWebsiteSection('message', event).content).toMatchObject({ signature: 'With love, from us', heading: 'Welcome, family & friends' })
  })

  it('fills a new countdown with the event\'s name', () => {
    expect(createWebsiteSection('countdown', event).content).toMatchObject({ heading: 'Ana & Marco', showSeconds: true })
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
      theme: { primaryColor: '#5E7A63', accentColor: '#E9DFC8', backgroundColor: null, fontPairingKey: 'romantic', cornerStyle: 'round' },
      sections: [
        { id: 11, type: 'hero', layout: 'split', background: 'light', options: { photoSide: 'left' }, content: { heading: 'Ana & Marco', layoutPhotos: [] }, contentVersion: 1, isVisible: true, visibility: 'Always' },
        { id: 12, type: 'countdown', layout: 'boxes', background: 'primary', options: {}, content: { heading: 'Soon', showSeconds: false, layoutPhotos: [] }, contentVersion: 1, isVisible: false, visibility: 'Always' },
      ],
      publishedAt: null,
      hasUnpublishedChanges: false,
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-02T00:00:00Z',
    }

    it('loads a saved website into the editor, each section with a key and its id', () => {
      const website = websiteFromApi(saved)

      // No background colour: unset, like a new website
      expect(website.theme).toEqual({ primaryColor: '#5E7A63', accentColor: '#E9DFC8', fontPairingKey: 'romantic', cornerStyle: 'round' })
      expect(website.sections.map(section => [section.key, section.id, section.layout, section.isVisible]))
        .toEqual([['section-11', 11, 'split', true], ['section-12', 12, 'boxes', false]])
      expect(websiteFromApi({ ...saved, theme: { ...saved.theme, backgroundColor: '#FFFCF4' } }).theme.backgroundColor).toBe('#FFFCF4')
    })

    it('upgrades saved content from its content version', () => {
      const upgraded: CountdownContent = { heading: 'Upgraded', showSeconds: false, layoutPhotos: [] }
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
      expect(request.sections[0]).toMatchObject({ type: 'hero', layout: 'fullscreen', contentVersion: 1, isVisible: true, visibility: 'Always' })
      expect(request.sections[1]).toEqual({ ...saved.sections[0] })
      expect(JSON.stringify(request)).not.toContain(added.key)
    })

    it('compares websites by what would be saved, whatever order the content fields are in', () => {
      const website = websiteFromApi(saved)
      const hero = website.sections[0]!
      const reordered = { ...hero, content: { layoutPhotos: [], heading: 'Ana & Marco' } }

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
