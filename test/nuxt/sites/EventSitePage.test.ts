import type { Site } from '~/features/sites/site.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getSite } = vi.hoisted(() => ({ getSite: vi.fn() }))

vi.mock('~/features/sites/site.api', () => ({ getSite }))
// Passes content through; a test checks that published content goes through it
const { upgradeSectionContent } = vi.hoisted(() => ({
  upgradeSectionContent: vi.fn((_type: string, content: Record<string, unknown>): Record<string, unknown> => content),
}))
vi.mock('~/features/sections/section.upgrade', () => ({ upgradeSectionContent }))

import EventSitePage from '~/pages/_site/EventSitePage.vue'

const site = {
  subdomain: 'ana-and-marco',
  eventName: 'Ana & Marco',
  venueName: 'Manila Cathedral',
  eventType: 'Wedding' as const,
  startsAt: '2027-06-12T07:00:00Z',
  timezone: 'Asia/Manila',
  bornOn: null,
  diedOn: null,
  program: { items: [
    { id: 1, date: '2027-06-12', startTime: '15:00', endTime: null, title: 'Ceremony', description: null, venueId: 4, speakers: null },
  ] },
  venues: [{ id: 4, name: 'Manila Cathedral', address: 'Intramuros, Manila', googleMapsUrl: null, appleMapsUrl: null, latitude: null, longitude: null, photoUrl: null, notes: null }],
  publishedAt: '2026-10-28T00:00:00Z',
  theme: { primaryColor: '#1E2A44', secondaryColor: '#E8A598', accentColor: null, backgroundColor: '#FFFCF4', fontPairingKey: 'serif_classic', cornerStyle: 'soft', motion: { intro: 'shutter' as const, intensity: 'normal' as const } },
  sections: [
    { type: 'hero', layout: 'split', background: 'light', options: {}, content: { eyebrow: 'Together with their families', layoutPhotos: [], cta: { label: 'RSVP', href: '#rsvp' } }, contentVersion: 2, visibility: 'Always' },
    { type: 'countdown', layout: 'boxes', background: 'primary', options: {}, content: { eyebrow: 'Counting down to', showSeconds: false, layoutPhotos: [] }, contentVersion: 2, visibility: 'Always' },
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
    upgradeSectionContent.mockImplementation((_type, content) => content)
  })

  it('shows the published website\'s sections in its theme, with the event\'s live name, date and venue', async () => {
    getSite.mockResolvedValue({ data: site })
    const wrapper = await mountPage()

    expect(getSite).toHaveBeenCalledWith('ana-and-marco')
    await vi.waitFor(() => expect(wrapper.find('h1').text()).toBe('Ana & Marco'))
    expect(wrapper.find('h2').text()).toBe('Ana & Marco')
    expect(wrapper.text()).toContain('Saturday, 12 June 2027')
    expect(wrapper.text()).toContain('Manila Cathedral')
    expect(wrapper.find('.crephore-site').attributes('style')).toContain('--site-')
    expect(wrapper.text()).not.toContain('This website isn\'t available')
  })

  it('opens with the site\'s intro, the default shutter for a site published before motion, or one replaced by it', async () => {
    getSite.mockResolvedValue({ data: { ...site, subdomain: 'card-flip', theme: { ...site.theme, motion: { intro: 'card-flip', intensity: 'normal' } } } })
    const wrapper = await mountPage('card-flip')
    await vi.waitFor(() => expect(wrapper.find('[data-page-intro]').attributes('data-intro')).toBe('card-flip'))

    // An intro that no longer exists (the earlier general intros) opens with the default
    getSite.mockResolvedValue({ data: { ...site, subdomain: 'removed', theme: { ...site.theme, motion: { intro: 'curtain' as never, intensity: 'normal' } } } })
    const removed = await mountPage('removed')
    await vi.waitFor(() => expect(removed.find('[data-page-intro]').attributes('data-intro')).toBe('shutter'))

    const { motion: _, ...oldTheme } = site.theme
    getSite.mockResolvedValue({ data: { ...site, subdomain: 'before-motion', theme: oldTheme as typeof site.theme } })
    const old = await mountPage('before-motion')
    await vi.waitFor(() => expect(old.find('[data-page-intro]').attributes('data-intro')).toBe('shutter'))
  })

  it('shows a memorial\'s live life dates under the name', async () => {
    const hero = { ...site.sections[0]!, content: { ...site.sections[0]!.content, lifeDates: 'years' as const } }
    getSite.mockResolvedValue({ data: { ...site, subdomain: 'lola-ising', eventType: 'Memorial', bornOn: '1938-05-01', diedOn: '2026-10-03', sections: [hero] } })
    const wrapper = await mountPage('lola-ising')

    await vi.waitFor(() => expect(wrapper.find('[data-hero-life-dates]').text()).toBe('1938 – 2026'))
  })

  it('upgrades published content from its content version', async () => {
    const countdown = site.sections[1]!
    upgradeSectionContent.mockImplementation((type, content) => (type === 'countdown' ? { ...content, eyebrow: 'Upgraded' } : content))
    getSite.mockResolvedValue({ data: { ...site, subdomain: 'upgraded', sections: [countdown] } })
    const wrapper = await mountPage('upgraded')

    await vi.waitFor(() => expect(wrapper.text()).toContain('Upgraded'))
    expect(upgradeSectionContent).toHaveBeenCalledWith('countdown', countdown.content, countdown.contentVersion)
  })

  it('shows the event\'s live program in the program section, at the event\'s venue', async () => {
    const programSection = { type: 'program' as const, layout: 'timeline', background: 'light' as const, options: {}, content: { eyebrow: 'The day', heading: 'Program', layoutPhotos: [] }, contentVersion: 3, visibility: 'Always' as const }
    getSite.mockResolvedValue({ data: { ...site, subdomain: 'with-program', sections: [site.sections[0]!, programSection] } })
    const wrapper = await mountPage('with-program')

    await vi.waitFor(() => expect(wrapper.find('[data-program-heading]').exists()).toBe(true))
    expect(wrapper.text()).toContain('Ceremony')
    expect(wrapper.find('[data-program-overall-venue]').text()).toContain('Manila Cathedral')
  })

  it('shows a section published in a removed layout in its replacement', async () => {
    const programSection = { type: 'program' as const, layout: 'tab-cards', background: 'light' as const, options: {}, content: { eyebrow: 'The day', heading: 'Program', layoutPhotos: [] }, contentVersion: 3, visibility: 'Always' as const }
    getSite.mockResolvedValue({ data: { ...site, subdomain: 'removed-layout', sections: [site.sections[0]!, programSection] } })
    const wrapper = await mountPage('removed-layout')

    // The cards layout's day panels
    await vi.waitFor(() => expect(wrapper.find('[data-program-heading]').exists()).toBe(true))
    expect(wrapper.text()).toContain('Ceremony')
    expect(wrapper.find('fieldset').exists()).toBe(true)
  })

  it('shows the program\'s venues with their details at the bottom of the program section', async () => {
    const programSection = { type: 'program' as const, layout: 'timeline', background: 'light' as const, options: {}, content: { eyebrow: 'The day', heading: 'Program', layoutPhotos: [] }, contentVersion: 3, visibility: 'Always' as const }
    getSite.mockResolvedValue({ data: { ...site, subdomain: 'with-venue-details', sections: [site.sections[0]!, programSection] } })
    const wrapper = await mountPage('with-venue-details')

    await vi.waitFor(() => expect(wrapper.find('[data-program-venues]').exists()).toBe(true))
    expect(wrapper.find('[data-program-venues] [data-venue-name]').text()).toBe('Manila Cathedral')
    expect(wrapper.find('[data-program-venues] [data-venue-address]').text()).toBe('Intramuros, Manila')
  })

  it('skips published sections of a type the app no longer has (the removed venue section)', async () => {
    const removed = { type: 'venue', layout: 'cards', background: 'light', options: {}, content: { heading: 'Venue & map' }, contentVersion: 1, visibility: 'Always' } as unknown as Site['sections'][number]
    getSite.mockResolvedValue({ data: { ...site, subdomain: 'old-venue-section', sections: [site.sections[0]!, removed] } })
    const wrapper = await mountPage('old-venue-section')

    await vi.waitFor(() => expect(wrapper.find('h1').exists()).toBe(true))
    expect(wrapper.text()).not.toContain('Venue & map')
  })

  it('leaves the program section out while the event\'s program has no items', async () => {
    const programSection = { type: 'program' as const, layout: 'timeline', background: 'light' as const, options: {}, content: { eyebrow: 'The day', heading: 'Program', layoutPhotos: [] }, contentVersion: 3, visibility: 'Always' as const }
    getSite.mockResolvedValue({ data: { ...site, subdomain: 'no-program', program: { items: [] }, sections: [site.sections[0]!, programSection] } })
    const wrapper = await mountPage('no-program')

    await vi.waitFor(() => expect(wrapper.find('h1').exists()).toBe(true))
    await flushPromises()
    expect(wrapper.find('[data-program-heading]').exists()).toBe(false)
  })

  it('says the website isn\'t available when it is not published or doesn\'t exist', async () => {
    getSite.mockRejectedValue(new Error('Not found'))
    const wrapper = await mountPage('nobody-here')

    expect(wrapper.text()).toContain('This website isn\'t available')
    expect(wrapper.find('.crephore-site').exists()).toBe(false)
  })
})
