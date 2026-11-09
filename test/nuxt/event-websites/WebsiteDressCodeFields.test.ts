import type { DressCodeContent } from '~/features/sections/dress-code/dress-code.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { getSectionLayout, getSectionType } from '~/features/sections/section.registry'
import WebsiteDressCodeFields from '~/pages/(dashboard)/dashboard/events/[id]/_components/website/WebsiteDressCodeFields.vue'

// With a real layout, so its declared fields drive the editor: the palette (every field) by default
async function mountFields(props: { layout?: 'palette' | 'pill', content?: DressCodeContent } = {}) {
  const wrapper = await mountSuspended(WebsiteDressCodeFields, {
    props: {
      'layout': getSectionLayout('dress-code', props.layout ?? 'palette')!,
      'content': props.content ?? structuredClone(getSectionType('dress-code').defaultContent),
      'onUpdate:content': (next: DressCodeContent) => wrapper.setProps({ content: next }),
    },
  })
  return wrapper
}
type Wrapper = Awaited<ReturnType<typeof mountFields>>
const content = (wrapper: Wrapper) => wrapper.props('content') as DressCodeContent
const list = (wrapper: Wrapper, name: 'colours' | 'avoidColours') => wrapper.find(`[data-dress-colours="${name}"]`)

describe('website dress code fields', () => {
  it('edits the label, heading and description, removing emptied optional text', async () => {
    const wrapper = await mountFields()
    const [eyebrow, heading] = wrapper.findAll('input')

    await heading!.setValue('What to wear')
    await eyebrow!.setValue('')
    await wrapper.find('textarea').setValue('')

    expect(content(wrapper)).toMatchObject({ heading: 'What to wear', eyebrow: undefined, description: undefined })
  })

  it('takes the attire motif in the host\'s own words, optional in every layout', async () => {
    const full = await mountFields()
    const field = full.find('[data-attire]')
    expect(field.text()).toContain('Attire motif (optional)')
    expect(field.find('input').element.value).toBe('')
    expect(field.find('[data-required]').exists()).toBe(false)

    await field.find('input').setValue('Rustic boho')
    expect(content(full).attire).toBe('Rustic boho')
    await field.find('input').setValue('')
    expect(content(full).attire).toBeUndefined()

    const pill = (await mountFields({ layout: 'pill' })).find('[data-attire]')
    expect(pill.text()).toContain('Attire motif (optional)')
    expect(pill.find('[data-required]').exists()).toBe(false)
  })

  it('labels a colour\'s name and colour at the same small size', async () => {
    const item = list(await mountFields(), 'colours').find('[data-dress-colour-item]')
    const labels = item.findAll('label').filter(label => ['Name', 'Colour'].includes(label.text()))
    expect(labels.map(label => label.text())).toEqual(['Name', 'Colour'])
    expect(labels.every(label => label.classes().includes('text-xs'))).toBe(true)
  })

  it('notes the limit above the colours to wear only', async () => {
    const wrapper = await mountFields()

    expect(list(wrapper, 'colours').find('[data-colour-limit]').text()).toBe('You can add up to 5 colours to wear.')
    expect(list(wrapper, 'colours').find('[data-colour-limit]').attributes('role')).toBe('note')
    expect(list(wrapper, 'avoidColours').find('[data-colour-limit]').exists()).toBe(false)
  })

  it('names, adds and removes colours to wear and to avoid, up to five each', async () => {
    const wrapper = await mountFields()
    const addColour = () => list(wrapper, 'colours').findAll('button').find(b => b.text() === 'Add a colour')

    await list(wrapper, 'colours').find('[data-dress-colour-item] input').setValue('Moss')
    expect(content(wrapper).colours[0]!.name).toBe('Moss')
    // Four to start with, one more, then no more
    await addColour()!.trigger('click')
    expect(content(wrapper).colours).toHaveLength(5)
    expect(addColour()?.attributes('disabled')).toBeDefined()

    await list(wrapper, 'avoidColours').findAll('button').find(b => b.text() === 'Add a colour to avoid')!.trigger('click')
    expect(content(wrapper).avoidColours).toHaveLength(3)
    await list(wrapper, 'avoidColours').find('button[aria-label="Remove White"]').trigger('click')
    expect(content(wrapper).avoidColours.map(colour => colour.name)).toEqual(['Ivory', ''])
  })

  it('offers only what the layout shows: the pill has no heading, description or label', async () => {
    const wrapper = await mountFields({ layout: 'pill' })

    expect(wrapper.find('textarea').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Small label')
    expect(wrapper.text()).not.toContain('Heading')
    expect(list(wrapper, 'avoidColours').exists()).toBe(true)
  })
})
