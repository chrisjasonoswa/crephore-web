import type { EventProgram } from '~/features/event-programs/event-program.type'
import type { EventVenue } from '~/features/event-venues/event-venue.type'
import type { Event } from '~/features/events/event.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { AxiosError, AxiosHeaders } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { updateEventProgram, updateEventVenues, cToast } = vi.hoisted(() => ({
  updateEventProgram: vi.fn(),
  updateEventVenues: vi.fn(),
  cToast: vi.fn(),
}))

vi.mock('~/features/event-programs/event-program.api', () => ({ updateEventProgram }))
vi.mock('~/features/event-venues/event-venue.api', () => ({ updateEventVenues }))
vi.mock('~/lib/cToast', () => ({ cToast }))

import EventProgramTab from '~/pages/(dashboard)/dashboard/events/[id]/_components/EventProgramTab.vue'

// A one-day event on 14 Feb 2027 in Manila
const event: Event = {
  id: 5,
  name: 'Ana & Marco',
  type: 'Wedding',
  venueName: 'Manila Cathedral',
  startsAt: '2027-02-14T06:00:00Z',
  endsAt: '2027-02-14T14:00:00Z',
  timezone: 'Asia/Manila',
  bornOn: null,
  diedOn: null,
  subdomain: 'ana-and-marco',
  createdAt: '2026-10-01T00:00:00Z',
  access: ['Owner'],
  eventGroup: null,
}

const venue = (id: number, name: string): EventVenue => ({
  id,
  name,
  address: null,
  googleMapsUrl: null,
  appleMapsUrl: null,
  latitude: null,
  longitude: null,
  photoUrl: null,
  notes: null,
})
const venues = [venue(10, 'Manila Cathedral'), venue(11, 'The Manila Hotel')]

const item = (id: number, title: string, date = '2027-02-14') =>
  ({ id, date, startTime: '15:00', endTime: '16:00', title, description: null, venueId: 10, speakers: null })
const program: EventProgram = { items: [item(1, 'Ceremony'), item(2, 'Cocktails'), item(3, 'After-party', '2027-02-15')] }

const mountTab = async (props: { event?: Event, program?: EventProgram, venues?: EventVenue[] } = {}) => {
  const wrapper = await mountSuspended(EventProgramTab, { props: { event, program, venues, ...props }, attachTo: document.body })
  await flushPromises()
  return wrapper
}

type Wrapper = Awaited<ReturnType<typeof mountTab>>
const buttonNamed = (wrapper: Wrapper, name: string) => wrapper.findAll('button').find(button => button.text() === name)!
const fieldOf = (wrapper: Wrapper, index: number, name: string) => wrapper.findAll('[data-program-item]')[index]!.find(`[id$="-${name}"]`)
const sentRequest = () => updateEventProgram.mock.calls[0]![1]

// The day and venue dropdowns (shadcn Select): their choices open in a popup outside the component
async function openSelect(wrapper: Wrapper, index: number, name: string) {
  await fieldOf(wrapper, index, name).trigger('keydown', { key: 'Enter' })
  await flushPromises()
  return [...document.body.querySelectorAll<HTMLElement>('[role="option"]')]
}
const openDays = (wrapper: Wrapper, index: number) => openSelect(wrapper, index, 'date')
async function pick(wrapper: Wrapper, index: number, name: string, label: string) {
  const option = (await openSelect(wrapper, index, name)).find(element => element.textContent?.trim() === label)!
  option.focus()
  option.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
  await flushPromises()
}

