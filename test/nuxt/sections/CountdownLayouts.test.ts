import type { Component } from 'vue'
import type { CountdownContent } from '~/features/sections/section.content.type'
import type { SectionBackground } from '~/features/sections/section.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import CountdownBoxes from '~/components/sections/countdown/CountdownBoxes.vue'
import CountdownCalendar from '~/components/sections/countdown/CountdownCalendar.vue'
import CountdownDaysOnly from '~/components/sections/countdown/CountdownDaysOnly.vue'
import CountdownFlip from '~/components/sections/countdown/CountdownFlip.vue'
import CountdownMinimal from '~/components/sections/countdown/CountdownMinimal.vue'
import CountdownPhoto from '~/components/sections/countdown/CountdownPhoto.vue'
import CountdownRings from '~/components/sections/countdown/CountdownRings.vue'
import CountdownSentence from '~/components/sections/countdown/CountdownSentence.vue'
import CountdownSplit from '~/components/sections/countdown/CountdownSplit.vue'
import CountdownStrip from '~/components/sections/countdown/CountdownStrip.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import { resolveLayoutOptions } from '~/features/sections/section.options'
import { getSectionLayout } from '~/features/sections/section.registry'

const backgroundPhoto = 'https://example.com/background.jpg'
const layoutPhoto = 'https://example.com/couple.jpg'

const content: CountdownContent = {
  eyebrow: 'Counting down to',
  title: 'Bea & Carlo\'s wedding',
  showSeconds: true,
  backgroundPhoto,
  layoutPhoto,
  cta: { label: 'Save the date', href: '#details' },
}

// 112 days, 6 hours, 45 minutes and 20 seconds from the frozen "now"; Sunday, 14 February 2027 in Manila
const now = new Date('2026-10-24T09:14:40Z')
const occasion = { startsAt: '2027-02-13T16:00:00Z', timezone: 'Asia/Manila' }

beforeAll(() => {
  // Only the clock is frozen; timers and promises run as usual
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(now)
})
afterAll(() => {
  vi.useRealTimers()
})

// Each layout, whether it shows the date and in which format
const layouts: { key: string, component: Component, date?: string }[] = [
  { key: 'boxes', component: CountdownBoxes, date: 'Sunday, 14 February 2027' },
  { key: 'minimal', component: CountdownMinimal },
  { key: 'photo', component: CountdownPhoto, date: '14 · 02 · 2027' },
  { key: 'split', component: CountdownSplit, date: 'Sunday, 14 February 2027' },
  { key: 'rings', component: CountdownRings },
  { key: 'flip', component: CountdownFlip, date: 'Sunday, 14 February 2027' },
  { key: 'sentence', component: CountdownSentence },
  { key: 'days-only', component: CountdownDaysOnly, date: 'Sunday, 14 February 2027' },
  { key: 'calendar', component: CountdownCalendar, date: 'Sunday, 14 February 2027' },
  { key: 'strip', component: CountdownStrip, date: '14 · 02 · 2027' },
]

const definitionOf = (key: string) => getSectionLayout('countdown', key)!

// Mounts a layout like SectionRenderer does: its options with defaults filled in
const mountLayout = (key: string, props: { content?: CountdownContent, background?: SectionBackground, options?: Record<string, string> } = {}) => {
  const definition = definitionOf(key)
  const component = layouts.find(layout => layout.key === key)!.component
  return mountSuspended(component, {
    props: {
      content: props.content ?? content,
      background: props.background ?? definition.backgrounds[0]!,
      options: resolveLayoutOptions(definition.options, props.options),
      occasion,
    },
  })
}

type Wrapper = Awaited<ReturnType<typeof mountLayout>>
const unitText = (wrapper: Wrapper, unit: string) => wrapper.find(`[data-unit="${unit}"]`).text()
const comesBefore = (wrapper: Wrapper, first: string, second: string) => {
  const html = wrapper.html()
  return html.indexOf(first) < html.indexOf(second)
}

describe.each(layouts)('countdown layout $key', ({ key, date }) => {
  it('counts down to the occasion', async () => {
    const wrapper = await mountLayout(key)

    expect(wrapper.find('[role="timer"]').exists()).toBe(true)
    expect(unitText(wrapper, 'days')).toContain('112')
    if (key !== 'days-only') {
      expect(unitText(wrapper, 'hours')).toMatch(/^0?6\D/)
      expect(unitText(wrapper, 'minutes')).toContain('45')
      expect(unitText(wrapper, 'seconds')).toContain('20')
    }
  })

  it('renders the eyebrow, title and button', async () => {
    const wrapper = await mountLayout(key)

    expect(wrapper.text()).toContain('Counting down to')
    expect(wrapper.find('h2').text()).toBe('Bea & Carlo\'s wedding')
    expect(wrapper.find('a[href="#details"]').text()).toBe('Save the date')
  })

  it('renders an unsafe saved button link without a link', async () => {
    const wrapper = await mountLayout(key, { content: { ...content, cta: { label: 'Save the date', href: 'javascript:alert(1)' } } })

    expect(wrapper.findAll('a').find(a => a.text() === 'Save the date')!.attributes('href')).toBeUndefined()
  })

  it(date ? `shows the date (${date})` : 'leaves the date out', async () => {
    const wrapper = await mountLayout(key)

    if (date)
      expect(wrapper.text()).toContain(date)
    else
      expect(wrapper.find('[data-countdown-date]').exists()).toBe(false)
  })

  it('leaves out seconds when they are off', async () => {
    const wrapper = await mountLayout(key, { content: { ...content, showSeconds: false } })

    expect(wrapper.find('[data-unit="seconds"]').exists()).toBe(false)
  })

  it('on the photo background, shows the background photo under an overlay, with the photo text colours', async () => {
    const wrapper = await mountLayout(key, { background: 'photo' })
    const section = wrapper.find('section')

    expect(section.find(':scope > img').attributes('src')).toBe(backgroundPhoto)
    expect(section.find(':scope > img + [class~="-z-10"]').exists()).toBe(true)
    for (const className of backgroundStyles.photo.root.split(' '))
      expect(section.classes()).toContain(className)
  })

  it('applies each background it supports', async () => {
    for (const background of definitionOf(key).backgrounds) {
      const wrapper = await mountLayout(key, { background })
      for (const className of backgroundStyles[background].root.split(' '))
        expect(wrapper.find('section').classes()).toContain(className)
    }
  })

  it('renders only the countdown when the optional content is missing', async () => {
    const wrapper = await mountLayout(key, { content: { showSeconds: true } })

    expect(wrapper.find('h2').exists()).toBe(false)
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Counting down to')
    expect(unitText(wrapper, 'days')).toContain('112')
  })
})

