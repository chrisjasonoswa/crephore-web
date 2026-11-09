import type { ProgramContent, SectionProgram } from '~/features/sections/program/program.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { sampleProgramItems } from '~/features/sections/program/program.helpers'
import WebsiteProgramFields from '~/pages/(dashboard)/dashboard/events/[id]/_components/website/WebsiteProgramFields.vue'

const program: SectionProgram = { venue: 'Manila Cathedral', items: sampleProgramItems('2027-02-14') }

// Whether `a` comes before `b` in the page
const isBefore = (a: Element, b: Element) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)

async function mountFields(props: { content?: ProgramContent, program?: SectionProgram } = {}) {
  const wrapper = await mountSuspended(WebsiteProgramFields, {
    props: {
      program,
      content: { eyebrow: 'The day', heading: 'Program', venuesHeading: 'Getting there', layoutPhotos: [] },
      ...props,
      'onUpdate:content': (next: ProgramContent) => wrapper.setProps({ content: next }),
    },
  })
  return wrapper
}

describe('website program fields', () => {
  it('edits the eyebrow and heading, dropping an emptied eyebrow', async () => {
    const wrapper = await mountFields()
    const [eyebrow, heading] = wrapper.findAll('input')

    await eyebrow!.setValue('')
    await heading!.setValue('Order of the day')

    expect(wrapper.props('content')).toEqual({ eyebrow: undefined, heading: 'Order of the day', venuesHeading: 'Getting there', layoutPhotos: [] })
  })

  it('edits the venues\' eyebrow and heading, dropping an emptied eyebrow', async () => {
    const wrapper = await mountFields()
    const venues = wrapper.find('[data-venues-text]')
    const [eyebrow, heading] = venues.findAll('input')

    await eyebrow!.setValue('Find us')
    await heading!.setValue('Where to go')
    expect(wrapper.props('content')).toMatchObject({ venuesEyebrow: 'Find us', venuesHeading: 'Where to go' })

    await eyebrow!.setValue('')
    expect(wrapper.props('content')).toMatchObject({ venuesEyebrow: undefined, venuesHeading: 'Where to go' })
  })

  it('shows the event program\'s venue and items as text, with a link to the Program tab', async () => {
    const wrapper = await mountFields()
    const group = wrapper.find('[data-program-text]')
    const note = group.find('[data-program-note]')

    expect(note.text()).toContain('The schedule is from the event\'s program.')
    expect(note.find('a').text()).toBe('Click here to Edit program')
    expect(note.find('a').attributes('href')).toContain('tab=program')
    expect(isBefore(note.element, group.find('input').element)).toBe(true)
    expect(isBefore(group.findAll('input')[1]!.element, group.find('[data-program-summary]').element)).toBe(true)
    expect(group.findAll('dd')[0]!.text()).toBe('Manila Cathedral')
    const items = group.findAll('[data-program-summary-item]')
    expect(items).toHaveLength(6)
    expect(items[0]!.text()).toContain('Sun, 14 Feb · 3:00 PM – 4:00 PM')
    expect(items[0]!.text()).toContain('Ceremony')
    // Only the section's own text can be edited: its eyebrow and heading, and the venues' eyebrow and heading
    expect(wrapper.findAll('input')).toHaveLength(4)
  })

  it('links the venues\' note to the Venues tab', async () => {
    const venues = (await mountFields()).find('[data-venues-text]')
    const note = venues.find('[data-venues-note]')

    expect(note.text()).toContain('Each venue\'s name, address, notes, photo and map are from the event\'s venues.')
    expect(note.find('a').text()).toBe('Click here to Edit venues')
    expect(note.find('a').attributes('href')).toContain('tab=venues')
    expect(isBefore(note.element, venues.find('input').element)).toBe(true)
  })

  it('leaves out the venue when the program moves around', async () => {
    const wrapper = await mountFields({ program: { items: program.items } })

    expect(wrapper.findAll('dt').map(dt => dt.text())).toEqual(['Schedule'])
  })

  it('warns that the section stays hidden while the program has no items', async () => {
    const wrapper = await mountFields({ program: { items: [] } })

    expect(wrapper.find('[role="note"]').text()).toBe('No schedule yet, so this section stays hidden on your website. Add the program')
    expect(wrapper.find('dl').exists()).toBe(false)
  })
})
