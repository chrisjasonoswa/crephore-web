import type { EventWebsite } from '~/features/event-websites/event-website.type'
import type { Event } from '~/features/events/event.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { getEventWebsite, updateEventWebsite, deleteEventWebsite, publishEventWebsite, unpublishEventWebsite, cToast } = vi.hoisted(() => ({
  getEventWebsite: vi.fn(),
  updateEventWebsite: vi.fn(),
  deleteEventWebsite: vi.fn(),
  publishEventWebsite: vi.fn(),
  unpublishEventWebsite: vi.fn(),
  cToast: vi.fn(),
}))

vi.mock('~/features/event-websites/event-website.api', () => ({
  getEventWebsite,
  updateEventWebsite,
  deleteEventWebsite,
  publishEventWebsite,
  unpublishEventWebsite,
}))
vi.mock('~/lib/cToast', () => ({ cToast }))

import EventWebsiteTab from '~/pages/(dashboard)/dashboard/events/[id]/_components/EventWebsiteTab.vue'

const event = {
  id: 5,
  name: 'Ana & Marco',
  description: null,
  type: 'Wedding',
  venueName: 'Manila Cathedral',
  venueAddress: 'Intramuros, Manila',
  venueLatitude: null,
  venueLongitude: null,
  venueGooglePlaceId: null,
  startsAt: '2027-06-12T07:00:00Z',
  endsAt: '2027-06-12T13:00:00Z',
  timezone: 'Asia/Manila',
  subdomain: 'ana-and-marco',
  createdAt: '2026-10-01T00:00:00Z',
  access: ['Owner'],
  eventGroup: null,
  timeline: [],
} satisfies Event

const saved = {
  id: 3,
  eventId: 5,
  theme: { primaryColor: '#1E2A44', accentColor: '#E8A598', backgroundColor: null, fontPairingKey: 'serif_classic', cornerStyle: 'soft' },
  sections: [
    { id: 11, type: 'hero', layout: 'split', background: 'light', options: { photoSide: 'right', textPosition: 'center' }, content: { title: 'Ana & Marco', layoutPhotos: [] }, contentVersion: 1, isVisible: true, visibility: 'Always' },
  ],
  publishedAt: null,
  hasUnpublishedChanges: false,
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-02T00:00:00Z',
} satisfies EventWebsite

const published = { ...saved, publishedAt: '2026-10-28T00:00:00Z' } satisfies EventWebsite

async function mountTab() {
  const wrapper = await mountSuspended(EventWebsiteTab, { props: { event }, attachTo: document.body })
  await flushPromises()
  return wrapper
}

type Tab = Awaited<ReturnType<typeof mountTab>>

const buttonNamed = (wrapper: Tab, text: string) => wrapper.findAll('button').find(button => button.text().includes(text))!
const saveStatus = (wrapper: Tab) => wrapper.find('[data-save-status]').text()
const publishStatus = (wrapper: Tab) => wrapper.find('[data-publish-status]').text()

async function settle() {
  await flushPromises()
  await new Promise(resolve => setTimeout(resolve, 0))
}

async function chooseFromMoreMenu(wrapper: Tab, label: string) {
  await wrapper.find('button[aria-label="More website actions"]').trigger('keydown', { key: 'Enter' })
  await settle()
  ;[...document.body.querySelectorAll<HTMLElement>('[role="menuitem"]')].find(item => item.textContent?.trim() === label)!.click()
  await settle()
  ;[...document.body.querySelectorAll<HTMLElement>('[role="dialog"] button')].find(button => button.textContent?.trim() === label)!.click()
  await settle()
}

