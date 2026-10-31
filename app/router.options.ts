import type { RouterConfig } from 'nuxt/schema'
import { siteSubdomainOf } from '~/features/sites/site'

// On an event's own address (ana-and-marco.crephore.com) the app is that event's website: one page at `/`, and any
// other path goes back to it. Everywhere else it is Crephore, with the pages in `pages/`. Runs per request on the
// server and once in the browser, so both pick the same routes.
export default {
  routes: (routes) => {
    const subdomain = siteSubdomainOf(useRequestURL().hostname, useRuntimeConfig().public.siteBaseUrl)
    if (!subdomain)
      return routes

    return [
      {
        name: 'event-site',
        path: '/',
        component: () => import('~/pages/_site/EventSitePage.vue'),
        props: { subdomain },
        // The website has no Crephore layout around it
        meta: { layout: false },
      },
      { path: '/:pathMatch(.*)*', redirect: '/' },
    ]
  },
} satisfies RouterConfig
