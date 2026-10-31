import type { Site } from '~/features/sites/site.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getSite } = vi.hoisted(() => ({ getSite: vi.fn() }))

vi.mock('~/features/sites/site.api', () => ({ getSite }))

import EventSitePage from '~/pages/_site/EventSitePage.vue'

const site = {
  subdomain: 'ana-and-marco',
  eventName: 'Ana & Marco',
  startsAt: '2027-06-12T07:00:00Z',
  timezone: 'Asia/Manila',
  publishedAt: '2026-10-28T00:00:00Z',
  theme: { primaryColor: '#1E2A44', accentColor: '#E8A598', backgroundColor: '#FFFCF4', fontPairingKey: 'serif_classic', cornerStyle: 'soft' },
  sections: [
    { type: 'hero', layout: 'split', background: 'light', options: {}, content: { title: 'Ana & Marco', layoutPhotos: [], cta: { label: 'RSVP', href: '#rsvp' } }, contentVersion: 1, visibility: 'Always' },
    { type: 'countdown', layout: 'boxes', background: 'primary', options: {}, content: { title: 'Counting down', showSeconds: false }, contentVersion: 1, visibility: 'Always' },
  ],
} satisfies Site

async function mountPage(subdomain = 'ana-and-marco') {
  const wrapper = await mountSuspended(EventSitePage, { props: { subdomain } })
  await flushPromises()
  return wrapper
}

describe('event site page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the published website\'s sections in its theme', async () => {
    getSite.mockResolvedValue({ data: site })
    const wrapper = await mountPage()

    expect(getSite).toHaveBeenCalledWith('ana-and-marco')
    await vi.waitFor(() => expect(wrapper.find('h1').text()).toBe('Ana & Marco'))
    await vi.waitFor(() => expect(wrapper.find('h2').text()).toBe('Counting down'))
    expect(wrapper.find('.crephore-site').attributes('style')).toContain('--site-')
    expect(wrapper.text()).not.toContain('This website isn\'t available')
  })

  it('says the website isn\'t available when it is not published or doesn\'t exist', async () => {
    getSite.mockRejectedValue(new Error('Not found'))
    const wrapper = await mountPage('nobody-here')

    expect(wrapper.text()).toContain('This website isn\'t available')
    expect(wrapper.find('.crephore-site').exists()).toBe(false)
  })
})
