import type { NuxtPage } from 'nuxt/schema'
import tailwindcss from '@tailwindcss/vite'
import { siteFontFamilies } from './app/site-theme/fontPairings'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },
  modules: ['shadcn-nuxt', '@nuxt/fonts', '@nuxtjs/color-mode', '@pinia/nuxt'],
  css: ['~/assets/css/tailwind.css'],
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
  routeRules: {
    '/': { prerender: true },
    '/dashboard/**': { ssr: false },
    '/admin/**': { ssr: false },
  },
  runtimeConfig: {
    public: {
      // Overridden by NUXT_PUBLIC_API_URL (see .env.example)
      apiUrl: 'http://localhost:5180/api',
    },
  },
})