describe('EventProgramTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows the saved items with their venues, with nothing to save yet', async () => {
    const wrapper = await mountTab()

    expect(fieldOf(wrapper, 0, 'venue').text()).toContain('Manila Cathedral')
    expect(wrapper.findAll('[data-program-item]')).toHaveLength(3)
    expect((fieldOf(wrapper, 0, 'title').element as HTMLInputElement).value).toBe('Ceremony')
    expect(buttonNamed(wrapper, 'Save changes').attributes('disabled')).toBeDefined()
  })

  it('edits an item and saves the whole program with PUT /events/{id}/program, saved items by id', async () => {
    const savedProgram = { ...program, items: [{ ...item(1, 'Wedding ceremony'), startTime: '14:30', endTime: null }, item(2, 'Cocktails'), item(3, 'After-party', '2027-02-15')] }
    updateEventProgram.mockResolvedValue({ data: savedProgram })
    const wrapper = await mountTab()

    await fieldOf(wrapper, 0, 'title').setValue('Wedding ceremony')
    await fieldOf(wrapper, 0, 'start').setValue('14:30')
    await fieldOf(wrapper, 0, 'end').setValue('')
    await buttonNamed(wrapper, 'Save changes').trigger('submit')
    await flushPromises()

    expect(updateEventProgram).toHaveBeenCalledWith(5, expect.objectContaining({ items: expect.any(Array) }))
    expect(sentRequest().items[0]).toEqual({ id: 1, date: '2027-02-14', startTime: '14:30', endTime: null, title: 'Wedding ceremony', description: null, venueId: 10, speakers: null })
    expect(sentRequest().items.map((sent: { id: number }) => sent.id)).toEqual([1, 2, 3])
    expect(wrapper.emitted('saved')).toEqual([[savedProgram]])
    expect(cToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Program saved.' }))
    expect(buttonNamed(wrapper, 'Save changes').attributes('disabled')).toBeDefined()
  })

  it('picks one of the event\'s venues for an item, the main one marked, or none', async () => {
    updateEventProgram.mockResolvedValue({ data: program })
    const wrapper = await mountTab()

    expect((await openSelect(wrapper, 1, 'venue')).map(option => option.textContent?.trim())).toEqual([
      'Manila Cathedral · Main venue',
      'The Manila Hotel',
      'No venue',
      'Add a venue…',
    ])
    document.body.querySelector<HTMLElement>('[role="listbox"]')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()
    await pick(wrapper, 1, 'venue', 'The Manila Hotel')
    await pick(wrapper, 2, 'venue', 'No venue')
    await buttonNamed(wrapper, 'Save changes').trigger('submit')
    await flushPromises()

    expect(sentRequest().items.map((sent: { venueId: number | null }) => sent.venueId)).toEqual([10, 11, null])
  })

  it('adds a venue from an item: saved to the event\'s venues after the saved ones, then picked', async () => {
    const added = venue(12, 'Poolside Bar')
    updateEventVenues.mockResolvedValue({ data: [...venues, added] })
    const wrapper = await mountTab()

    await pick(wrapper, 2, 'venue', 'Add a venue…')
    const dialog = document.body.querySelector<HTMLElement>('[role="dialog"]')!
    expect(dialog.textContent).toContain('Add a venue')
    const name = dialog.querySelector<HTMLInputElement>('input')!
    name.value = '  Poolside Bar '
    name.dispatchEvent(new Event('input'))
    await flushPromises()
    ;[...dialog.querySelectorAll('button')].find(button => button.textContent?.trim() === 'Add venue')!.click()
    await flushPromises()

    expect(updateEventVenues).toHaveBeenCalledWith(5, { venues: [
      expect.objectContaining({ id: 10, name: 'Manila Cathedral' }),
      expect.objectContaining({ id: 11, name: 'The Manila Hotel' }),
      expect.objectContaining({ id: null, name: 'Poolside Bar' }),
    ] })
    expect(wrapper.emitted('venues-saved')).toEqual([[[...venues, added]]])
    // The page passes the saved venues back
    await wrapper.setProps({ venues: [...venues, added] })
    expect(fieldOf(wrapper, 2, 'venue').text()).toContain('Poolside Bar')
  })

  it('moves an item whose venue was removed to the main venue, as the API does', async () => {
    updateEventProgram.mockResolvedValue({ data: program })
    const wrapper = await mountTab({ program: { items: [item(1, 'Ceremony'), { ...item(2, 'Reception'), venueId: 11 }] } })

    await wrapper.setProps({ venues: [venues[0]!] })
    await buttonNamed(wrapper, 'Save changes').trigger('submit')
    await flushPromises()

    expect(sentRequest().items.map((sent: { venueId: number | null }) => sent.venueId)).toEqual([10, 10])
  })

  it('offers the event\'s day and the next, plus an item\'s own date when it\'s another', async () => {
    const wrapper = await mountTab({ program: { ...program, items: [...program.items, item(4, 'Brunch', '2027-03-01')] } })

    expect(fieldOf(wrapper, 0, 'date').text()).toBe('Event day · Sun, 14 Feb')
    expect((await openDays(wrapper, 3)).map(option => option.textContent?.trim())).toEqual(['Event day · Sun, 14 Feb', 'Next day · Mon, 15 Feb', 'Mon, 1 Mar'])
  })

  it('moves an item to another day', async () => {
    updateEventProgram.mockResolvedValue({ data: program })
    const wrapper = await mountTab()

    await pick(wrapper, 0, 'date', 'Next day · Mon, 15 Feb')
    expect(fieldOf(wrapper, 0, 'date').text()).toBe('Next day · Mon, 15 Feb')
    await buttonNamed(wrapper, 'Save changes').trigger('submit')
    await flushPromises()

    expect(sentRequest().items[0].date).toBe('2027-02-15')
  })

  it('adds an item on the last item\'s day at the main venue, removes and reorders items, and sends new items without an id', async () => {
    updateEventProgram.mockResolvedValue({ data: program })
    const wrapper = await mountTab()

    await buttonNamed(wrapper, 'Add an item').trigger('click')
    await fieldOf(wrapper, 3, 'title').setValue('Breakfast')
    await wrapper.find('button[aria-label="Remove Cocktails"]').trigger('click')
    await wrapper.findAll('[data-program-handle]')[0]!.trigger('keydown', { key: 'ArrowDown' })
    await buttonNamed(wrapper, 'Save changes').trigger('submit')
    await flushPromises()

    expect(sentRequest().items.map((sent: { id: number | null, title: string, date: string, venueId: number | null }) => [sent.id, sent.title, sent.date, sent.venueId])).toEqual([
      [3, 'After-party', '2027-02-15', 10],
      [1, 'Ceremony', '2027-02-14', 10],
      [null, 'Breakfast', '2027-02-15', 10],
    ])
  })

  it('shows what\'s missing beside the item instead of saving', async () => {
    const wrapper = await mountTab()

    await buttonNamed(wrapper, 'Add an item').trigger('click')
    await fieldOf(wrapper, 3, 'end').setValue('10:00')
    await buttonNamed(wrapper, 'Save changes').trigger('submit')
    await flushPromises()

    expect(updateEventProgram).not.toHaveBeenCalled()
    const added = wrapper.findAll('[data-program-item]')[3]!
    expect(added.text()).toContain('Title is required.')
    expect(added.text()).toContain('Add a start time first.')
  })

  it('shows the API\'s errors beside the item they\'re about', async () => {
    updateEventProgram.mockRejectedValue(new AxiosError('Bad Request', '400', undefined, undefined, {
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: { success: false, message: 'Some fields are invalid.', errors: { 'items[1].title': ['Title must be 150 characters or fewer.'] } },
    }))
    const wrapper = await mountTab()

    await fieldOf(wrapper, 1, 'title').setValue('Cocktails by the pool')
    await buttonNamed(wrapper, 'Save changes').trigger('submit')
    await flushPromises()

    expect(wrapper.findAll('[data-program-item]')[1]!.text()).toContain('Title must be 150 characters or fewer.')
  })

  it('discards changes back to the saved program', async () => {
    const wrapper = await mountTab()

    await fieldOf(wrapper, 0, 'title').setValue('Mass')
    expect(wrapper.text()).toContain('You have unsaved changes.')
    // In the red save bar above the items
    expect(wrapper.find('form').element.firstElementChild).toBe(wrapper.find('[data-save-bar]').element)
    expect(wrapper.find('[data-save-bar]').classes()).toContain('bg-red-50')
    await buttonNamed(wrapper, 'Discard changes').trigger('click')

    expect((fieldOf(wrapper, 0, 'title').element as HTMLInputElement).value).toBe('Ceremony')
    expect(wrapper.text()).not.toContain('You have unsaved changes.')
  })

  it('says the section stays hidden without items', async () => {
    const wrapper = await mountTab({ program: { items: [] } })

    expect(wrapper.text()).toContain('No items yet. The program section stays hidden on your website until you add one.')
  })

  it('is read-only without owner access', async () => {
    const wrapper = await mountTab({ event: { ...event, access: [] } })

    expect(wrapper.find('fieldset').attributes('disabled')).toBeDefined()
    expect(wrapper.findAll('button').some(button => button.text() === 'Save changes')).toBe(false)
    expect(wrapper.find('[data-save-bar]').exists()).toBe(false)
    expect(wrapper.find('[data-program-handle]').exists()).toBe(false)
  })
})
