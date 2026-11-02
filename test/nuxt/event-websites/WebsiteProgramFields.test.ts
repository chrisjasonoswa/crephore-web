import type { ProgramContent } from '~/features/sections/program/program.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { sampleProgramItems } from '~/features/sections/program/program.helpers'
import WebsiteProgramFields from '~/pages/(dashboard)/dashboard/events/[id]/_components/website/WebsiteProgramFields.vue'

// A one-day event on 14 Feb 2027 in Manila
const event = { startsAt: '2027-02-14T06:00:00Z', endsAt: '2027-02-14T14:00:00Z', timezone: 'Asia/Manila' }

async function mountFields(content: ProgramContent = { eyebrow: 'The day', heading: 'Program', items: sampleProgramItems('2027-02-14'), layoutPhotos: [] }) {
  const wrapper = await mountSuspended(WebsiteProgramFields, {
    props: {
      event,
      content,
      'onUpdate:content': (next: ProgramContent) => wrapper.setProps({ content: next }),
    },
  })
  return wrapper
}

type Wrapper = Awaited<ReturnType<typeof mountFields>>
const itemsOf = (wrapper: Wrapper) => (wrapper.props('content') as ProgramContent).items
const fieldOf = (wrapper: Wrapper, index: number, name: string) => wrapper.findAll('[data-program-item]')[index]!.find(`[id$="-${name}"]`)

describe('website program fields', () => {
  it('edits an item\'s title, times and venue, dropping emptied optional fields', async () => {
    const wrapper = await mountFields()

    await fieldOf(wrapper, 0, 'title').setValue('Wedding ceremony')
    await fieldOf(wrapper, 0, 'start').setValue('14:30')
    await fieldOf(wrapper, 0, 'end').setValue('')
    await fieldOf(wrapper, 0, 'venue').setValue('')

    expect(itemsOf(wrapper)[0]).toMatchObject({ title: 'Wedding ceremony', startTime: '14:30', endTime: undefined, venue: undefined })
  })

  it('offers the event\'s day and the next, and moves an item to another day', async () => {
    const wrapper = await mountFields()
    const select = fieldOf(wrapper, 0, 'date')

    expect(select.findAll('option').map(option => option.text())).toEqual(['Event day · Sun, 14 Feb', 'Next day · Mon, 15 Feb'])
    await select.setValue('2027-02-15')
    expect(itemsOf(wrapper)[0]!.date).toBe('2027-02-15')
  })

  it('shows an item without a date on the event\'s day', async () => {
    const wrapper = await mountFields({ heading: 'Program', items: sampleProgramItems(), layoutPhotos: [] })

    expect((fieldOf(wrapper, 0, 'date').element as HTMLSelectElement).value).toBe('2027-02-14')
  })

  it('adds an item on the last item\'s day and removes one', async () => {
    const wrapper = await mountFields()

    await wrapper.findAll('button').find(button => button.text() === 'Add an item')!.trigger('click')
    const added = itemsOf(wrapper).at(-1)!
    expect(itemsOf(wrapper)).toHaveLength(7)
    expect(added).toMatchObject({ title: '', date: '2027-02-15' })
    expect(added.id).toBeTruthy()

    await wrapper.find('button[aria-label="Remove Ceremony"]').trigger('click')
    expect(itemsOf(wrapper).map(item => item.title)).not.toContain('Ceremony')
  })

  it('reorders items from the keyboard on the handle', async () => {
    const wrapper = await mountFields()

    await wrapper.findAll('[data-program-handle]')[0]!.trigger('keydown', { key: 'ArrowDown' })

    expect(itemsOf(wrapper).slice(0, 2).map(item => item.title)).toEqual(['Cocktails', 'Ceremony'])
  })

  it('edits the overall venue, dropping it when emptied', async () => {
    const wrapper = await mountFields()
    // Above the items, so the first venue field
    const venue = wrapper.find('input[id$="-venue"]')
    expect(venue.element.closest('[data-program-item]')).toBeNull()

    await venue.setValue('Manila Cathedral')
    expect(wrapper.props('content').venue).toBe('Manila Cathedral')
    await venue.setValue('')
    expect(wrapper.props('content').venue).toBeUndefined()
  })

  it('edits the eyebrow and heading, dropping an emptied eyebrow', async () => {
    const wrapper = await mountFields()
    const [eyebrow, heading] = wrapper.findAll('input')

    await eyebrow!.setValue('')
    await heading!.setValue('Order of the day')

    expect(wrapper.props('content')).toMatchObject({ eyebrow: undefined, heading: 'Order of the day' })
  })
})
