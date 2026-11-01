import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import CDataTableRowActions from '~/components/custom/c-data-table/CDataTableRowActions.vue'

describe('data table row actions', () => {
  it('shows each action as a labelled button, without a menu', async () => {
    const manage = vi.fn()
    const remove = vi.fn()
    const row = { original: { id: 7 } }
    const wrapper = await mountSuspended(CDataTableRowActions, {
      props: {
        row,
        actions: [
          { buttonName: 'Manage', onClick: manage },
          { separator: true },
          { buttonName: 'Delete', variant: 'destructive', onClick: remove },
        ],
      },
    })

    const buttons = wrapper.findAll('[data-row-action]')
    expect(buttons.map(button => button.text())).toEqual(['Manage', 'Delete'])
    expect(wrapper.find('[aria-haspopup="menu"]').exists()).toBe(false)
    expect(buttons[1]!.classes()).toContain('text-destructive')

    await buttons[0]!.trigger('click')
    await buttons[1]!.trigger('click')
    expect(manage).toHaveBeenCalledWith(row)
    expect(remove).toHaveBeenCalledWith(row)
  })
})
