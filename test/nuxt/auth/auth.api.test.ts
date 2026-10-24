import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get, post } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}))

vi.mock('~/lib/axios', () => ({ get, post }))

import { getMe, login, logout, signup } from '~/features/auth/auth.api'

describe('auth api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('signs up with /auth/signup', () => {
    const payload = { firstName: 'Chris', lastName: 'Oswa', email: 'chris@test.com', password: 'password123' }

    signup(payload)

    expect(post).toHaveBeenCalledWith('/auth/signup', payload)
  })

  it('logs in with /auth/login', () => {
    const payload = { email: 'chris@test.com', password: 'password123' }

    login(payload)

    expect(post).toHaveBeenCalledWith('/auth/login', payload)
  })

  it('logs out with /auth/logout', () => {
    logout()

    expect(post).toHaveBeenCalledWith('/auth/logout')
  })

  it('gets the current user from /auth/me', () => {
    getMe()

    expect(get).toHaveBeenCalledWith('/auth/me')
  })
})
