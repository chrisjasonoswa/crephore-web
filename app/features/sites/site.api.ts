import type { Site } from './site.type'
import type { ApiResponse } from '~/types/api'
import { get } from '~/lib/axios'

export const SiteApiRoutes = {
  // No sign-in needed; 404 unless published
  site: (subdomain: string) => `/sites/${encodeURIComponent(subdomain)}`,
}

/* APIs */
export const getSite = (subdomain: string) => {
  return get<ApiResponse<Site>>(SiteApiRoutes.site(subdomain))
}
