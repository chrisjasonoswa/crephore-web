import type { Event } from '~/features/events/event.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { AxiosError, AxiosHeaders } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { updateEvent, cToast } = vi.hoisted(() => ({
  updateEvent: vi.fn(),
  cToast: vi.fn(),
}))

vi.mock('~/features/events/event.api', () => ({ updateEvent }))
vi.mock('~/features/event-groups/event-group.api', () => ({
  listEventGroups: vi.fn().mockResolvedValue({ data: { items: [] } }),
}))
vi.mock('~/lib/cToast', () => ({ cToast }))

import EventDetailsForm from '~/pages/(dashboard)/dashboard/events/[id]/_components/EventDetailsForm.vue'

const event: Event = {
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
  timeline: ['Opening', 'Dinner'],
}

const mountForm = async (props: { event: Event } = { event }) => {
  const wrapper = await mountSuspended(EventDetailsForm, { props })
  await flushPromises()
  return wrapper
}

const saveButton = (wrapper: Awaited<ReturnType<typeof mountForm>>) =>
  wrapper.findAll('button').find(button => button.text() === 'Save changes')!

describe('EventDetailsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fills the fields from the event, with nothing to save yet', async () => {
    const wrapper = await mountForm()

    expect((wrapper.find('input[id="name"]').element as HTMLInputElement).value).toBe('Ana & Marco')
    expect((wrapper.find('input[id="timeline[1]"]').element as HTMLInputElement).value).toBe('Dinner')
    expect(saveButton(wrapper).attributes('disabled')).toBeDefined()
  })

  it('saves the changes with PUT /events/{id} and starts again from the saved event', async () => {
    const saved = { ...event, name: 'Ana & Marco 2027' }
    updateEvent.mockResolvedValue({ data: saved })
    const wrapper = await mountForm()

    await wrapper.find('input[id="name"]').setValue('  Ana & Marco 2027 ')
    await flushPromises()
    expect(saveButton(wrapper).attributes('disabled')).toBeUndefined()

    await wrapper.find('form').trigger('submit')
    // Validation runs first (async)
    await vi.waitFor(() => expect(wrapper.emitted('saved')).toBeDefined())

    expect(updateEvent).toHaveBeenCalledWith(5, expect.objectContaining({
      name: 'Ana & Marco 2027',
      startsAt: '2027-06-12T15:00',
      timezone: 'Asia/Manila',
      timeline: ['Opening', 'Dinner'],
    }))
    expect(wrapper.emitted('saved')).toEqual([[saved]])
    expect(cToast).toHaveBeenCalledWith({ title: 'Event updated.', type: 'success' })
    expect(saveButton(wrapper).attributes('disabled')).toBeDefined()
  })

  it('shows the API field errors on the fields', async () => {
    updateEvent.mockRejectedValue(new AxiosError('Bad request', '400', undefined, undefined, {
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: { success: false, data: null, message: 'Invalid', errors: { subdomain: ['This website address is already taken.'] } },
    }))
    const wrapper = await mountForm()

    await wrapper.find('input[id="subdomain"]').setValue('taken')
    await wrapper.find('form').trigger('submit')

    await vi.waitFor(() => expect(wrapper.text()).toContain('This website address is already taken.'))
    expect(wrapper.emitted('saved')).toBeUndefined()
  })

  it('discards the changes', async () => {
    const wrapper = await mountForm()

    await wrapper.find('input[id="name"]').setValue('Something else')
    await flushPromises()
    expect(wrapper.text()).toContain('You have unsaved changes.')

    await wrapper.findAll('button').find(button => button.text() === 'Discard changes')!.trigger('click')
    await flushPromises()

    expect((wrapper.find('input[id="name"]').element as HTMLInputElement).value).toBe('Ana & Marco')
    expect(wrapper.text()).not.toContain('You have unsaved changes.')
  })

  it('has no save buttons without edit access', async () => {
    const wrapper = await mountForm({ event: { ...event, access: [] } })

    expect(wrapper.findAll('button').some(button => button.text() === 'Save changes')).toBe(false)
  })
})
