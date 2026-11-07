import type { Event } from '~/features/events/event.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getEvent } = vi.hoisted(() => ({ getEvent: vi.fn() }))

vi.mock('~/features/events/event.api', () => ({ getEvent, updateEvent: vi.fn() }))
vi.mock('~/features/event-websites/event-website.api', () => ({
  getEventWebsite: vi.fn().mockResolvedValue({ data: null }),
  updateEventWebsite: vi.fn(),
  deleteEventWebsite: vi.fn(),
  publishEventWebsite: vi.fn(),
  unpublishEventWebsite: vi.fn(),
}))
vi.mock('~/features/event-programs/event-program.api', () => ({
  getEventProgram: vi.fn().mockResolvedValue({ data: { items: [] } }),
  updateEventProgram: vi.fn(),
}))
vi.mock('~/features/event-venues/event-venue.api', () => ({
  getEventVenues: vi.fn().mockResolvedValue({ data: [] }),
  updateEventVenues: vi.fn(),
}))
vi.mock('~/features/event-groups/event-group.api', () => ({
  listEventGroups: vi.fn().mockResolvedValue({ data: { items: [] } }),
}))

import EventPage from '~/pages/(dashboard)/dashboard/events/[id]/index.vue'

const event = {
  id: 5,
  name: 'Ana & Marco',
  type: 'Wedding',
  venueName: 'Manila Cathedral',
  startsAt: '2027-06-12T07:00:00Z',
  endsAt: '2027-06-12T13:00:00Z',
  timezone: 'Asia/Manila',
  bornOn: null,
  diedOn: null,
  subdomain: 'ana-and-marco',
  createdAt: '2026-10-01T00:00:00Z',
  access: ['Owner'],
  eventGroup: null,
} satisfies Event

const mountPage = async (route: string) => {
  const wrapper = await mountSuspended(EventPage, { route })
  await flushPromises()
  return wrapper
}

const activeTab = (wrapper: Awaited<ReturnType<typeof mountPage>>) =>
  wrapper.find('[role="tab"][data-state="active"]').text()

describe('event page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Signed in, so the route guard lets the dashboard page open
    localStorage.setItem('isAuthenticated', 'true')
    getEvent.mockResolvedValue({ data: event })
  })

  it('loads the event and opens Details, with the tabs in order', async () => {
    const wrapper = await mountPage('/dashboard/events/5')

    expect(getEvent).toHaveBeenCalledWith(5)
    expect(wrapper.find('h1').text()).toBe('Ana & Marco')
    expect(wrapper.findAll('[role="tab"]').map(tab => tab.text())).toEqual(['Details', 'Venues', 'Program', 'Website', 'Guests & RSVP'])
    expect(activeTab(wrapper)).toBe('Details')
    expect(wrapper.find('input[id="name"]').exists()).toBe(true)
  })

  it('opens the tab named in the URL', async () => {
    const wrapper = await mountPage('/dashboard/events/5?tab=website')

    expect(activeTab(wrapper)).toBe('Website')
    // The site domain of this environment (NUXT_PUBLIC_SITE_BASE_URL)
    expect(wrapper.text()).toContain('ana-and-marco.localhost:3000')
  })

  it('starts the website with the choice between a template and a blank page', async () => {
    const wrapper = await mountPage('/dashboard/events/5?tab=website')
    const choices = wrapper.findAll('[data-start]')

    expect(choices.map(choice => choice.attributes('data-start'))).toEqual(['template', 'blank'])
    expect(choices[0]!.text()).toContain('Start from a template')
    // Starting from a template still allows adding sections
    expect(choices[0]!.text()).toContain('You can still add your own sections')
    expect(choices[1]!.text()).toContain('Start from scratch')

    await choices[0]!.trigger('click')
    expect(wrapper.find('[data-start]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Templates')

    await wrapper.findAll('button').find(button => button.text() === 'Back')!.trigger('click')
    expect(wrapper.findAll('[data-start]')).toHaveLength(2)
  })

  it('opens the website editor on an empty page when starting from scratch, and keeps it when switching tabs', async () => {
    const wrapper = await mountPage('/dashboard/events/5?tab=website')

    await wrapper.find('[data-start="blank"]').trigger('click')
    expect(wrapper.text()).toContain('Your page is empty')

    // Switching tabs keeps the draft (the tab stays mounted)
    await wrapper.findAll('[role="tab"]').find(tab => tab.text() === 'Details')!.trigger('mousedown')
    await vi.waitFor(() => expect(activeTab(wrapper)).toBe('Details'))
    await wrapper.findAll('[role="tab"]').find(tab => tab.text() === 'Website')!.trigger('mousedown')
    await vi.waitFor(() => expect(activeTab(wrapper)).toBe('Website'))
    expect(wrapper.text()).toContain('Your page is empty')
    expect(wrapper.find('[data-start]').exists()).toBe(false)
  })

  it('loads the event\'s program into the Program tab', async () => {
    const wrapper = await mountPage('/dashboard/events/5?tab=program')

    expect(activeTab(wrapper)).toBe('Program')
    expect(wrapper.text()).toContain('No items yet.')
  })

  it('loads the event\'s venues into the Venues tab', async () => {
    const wrapper = await mountPage('/dashboard/events/5?tab=venues')

    expect(activeTab(wrapper)).toBe('Venues')
    expect(wrapper.text()).toContain('No venues yet.')
  })

  it('shows "Event not found" when the event cannot be loaded', async () => {
    getEvent.mockRejectedValue(new Error('Not found'))
    const wrapper = await mountPage('/dashboard/events/99')

    expect(wrapper.text()).toContain('Event not found')
    expect(wrapper.find('[role="tab"]').exists()).toBe(false)
  })
})
