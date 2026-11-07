import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { defaultWebsiteTheme } from '~/features/event-websites/event-website'
import WebsiteBackgroundPicker from '~/pages/(dashboard)/dashboard/events/[id]/_components/website/WebsiteBackgroundPicker.vue'

describe('website background picker', () => {
  it('lists the backgrounds as Light, Primary, Secondary, Photo, even when the layout starts on another one', async () => {
    const wrapper = await mountSuspended(WebsiteBackgroundPicker, {
      props: { backgrounds: ['secondary', 'light', 'primary', 'photo'], theme: defaultWebsiteTheme(), modelValue: 'secondary' },
    })

    expect(wrapper.findAll('[data-choice]').map(item => item.text())).toEqual(['Light', 'Primary', 'Secondary', 'Photo'])
    expect(wrapper.findAll('[data-choice]').find(item => item.text() === 'Secondary')!.attributes('data-state')).toBe('on')
  })

  it('only lists the backgrounds the layout supports', async () => {
    const wrapper = await mountSuspended(WebsiteBackgroundPicker, {
      props: { backgrounds: ['photo', 'light'], theme: defaultWebsiteTheme(), modelValue: 'photo' },
    })

    expect(wrapper.findAll('[data-choice]').map(item => item.text())).toEqual(['Light', 'Photo'])
  })
})
