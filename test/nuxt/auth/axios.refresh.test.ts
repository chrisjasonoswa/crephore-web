import type { AxiosAdapter, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import axios, { AxiosError } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { get } from '~/lib/axios'

const { clearAuth, cToast } = vi.hoisted(() => ({
  clearAuth: vi.fn(),
  cToast: vi.fn(),
}))

vi.mock('~/features/auth/auth.store', () => ({ useAuthStore: () => ({ clearAuth }) }))
vi.mock('~/lib/cToast', () => ({ cToast }))

const ok = (config: InternalAxiosRequestConfig, data: unknown) =>
  Promise.resolve({ data, status: 200, statusText: 'OK', headers: {}, config })

const unauthorized = (config: InternalAxiosRequestConfig) =>
  Promise.reject(new AxiosError('Unauthorized', '401', config, null, {
    data: { message: 'Unauthorized' }, status: 401, statusText: 'Unauthorized', headers: {}, config,
  }))

// The app's API client (plugins/api.ts) with a fake network: 401 until a refresh succeeded, then 200
let refreshed = false
const adapter: AxiosAdapter = config => (refreshed ? ok(config, { url: config.url }) : unauthorized(config))

const refresh = vi.spyOn(axios, 'post')
const replace = vi.fn()

beforeEach(() => {
  ;(useNuxtApp().$api as AxiosInstance).defaults.adapter = adapter
  refreshed = false
  refresh.mockReset()
  clearAuth.mockReset()
  replace.mockReset()
  vi.stubGlobal('location', { pathname: '/dashboard/events', replace })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('axios refresh on 401', () => {
  it('refreshes the access token and retries the request', async () => {
    refresh.mockImplementation(async () => {
      refreshed = true
      return { data: {} }
    })

    const result = await get<{ url: string }>('/events')

    expect(result).toEqual({ url: '/events' })
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(refresh).toHaveBeenCalledWith('/auth/refresh', {}, expect.objectContaining({ baseURL: useNuxtApp().$baseUrl, withCredentials: true }))
  })

  it('shares one refresh between requests that fail at the same time', async () => {
    refresh.mockImplementation(async () => {
      refreshed = true
      return { data: {} }
    })

    await Promise.all([get('/events'), get('/event-groups'), get('/auth/me')])

    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('signs out when the refresh fails', async () => {
    refresh.mockImplementation(() => unauthorized({ url: '/auth/refresh', headers: {} } as InternalAxiosRequestConfig))

    await expect(get('/events')).rejects.toBeInstanceOf(AxiosError)

    expect(clearAuth).toHaveBeenCalled()
    expect(replace).toHaveBeenCalledWith('/sign-in?reason=session-expired')
  })

  it('never refreshes for a failed login', async () => {
    await expect(get('/auth/login')).rejects.toBeInstanceOf(AxiosError)

    expect(refresh).not.toHaveBeenCalled()
    expect(clearAuth).not.toHaveBeenCalled()
  })
})