describe('countdown layouts', () => {
  it('rings: draws each ring by what is left (hours out of a day)', async () => {
    const wrapper = await mountLayout('rings')
    const ring = wrapper.find('[data-unit="hours"] [data-ring]')
    const circumference = Number(ring.attributes('stroke-dasharray'))

    expect(Number(ring.attributes('stroke-dashoffset'))).toBeCloseTo(circumference * (1 - 6 / 24))
  })

  it('sentence: writes the countdown as a sentence, the title after it', async () => {
    const wrapper = await mountLayout('sentence')

    expect(wrapper.find('[role="timer"]').text()).toBe('112 days, 6 hours, 45 minutes and 20 seconds')
    expect(comesBefore(wrapper, 'role="timer"', '<h2')).toBe(true)
  })

  it('days-only: shows only the days, whatever "show seconds" says', async () => {
    const wrapper = await mountLayout('days-only')

    expect(wrapper.find('[role="timer"]').text()).toBe('112days to go')
    expect(wrapper.find('[data-unit="hours"]').exists()).toBe(false)
  })

  it('photo: shows the background photo (never the layout photo), primary without one', async () => {
    const wrapper = await mountLayout('photo')
    expect(wrapper.findAll('img').map(img => img.attributes('src'))).toEqual([backgroundPhoto])

    const withoutPhoto = await mountLayout('photo', { content: { ...content, backgroundPhoto: undefined } })
    expect(withoutPhoto.find('img').exists()).toBe(false)
    expect(withoutPhoto.find('section').classes()).toContain('bg-(--site-primary)')
  })

  it('photo: puts the text at textPosition, with the overlay where it sits', async () => {
    const wrapper = await mountLayout('photo', { options: { textPosition: 'bottom-left' } })

    expect(wrapper.find('[data-countdown-text]').classes()).toEqual(expect.arrayContaining(['justify-end', 'items-start']))
    expect(wrapper.find('img + div').classes()).toContain('bg-linear-to-t')
  })

  it('split: puts the layout photo (never the background photo) on photoSide, with a placeholder when missing', async () => {
    const wrapper = await mountLayout('split', { options: { photoSide: 'right' } })

    expect(wrapper.findAll('img').map(img => img.attributes('src'))).toEqual([layoutPhoto])

    expect(wrapper.find('[data-countdown-photo]').classes()).toContain('@3xl:col-start-2')
    expect(wrapper.find('[data-countdown-text]').classes()).toContain('@3xl:col-start-1')

    const withoutPhoto = await mountLayout('split', { content: { ...content, layoutPhoto: undefined } })
    expect(withoutPhoto.find('[data-photo-placeholder]').exists()).toBe(true)
  })

  it.each(['boxes', 'minimal', 'rings', 'flip', 'sentence', 'days-only'])('%s: aligns the text by textAlign', async (key) => {
    expect((await mountLayout(key, { options: { textAlign: 'start' } })).find('section > div').classes()).toContain('items-start')
    expect((await mountLayout(key, { options: { textAlign: 'center' } })).find('section > div').classes()).toContain('items-center')
  })

  it('calendar: circles the day on the month page, on calendarSide', async () => {
    const wrapper = await mountLayout('calendar', { options: { calendarSide: 'right' } })

    expect(wrapper.find('[data-calendar]').text()).toContain('February 2027')
    expect(wrapper.find('[aria-current="date"]').text()).toBe('14')
    expect(wrapper.find('section > div').classes()).toContain('@3xl:flex-row-reverse')
    expect((await mountLayout('calendar')).find('section > div').classes()).not.toContain('@3xl:flex-row-reverse')
  })

  it('strip: puts the date on dateSide, keeping the title for screen readers', async () => {
    const left = await mountLayout('strip')
    expect(left.find('[data-countdown-date]').classes()).toContain('@3xl:order-1')
    expect(left.find('h2').classes()).toContain('sr-only')

    const right = await mountLayout('strip', { options: { dateSide: 'right' } })
    expect(right.find('[data-countdown-date]').classes()).toContain('@3xl:order-3')
  })
})
