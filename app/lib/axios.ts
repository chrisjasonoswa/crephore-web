import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiResponse } from '~/types/api'
import axios from 'axios'
import { useAuthStore } from '~/features/auth/auth.store'
import { cToast } from '~/lib/cToast'

let hasHandledSessionExpiration = false
let isInterceptorAttached = false

// Requests whose 401 means "wrong input", not "session expired".
const SESSION_EXPIRY_EXEMPT_URLS = ['/auth/login', '/auth/logout']
// Requests whose errors are handled by the caller without a toast.
const SILENT_URLS = ['/auth/me']

export const isAuthFailure = (error: unknown): boolean => {
  return axios.isAxiosError(error)
    && (error.response?.status === 401 || error.response?.status === 403)
}

/** The API's field errors (`{ email: ["..."] }`) from a failed request, if any. */
export const getApiErrors = (error: unknown): ApiResponse<unknown>['errors'] => {
  return axios.isAxiosError<ApiResponse<unknown>>(error) ? error.response?.data?.errors : undefined
}

function getApiClient(): AxiosInstance {
  const apiClient = useNuxtApp().$api as AxiosInstance

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

function attachResponseInterceptor(apiClient: AxiosInstance): void {
  apiClient.interceptors.response.use(
    response => response,
    async (error: AxiosError<ApiResponse<unknown>>) => {
      const url = error.config?.url ?? ''

      if (!error.response) {
        cToast({ title: 'Network error. Please check your connection.', type: 'error' })
        return Promise.reject(error)
      }

      // The API has no refresh tokens: a 401 means the session was revoked or has expired.
      if (error.response.status === 401 && !SESSION_EXPIRY_EXEMPT_URLS.includes(url)) {
        handleSessionExpired()
        return Promise.reject(error)
      }

      if (!SILENT_URLS.includes(url)) {
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
