import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get, put } = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
}))

vi.mock('~/lib/axios', () => ({ get, put }))

import { getEventVenues, updateEventVenues } from '~/features/event-venues/event-venue.api'

describe('event venue api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets the event\'s venues', () => {
    getEventVenues(5)

    expect(get).toHaveBeenCalledWith('/events/5/venues')
  })

  it('saves the whole list', () => {
    const payload = {
      venues: [{ id: null, name: 'Manila Cathedral', address: null, googleMapsUrl: 'https://maps.app.goo.gl/abc', appleMapsUrl: null, latitude: 14.5915, longitude: 120.9736, photoUrl: null, notes: null }],
    }

    updateEventVenues(5, payload)

    expect(put).toHaveBeenCalledWith('/events/5/venues', payload)
  })
})
