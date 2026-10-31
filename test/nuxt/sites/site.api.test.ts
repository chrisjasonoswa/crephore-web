import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('~/lib/axios', () => ({ get }))

import { getSite } from '~/features/sites/site.api'

describe('site api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets a published website by its subdomain', () => {
    getSite('ana-and-marco')

    expect(get).toHaveBeenCalledWith('/sites/ana-and-marco')
  })
})
