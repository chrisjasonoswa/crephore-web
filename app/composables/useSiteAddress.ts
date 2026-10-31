import type { SiteAddress } from '~/features/sites/site'
import { siteAddress } from '~/features/sites/site'

/** Event website addresses for this environment (from `runtimeConfig.public.siteBaseUrl`). */
export function useSiteAddress(): SiteAddress {
  return siteAddress(useRuntimeConfig().public.siteBaseUrl)
}
