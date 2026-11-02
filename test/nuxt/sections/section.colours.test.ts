import type { Component } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AboutChapter from '~/components/sections/about/AboutChapter.vue'
import AboutHeading from '~/components/sections/about/AboutHeading.vue'
import CountdownHeading from '~/components/sections/countdown/CountdownHeading.vue'
import HeroText from '~/components/sections/hero/HeroText.vue'
import MessageHeading from '~/components/sections/message/MessageHeading.vue'
import PeopleHeading from '~/components/sections/people/PeopleHeading.vue'
import ProgramHeading from '~/components/sections/program/ProgramHeading.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import { sectionBackgrounds } from '~/features/sections/section.type'

// Every section type's heading in the background's brand text colour (the primary on light and accent, the accent on
// primary and photo) and its eyebrow in the label colour (the accent on light, a softer shade on the colours)
const headings: { name: string, component: Component, props: Record<string, unknown>, heading: string }[] = [
  { name: 'hero', component: HeroText, props: { content: { eyebrow: 'Together', heading: 'Bea & Carlo', layoutPhotos: [] } }, heading: 'h1' },
  { name: 'countdown', component: CountdownHeading, props: { content: { eyebrow: 'Counting down', heading: 'Soon', showSeconds: true, layoutPhotos: [] } }, heading: 'h2' },
  { name: 'message', component: MessageHeading, props: { content: { eyebrow: 'A note', heading: 'Welcome', body: '', layoutPhotos: [] } }, heading: 'h2' },
  { name: 'about', component: AboutHeading, props: { content: { eyebrow: 'Our story', heading: 'How we met', timeline: [], layoutPhotos: [] } }, heading: 'h2' },
  { name: 'people', component: PeopleHeading, props: { content: { eyebrow: 'The entourage', heading: 'Meet our people', people: [] } }, heading: 'h2' },
  { name: 'program', component: ProgramHeading, props: { content: { eyebrow: 'The day', heading: 'Program', items: [] } }, heading: 'h2' },
  { name: 'about chapter', component: AboutChapter, props: { item: { eyebrow: '2019', heading: 'Spilled coffee' } }, heading: 'h3' },
]

describe.each(headings)('$name heading colours', ({ component, props, heading }) => {
  it.each(sectionBackgrounds)('uses the brand text colour for the heading and the label colour for the eyebrow on %s', async (background) => {
    const styles = backgroundStyles[background]
    const wrapper = await mountSuspended(component, { props: { ...props, styles } })

    expect(wrapper.find(heading).classes()).toContain(styles.brandText)
    expect(wrapper.find('p').classes()).toContain(styles.eyebrow)
  })
})

describe('brand colours per background', () => {
  it('uses the accent for labels and the primary for headings on light', () => {
    expect(backgroundStyles.light).toMatchObject({ eyebrow: 'text-(--site-accent-text)', brandText: 'text-(--site-primary-text)' })
  })

  it('uses the accent for headings and a softer primary for labels on primary, and the reverse on accent', () => {
    expect(backgroundStyles.primary).toMatchObject({ eyebrow: 'text-(--site-on-primary-muted)', brandText: 'text-(--site-accent-on-primary)' })
    expect(backgroundStyles.accent).toMatchObject({ eyebrow: 'text-(--site-on-accent-muted)', brandText: 'text-(--site-primary-on-accent)' })
  })

  it('treats a photo like primary: accent headings, soft light labels', () => {
    expect(backgroundStyles.photo).toMatchObject({ eyebrow: 'text-(--site-on-photo-muted)', brandText: 'text-(--site-accent-on-photo)' })
  })
})
