import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '~/types/api'
import axios from 'axios'
import { useAuthStore } from '~/features/auth/auth.store'
import { cToast } from '~/lib/cToast'

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

let refreshPromise: Promise<void> | null = null
let hasHandledSessionExpiration = false
let isInterceptorAttached = false

// Requests whose 401 is not an expired access token, so they are never refreshed and retried.
const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh', '/auth/logout']
// Requests whose errors are handled by the caller without a toast.
const SILENT_URLS = ['/auth/me', '/auth/refresh']
// Same, by prefix: event websites guests open (an unpublished one is a page, not an error toast)
const SILENT_URL_PREFIXES = ['/sites/']
const isSilent = (url: string) => SILENT_URLS.includes(url) || SILENT_URL_PREFIXES.some(prefix => url.startsWith(prefix))

export const isAuthFailure = (error: unknown): boolean => {
  return axios.isAxiosError(error)
    && (error.response?.status === 401 || error.response?.status === 403)
}

/** The API's field errors (`{ email: ["..."] }`) from a failed request, if any. */
export const getApiErrors = (error: unknown): ApiResponse<unknown>['errors'] => {
  return axios.isAxiosError<ApiResponse<unknown>>(error) ? error.response?.data?.errors : undefined
}

function getNuxtDependencies() {
  const { $api, $baseUrl } = useNuxtApp()

  return {
    apiClient: $api as AxiosInstance,
    baseUrl: $baseUrl as string,
  }
}

function getApiClient(): AxiosInstance {
  const { apiClient } = getNuxtDependencies()

  if (!isInterceptorAttached) {
    attachResponseInterceptor(apiClient)
    isInterceptorAttached = true
  }

  return apiClient
}

const handleSessionExpired = () => {
  if (typeof window === 'undefined' || hasHandledSessionExpiration)
    return

  hasHandledSessionExpiration = true
  useAuthStore().clearAuth()

  if (window.location.pathname !== '/sign-in')
    window.location.replace('/sign-in?reason=session-expired')
}

// Renews the access token with the HttpOnly refreshToken cookie (as in zao-pos-web).
// Requests that fail at the same time share one refresh, since each refresh rotates the token.
async function refreshAuthTokens(): Promise<void> {
  if (!refreshPromise) {
    const { baseUrl } = getNuxtDependencies()

    // Plain axios, so a failed refresh doesn't go through the interceptor again
    refreshPromise = axios
      .post('/auth/refresh', {}, { baseURL: baseUrl, timeout: 15000, withCredentials: true })
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

function attachResponseInterceptor(apiClient: AxiosInstance): void {
  apiClient.interceptors.response.use(
    response => response,
    async (error: AxiosError<ApiResponse<unknown>>) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined
      const url = originalRequest?.url ?? ''

      if (!error.response) {
        if (!isSilent(url) && import.meta.client)
          cToast({ title: 'Network error. Please check your connection.', type: 'error' })
        return Promise.reject(error)
      }

      // A 401 usually means the access token (30 minutes) expired: refresh it and retry the request once.
      if (error.response.status === 401 && originalRequest && !AUTH_ENDPOINTS.includes(url)) {
        // Already retried after a refresh: the session itself is gone
        if (originalRequest._retry) {
          handleSessionExpired()
          return Promise.reject(error)
        }

        originalRequest._retry = true

        try {
          await refreshAuthTokens()
          hasHandledSessionExpiration = false
          return apiClient.request(originalRequest)
        }
        catch (refreshError) {
          // The refresh token expired, was revoked (logout elsewhere) or was already used
          if (isAuthFailure(refreshError))
            handleSessionExpired()
          return Promise.reject(refreshError)
        }
      }

      // Toasts only exist in the browser (server rendering fetches event websites)
      if (!isSilent(url) && import.meta.client) {
        const message = error.response.data?.message
          ?? error.message
          ?? 'Something went wrong. Please try again.'

        cToast({ title: message, type: 'error' })
      }

      return Promise.reject(error)
    },
  )
}

export async function request<TResponse = unknown, TBody = unknown>(
  config: AxiosRequestConfig<TBody>,
): Promise<TResponse> {
  const apiClient = getApiClient()

  const response = await apiClient.request<TResponse, AxiosResponse<TResponse>, TBody>(config)
  return response.data
}

export function get<TResponse = unknown>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<TResponse> {
  return request<TResponse>({
    ...config,
    method: 'GET',
    url,
    // ASP.NET model binding expects repeated query keys for arrays: key=1&key=2
    paramsSerializer: config?.paramsSerializer ?? { indexes: null },
  })
}

export function post<TResponse = unknown, TBody = unknown>(
  url: string,
  data?: TBody,
  config?: AxiosRequestConfig<TBody>,
): Promise<TResponse> {
  return request<TResponse, TBody>({ ...config, method: 'POST', url, data })
}

export function put<TResponse = unknown, TBody = unknown>(
  url: string,
  data?: TBody,
  config?: AxiosRequestConfig<TBody>,
): Promise<TResponse> {
  return request<TResponse, TBody>({ ...config, method: 'PUT', url, data })
}

export function patch<TResponse = unknown, TBody = unknown>(
  url: string,
  data?: TBody,
  config?: AxiosRequestConfig<TBody>,
): Promise<TResponse> {
  return request<TResponse, TBody>({ ...config, method: 'PATCH', url, data })
}

export function del<TResponse = unknown>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<TResponse> {
  return request<TResponse>({ ...config, method: 'DELETE', url })
}
