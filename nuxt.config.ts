import type { NuxtPage } from 'nuxt/schema'
import tailwindcss from '@tailwindcss/vite'
import { siteFontFamilies } from './app/site-theme/fontPairings'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },
  modules: ['shadcn-nuxt', '@nuxt/fonts', '@nuxtjs/color-mode', '@pinia/nuxt'],
  css: ['~/assets/css/tailwind.css'],
  app: {
    head: {
      // The brand mark (AppLogoMark). The SVG follows the browser's light/dark mode; favicon.ico (16/32/48 px) and the
      // Apple touch icon are the light-mode mark, rendered from it, for browsers that don't use SVG icons.
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },
  vite: { plugins: [tailwindcss()] },
  hooks: {
    // Page-local files live next to their page: `_components/` folders and `.ts` files
    // (form schemas, table columns) inside `pages/` must not become routes.
    'pages:extend'(pages) {
      function filterPages(pages: NuxtPage[], filePattern: RegExp, folderPattern: RegExp): NuxtPage[] {
        return pages
          .filter(page => !page.file || (!filePattern.test(page.file) && !folderPattern.test(page.file)))
          .map(page => ({ ...page, children: filterPages(page.children ?? [], filePattern, folderPattern) }))
      }

      pages.splice(0, pages.length, ...filterPages(pages, /\.ts$/, /\/_/))
    },
  },
  components: [
    // Reusable custom components (`custom/c-*/C*.vue`) are registered by file name only.
    // Listed first so `~/components` below does not register them again with a path prefix.
    {
      path: '~/components/custom',
      pathPrefix: false,
    },
    '~/components',
  ],
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },
  colorMode: { classSuffix: '' },
  // Event-site fonts are only referenced through CSS variables, so register them explicitly.
  fonts: { families: siteFontFamilies },
  // `/` is rendered per request, not prerendered: event websites (<subdomain>.<site domain>) are served at `/` of
  // their own host (app/router.options.ts), so one prerendered page would answer for every event's address.
  routeRules: {
    '/dashboard/**': { ssr: false },
    '/admin/**': { ssr: false },
  },
  runtimeConfig: {
    public: {
      // Overridden by NUXT_PUBLIC_API_URL (see .env.example)
      apiUrl: 'http://localhost:5180/api',
      // Where Crephore itself runs; event websites are its subdomains (ana-and-marco.localhost:3000 in development,
      // ana-and-marco.crephore.com in production). Overridden by NUXT_PUBLIC_SITE_BASE_URL.
      siteBaseUrl: 'http://localhost:3000',
    },
  },
})
