import type { Event } from '~/features/events/event.type'
import type { HeroContent } from '~/features/sections/hero/hero.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import WebsiteHeroFields from '~/pages/(dashboard)/dashboard/events/[id]/_components/website/WebsiteHeroFields.vue'

const memorial: Event = {
  id: 9,
  name: 'Lola Ising',
  type: 'Memorial',
  venueName: 'Santuario de San Antonio',
  startsAt: '2026-10-10T02:00:00Z',
  endsAt: '2026-10-10T05:00:00Z',
  timezone: 'Asia/Manila',
  bornOn: '1938-05-01',
  diedOn: '2026-10-03',
  subdomain: 'lola-ising',
  createdAt: '2026-10-04T00:00:00Z',
  access: ['Owner'],
  eventGroup: null,
}

async function mountFields(event: Event = memorial, content: HeroContent = { layoutPhotos: [], lifeDates: 'years' }) {
  const wrapper = await mountSuspended(WebsiteHeroFields, {
    props: {
      event,
      content,
      'onUpdate:content': (next: HeroContent) => wrapper.setProps({ content: next }),
    },
  })
  return wrapper
}

type Fields = Awaited<ReturnType<typeof mountFields>>
const card = (wrapper: Fields, label: string) =>
  wrapper.find('[data-life-dates-field]').findAll('[data-choice]').find(item => item.text() === label)!

describe('website hero fields', () => {
  it('shows a memorial\'s life dates with the event\'s details: the choice, then the dates as text, both indented', async () => {
    const wrapper = await mountFields()
    const eventFields = wrapper.find('[data-event-fields]')
    const lifeDates = eventFields.findAll('dt')[1]!.element.parentElement!

    expect(eventFields.find('[role="note"]').text()).toContain('Heading, life dates, date and place are from the event details.')
    expect(eventFields.findAll('dt').map(dt => dt.text())).toEqual(['Heading', 'Life dates', 'Date', 'Place'])
    // Label, how they show, then the dates as the hero shows them, indented like the other read-only values
    expect([...lifeDates.children].map(child => child.tagName)).toEqual(['DT', 'DIV', 'DD'])
    expect(lifeDates.children[1]!.classList).toContain('ps-3')
    expect(wrapper.find('[data-life-dates-field]').attributes('aria-label')).toBe('Life dates')
    expect(wrapper.find('[data-life-dates-field]').findAll('[data-choice]').map(item => item.text())).toEqual(['None', 'Full dates', 'Years only'])
    expect(card(wrapper, 'Years only').attributes('data-state')).toBe('on')
    expect(eventFields.findAll('dd')[1]!.text()).toBe('1938 – 2026')
    expect(eventFields.findAll('dd')[1]!.classes()).toContain('ps-3')
  })

  it('picks full dates, years only or none (stored as no value; the dates still shown in full)', async () => {
    const wrapper = await mountFields()
    const dates = () => wrapper.find('[data-event-fields]').findAll('dd')[1]!.text()

    await card(wrapper, 'Full dates').trigger('click')
    expect(wrapper.props('content').lifeDates).toBe('full')
    expect(dates()).toBe('1 May 1938 – 3 October 2026')

    await card(wrapper, 'None').trigger('click')
    expect(wrapper.props('content')).not.toHaveProperty('lifeDates', expect.anything())
    expect(dates()).toBe('1 May 1938 – 3 October 2026')
  })

  it('says the dates aren\'t added yet without both', async () => {
    const wrapper = await mountFields({ ...memorial, diedOn: null })

    expect(wrapper.find('[data-event-fields]').findAll('dd')[1]!.text()).toBe('Not added yet')
  })

  it('offers no life dates for other kinds of events', async () => {
    const wrapper = await mountFields({ ...memorial, type: 'Wedding', bornOn: null, diedOn: null }, { layoutPhotos: [] })

    expect(wrapper.find('[data-life-dates-field]').exists()).toBe(false)
    expect(wrapper.find('[data-event-fields]').findAll('dt').map(dt => dt.text())).toEqual(['Heading', 'Date', 'Place'])
  })
})
