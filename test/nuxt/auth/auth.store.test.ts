import { AxiosError, AxiosHeaders } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthUser } from '~/features/auth/auth.type'

const { getMe, logout } = vi.hoisted(() => ({
  getMe: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('~/features/auth/auth.api', () => ({ getMe, logout }))

import { useAuthStore } from '~/features/auth/auth.store'

const user: AuthUser = {
  id: 1,
  firstName: 'Chris',
  lastName: 'Oswa',
  email: 'chris@test.com',
  phoneNumber: null,
  timezone: 'Asia/Manila',
  isSuperAdmin: false,
  createdAt: '2026-10-22T00:00:00Z',
}

const axiosErrorWithStatus = (status: number) =>
  new AxiosError('Request failed', undefined, undefined, undefined, {
    status,
    statusText: '',
    data: {},
    headers: {},
    config: { headers: new AxiosHeaders() },
  })

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('stores the user and marks the session as authenticated', () => {
    const authStore = useAuthStore()

    authStore.setAuth({ user })

    expect(authStore.user).toEqual(user)
    expect(authStore.isAuthenticated()).toBe(true)
  })

  it('clears the user and the session flag', () => {
    const authStore = useAuthStore()
    authStore.setAuth({ user })

    authStore.clearAuth()

    expect(authStore.user).toBeNull()
    expect(authStore.isAuthenticated()).toBe(false)
  })

  it('loads the current user from /auth/me', async () => {
    getMe.mockResolvedValue({ success: true, data: user })
    const authStore = useAuthStore()

    await authStore.getAuthMe()

    expect(authStore.user).toEqual(user)
    expect(authStore.isAuthenticated()).toBe(true)
  })

  it('clears the session when /auth/me is unauthorized', async () => {
    getMe.mockRejectedValue(axiosErrorWithStatus(401))
    const authStore = useAuthStore()
    authStore.setAuth({ user })

    await authStore.getAuthMe()

    expect(authStore.user).toBeNull()
    expect(authStore.isAuthenticated()).toBe(false)
  })

  it('keeps the session when /auth/me fails for another reason', async () => {
    getMe.mockRejectedValue(axiosErrorWithStatus(500))
    const authStore = useAuthStore()
    authStore.setAuth({ user })

    await authStore.getAuthMe()

    expect(authStore.isAuthenticated()).toBe(true)
  })

  it('calls the API and clears the session on logout', async () => {
    logout.mockResolvedValue({ success: true, data: null })
    const authStore = useAuthStore()
    authStore.setAuth({ user })

    await authStore.logout()

    expect(logout).toHaveBeenCalledOnce()
    expect(authStore.user).toBeNull()
    expect(authStore.isAuthenticated()).toBe(false)
  })

  it('clears the session on logout even when the API call fails', async () => {
    logout.mockRejectedValue(axiosErrorWithStatus(401))
    const authStore = useAuthStore()
    authStore.setAuth({ user })

    await authStore.logout()

    expect(authStore.isAuthenticated()).toBe(false)
  })
})
