import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import CDateTime from '~/components/custom/c-date-time/CDateTime.vue'

const value = '2027-06-12T07:00:00Z' // 3:00 PM in Manila
const end = '2027-06-12T08:00:00Z'

describe('CDateTime', () => {
  it('shows only the date and time when the viewer is in the event\'s timezone', async () => {
    const wrapper = await mountSuspended(CDateTime, { props: { value, timeZone: 'Asia/Manila', viewerTimeZone: 'Asia/Manila' } })

    expect(wrapper.text()).toMatch(/3:00\sPM$/)
    expect(wrapper.find('.text-muted-foreground').exists()).toBe(false)
  })

  it('adds the event\'s timezone, muted, when the viewer is in another one', async () => {
    const wrapper = await mountSuspended(CDateTime, { props: { value, timeZone: 'Asia/Manila', viewerTimeZone: 'America/New_York' } })

    // Still the event's time (3:00 PM), not the viewer's (3:00 AM)
    expect(wrapper.text()).toMatch(/3:00\sPM \(Manila, GMT\+8\)$/)
    expect(wrapper.find('.text-muted-foreground').text()).toBe('(Manila, GMT+8)')
  })

  it('leaves the timezone out while the viewer\'s timezone is unknown (server render)', async () => {
    const wrapper = await mountSuspended(CDateTime, { props: { value, timeZone: 'Asia/Manila', viewerTimeZone: null } })

    expect(wrapper.text()).toMatch(/3:00\sPM$/)
  })

  it('shows a range with `end`', async () => {
    const wrapper = await mountSuspended(CDateTime, { props: { value, end, timeZone: 'Asia/Manila', viewerTimeZone: 'Europe/London' } })

    expect(wrapper.text()).toMatch(/3:00.*4:00\sPM \(Manila, GMT\+8\)$/)
  })
})
