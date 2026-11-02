import type { Component } from 'vue'
import type { PeopleContent, PersonItem } from '~/features/sections/people/people.type'
import type { SectionBackground } from '~/features/sections/section.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import PeopleCards from '~/components/sections/people/PeopleCards.vue'
import PeopleCarousel from '~/components/sections/people/PeopleCarousel.vue'
import PeopleCredits from '~/components/sections/people/PeopleCredits.vue'
import PeopleDirectory from '~/components/sections/people/PeopleDirectory.vue'
import PeopleEntourage from '~/components/sections/people/PeopleEntourage.vue'
import PeopleFeatured from '~/components/sections/people/PeopleFeatured.vue'
import PeopleGrid from '~/components/sections/people/PeopleGrid.vue'
import PeoplePolaroids from '~/components/sections/people/PeoplePolaroids.vue'
import PeopleSpotlight from '~/components/sections/people/PeopleSpotlight.vue'
import PeopleStaggered from '~/components/sections/people/PeopleStaggered.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import { resolveLayoutOptions } from '~/features/sections/section.options'
import { getSectionLayout, getSectionType } from '~/features/sections/section.registry'
import { sampleOccasion } from '~/features/sections/section.type'

const backgroundPhoto = 'https://example.com/background.jpg'
const photoOf = (index: number) => `https://example.com/person-${index + 1}.jpg`

const people: PersonItem[] = [
  { id: 'a', name: 'Bea Santos', role: 'Bride', bio: 'Planner of everything.', photo: photoOf(0) },
  { id: 'b', name: 'Carlo Reyes', role: 'Groom', bio: 'Spilled the coffee.', photo: photoOf(1) },
  { id: 'c', name: 'Mr. & Mrs. Jose Santos', role: 'Principal sponsors', photo: photoOf(2) },
  { id: 'd', name: 'Mr. & Mrs. Ramon Reyes', role: 'Principal sponsors', photo: photoOf(3) },
  { id: 'e', name: 'Ana Lim', photo: photoOf(4) },
]
const content: PeopleContent = { eyebrow: 'The entourage', heading: 'Meet our people', people, backgroundPhoto }

// Each layout, whether it shows photos and bios
const layouts: { key: string, component: Component, photos: boolean, bios: boolean }[] = [
  { key: 'grid', component: PeopleGrid, photos: true, bios: false },
  { key: 'entourage', component: PeopleEntourage, photos: false, bios: false },
  { key: 'featured', component: PeopleFeatured, photos: true, bios: false },
  { key: 'cards', component: PeopleCards, photos: true, bios: true },
  { key: 'spotlight', component: PeopleSpotlight, photos: true, bios: true },
  { key: 'carousel', component: PeopleCarousel, photos: true, bios: false },
  { key: 'staggered', component: PeopleStaggered, photos: true, bios: false },
  { key: 'polaroids', component: PeoplePolaroids, photos: true, bios: false },
  { key: 'directory', component: PeopleDirectory, photos: true, bios: false },
  { key: 'credits', component: PeopleCredits, photos: false, bios: false },
]

const definitionOf = (key: string) => getSectionLayout('people', key)!

const mountLayout = (key: string, props: { content?: PeopleContent, background?: SectionBackground, options?: Record<string, string> } = {}) => {
  const definition = definitionOf(key)
  const component = layouts.find(layout => layout.key === key)!.component
  return mountSuspended(component, {
    props: {
      content: props.content ?? content,
      background: props.background ?? definition.backgrounds[0]!,
      options: resolveLayoutOptions(definition.options, props.options),
      occasion: sampleOccasion(),
    },
  })
}

type Wrapper = Awaited<ReturnType<typeof mountLayout>>
const sources = (wrapper: Wrapper) => wrapper.findAll('img').map(img => img.attributes('src'))

it('registers the ten people layouts in picker order, none with layout photos', () => {
  const registered = getSectionType('people').layouts
  expect(registered.map(layout => layout.key)).toEqual(layouts.map(layout => layout.key))
  expect(registered.every(layout => layout.layoutPhotoCount === 0)).toBe(true)
})

