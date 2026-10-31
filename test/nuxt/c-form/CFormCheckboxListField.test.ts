import { mountSuspended } from '@nuxt/test-utils/runtime'
import { useForm } from 'vee-validate'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import CFormCheckboxListField from '~/components/custom/c-form/CFormCheckboxListField.vue'

const options = [
  { value: 1, label: 'Opening night', hint: 'in Family' },
  { value: 2, label: 'Dinner', description: 'Jun 12, 2027, 3:00 PM' },
]

// A form holding `eventIds`, exposing its values to the test
const mountField = (initial: number[]) => {
  let values: { eventIds: number[] } = { eventIds: [] }
  const Host = defineComponent(() => {
    const form = useForm({ initialValues: { eventIds: initial } })
    values = form.values as typeof values
    return () => h(CFormCheckboxListField, { name: 'eventIds', label: 'Events', options, searchPlaceholder: 'Search events...' })
  })
  return mountSuspended(Host).then(wrapper => ({ wrapper, values: () => values }))
}

describe('CFormCheckboxListField', () => {
  it('checks the options in the value and shows their hint and description', async () => {
    const { wrapper } = await mountField([1])

    const boxes = wrapper.findAll('[data-slot="checkbox"]')
    expect(boxes[0]!.attributes('data-state')).toBe('checked')
    expect(boxes[1]!.attributes('data-state')).toBe('unchecked')
    expect(wrapper.text()).toContain('in Family')
    expect(wrapper.text()).toContain('Jun 12, 2027, 3:00 PM')
  })

  it('adds and removes values when options are ticked', async () => {
    const { wrapper, values } = await mountField([1])
    const boxes = wrapper.findAll('[data-slot="checkbox"]')

    await boxes[1]!.trigger('click')
    await nextTick()
    expect(values().eventIds).toEqual([1, 2])

    await boxes[0]!.trigger('click')
    await nextTick()
    expect(values().eventIds).toEqual([2])
  })

  it('filters the options with the search', async () => {
    const { wrapper } = await mountField([])

    await wrapper.find('input').setValue('din')

    expect(wrapper.text()).toContain('Dinner')
    expect(wrapper.text()).not.toContain('Opening night')
  })
})
