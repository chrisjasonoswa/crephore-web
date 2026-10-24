import axios from 'axios'

// Shared API client. Auth is cookie-based (HttpOnly `accessToken` set by the API on login),
// so every request is sent with credentials.
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const apiClient = axios.create({
    baseURL: config.public.apiUrl,
    withCredentials: true,
  })

  return {
    provide: {
      api: apiClient,
      baseUrl: config.public.apiUrl,
    },
  }
})
