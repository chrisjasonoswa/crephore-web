import { useAuthStore } from '~/features/auth/auth.store'

// Signed-in areas and the pages only signed-out visitors should see.
const protectedPaths = ['/dashboard', '/admin']
const unauthenticatedPaths = ['/sign-in', '/sign-up']

const matches = (path: string, prefixes: string[]) =>
  prefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`))

export default defineNuxtRouteMiddleware((to) => {
  // The session flag lives in localStorage, so only the client can decide.
  // Middleware runs again on the client after hydration.
  if (import.meta.server)
    return

  const hasSession = useAuthStore().isAuthenticated()

  // Redirect signed-in users away from auth pages
  if (hasSession && matches(to.path, unauthenticatedPaths))
    return navigateTo('/dashboard')

  // Redirect signed-out users to sign-in
  if (!hasSession && matches(to.path, protectedPaths))
    return navigateTo('/sign-in')
})
