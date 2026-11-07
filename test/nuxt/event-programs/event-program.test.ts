import type { EventProgram } from '~/features/event-programs/event-program.type'
import type { EventVenue } from '~/features/event-venues/event-venue.type'
import { describe, expect, it } from 'vitest'
import { isSameProgram, mapProgramToRequest, programErrors, programFromApi, sectionProgram } from '~/features/event-programs/event-program'

const program: EventProgram = {
  items: [
    { id: 1, date: '2027-02-14', startTime: '15:00', endTime: null, title: 'Ceremony', description: 'Be seated by 2:45.', venueId: 10, speakers: null },
    { id: 2, date: '2027-02-15', startTime: null, endTime: null, title: 'Brunch', description: null, venueId: 11, speakers: 'Ana Lim' },
  ],
}

const venue = (id: number, name: string, extra: Partial<EventVenue> = {}): EventVenue =>
  ({ id, name, address: null, googleMapsUrl: null, appleMapsUrl: null, latitude: null, longitude: null, photoUrl: null, notes: null, ...extra })
const venues = [venue(10, 'Manila Cathedral'), venue(11, 'Poolside')]

describe('event program', () => {
  it('reads the saved program for editing: each item keyed by its id, empty fields left out', () => {
    expect(programFromApi(program).items).toEqual([
      { id: 'item-1', savedId: 1, date: '2027-02-14', startTime: '15:00', title: 'Ceremony', description: 'Be seated by 2:45.', venueId: 10 },
      { id: 'item-2', savedId: 2, date: '2027-02-15', title: 'Brunch', venueId: 11, speakers: 'Ana Lim' },
    ])
  })

  it('saves every item in order, saved ones by id and new ones without, text trimmed and blanks as null', () => {
    const draft = programFromApi(program)
    const request = mapProgramToRequest({
      items: [...draft.items, { id: 'new', date: '2027-02-15', title: '  Farewell  ', endTime: '' }],
    })

    expect(request.items.map(item => item.id)).toEqual([1, 2, null])
    expect(request.items[1]).toMatchObject({ venueId: 11 })
    expect(request.items[2]).toEqual({ id: null, date: '2027-02-15', startTime: null, endTime: null, title: 'Farewell', description: null, venueId: null, speakers: null })
  })

  it('compares programs by what would be saved', () => {
    const draft = programFromApi(program)

    expect(isSameProgram({ items: draft.items.map(item => ({ ...item, id: `other-${item.id}` })) }, draft)).toBe(true)
    expect(isSameProgram({ items: draft.items.map(item => ({ ...item, venueId: 10 })) }, draft)).toBe(false)
    expect(isSameProgram({ items: [...draft.items].reverse() }, draft)).toBe(false)
  })

  it('shows each item\'s venue by name in sections when the program moves around', () => {
    expect(sectionProgram(program, venues)).toEqual({
      venues: [],
      items: [
        { id: 'item-1', date: '2027-02-14', startTime: '15:00', title: 'Ceremony', description: 'Be seated by 2:45.', venue: 'Manila Cathedral' },
        { id: 'item-2', date: '2027-02-15', title: 'Brunch', venue: 'Poolside', speakers: 'Ana Lim' },
      ],
    })
  })

  it('shows one venue under the heading when every item is there, and none for items without a venue', () => {
    const atOne = { items: program.items.map(item => ({ ...item, venueId: 10 })) }
    expect(sectionProgram(atOne, venues)).toMatchObject({ venue: 'Manila Cathedral' })
    expect(sectionProgram(atOne, venues).items.every(item => !item.venue)).toBe(true)

    const mixed = { items: [{ ...program.items[0]!, venueId: null }, program.items[1]!] }
    expect(sectionProgram(mixed, venues)).not.toHaveProperty('venue')
    expect(sectionProgram(mixed, venues).items.map(item => item.venue)).toEqual([undefined, 'Poolside'])
    expect(sectionProgram({ items: [] }, venues)).toEqual({ items: [], venues: [] })
  })

  it('lists the venues its items are at with their details, in the order first used, leaving out name-only ones', () => {
    const detailed = [
      venue(10, 'Manila Cathedral', { address: 'Cabildo St', notes: 'Main doors.', latitude: 14.59, longitude: 120.97, googleMapsUrl: 'https://maps.app.goo.gl/a' }),
      venue(11, 'Poolside'),
      venue(12, 'The Manila Hotel', { photoUrl: 'https://cdn.example/hotel.jpg', appleMapsUrl: 'https://maps.apple/p/b' }),
      venue(13, 'Unused', { address: 'Somewhere' }),
    ]
    const used = { items: [{ ...program.items[1]!, venueId: 12 }, { ...program.items[0]!, venueId: 11 }, { ...program.items[0]!, id: 3, venueId: 10 }] }

    expect(sectionProgram(used, detailed).venues).toEqual([
      { id: 'venue-12', name: 'The Manila Hotel', photo: 'https://cdn.example/hotel.jpg', appleMapsUrl: 'https://maps.apple/p/b' },
      { id: 'venue-10', name: 'Manila Cathedral', address: 'Cabildo St', notes: 'Main doors.', latitude: 14.59, longitude: 120.97, googleMapsUrl: 'https://maps.app.goo.gl/a' },
    ])
  })

  it('checks items with the API\'s rules and messages, keyed like its errors', () => {
    expect(programErrors(programFromApi(program))).toEqual({})
    expect(programErrors({
      items: [
        { id: 'a', date: '', title: ' ', endTime: '10:00' },
        { id: 'b', date: '2027-02-14', title: 'x'.repeat(151), description: 'x'.repeat(501), speakers: 'x'.repeat(301) },
      ],
    })).toEqual({
      'items[0].date': 'Date is required.',
      'items[0].endTime': 'Add a start time first.',
      'items[0].title': 'Title is required.',
      'items[1].title': 'Title must be 150 characters or fewer.',
      'items[1].description': 'Note must be 500 characters or fewer.',
      'items[1].speakers': 'Speakers must be 300 characters or fewer.',
    })
  })
})