describe.each(layouts)('people layout $key', ({ key, photos, bios }) => {
  it('renders the eyebrow, heading and every name in order', async () => {
    const wrapper = await mountLayout(key)

    expect(wrapper.text()).toContain('The entourage')
    expect(wrapper.find('h2').text()).toBe('Meet our people')
    const text = wrapper.text()
    const positions = people.map(person => text.indexOf(person.name))
    expect(positions.every(position => position >= 0)).toBe(true)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
  })

  it(photos ? 'shows each person\'s photo, and the background photo only on the photo background' : 'shows no photos inside the layout', async () => {
    expect(sources(await mountLayout(key, { background: 'light' }))).toEqual(photos ? people.map(person => person.photo) : [])
    expect(sources(await mountLayout(key, { background: 'photo' }))).toEqual([backgroundPhoto, ...(photos ? people.map(person => person.photo) : [])])
  })

  if (photos) {
    it('shows the person\'s initials for a missing photo', async () => {
      const wrapper = await mountLayout(key, { content: { ...content, backgroundPhoto: undefined, people: people.map(({ photo: _, ...person }) => person) } })

      expect(wrapper.find('img').exists()).toBe(false)
      expect(wrapper.findAll('[data-person-initials]').map(initials => initials.text())).toEqual(['BS', 'CR', 'JS', 'RR', 'AL'])
      // In the avatar colours of the layout's background (the polaroid wall starts on accent)
      expect(wrapper.find('[data-person-initials]').classes()).toEqual(expect.arrayContaining(backgroundStyles[definitionOf(key).backgrounds[0]!].avatar.split(' ')))
    })
  }

  it(bios ? 'shows bios' : 'leaves bios out', async () => {
    expect((await mountLayout(key)).text().includes('Planner of everything.')).toBe(bios)
  })

  it('applies each background it supports', async () => {
    for (const background of definitionOf(key).backgrounds) {
      const wrapper = await mountLayout(key, { background })
      for (const className of backgroundStyles[background].root.split(' '))
        expect(wrapper.find('section').classes()).toContain(className)
    }
  })

  it('shows only the heading without people, and leaves out a missing eyebrow', async () => {
    const wrapper = await mountLayout(key, { content: { heading: 'Meet our people', people: [] } })

    expect(wrapper.find('h2').text()).toBe('Meet our people')
    expect(wrapper.find('[data-people]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('The entourage')
  })
})

describe('people colours', () => {
  // On each background the name (and bio) use its brand text colour and the role its brand label colour: the primary
  // and accent on light, the accent and a soft primary on primary, the primary and a soft accent on accent
  it.each(['light', 'primary', 'accent', 'photo'] as const)('uses the brand colours for names, bios and roles on %s', async (background) => {
    const wrapper = await mountLayout('spotlight', { background })
    const styles = backgroundStyles[background]

    expect(wrapper.find('[data-person-name]').classes()).toContain(styles.brandText)
    expect(wrapper.find('[data-person-bio]').classes()).toContain(styles.brandText)
    expect(wrapper.find('[data-person-role]').classes()).toContain(styles.eyebrow)
  })

  // The initials switch with the background: a soft tint of the section's colour with that colour's text
  // People without photos; the background photo stays, so the photo background renders as itself
  const withoutPhotos = { ...content, people: people.map(({ photo: _, ...person }) => person) }
  it.each(['light', 'primary', 'accent', 'photo'] as const)('fills the initials with the avatar colours of %s', async (background) => {
    const initials = (await mountLayout('grid', { background, content: withoutPhotos })).find('[data-person-initials]')

    for (const className of backgroundStyles[background].avatar.split(' '))
      expect(initials.classes(), background).toContain(className)
  })

  it('uses the same avatar colours on white cards and prints as in the other layouts, while their text stays light', async () => {
    for (const key of ['cards', 'polaroids']) {
      for (const background of ['primary', 'accent'] as const) {
        const wrapper = await mountLayout(key, { background, content: withoutPhotos })
        for (const className of backgroundStyles[background].avatar.split(' '))
          expect(wrapper.find('[data-person-initials]').classes(), `${key} on ${background}`).toContain(className)
        expect(wrapper.find('[data-person-name]').classes(), `${key} on ${background}`).toContain(backgroundStyles.light.brandText)
      }
    }
  })

  it('uses a soft tint of the section\'s colour: the primary\'s, the accent\'s on accent', () => {
    for (const background of ['light', 'primary', 'photo'] as const)
      expect(backgroundStyles[background].avatar, background).toBe('bg-(--site-primary-50) text-(--site-primary-text)')
    expect(backgroundStyles.accent.avatar).toBe('bg-(--site-accent-100) text-(--site-accent-text)')
  })

  it('uses them in the entourage list too', async () => {
    const wrapper = await mountLayout('entourage', { background: 'primary' })

    expect(wrapper.find('[data-people-group] ul').classes()).toContain(backgroundStyles.primary.brandText)
    expect(wrapper.find('[data-person-role]').classes()).toContain(backgroundStyles.primary.eyebrow)
  })

  it('uses the light colours on the light cards, whatever the background', async () => {
    const card = (await mountLayout('cards', { background: 'primary' })).find('[data-person]')

    expect(card.find('[data-person-name]').classes()).toContain(backgroundStyles.light.brandText)
    expect(card.find('[data-person-role]').classes()).toContain(backgroundStyles.light.eyebrow)
  })
})

describe('placement options', () => {
  const classesOf = async (key: string, selector: string, options: Record<string, string> = {}) =>
    (await mountLayout(key, { options })).find(selector).classes()

  it('grid: shapes the photos and sets the columns, centring a row that isn\'t full', async () => {
    expect(await classesOf('grid', '[data-person-photo]')).toContain('rounded-full')
    expect(await classesOf('grid', '[data-person-photo]', { photoShape: 'arch' })).toContain('rounded-t-full')
    expect(await classesOf('grid', '[data-person]')).toContain('@3xl:w-[calc((100%-4.5rem)/4)]')
    expect(await classesOf('grid', '[data-person]', { columns: '5' })).toContain('@3xl:w-[calc((100%-6rem)/5)]')
    expect(await classesOf('grid', '[data-people]')).toEqual(expect.arrayContaining(['flex-wrap', 'justify-center']))
  })

  it('entourage: groups people next to each other with the same role under one heading', async () => {
    const wrapper = await mountLayout('entourage')
    const groups = wrapper.findAll('[data-people-group]')

    expect(groups.map(group => group.find('h3').exists() ? group.find('h3').text() : null)).toEqual(['Bride', 'Groom', 'Principal sponsors', null])
    expect(groups[2]!.findAll('li').map(li => li.text())).toEqual(['Mr. & Mrs. Jose Santos', 'Mr. & Mrs. Ramon Reyes'])
    expect(await classesOf('entourage', '[data-people]', { columns: '1' })).not.toContain('@2xl:columns-2')
  })

  it('featured: puts the first two people as a pair joined by an ampersand, the rest below', async () => {
    const wrapper = await mountLayout('featured')

    expect(wrapper.find('[data-people-pair]').text()).toContain('Bea Santos')
    expect(wrapper.find('[data-people-pair]').text()).toContain('Carlo Reyes')
    expect(wrapper.find('[data-people-ampersand]').text()).toBe('&')
    expect(wrapper.findAll('[data-people] [data-person]')).toHaveLength(3)
    expect((await mountLayout('featured', { content: { ...content, people: people.slice(0, 1) } })).find('[data-people-ampersand]').exists()).toBe(false)
  })

  it('cards: puts each person on a light card, columns from 768px', async () => {
    const card = (await mountLayout('cards', { background: 'primary' })).find('[data-person]')

    for (const className of backgroundStyles.light.root.split(' '))
      expect(card.classes()).toContain(className)
    expect(await classesOf('cards', '[data-person]', { columns: '2' })).toContain('@3xl:w-[calc((100%-1.5rem)/2)]')
  })

  it('spotlight: alternates the photo side, or keeps it on the left', async () => {
    const sides = async (options: Record<string, string>) =>
      (await mountLayout('spotlight', { options })).findAll('[data-person]').map(person => person.attributes('data-photo-side'))

    expect(await sides({})).toEqual(['left', 'right', 'left', 'right', 'left'])
    expect(await sides({ alternate: 'no' })).toEqual(['left', 'left', 'left', 'left', 'left'])
  })

  it('carousel: one row that scrolls sideways, centred while it fits', async () => {
    expect(await classesOf('carousel', '[data-people]')).toEqual(expect.arrayContaining(['overflow-x-auto', 'snap-x']))
    expect(await classesOf('carousel', '[data-person]')).toEqual(expect.arrayContaining(['shrink-0', 'first:ms-auto', 'last:me-auto']))
    expect(await classesOf('carousel', '[data-person-photo]', { photoShape: 'rounded' })).toContain('rounded-(--site-radius)')
  })

  it('staggered: drops every other portrait lower', async () => {
    expect(await classesOf('staggered', '[data-person]')).toContain('even:mt-12')
    expect(await classesOf('staggered', '[data-person-photo]')).toContain('rounded-t-full')
  })

  it('polaroids: tilts the prints unless tilt is off, with the name written on each', async () => {
    const wrapper = await mountLayout('polaroids', { background: 'primary' })

    expect(wrapper.find('[data-person-polaroid]').classes()).toContain('-rotate-3')
    expect(wrapper.find('[data-person-polaroid] figcaption').text()).toBe('Bea Santos')
    // The name is on the white print, so it uses the light background's brand colour on every background
    expect(wrapper.find('figcaption').classes()).toContain('text-(--site-primary-text)')
    expect(await classesOf('polaroids', '[data-person-polaroid]', { tilt: 'off' })).not.toContain('-rotate-3')
  })

  it('directory: one or two columns', async () => {
    expect(await classesOf('directory', '[data-people]')).toContain('@2xl:grid-cols-2')
    expect(await classesOf('directory', '[data-people]', { columns: '1' })).not.toContain('@2xl:grid-cols-2')
  })

  it('credits: puts the role above the name, or below it', async () => {
    const order = async (options: Record<string, string>) => {
      const caption = (await mountLayout('credits', { options })).find('[data-person-caption]').html()
      return caption.indexOf('data-person-role') < caption.indexOf('data-person-name') ? 'role first' : 'name first'
    }

    expect(await order({})).toBe('role first')
    expect(await order({ roleFirst: 'no' })).toBe('name first')
  })
})
