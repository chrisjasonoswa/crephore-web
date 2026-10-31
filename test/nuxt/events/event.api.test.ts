import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get, post, put, del } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}))

vi.mock('~/lib/axios', () => ({ get, post, put, del }))

import { addEvent, deleteEvent, getEvent, listEvents, updateEvent } from '~/features/events/event.api'

describe('event api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists events from /events with paging, sort, search and group filter', () => {
    const params = { page: 2, pageSize: 20, sort: ['startsAt:asc'], searchKey: 'ana', eventGroupId: 3 }

    listEvents(params)

    expect(get).toHaveBeenCalledWith('/events', { params })
  })

  it('gets an event by id', () => {
    getEvent(7)

    expect(get).toHaveBeenCalledWith('/events/7')
  })

  it('creates an event with its timeline', () => {
    const payload = {
      name: 'Ana & Marco',
      description: null,
      type: 'Wedding' as const,
      venueName: 'Taal Vista',
      venueAddress: 'Tagaytay',
      venueLatitude: null,
      venueLongitude: null,
      venueGooglePlaceId: null,
      startsAt: '2027-06-12T15:00',
      endsAt: '2027-06-12T23:00',
      timezone: 'Asia/Manila',
      subdomain: 'ana-and-marco',
      eventGroupId: null,
      timeline: ['Opening', 'Dinner'],
    }

    addEvent(payload)

    expect(post).toHaveBeenCalledWith('/events', payload)
  })

  it('deletes an event by id', () => {
    deleteEvent(7)

    expect(del).toHaveBeenCalledWith('/events/7')
  })

  it('updates an event by id', () => {
    const payload = {
      name: 'Ana & Marco',
      description: null,
      type: 'Wedding' as const,
      venueName: 'Taal Vista',
      venueAddress: 'Tagaytay',
      venueLatitude: null,
      venueLongitude: null,
      venueGooglePlaceId: null,
      startsAt: '2027-06-12T15:00',
      endsAt: '2027-06-12T23:00',
      timezone: 'Asia/Manila',
      subdomain: 'ana-and-marco',
      eventGroupId: null,
      timeline: ['Opening'],
    }

    updateEvent(7, payload)

    expect(put).toHaveBeenCalledWith('/events/7', payload)
  })
})
