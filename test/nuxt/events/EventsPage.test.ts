import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { emptyPage } = vi.hoisted(() => ({ emptyPage: { data: { items: [], page: 1, pageSize: 20, totalCount: 0, hasNextPage: false, hasPreviousPage: false } } }))

vi.mock('~/features/events/event.api', () => ({
  addEvent: vi.fn(),
  deleteEvent: vi.fn(),
  listEvents: vi.fn().mockResolvedValue(emptyPage),
}))
vi.mock('~/features/event-groups/event-group.api', () => ({
  addEventGroup: vi.fn(),
  addEventToGroup: vi.fn(),
  deleteEventGroup: vi.fn(),
  removeEventFromGroup: vi.fn(),
  listEventGroups: vi.fn().mockResolvedValue(emptyPage),
  updateEventGroup: vi.fn(),
}))

import EventsPage from '~/pages/(dashboard)/dashboard/events/index.vue'

const STORAGE_KEY = 'crephore:events:groups-panel-open'

async function mountPage() {
  const wrapper = await mountSuspended(EventsPage)
  await flushPromises()
  return wrapper
}

const viewGroups = (wrapper: Awaited<ReturnType<typeof mountPage>>) =>
  wrapper.findAll('button').find(button => button.text() === 'View groups')

describe('my events page', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with the groups panel closed', async () => {
    const wrapper = await mountPage()

    expect(wrapper.find('aside').exists()).toBe(false)
    expect(viewGroups(wrapper)).toBeDefined()
  })

  it('remembers the panel opened or closed for the next visit', async () => {
    const first = await mountPage()
    await viewGroups(first)!.trigger('click')
    expect(first.find('aside').exists()).toBe(true)
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true')
    first.unmount()

    const second = await mountPage()
    expect(second.find('aside').exists()).toBe(true)

    await second.find('button[aria-label="Hide event groups"]').trigger('click')
    second.unmount()
    expect(localStorage.getItem(STORAGE_KEY)).toBe('false')
    expect((await mountPage()).find('aside').exists()).toBe(false)
  })
})
