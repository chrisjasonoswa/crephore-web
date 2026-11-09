import type { ProgramVenue } from '~/features/sections/program/program.type'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import ProgramVenuePreview from '~/components/sections/program/ProgramVenuePreview.vue'

const venue: ProgramVenue = { id: 'v1', name: 'Taal Vista Hotel', address: 'Tagaytay' }

// As the live site renders it: on the server, where a root made of two nodes (e.g. a comment before a v-else branch)
// silently drops the layout's classes
const serverRender = (props: { venue: ProgramVenue, placeholder?: boolean, class: string }) => renderToString(createSSRApp({ render: () => h(ProgramVenuePreview, props) }))

describe('venue preview', () => {
  it('keeps the layout\'s size and corners on the placeholder when rendered on the server', async () => {
    const html = await serverRender({ venue, placeholder: true, class: 'aspect-16/9 w-full rounded-(--site-radius)' })

    expect(html).toContain('data-venue-preview-placeholder')
    expect(html).toMatch(/<div[^>]*class="[^"]*aspect-16\/9 w-full rounded-\(--site-radius\)[^"]*"[^>]*data-venue-preview-placeholder|<div[^>]*data-venue-preview-placeholder[^>]*class="[^"]*aspect-16\/9/)
    expect(html.trimStart().startsWith('<div')).toBe(true)
  })

  it('keeps them on the photo too', async () => {
    const html = await serverRender({ venue: { ...venue, photo: 'https://example.com/venue.jpg' }, class: 'aspect-16/9 rounded-(--site-radius)' })
    expect(html).toMatch(/<div[^>]*data-venue-preview[^>]*class="[^"]*aspect-16\/9|<div[^>]*class="[^"]*aspect-16\/9[^"]*"[^>]*data-venue-preview/)
  })
})
