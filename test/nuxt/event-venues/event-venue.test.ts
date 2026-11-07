import type { EventVenue } from '~/features/event-venues/event-venue.type'
import { describe, expect, it } from 'vitest'
import {
  blankVenue,
  isAppleMapsUrl,
  isGoogleMapsUrl,
  isSameVenues,
  mapPreviewUrl,
  mapVenuesToRequest,
  pinLinkOf,
  venueErrors,
  venueFromApi,
} from '~/features/event-venues/event-venue'

const saved: EventVenue = {
  id: 4,
  name: 'Manila Cathedral',
  address: 'Intramuros, Manila',
  googleMapsUrl: 'https://maps.app.goo.gl/abc',
  appleMapsUrl: null,
  latitude: 14.5915,
  longitude: 120.9736,
  photoUrl: null,
  notes: 'Main entrance.',
}

describe('event venues', () => {
  it('reads a saved venue for editing, empty text as \'\'', () => {
    expect(venueFromApi(saved)).toEqual({
      key: 'venue-4',
      savedId: 4,
      name: 'Manila Cathedral',
      address: 'Intramuros, Manila',
      googleMapsUrl: 'https://maps.app.goo.gl/abc',
      appleMapsUrl: '',
      latitude: 14.5915,
      longitude: 120.9736,
      photoUrl: '',
      notes: 'Main entrance.',
    })
  })

  it('saves every venue in order, saved ones by id and new ones without, text trimmed and blanks as null', () => {
    const request = mapVenuesToRequest([venueFromApi(saved), { ...blankVenue(), name: '  The Manila Hotel ', notes: '  ' }])

    expect(request.venues[0]).toEqual({ ...saved })
    expect(request.venues[1]).toEqual({
      id: null,
      name: 'The Manila Hotel',
      address: null,
      googleMapsUrl: null,
      appleMapsUrl: null,
      latitude: null,
      longitude: null,
      photoUrl: null,
      notes: null,
    })
  })

  it('compares lists by what would be saved', () => {
    const list = [venueFromApi(saved)]

    expect(isSameVenues([{ ...list[0]!, key: 'other', name: ' Manila Cathedral ' }], list)).toBe(true)
    expect(isSameVenues([{ ...list[0]!, notes: 'Valet' }], list)).toBe(false)
    expect(isSameVenues([...list, blankVenue()], list)).toBe(false)
  })

  it('accepts Google Maps and Apple Maps links only from their own hosts, over https', () => {
    expect(isGoogleMapsUrl('https://maps.app.goo.gl/abc')).toBe(true)
    expect(isGoogleMapsUrl('https://www.google.com/maps/place/Manila')).toBe(true)
    expect(isGoogleMapsUrl('http://maps.google.com/?q=Manila')).toBe(false)
    expect(isGoogleMapsUrl('https://google.com.evil.example/maps')).toBe(false)
    expect(isAppleMapsUrl('https://maps.apple/p/abc')).toBe(true)
    expect(isAppleMapsUrl('https://maps.apple.com/?q=Manila')).toBe(true)
    expect(isAppleMapsUrl('https://maps.app.goo.gl/abc')).toBe(false)
  })

  it('checks venues with the API\'s rules and messages, keyed like its errors', () => {
    expect(venueErrors([venueFromApi(saved)])).toEqual({})
    expect(venueErrors([
      { ...blankVenue(), name: ' ', googleMapsUrl: 'https://example.com/map', appleMapsUrl: 'https://maps.app.goo.gl/abc' },
      { ...blankVenue(), name: 'x'.repeat(201), address: 'x'.repeat(301), notes: 'x'.repeat(1001) },
    ])).toEqual({
      'venues[0].name': 'Name is required.',
      'venues[0].googleMapsUrl': 'Google Maps link must be a link from Google Maps.',
      'venues[0].appleMapsUrl': 'Apple Maps link must be a link from Apple Maps.',
      'venues[1].name': 'Name must be 200 characters or fewer.',
      'venues[1].address': 'Address must be 300 characters or fewer.',
      'venues[1].notes': 'Notes must be 1000 characters or fewer.',
    })
  })

  it('takes the pin from the Google Maps link first, else the Apple Maps link', () => {
    expect(pinLinkOf({ googleMapsUrl: ' https://maps.app.goo.gl/abc ', appleMapsUrl: 'https://maps.apple/p/x' })).toBe('https://maps.app.goo.gl/abc')
    expect(pinLinkOf({ googleMapsUrl: '', appleMapsUrl: 'https://maps.apple/p/x' })).toBe('https://maps.apple/p/x')
    expect(pinLinkOf({ googleMapsUrl: 'not a link', appleMapsUrl: '' })).toBeNull()
  })

  it('previews the pin on Google Maps\' keyless embed', () => {
    expect(mapPreviewUrl(14.5915, 120.9736)).toBe('https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s14.5915,120.9736!6i17')
    expect(mapPreviewUrl(14.5915, 120.9736, 15)).toContain('!6i15')
  })
})
