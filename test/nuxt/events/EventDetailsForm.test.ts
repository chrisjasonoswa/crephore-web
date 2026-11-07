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
    }))
    expect(wrapper.emitted('saved')).toEqual([[saved]])
    expect(cToast).toHaveBeenCalledWith({ title: 'Event updated.', type: 'success' })
    expect(saveButton(wrapper).attributes('disabled')).toBeDefined()
  })

  it('asks a memorial for the dates of birth and passing, and saves a cleared one as null', async () => {
    const memorial: Event = { ...event, type: 'Memorial', bornOn: '1938-05-01', diedOn: '2026-10-03' }
    updateEvent.mockResolvedValue({ data: { ...memorial, bornOn: null } })
    const wrapper = await mountForm({ event: memorial })
    const fields = wrapper.find('[data-memorial-fields]')

    expect(fields.findAll('label').map(label => label.text())).toEqual(expect.arrayContaining(['Date of birth', 'Date of passing']))
    expect(fields.find('button[id="bornOn"]').text()).toContain('1938')
    expect(fields.find('button[id="diedOn"]').text()).toContain('2026')

    await fields.find('button[aria-label="Clear date of birth"]').trigger('click')
    await flushPromises()
    await wrapper.find('form').trigger('submit')
    await vi.waitFor(() => expect(wrapper.emitted('saved')).toBeDefined())

    expect(updateEvent).toHaveBeenCalledWith(5, expect.objectContaining({ type: 'Memorial', bornOn: null, diedOn: '2026-10-03' }))
  })

  it('has no life dates for other kinds of events', async () => {
    const wrapper = await mountForm()

    expect(wrapper.find('[data-memorial-fields]').exists()).toBe(false)
  })

  it('shows the save bar above the fields: red while there are unsaved changes, green once saved', async () => {
    const wrapper = await mountForm()
    const bar = wrapper.find('[data-save-bar]')

    expect(wrapper.find('form').element.firstElementChild).toBe(bar.element)
    expect(bar.find('[data-save-status]').text()).toBe('All changes saved.')
    expect(bar.classes()).toContain('bg-green-50')

    await wrapper.find('input[id="name"]').setValue('Ana & Marco 2027')
    await flushPromises()
    expect(bar.find('[data-save-status]').text()).toBe('You have unsaved changes.')
    expect(bar.classes()).toContain('bg-red-50')
  })

  it('has no group field, and saves without touching the event\'s group', async () => {
    updateEvent.mockResolvedValue({ data: event })
    const wrapper = await mountForm({ event: { ...event, eventGroup: { id: 3, name: 'Family' } } })

    expect(wrapper.find('[id="eventGroupId"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Group')

    await wrapper.find('input[id="name"]').setValue('Ana & Marco 2027')
    await wrapper.find('form').trigger('submit')
    await vi.waitFor(() => expect(updateEvent).toHaveBeenCalled())
    expect(updateEvent.mock.calls[0]![1]).not.toHaveProperty('eventGroupId')
  })

  it('clears the end, saving the event without one', async () => {
    updateEvent.mockResolvedValue({ data: { ...event, endsAt: null } })
    const wrapper = await mountForm()

    await wrapper.find('button[aria-label="Clear event ends"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('button[id="endsAt"]').text()).toContain('Pick a date')
    await wrapper.find('form').trigger('submit')
    await vi.waitFor(() => expect(wrapper.emitted('saved')).toBeDefined())

    expect(updateEvent).toHaveBeenCalledWith(5, expect.objectContaining({ endsAt: null }))
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
