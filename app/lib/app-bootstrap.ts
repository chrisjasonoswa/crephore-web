import { useAuthStore } from '~/features/auth/auth.store'

// Loads the signed-in user's data. Runs when a signed-in area mounts and after login.
export const init = async () => {
  await useAuthStore().getAuthMe()
}
