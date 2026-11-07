import type { VueWrapper } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import WebsiteListField from '~/pages/(dashboard)/dashboard/events/[id]/_components/website/WebsiteListField.vue'

interface Item { id: string, name: string }
const items: Item[] = [{ id: 'a', name: 'Bea' }, { id: 'b', name: 'Carlo' }, { id: 'c', name: 'Ana' }]

async function mountList(start: Item[] = items, max = 4, required = false): Promise<VueWrapper> {
  let created = 0
  const wrapper: VueWrapper = await mountSuspended(WebsiteListField, {
    props: {
      'modelValue': start,
      'onUpdate:modelValue': (next: unknown[]) => wrapper.setProps({ modelValue: next }),
      'label': 'People',
      'addLabel': 'Add a person',
      'name': 'person',
      max,
      required,
      'create': () => ({ id: `new-${++created}`, name: '' }),
      // The mount helper can't infer the list's item type, so the callbacks take `unknown`
      'itemLabel': (item: unknown, index: number) => (item as Item).name || `Person ${index + 1}`,
      'keyOf': (item: unknown) => (item as Item).id,
    },
    slots: {
      description: () => h('p', { 'data-hint': '' }, 'A couple can be one person.'),
      item: ({ item }: { item: unknown }) => h('span', { 'data-name': '' }, (item as Item).name),
    },
  })
  return wrapper
}
type Wrapper = VueWrapper
const itemsOf = (wrapper: Wrapper) => (wrapper.vm.$props as { modelValue: Item[] }).modelValue
const names = (wrapper: Wrapper) => itemsOf(wrapper).map(item => item.name)
const button = (wrapper: Wrapper, label: string) => wrapper.findAll('button').find(b => b.attributes('aria-label') === label || b.text() === label)!

describe('website list field', () => {
  it('shows the heading, count, description and each item through the slot, with its hooks', async () => {
    const wrapper = await mountList()

    expect(wrapper.find('h5').text()).toBe('People')
    expect(wrapper.text()).toContain('3 of 4')
    expect(wrapper.find('[data-hint]').exists()).toBe(true)
    expect(wrapper.findAll('[data-person-item] [data-name]').map(name => name.text())).toEqual(['Bea', 'Carlo', 'Ana'])
    expect(wrapper.find('[data-person-handle]').attributes('aria-label')).toBe('Move Bea (1 of 3)')
  })

  it('adds a new item at the end, and stops at the most', async () => {
    const wrapper = await mountList()

    await button(wrapper, 'Add a person').trigger('click')
    expect(itemsOf(wrapper)).toEqual([...items, { id: 'new-1', name: '' }])
    expect(button(wrapper, 'Add a person').attributes('disabled')).toBeDefined()
  })

  it('removes an item', async () => {
    const wrapper = await mountList()

    await button(wrapper, 'Remove Carlo').trigger('click')
    expect(names(wrapper)).toEqual(['Bea', 'Ana'])
  })

  it('moves an item with Arrow Up/Down on its handle, never past the ends', async () => {
    const wrapper = await mountList()
    const handle = (index: number) => wrapper.findAll('[data-person-handle]')[index]!

    await handle(0).trigger('keydown', { key: 'ArrowDown' })
    expect(names(wrapper)).toEqual(['Carlo', 'Bea', 'Ana'])
    await handle(0).trigger('keydown', { key: 'ArrowUp' })
    expect(names(wrapper)).toEqual(['Carlo', 'Bea', 'Ana'])
    await handle(2).trigger('keydown', { key: 'ArrowDown' })
    expect(names(wrapper)).toEqual(['Carlo', 'Bea', 'Ana'])
    await handle(2).trigger('keydown', { key: 'ArrowUp' })
    expect(names(wrapper)).toEqual(['Carlo', 'Ana', 'Bea'])
  })

  it('marks a list the layout needs as required while it has no items', async () => {
    expect((await mountList([], 4, true)).find('[data-required]').text()).toBe('Required')
    expect((await mountList(items, 4, true)).find('[data-required]').exists()).toBe(false)
    expect((await mountList([], 4, false)).find('[data-required]').exists()).toBe(false)
  })
})