describe('event website tab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('opens the saved website in the editor', async () => {
    getEventWebsite.mockResolvedValue({ data: saved })
    const wrapper = await mountTab()

    expect(getEventWebsite).toHaveBeenCalledWith(5)
    expect(saveStatus(wrapper)).toBe('All changes saved.')
    expect(wrapper.find('[data-section-row]').text()).toContain('Hero')
  })

  it('offers the start choice when the event has no website yet', async () => {
    getEventWebsite.mockResolvedValue({ data: null })
    const wrapper = await mountTab()

    expect(wrapper.findAll('[data-start]')).toHaveLength(2)
  })

  it('saves the website and marks it saved, giving new sections their ids', async () => {
    getEventWebsite.mockResolvedValue({ data: saved })
    const wrapper = await mountTab()

    await wrapper.find('[data-section-row] button[aria-label="Hide Hero"]').trigger('click')
    expect(saveStatus(wrapper)).toBe('You have unsaved changes.')

    updateEventWebsite.mockResolvedValue({ data: { ...saved, sections: [{ ...saved.sections[0]!, isVisible: false }] } })
    await buttonNamed(wrapper, 'Save changes').trigger('click')
    await settle()

    expect(updateEventWebsite).toHaveBeenCalledWith(5, expect.objectContaining({
      sections: [expect.objectContaining({ id: 11, isVisible: false })],
    }))
    expect(cToast).toHaveBeenCalledWith({ title: 'Website saved.', type: 'success' })
    expect(saveStatus(wrapper)).toBe('All changes saved.')
  })

  it('keeps the changes when saving fails', async () => {
    getEventWebsite.mockResolvedValue({ data: saved })
    updateEventWebsite.mockRejectedValue(new Error('Server error'))
    const wrapper = await mountTab()

    await wrapper.find('[data-section-row] button[aria-label="Hide Hero"]').trigger('click')
    await buttonNamed(wrapper, 'Save changes').trigger('click')
    await settle()

    expect(saveStatus(wrapper)).toBe('You have unsaved changes.')
  })

  it('discards changes back to the saved website', async () => {
    getEventWebsite.mockResolvedValue({ data: saved })
    const wrapper = await mountTab()

    await wrapper.find('[data-section-row] button[aria-label="Hide Hero"]').trigger('click')
    await buttonNamed(wrapper, 'Discard changes').trigger('click')

    expect(saveStatus(wrapper)).toBe('All changes saved.')
    expect(wrapper.find('[data-section-row] button[aria-label="Hide Hero"]').exists()).toBe(true)
  })

  it('saves a website started from scratch for the first time', async () => {
    getEventWebsite.mockResolvedValue({ data: null })
    const wrapper = await mountTab()

    await wrapper.find('[data-start="blank"]').trigger('click')
    // A blank page has nothing to save yet
    expect(saveStatus(wrapper)).toBe('Not saved yet. Save to keep your website.')
    expect(buttonNamed(wrapper, 'Save changes').attributes('disabled')).toBeDefined()

    await buttonNamed(wrapper, 'Add a section').trigger('click')
    await settle()
    document.body.querySelector<HTMLElement>('[data-add-section="countdown"]')!.click()
    await settle()
    updateEventWebsite.mockResolvedValue({ data: { ...saved, sections: [{ ...saved.sections[0]!, id: 31, type: 'countdown', layout: 'boxes' }] } })
    await buttonNamed(wrapper, 'Save changes').trigger('click')
    await settle()

    expect(updateEventWebsite).toHaveBeenCalledWith(5, expect.objectContaining({
      sections: [expect.objectContaining({ id: null, type: 'countdown' })],
    }))
    expect(saveStatus(wrapper)).toBe('All changes saved.')
  })

  it('deletes the saved website when starting over, then offers the start choice', async () => {
    getEventWebsite.mockResolvedValue({ data: saved })
    deleteEventWebsite.mockResolvedValue({ data: null })
    const wrapper = await mountTab()

    await chooseFromMoreMenu(wrapper, 'Start over')

    expect(deleteEventWebsite).toHaveBeenCalledWith(5)
    expect(wrapper.findAll('[data-start]')).toHaveLength(2)
  })

  it('publishes the saved website and links to it', async () => {
    getEventWebsite.mockResolvedValue({ data: saved })
    publishEventWebsite.mockResolvedValue({ data: published })
    const wrapper = await mountTab()
    expect(publishStatus(wrapper)).toBe('Not published')

    await wrapper.find('[data-publish]').trigger('click')
    await settle()

    expect(updateEventWebsite).not.toHaveBeenCalled()
    expect(publishEventWebsite).toHaveBeenCalledWith(5)
    expect(publishStatus(wrapper)).toBe('Live')
    expect(wrapper.find('[data-view-site]').attributes('href')).toBe('http://ana-and-marco.localhost:3000')
    expect(cToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Your website is live.', description: 'ana-and-marco.localhost:3000' }))
  })

  it('saves unsaved changes before publishing them', async () => {
    getEventWebsite.mockResolvedValue({ data: published })
    const hidden = { ...published, sections: [{ ...published.sections[0]!, isVisible: false }] }
    updateEventWebsite.mockResolvedValue({ data: { ...hidden, hasUnpublishedChanges: true } })
    publishEventWebsite.mockResolvedValue({ data: hidden })
    const wrapper = await mountTab()
    expect(publishStatus(wrapper)).toBe('Live')

    // Add a countdown so the page still has a visible section, and hide the hero
    await wrapper.find('[data-section-row] button[aria-label="Hide Hero"]').trigger('click')
    expect(publishStatus(wrapper)).toBe('Live · changes not published')
    await buttonNamed(wrapper, 'Add a section').trigger('click')
    await settle()
    document.body.querySelector<HTMLElement>('[data-add-section="countdown"]')!.click()
    await settle()
    await wrapper.find('[data-publish]').trigger('click')
    await settle()

    expect(updateEventWebsite).toHaveBeenCalledOnce()
    expect(publishEventWebsite).toHaveBeenCalledOnce()
    expect(updateEventWebsite.mock.invocationCallOrder[0]).toBeLessThan(publishEventWebsite.mock.invocationCallOrder[0]!)
    expect(publishStatus(wrapper)).toBe('Live')
  })

  it('does not publish when saving the changes fails', async () => {
    getEventWebsite.mockResolvedValue({ data: saved })
    updateEventWebsite.mockRejectedValue(new Error('Server error'))
    const wrapper = await mountTab()

    await buttonNamed(wrapper, 'Add a section').trigger('click')
    await settle()
    document.body.querySelector<HTMLElement>('[data-add-section="countdown"]')!.click()
    await settle()
    await wrapper.find('[data-publish]').trigger('click')
    await settle()

    expect(publishEventWebsite).not.toHaveBeenCalled()
    expect(publishStatus(wrapper)).toBe('Not published')
  })

  it('unpublishes the website', async () => {
    getEventWebsite.mockResolvedValue({ data: published })
    unpublishEventWebsite.mockResolvedValue({ data: saved })
    const wrapper = await mountTab()

    await chooseFromMoreMenu(wrapper, 'Unpublish')

    expect(unpublishEventWebsite).toHaveBeenCalledWith(5)
    expect(publishStatus(wrapper)).toBe('Not published')
    expect(wrapper.find('[data-view-site]').exists()).toBe(false)
  })

  it('offers to try again when the website cannot be loaded', async () => {
    getEventWebsite.mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce({ data: saved })
    const wrapper = await mountTab()

    expect(wrapper.text()).toContain('Couldn\'t load the website')
    await buttonNamed(wrapper, 'Try again').trigger('click')
    await settle()

    expect(saveStatus(wrapper)).toBe('All changes saved.')
  })
})
