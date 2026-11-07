import type { EventProgram } from '~/features/event-programs/event-program.type'
import type { EventVenue } from '~/features/event-venues/event-venue.type'
import type { Event } from '~/features/events/event.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { updateEventVenues, getMapPin, cToast } = vi.hoisted(() => ({
  updateEventVenues: vi.fn(),
  getMapPin: vi.fn(),
  cToast: vi.fn(),
}))

vi.mock('~/features/event-venues/event-venue.api', () => ({ updateEventVenues }))
vi.mock('~/features/event-venues/map-pin.api', () => ({ getMapPin }))
vi.mock('~/lib/cToast', () => ({ cToast }))

import EventVenuesTab from '~/pages/(dashboard)/dashboard/events/[id]/_components/EventVenuesTab.vue'

const event: Event = {
  id: 5,
  name: 'Ana & Marco',
  type: 'Wedding',
  venueName: 'Manila Cathedral',
  startsAt: '2027-02-14T06:00:00Z',
  endsAt: null,
  timezone: 'Asia/Manila',
  bornOn: null,
  diedOn: null,
  subdomain: 'ana-and-marco',
  createdAt: '2026-10-01T00:00:00Z',
  access: ['Owner'],
  eventGroup: null,
}

const venue = (id: number, name: string, extra: Partial<EventVenue> = {}): EventVenue => ({
  id,
  name,
  address: null,
  googleMapsUrl: null,
  appleMapsUrl: null,
  latitude: null,
  longitude: null,
  photoUrl: null,
  notes: null,
  ...extra,
})
const venues = [venue(10, 'Manila Cathedral', { address: 'Intramuros, Manila' }), venue(11, 'The Manila Hotel')]

const item = (id: number, title: string, venueId: number | null) =>
  ({ id, date: '2027-02-14', startTime: null, endTime: null, title, description: null, venueId, speakers: null })
const program: EventProgram = { items: [item(1, 'Ceremony', 10), item(2, 'Cocktails', 11), item(3, 'Reception', 11)] }

const mountTab = async (props: { event?: Event, venues?: EventVenue[] } = {}) => {
  const wrapper = await mountSuspended(EventVenuesTab, { props: { event, venues, program, ...props }, attachTo: document.body })
  await flushPromises()
  return wrapper
}

type Wrapper = Awaited<ReturnType<typeof mountTab>>
const buttonNamed = (wrapper: Wrapper, name: string) => wrapper.findAll('button').find(button => button.text() === name)!
const card = (wrapper: Wrapper, index: number) => wrapper.findAll('[data-venue]')[index]!
const openCard = (wrapper: Wrapper, index: number) => card(wrapper, index).find('button[aria-expanded]').trigger('click')
const field = (wrapper: Wrapper, index: number, name: string) => card(wrapper, index).find(`[id$="-${name}"]`)
const sentVenues = () => updateEventVenues.mock.calls[0]![1].venues

