import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import WebsiteChoiceGroup from '~/pages/(dashboard)/dashboard/events/[id]/_components/website/WebsiteChoiceGroup.vue'

const choices = [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }]

async function mountGroup(value = 'right') {
  const wrapper = await mountSuspended(WebsiteChoiceGroup, {
    props: {
      'choices': choices,
      'label': 'Photo side',
      'modelValue': value,
      'onUpdate:modelValue': (next: string) => wrapper.setProps({ modelValue: next }),
    },
  })
  return wrapper
}

const card = (wrapper: Awaited<ReturnType<typeof mountGroup>>, label: string) =>
  wrapper.findAll('[data-choice]').find(item => item.text() === label)!

describe('website choice group', () => {
  it('shows each choice as a card and marks the chosen one', async () => {
    const wrapper = await mountGroup()

    expect(wrapper.findAll('[data-choice]').map(item => item.text())).toEqual(['Left', 'Right'])
    expect(card(wrapper, 'Right').attributes('data-state')).toBe('on')
    expect(card(wrapper, 'Left').attributes('data-state')).toBe('off')
    // The check badge is in every card, shown only on the chosen one (by its state)
    expect(card(wrapper, 'Right').find('svg').exists()).toBe(true)
  })

  it('picks another choice, and keeps the current one when it is clicked again', async () => {
    const wrapper = await mountGroup()

    await card(wrapper, 'Left').trigger('click')
    expect(wrapper.props('modelValue')).toBe('left')

    await card(wrapper, 'Left').trigger('click')
    expect(wrapper.props('modelValue')).toBe('left')
    expect(card(wrapper, 'Left').attributes('data-state')).toBe('on')
  })
})
