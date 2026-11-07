import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import WebsiteTextareaField from '~/pages/(dashboard)/dashboard/events/[id]/_components/website/WebsiteTextareaField.vue'
import WebsiteTextField from '~/pages/(dashboard)/dashboard/events/[id]/_components/website/WebsiteTextField.vue'

describe('website text fields', () => {
  it.each([['text', WebsiteTextField], ['textarea', WebsiteTextareaField]] as const)('%s: labels its input and reports the text as typed', async (_, component) => {
    const wrapper = await mountSuspended(component, { props: { 'label': 'Heading', 'modelValue': '', 'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }) } })
    const input = wrapper.find(component === WebsiteTextField ? 'input' : 'textarea')

    expect(wrapper.find('label').attributes('for')).toBe(input.attributes('id'))
    await input.setValue('Our story')
    expect(wrapper.props('modelValue')).toBe('Our story')
  })

  it.each([['text', WebsiteTextField], ['textarea', WebsiteTextareaField]] as const)('%s: marks a field the layout needs as required while it\'s empty', async (_, component) => {
    const empty = await mountSuspended(component, { props: { label: 'Message', modelValue: '  ', required: true } })
    const filled = await mountSuspended(component, { props: { label: 'Message', modelValue: 'Welcome', required: true } })
    const optional = await mountSuspended(component, { props: { label: 'Message', modelValue: '' } })

    expect(empty.find('[data-required]').text()).toBe('Required')
    expect(filled.find('[data-required]').exists()).toBe(false)
    expect(optional.find('[data-required]').exists()).toBe(false)
  })
})
