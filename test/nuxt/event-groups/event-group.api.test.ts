import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get, post, put, del } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}))

vi.mock('~/lib/axios', () => ({ get, post, put, del }))

import {
  addEventGroup,
  addEventToGroup,
  deleteEventGroup,
  listEventGroups,
  removeEventFromGroup,
  updateEventGroup,
} from '~/features/event-groups/event-group.api'

describe('event group api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists event groups from /event-groups', () => {
    const params = { page: 1, pageSize: 20, sort: ['name:asc'], searchKey: 'birth' }

    listEventGroups(params)

    expect(get).toHaveBeenCalledWith('/event-groups', { params })
  })

  it('creates an event group', () => {
    addEventGroup({ name: 'Birthdays' })

    expect(post).toHaveBeenCalledWith('/event-groups', { name: 'Birthdays' })
  })

  it('updates an event group by id, sending its name and events', () => {
    updateEventGroup({ id: 4, name: 'Family birthdays', eventIds: [7, 9] })

    expect(put).toHaveBeenCalledWith('/event-groups/4', { name: 'Family birthdays', eventIds: [7, 9] })
  })

  it('deletes an event group by id', () => {
    deleteEventGroup(4)

    expect(del).toHaveBeenCalledWith('/event-groups/4')
  })

  it('adds an event to a group', () => {
    addEventToGroup(4, 9)

    expect(post).toHaveBeenCalledWith('/event-groups/4/events/9')
  })

  it('removes an event from a group', () => {
    removeEventFromGroup(4, 9)

    expect(del).toHaveBeenCalledWith('/event-groups/4/events/9')
  })
})
