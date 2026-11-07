import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get, put } = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
}))

vi.mock('~/lib/axios', () => ({ get, put }))

import { getEventProgram, updateEventProgram } from '~/features/event-programs/event-program.api'

describe('event program api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets the event\'s program', () => {
    getEventProgram(5)

    expect(get).toHaveBeenCalledWith('/events/5/program')
  })

  it('saves the whole program', () => {
    const payload = {
      items: [{ id: null, date: '2027-02-14', startTime: '15:00', endTime: null, title: 'Ceremony', description: null, venueId: 4, speakers: null }],
    }

    updateEventProgram(5, payload)

    expect(put).toHaveBeenCalledWith('/events/5/program', payload)
  })
})
