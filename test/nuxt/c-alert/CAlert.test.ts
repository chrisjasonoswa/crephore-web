import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import CAlert from '~/components/custom/c-alert/CAlert.vue'
import { toastAndAlertStyles } from '~/utils/styles/toast-and-alert'

describe('CAlert', () => {
  it('uses the shared style of its type, info by default, in place of the card colours', async () => {
    const info = await mountSuspended(CAlert, { props: { description: 'Saved' } })
    expect(info.classes()).toEqual(expect.arrayContaining(toastAndAlertStyles.info.container.split(' ')))
    expect(info.classes()).not.toContain('bg-card')

    const warning = await mountSuspended(CAlert, { props: { type: 'warning', description: 'Careful' } })
    expect(warning.classes()).toEqual(expect.arrayContaining(toastAndAlertStyles.warning.container.split(' ')))
  })

  it('shows the title, the description as HTML and the slot', async () => {
    const wrapper = await mountSuspended(CAlert, {
      props: { title: 'Heads up', description: 'One<br>Two' },
      slots: { default: () => 'More' },
    })

    expect(wrapper.find('[data-slot="alert-title"]').text()).toBe('Heads up')
    expect(wrapper.find('[data-slot="alert-description"] br').exists()).toBe(true)
    expect(wrapper.text()).toContain('More')
  })

  it('shows its type\'s icon, unless given another one or null', async () => {
    // Lucide names each icon in a class: TriangleAlertIcon (warning), CircleCheckIcon (success)
    const byType = await mountSuspended(CAlert, { props: { type: 'warning', description: 'Careful' } })
    expect(byType.find('svg').classes()).toContain('lucide-triangle-alert')

    const replaced = await mountSuspended(CAlert, { props: { type: 'warning', description: 'Careful', icon: toastAndAlertStyles.success.icon } })
    expect(replaced.findAll('svg')).toHaveLength(1)
    expect(replaced.find('svg').classes()).toContain('lucide-circle-check')

    expect((await mountSuspended(CAlert, { props: { description: 'Plain', icon: null } })).find('svg').exists()).toBe(false)
  })

  it('fits its content unless given a class, is smaller with size sm, and passes other attributes on', async () => {
    expect((await mountSuspended(CAlert, { props: { description: 'Fit' } })).classes()).toContain('w-fit')

    const wrapper = await mountSuspended(CAlert, { props: { description: 'Wide', size: 'sm', class: 'w-full' }, attrs: { role: 'note' } })
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['w-full', 'text-xs', 'px-2.5', 'py-1']))
    expect(wrapper.classes()).not.toContain('w-fit')
    expect(wrapper.attributes('role')).toBe('note')
  })
})
