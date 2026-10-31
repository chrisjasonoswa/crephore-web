import { beforeEach, describe, expect, it, vi } from 'vitest'

const { post } = vi.hoisted(() => ({ post: vi.fn() }))

vi.mock('~/lib/axios', () => ({ post }))

import { uploadPhoto } from '~/features/media/media.api'

describe('media api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uploads a photo for the event as form data in `file`', () => {
    const file = new File(['photo'], 'beach.jpg', { type: 'image/jpeg' })

    uploadPhoto(5, file)

    const [url, form] = post.mock.calls[0]!
    expect(url).toBe('/events/5/media')
    expect(form).toBeInstanceOf(FormData)
    expect((form as FormData).get('file')).toBe(file)
  })
})
