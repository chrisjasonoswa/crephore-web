import type { PeopleContent } from '~/features/sections/people/people.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { getSectionLayout, getSectionType } from '~/features/sections/section.registry'
import WebsitePeopleFields from '~/pages/(dashboard)/dashboard/events/[id]/_components/website/WebsitePeopleFields.vue'

// With a real layout, so its declared fields drive the editor: the grid (photos, no bios) by default
async function mountFields(props: { layout?: 'grid' | 'cards' | 'credits', content?: PeopleContent } = {}) {
  const wrapper = await mountSuspended(WebsitePeopleFields, {
    props: {
      'eventId': 5,
      'layout': getSectionLayout('people', props.layout ?? 'grid')!,
      'content': props.content ?? structuredClone(getSectionType('people').defaultContent),
      'onUpdate:content': (next: PeopleContent) => wrapper.setProps({ content: next }),
    },
  })
  return wrapper
}

type Wrapper = Awaited<ReturnType<typeof mountFields>>
const names = (wrapper: Wrapper) => (wrapper.props('content') as PeopleContent).people.map(person => person.name)

describe('website people fields', () => {
  it('edits each person\'s name and role, dropping an emptied role', async () => {
    const wrapper = await mountFields()
    const inputs = wrapper.findAll('[data-person-item]')[0]!.findAll('input')

    await inputs[0]!.setValue('Bea Santos-Reyes')
    await inputs[1]!.setValue('')

    expect((wrapper.props('content') as PeopleContent).people[0]).toMatchObject({ name: 'Bea Santos-Reyes', role: undefined })
  })

  it('adds a person with a new id and removes one', async () => {
    const wrapper = await mountFields()
    const before = (wrapper.props('content') as PeopleContent).people.length

    await wrapper.findAll('button').find(button => button.text() === 'Add a person')!.trigger('click')
    const added = (wrapper.props('content') as PeopleContent).people.at(-1)!
    expect((wrapper.props('content') as PeopleContent).people).toHaveLength(before + 1)
    expect(added.name).toBe('')
    expect(added.id).toBeTruthy()

    await wrapper.find('button[aria-label="Remove Bea Santos"]').trigger('click')
    expect(names(wrapper)).not.toContain('Bea Santos')
  })

  it('reorders people from the keyboard on the handle', async () => {
    const wrapper = await mountFields()

    await wrapper.findAll('[data-person-handle]')[0]!.trigger('keydown', { key: 'ArrowDown' })

    expect(names(wrapper).slice(0, 2)).toEqual(['Carlo Reyes', 'Bea Santos'])
  })

  it('offers photos and bios only when the layout shows them', async () => {
    const withBoth = await mountFields({ layout: 'cards' })
    expect(withBoth.findAll('[data-photo-label]').length).toBe(8)
    expect(withBoth.text()).toContain('Bio (optional)')

    const textOnly = await mountFields({ layout: 'credits' })
    expect(textOnly.findAll('[data-photo-label]')).toHaveLength(0)
    expect(textOnly.text()).not.toContain('Bio (optional)')
  })
})
