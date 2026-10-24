import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RouteLocationNormalized } from 'vue-router'

const { navigateTo } = vi.hoisted(() => ({ navigateTo: vi.fn((path: string) => path) }))

vi.mock('#app/composables/router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('#app/composables/router')>()),
  navigateTo,
}))

import authMiddleware from '~/middleware/auth.global'

const runMiddleware = (path: string) =>
  authMiddleware({ path } as RouteLocationNormalized, {} as RouteLocationNormalized)

describe('auth middleware', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('sends signed-out visitors from protected pages to sign-in', () => {
    expect(runMiddleware('/dashboard')).toBe('/sign-in')
    expect(runMiddleware('/dashboard/events')).toBe('/sign-in')
    expect(runMiddleware('/admin/users')).toBe('/sign-in')
  })

  it('lets signed-out visitors open public pages', () => {
    expect(runMiddleware('/')).toBeUndefined()
    expect(runMiddleware('/sign-in')).toBeUndefined()
    expect(runMiddleware('/sign-up')).toBeUndefined()
    // Only path segments match: "/dashboarding" is not under "/dashboard"
    expect(runMiddleware('/dashboarding')).toBeUndefined()
  })

  it('sends signed-in users from auth pages to the dashboard', () => {
    localStorage.setItem('isAuthenticated', 'true')

    expect(runMiddleware('/sign-in')).toBe('/dashboard')
    expect(runMiddleware('/sign-up')).toBe('/dashboard')
  })

  it('lets signed-in users open protected pages', () => {
    localStorage.setItem('isAuthenticated', 'true')

    expect(runMiddleware('/dashboard')).toBeUndefined()
  })
})
