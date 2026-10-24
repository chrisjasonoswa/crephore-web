import type { AuthUser } from './auth.type'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { isAuthFailure } from '~/lib/axios'
import { getMe, logout as logoutRequest } from './auth.api'

// The access token is an HttpOnly cookie the app cannot read, so a localStorage flag
// remembers that a session exists. The route middleware uses it to guard pages.
const IS_AUTHENTICATED_KEY = 'isAuthenticated'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<AuthUser | null>(null)

  // Getters / Helpers
  const isAuthenticated = () => {
    if (typeof window === 'undefined')
      return false
    return localStorage.getItem(IS_AUTHENTICATED_KEY) === 'true'
  }

  // Actions
  const setIsAuthenticated = (authenticated: boolean) => {
    if (authenticated)
      localStorage.setItem(IS_AUTHENTICATED_KEY, 'true')
    else
      localStorage.removeItem(IS_AUTHENTICATED_KEY)
  }

  const setAuth = (data: { user: AuthUser | null }) => {
    user.value = data.user
    setIsAuthenticated(!!data.user)
  }

  const clearAuth = () => {
    user.value = null
    setIsAuthenticated(false)
  }

  const getAuthMe = async () => {
    try {
      const response = await getMe()
      setAuth({ user: response.data })
    }
    catch (error) {
      if (isAuthFailure(error))
        clearAuth()
    }
  }

  // Signs out locally even if the API call fails (e.g. the session had already expired).
  const logout = async () => {
    try {
      await logoutRequest()
    }
    catch {}
    finally {
      clearAuth()
    }
  }

  return {
    // State
    user,

    // Getters
    isAuthenticated,

    // Actions / Helpers
    setIsAuthenticated,
    setAuth,
    clearAuth,
    getAuthMe,
    logout,
  }
})