describe('EventVenuesTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('lists the venues, the first as the main venue, with the program items at each', async () => {
    const wrapper = await mountTab()

    expect(wrapper.findAll('[data-venue-name]').map(name => name.text())).toEqual(['Manila Cathedral', 'The Manila Hotel'])
    expect(card(wrapper, 0).find('[data-main-venue]').exists()).toBe(true)
    expect(card(wrapper, 1).find('[data-main-venue]').exists()).toBe(false)
    expect(card(wrapper, 0).text()).toContain('Intramuros, Manila')
    expect(card(wrapper, 1).text()).toContain('Used by Cocktails, Reception')
    expect(buttonNamed(wrapper, 'Save changes').attributes('disabled')).toBeDefined()
  })

  it('edits a venue and saves the whole list with PUT /events/{id}/venues', async () => {
    updateEventVenues.mockResolvedValue({ data: venues })
    const wrapper = await mountTab()

    await openCard(wrapper, 1)
    await field(wrapper, 1, 'notes').setValue('Free valet at the lobby.')
    await buttonNamed(wrapper, 'Save changes').trigger('submit')
    await flushPromises()

    expect(updateEventVenues).toHaveBeenCalledWith(5, expect.anything())
    expect(sentVenues().map((sent: { id: number | null }) => sent.id)).toEqual([10, 11])
    expect(sentVenues()[1]).toMatchObject({ name: 'The Manila Hotel', notes: 'Free valet at the lobby.' })
    expect(wrapper.emitted('saved')).toEqual([[venues]])
    expect(cToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Venues saved.' }))
  })

  it('adds a venue (opened to fill in), makes another the main venue, and sends new ones without an id', async () => {
    updateEventVenues.mockResolvedValue({ data: venues })
    const wrapper = await mountTab()

    await buttonNamed(wrapper, 'Add a venue').trigger('click')
    await field(wrapper, 2, 'name').setValue('Poolside Bar')
    await openCard(wrapper, 1)
    await buttonNamed(wrapper, 'Make main venue').trigger('click')
    expect(card(wrapper, 0).find('[data-venue-name]').text()).toBe('The Manila Hotel')
    expect(card(wrapper, 0).find('[data-main-venue]').exists()).toBe(true)
    await buttonNamed(wrapper, 'Save changes').trigger('submit')
    await flushPromises()

    expect(sentVenues().map((sent: { id: number | null, name: string }) => [sent.id, sent.name])).toEqual([
      [11, 'The Manila Hotel'],
      [10, 'Manila Cathedral'],
      [null, 'Poolside Bar'],
    ])
  })

  it('says where a removed venue\'s items go before removing it', async () => {
    updateEventVenues.mockResolvedValue({ data: [venues[0]!] })
    const wrapper = await mountTab()

    await openCard(wrapper, 1)
    await buttonNamed(wrapper, 'Remove venue').trigger('click')
    await flushPromises()
    const dialog = document.body.querySelector<HTMLElement>('[role="alertdialog"], [role="dialog"]')!
    expect(dialog.textContent).toContain('Cocktails, Reception will move to Manila Cathedral when you save.')
    ;[...dialog.querySelectorAll('button')].find(button => button.textContent?.trim() === 'Remove')!.click()
    await flushPromises()
    await buttonNamed(wrapper, 'Save changes').trigger('submit')
    await flushPromises()

    expect(sentVenues().map((sent: { id: number | null }) => sent.id)).toEqual([10])
  })

  it('shows what\'s wrong beside the field instead of saving, opening the venue', async () => {
    const wrapper = await mountTab()

    await buttonNamed(wrapper, 'Add a venue').trigger('click')
    await field(wrapper, 2, 'google').setValue('https://example.com/map')
    await buttonNamed(wrapper, 'Save changes').trigger('submit')
    await flushPromises()

    expect(updateEventVenues).not.toHaveBeenCalled()
    expect(card(wrapper, 2).text()).toContain('Name is required.')
    expect(card(wrapper, 2).text()).toContain('Google Maps link must be a link from Google Maps.')
  })

  it('reads the pin from a pasted map link and previews it on a map', async () => {
    getMapPin.mockResolvedValue({ lat: 14.5915, lng: 120.9736, exact: true })
    updateEventVenues.mockResolvedValue({ data: venues })
    const wrapper = await mountTab()

    await openCard(wrapper, 0)
    expect(card(wrapper, 0).find('[data-venue-map] iframe').exists()).toBe(false)
    await field(wrapper, 0, 'google').setValue('https://maps.app.goo.gl/abc')
    await new Promise(resolve => setTimeout(resolve, 450))
    await flushPromises()

    expect(getMapPin).toHaveBeenCalledWith('https://maps.app.goo.gl/abc')
    expect(card(wrapper, 0).find('[data-venue-map] iframe').attributes('src')).toContain('google.com/maps/embed')
    await buttonNamed(wrapper, 'Save changes').trigger('submit')
    await flushPromises()
    expect(sentVenues()[0]).toMatchObject({ googleMapsUrl: 'https://maps.app.goo.gl/abc', latitude: 14.5915, longitude: 120.9736 })
  })

  it('clears the pin with the map links, both latitude and longitude', async () => {
    updateEventVenues.mockResolvedValue({ data: venues })
    const wrapper = await mountTab({ venues: [venue(10, 'Manila Cathedral', { googleMapsUrl: 'https://maps.app.goo.gl/abc', latitude: 14.5915, longitude: 120.9736 })] })

    await openCard(wrapper, 0)
    expect(card(wrapper, 0).find('[data-venue-map] iframe').exists()).toBe(true)
    await field(wrapper, 0, 'google').setValue('')
    await new Promise(resolve => setTimeout(resolve, 450))
    await flushPromises()

    expect(card(wrapper, 0).find('[data-venue-map] iframe').exists()).toBe(false)
    await buttonNamed(wrapper, 'Save changes').trigger('submit')
    await flushPromises()
    expect(sentVenues()[0]).toMatchObject({ googleMapsUrl: null, latitude: null, longitude: null })
  })

  it('says when a link has no place it can read', async () => {
    getMapPin.mockResolvedValue(null)
    const wrapper = await mountTab()

    await openCard(wrapper, 1)
    await field(wrapper, 1, 'apple').setValue('https://maps.apple.com/?q=Hotel')
    await new Promise(resolve => setTimeout(resolve, 450))
    await flushPromises()

    expect(card(wrapper, 1).find('[data-venue-map]').text()).toContain('Couldn\'t find the place in that link.')
  })

  it('adds venues saved elsewhere (the Program tab) and keeps edits here', async () => {
    const wrapper = await mountTab()

    await openCard(wrapper, 0)
    await field(wrapper, 0, 'notes').setValue('Street parking.')
    await wrapper.setProps({ venues: [...venues, venue(12, 'Poolside Bar')] })

    expect(wrapper.findAll('[data-venue-name]').map(name => name.text())).toEqual(['Manila Cathedral', 'The Manila Hotel', 'Poolside Bar'])
    expect((field(wrapper, 0, 'notes').element as HTMLTextAreaElement).value).toBe('Street parking.')
  })

  it('is read-only without owner access', async () => {
    const wrapper = await mountTab({ event: { ...event, access: [] } })

    await openCard(wrapper, 0)
    expect(wrapper.find('[data-save-bar]').exists()).toBe(false)
    expect(wrapper.findAll('button').some(button => button.text() === 'Add a venue')).toBe(false)
    expect(card(wrapper, 0).find('fieldset').attributes('disabled')).toBeDefined()
  })
})
