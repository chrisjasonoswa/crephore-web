import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import SiteThemeScope from '~/components/sections/SiteThemeScope.vue'

// Every section component's source, so the rule below covers new layouts automatically.
const sectionSources = import.meta.glob<string>('/app/components/sections/**/*.vue', {
  query: '?raw',
  import: 'default',
  eager: true,
})

describe('responsive sections', () => {
  it('finds the section components', () => {
    expect(Object.keys(sectionSources).length).toBeGreaterThan(0)
  })

  it('makes the site-theme wrapper the container sections respond to', async () => {
    const wrapper = await mountSuspended(SiteThemeScope, {
      props: { theme: { primaryColor: '#1F6E6C', accentColor: '#F4B6C2', fontPairingKey: 'serif_classic', cornerStyle: 'soft' } },
    })

    expect(wrapper.classes()).toContain('@container')
  })

  // Viewport breakpoints follow the browser window, so a narrow preview on a wide screen would
  // still show the desktop layout. Sections use container queries (`@2xl:` …) instead.
  it.each(Object.entries(sectionSources))('uses container queries, not viewport breakpoints (%s)', (_, source) => {
    expect(source).not.toMatch(/(?<![\w@-])(sm|md|lg|xl|2xl):/)
  })
})
