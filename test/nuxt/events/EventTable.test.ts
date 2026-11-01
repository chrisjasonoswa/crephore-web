import type { EventFormValues } from '~/pages/(dashboard)/dashboard/events/_components/event.form.schema'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { addEvent, navigateTo } = vi.hoisted(() => ({ addEvent: vi.fn(), navigateTo: vi.fn() }))

vi.mock('~/features/events/event.api', () => ({
  addEvent,
  deleteEvent: vi.fn(),
  listEvents: vi.fn().mockResolvedValue({ data: { items: [], page: 1, pageSize: 20, totalCount: 0, hasNextPage: false, hasPreviousPage: false } }),
}))
mockNuxtImport('navigateTo', () => navigateTo)

import { eventFormInitialValues } from '~/pages/(dashboard)/dashboard/events/_components/event.form.schema'
import EventTable from '~/pages/(dashboard)/dashboard/events/_components/EventTable.vue'

// What the table's add dialog calls on submit (CDataTable is generic, so its props aren't typed through findComponent)
const addItemOf = (wrapper: Awaited<ReturnType<typeof mountSuspended>>) =>
  wrapper.findComponent({ name: 'CDataTable' }).props('addItem') as (values: EventFormValues) => Promise<unknown>

const values: EventFormValues = {
  ...eventFormInitialValues,
  name: 'Ana & Marco',
  startsAt: '2027-06-12T15:00',
  timezone: 'Asia/Manila',
  subdomain: 'ana-and-marco',
}

describe('event table', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('opens the new event\'s page after adding it', async () => {
    addEvent.mockResolvedValue({ data: { id: 42 } })
    const wrapper = await mountSuspended(EventTable, { props: { eventGroupId: null } })
    await flushPromises()

    await addItemOf(wrapper)(values)

    expect(addEvent).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ana & Marco', subdomain: 'ana-and-marco' }))
    expect(wrapper.emitted('changed')).toHaveLength(1)
    expect(navigateTo).toHaveBeenCalledWith('/dashboard/events/42')
  })

  it('stays on the list when adding fails', async () => {
    addEvent.mockRejectedValue(new Error('Subdomain taken'))
    const wrapper = await mountSuspended(EventTable, { props: { eventGroupId: null } })
    await flushPromises()

    await expect(addItemOf(wrapper)(values)).rejects.toThrow()
    expect(navigateTo).not.toHaveBeenCalled()
  })
})
