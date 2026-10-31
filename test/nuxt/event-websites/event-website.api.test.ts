import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get, post, put, del } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}))

vi.mock('~/lib/axios', () => ({ get, post, put, del }))

import {
  deleteEventWebsite,
  getEventWebsite,
  publishEventWebsite,
  unpublishEventWebsite,
  updateEventWebsite,
} from '~/features/event-websites/event-website.api'

describe('event website api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets the event\'s website', () => {
    getEventWebsite(5)

    expect(get).toHaveBeenCalledWith('/events/5/website')
  })

  it('saves the whole website', () => {
    const payload = {
      theme: { primaryColor: '#1E2A44', accentColor: '#E8A598', backgroundColor: null, fontPairingKey: 'serif_classic', cornerStyle: 'soft' as const },
      sections: [{
        id: null,
        type: 'countdown' as const,
        layout: 'boxes',
        background: 'primary' as const,
        options: { dateSide: 'left' },
        content: { title: 'Soon', showSeconds: true },
        contentVersion: 1,
        isVisible: true,
        visibility: 'Always' as const,
      }],
    }

    updateEventWebsite(5, payload)

    expect(put).toHaveBeenCalledWith('/events/5/website', payload)
  })

  it('deletes the event\'s website', () => {
    deleteEventWebsite(5)

    expect(del).toHaveBeenCalledWith('/events/5/website')
  })

  it('publishes and unpublishes the event\'s website', () => {
    publishEventWebsite(5)
    unpublishEventWebsite(5)

    expect(post).toHaveBeenNthCalledWith(1, '/events/5/website/publish')
    expect(post).toHaveBeenNthCalledWith(2, '/events/5/website/unpublish')
  })
})
