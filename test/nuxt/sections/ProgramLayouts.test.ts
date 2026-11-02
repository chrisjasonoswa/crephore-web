import type { Component } from 'vue'
import type { ProgramContent, ProgramItem } from '~/features/sections/program/program.type'
import type { SectionBackground } from '~/features/sections/section.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import ProgramAgenda from '~/components/sections/program/ProgramAgenda.vue'
import ProgramBigTimes from '~/components/sections/program/ProgramBigTimes.vue'
import ProgramCards from '~/components/sections/program/ProgramCards.vue'
import ProgramDayDivider from '~/components/sections/program/ProgramDayDivider.vue'
import ProgramDateBlocks from '~/components/sections/program/ProgramDateBlocks.vue'
import ProgramHorizontal from '~/components/sections/program/ProgramHorizontal.vue'
import ProgramList from '~/components/sections/program/ProgramList.vue'
import ProgramMenuCard from '~/components/sections/program/ProgramMenuCard.vue'
import ProgramNote from '~/components/sections/program/ProgramNote.vue'
import ProgramPhotoCards from '~/components/sections/program/ProgramPhotoCards.vue'
import ProgramPoster from '~/components/sections/program/ProgramPoster.vue'
import ProgramPrinted from '~/components/sections/program/ProgramPrinted.vue'
import ProgramTabCards from '~/components/sections/program/ProgramTabCards.vue'
import ProgramTable from '~/components/sections/program/ProgramTable.vue'
import ProgramTickets from '~/components/sections/program/ProgramTickets.vue'
import ProgramTimeline from '~/components/sections/program/ProgramTimeline.vue'
import ProgramVertical from '~/components/sections/program/ProgramVertical.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import { groupedChoices, resolveLayoutOptions } from '~/features/sections/section.options'
import { getSectionLayout, getSectionType } from '~/features/sections/section.registry'

const backgroundPhoto = 'https://example.com/background.jpg'
// 14 Feb 2027 in Manila
const occasion = { startsAt: '2027-02-14T06:00:00Z', timezone: 'Asia/Manila' }

const items: ProgramItem[] = [
  { id: 'a', date: '2027-02-14', startTime: '15:00', endTime: '16:00', title: 'Ceremony', venue: 'Manila Cathedral', description: 'Please be seated by 2:45.', speakers: 'Fr. Jose Cruz' },
  { id: 'b', date: '2027-02-14', startTime: '18:00', title: 'Cocktails', venue: 'Pool deck' },
  { id: 'c', date: '2027-02-15', startTime: '00:30', title: 'After-party', venue: 'Poolside Bar' },
]
const content: ProgramContent = { eyebrow: 'The day', heading: 'Program', items, layoutPhotos: [], backgroundPhoto }
const titles = items.map(item => item.title)

// Each layout, whether it sets the time large (and numbers items without times), shows notes and shows venues
const layouts: { key: string, component: Component, marker: boolean, notes: boolean, venues: boolean }[] = [
  { key: 'timeline', component: ProgramTimeline, marker: false, notes: true, venues: true },
  { key: 'list', component: ProgramList, marker: false, notes: true, venues: true },
  { key: 'table', component: ProgramTable, marker: false, notes: true, venues: true },
  { key: 'cards', component: ProgramCards, marker: false, notes: true, venues: true },
  { key: 'printed', component: ProgramPrinted, marker: false, notes: true, venues: true },
  { key: 'big-times', component: ProgramBigTimes, marker: true, notes: true, venues: true },
  { key: 'horizontal', component: ProgramHorizontal, marker: false, notes: true, venues: true },
  { key: 'poster', component: ProgramPoster, marker: true, notes: true, venues: true },
  { key: 'agenda', component: ProgramAgenda, marker: false, notes: true, venues: true },
  { key: 'menu-card', component: ProgramMenuCard, marker: false, notes: true, venues: true },
  { key: 'tickets', component: ProgramTickets, marker: true, notes: true, venues: true },
  { key: 'note', component: ProgramNote, marker: false, notes: true, venues: true },
  { key: 'vertical', component: ProgramVertical, marker: false, notes: true, venues: true },
  { key: 'date-blocks', component: ProgramDateBlocks, marker: false, notes: true, venues: true },
  { key: 'photo-cards', component: ProgramPhotoCards, marker: false, notes: true, venues: true },
  { key: 'tab-cards', component: ProgramTabCards, marker: false, notes: true, venues: true },
]

const definitionOf = (key: string) => getSectionLayout('program', key)!

const mountLayout = (key: string, props: { content?: ProgramContent, background?: SectionBackground, options?: Record<string, string> } = {}) => {
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
// The agenda shows one day at a time: its first tab
const firstDayTitles = (key: string) => key === 'agenda' ? titles.slice(0, 2) : titles
const inOrder = (text: string, parts: string[]) => {
  const positions = parts.map(part => text.indexOf(part))
  return positions.every(position => position >= 0) && positions.every((position, i) => i === 0 || position > positions[i - 1]!)
}
const sources = (wrapper: Wrapper) => wrapper.findAll('img').map(img => img.attributes('src'))

it('registers the program layouts in picker order, each with a time option; only two have a layout photo', () => {
  const registered = getSectionType('program').layouts
  expect(registered.map(layout => layout.key)).toEqual(layouts.map(layout => layout.key))
  expect(registered.filter(layout => layout.layoutPhotoCount).map(layout => [layout.key, layout.layoutPhotoCount])).toEqual([['vertical', 1], ['photo-cards', 1]])
  for (const layout of registered)
    expect(layout.options.find(option => option.key === 'showTime')?.choices.map(choice => choice.value), layout.key).toEqual(['show', 'hide'])
  // Times are shown by default
  expect(registered.every(layout => layout.options.find(option => option.key === 'showTime')!.default === 'show')).toBe(true)
})

it('starts the bold poster on primary and the paper layouts on accent', () => {
  for (const key of ['poster', 'photo-cards'])
    expect(definitionOf(key).backgrounds[0], key).toBe('primary')
  for (const key of ['printed', 'menu-card', 'tickets', 'note'])
    expect(definitionOf(key).backgrounds[0], key).toBe('accent')
  for (const key of ['timeline', 'list', 'cards', 'big-times', 'horizontal', 'agenda', 'table', 'vertical', 'date-blocks', 'tab-cards'])
    expect(definitionOf(key).backgrounds[0], key).toBe('light')
})

describe.each(layouts)('program layout $key', ({ key, marker, notes, venues }) => {
  it('renders the eyebrow, heading and the titles in order', async () => {
    const wrapper = await mountLayout(key)

    expect(wrapper.text()).toContain('The day')
    expect(wrapper.find('h2').text()).toBe('Program')
    expect(inOrder(wrapper.text(), firstDayTitles(key))).toBe(true)
  })

  it('shows the times, and hides them with the time option', async () => {
    const shown = await mountLayout(key, { options: { showTime: 'show' } })
    expect(shown.text()).toContain('3:00')
    expect(shown.text()).toContain('6:00')

    const hidden = await mountLayout(key, { options: { showTime: 'hide' } })
    expect(hidden.text()).not.toContain('3:00')
    expect(hidden.find('[data-program-time]').exists()).toBe(false)
    if (marker)
      expect(hidden.findAll('[data-program-marker]').map(el => el.text())).toEqual(['01', '02', '03'])
  })

  it(notes ? 'shows notes' : 'leaves notes out', async () => {
    expect((await mountLayout(key)).text().includes('Please be seated by 2:45.')).toBe(notes)
  })

  it(venues ? 'shows venues' : 'leaves venues out', async () => {
    expect((await mountLayout(key)).text().includes('Manila Cathedral')).toBe(venues)
  })

  it('starts every day with its date, the first too', async () => {
    const wrapper = await mountLayout(key)
    if (key === 'agenda')
      expect(wrapper.findAll('[data-program-tab]').map(tab => tab.text())).toEqual(['Day 1 · Sun, 14 Feb', 'Day 2 · Mon, 15 Feb'])
    // Just the date, never "Event day" or "Next day"
    else
      expect(wrapper.findAll('[data-program-day]').map(day => day.text())).toEqual(['Sun, 14 Feb', 'Mon, 15 Feb'])
  })

  it('shows the date when everything is on one day', async () => {
    const wrapper = await mountLayout(key, { content: { ...content, items: items.slice(0, 2) } })

    // The agenda has no tabs for one day; each row's date badge shows it
    if (key === 'agenda') {
      expect(wrapper.find('[data-program-tabs]').exists()).toBe(false)
      expect(wrapper.find('[data-program-date]').text()).toBe('14Feb')
    }
    else {
      expect(wrapper.findAll('[data-program-day]').map(day => day.text())).toEqual(['Sun, 14 Feb'])
    }
  })

  it('shows the overall venue under the heading, behind a map pin, only when there is one', async () => {
    expect((await mountLayout(key)).find('[data-program-overall-venue]').exists()).toBe(false)

    const venue = (await mountLayout(key, { content: { ...content, venue: 'Manila Cathedral' } })).find('[data-program-heading] [data-program-overall-venue]')
    expect(venue.text()).toBe('Venue: Manila Cathedral')
    expect(venue.find('svg').classes()).toContain('lucide-map-pin')
  })

  it('shows the background photo only on the photo background, and no other photos', async () => {
    expect(sources(await mountLayout(key, { background: 'light' }))).toEqual([])
    expect(sources(await mountLayout(key, { background: 'photo' }))).toEqual([backgroundPhoto])
  })

  it('applies each background it supports', async () => {
    for (const background of definitionOf(key).backgrounds) {
      const wrapper = await mountLayout(key, { background })
      for (const className of backgroundStyles[background].root.split(' '))
        expect(wrapper.find('section').classes()).toContain(className)
    }
  })

  it('shows only the heading without items, and leaves out a missing eyebrow', async () => {
    const wrapper = await mountLayout(key, { content: { heading: 'Program', items: [], layoutPhotos: [] } })

    expect(wrapper.find('h2').text()).toBe('Program')
    expect(wrapper.find('[data-program-items]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('The day')
  })
})

describe('program colours', () => {
  it.each(['light', 'primary', 'accent', 'photo'] as const)('uses the brand text colour for titles and the label colour for times on %s', async (background) => {
    const wrapper = await mountLayout('timeline', { background })
    const styles = backgroundStyles[background]

    expect(wrapper.find('[data-program-item] h3').classes()).toContain(styles.brandText)
    expect(wrapper.find('[data-program-time] span').classes()).toContain(styles.eyebrow)
  })

  it('uses the light colours on cards, tickets, the menu card and photo cards, whatever the background', async () => {
    for (const key of ['cards', 'tickets', 'menu-card', 'photo-cards']) {
      const wrapper = await mountLayout(key, { background: 'primary' })
      expect(wrapper.find('[data-program-item] h3').classes(), key).toContain(backgroundStyles.light.brandText)
    }
  })
})

describe('layout options', () => {
  const classesOf = async (key: string, selector: string, options: Record<string, string> = {}) =>
    (await mountLayout(key, { options })).find(selector).classes()

  it('timeline: puts the times on the left or the right of the line', async () => {
    expect(await classesOf('timeline', '[data-program-item]')).not.toContain('flex-row-reverse')
    expect(await classesOf('timeline', '[data-program-item]', { timeColumn: 'right' })).toContain('flex-row-reverse')
  })

  it('timeline: shows the speakers after the venue, as "with" and the names in the label colour', async () => {
    const wrapper = await mountLayout('timeline', { background: 'primary' })
    const speakers = wrapper.find('[data-program-speakers]')
    const [joiner, names] = speakers.findAll('span')

    expect(joiner!.text()).toBe('with')
    expect(names!.text()).toBe('Fr. Jose Cruz')
    expect(names!.classes()).toContain(backgroundStyles.primary.eyebrow)
    const text = wrapper.find('[data-program-item]').text()
    expect(inOrder(text, ['Manila Cathedral', 'Fr. Jose Cruz', 'Please be seated by 2:45.'])).toBe(true)
    // Only items with speakers have the line
    expect(wrapper.findAll('[data-program-speakers]')).toHaveLength(1)
  })

  it('list: stacks the venue, the speakers and a smaller note on the right', async () => {
    const details = (await mountLayout('list')).find('[data-program-details]')

    expect(inOrder(details.text(), ['Manila Cathedral', 'with', 'Fr. Jose Cruz', 'Please be seated by 2:45.'])).toBe(true)
    expect(details.find('[data-program-description]').classes()).toContain('text-xs')
    expect(details.classes()).toContain('@2xl:items-end')
  })

  it('list: draws a line under each item, except a day\'s last when another day follows', async () => {
    const lines = (await mountLayout('list')).findAll('[data-program-item]').map(item => item.classes().includes('border-b'))

    // Ceremony, Cocktails (last of the event day, then the next day's divider), After-party (last of all)
    expect(lines).toEqual([true, false, true])
  })

  it('printed: shows the venue, then who leads it in italics, then the note, under the title', async () => {
    const item = (await mountLayout('printed')).find('[data-program-item]')

    expect(inOrder(item.text(), ['Ceremony', 'Manila Cathedral', 'Fr. Jose Cruz', 'Please be seated by 2:45.'])).toBe(true)
    expect(item.find('[data-program-speakers]').text()).toBe('Fr. Jose Cruz')
    expect(item.find('[data-program-speakers]').classes()).toContain('italic')
    expect(item.find('[data-program-venue]').classes()).not.toContain('italic')
  })

  it('printed: numbers the parts (none by default) above a lighter time, through every day', async () => {
    const numbers = async (numbering?: string) => (await mountLayout('printed', { options: numbering ? { numbering } : {} })).findAll('[data-program-number]').map(el => el.text())
    expect(await numbers()).toEqual([])
    expect(await numbers('roman')).toEqual(['I', 'II', 'III'])
    expect(await numbers('numbers')).toEqual(['1', '2', '3'])

    // The number above the time; the time bold only without a number
    const plain = (await mountLayout('printed')).find('[data-program-time]')
    expect(plain.classes()).toContain('font-semibold')
    const part = (await mountLayout('printed', { options: { numbering: 'roman' } })).find('[data-program-item]')
    expect(inOrder(part.text(), ['I', '3:00 PM', 'Ceremony'])).toBe(true)
    expect(part.find('[data-program-time]').classes()).toContain('font-normal')
    expect(part.find('[data-program-time]').classes()).not.toContain('font-semibold')
  })

  it('big times: shows "with" and the speakers between the venue and the note', async () => {
    const item = (await mountLayout('big-times')).find('[data-program-item]')

    expect(inOrder(item.text(), ['Manila Cathedral', 'with', 'Fr. Jose Cruz', 'Please be seated by 2:45.'])).toBe(true)
  })

  it('big times: draws a line under each item except those in a day\'s last row', async () => {
    const linesOf = async (columns: string, list: ProgramItem[]) =>
      (await mountLayout('big-times', { options: { columns }, content: { ...content, items: list } }))
        .findAll('[data-program-item]')
        .map(item => item.classes().includes('border-b') ? (item.classes().includes('@3xl:border-b-0') ? 'phone only' : 'line') : 'none')
    const sameDay = [...items.slice(0, 2), { ...items[1]!, id: 'd', title: 'Dinner' }, { ...items[1]!, id: 'e', title: 'Dance' }]

    // A day's last item never has one (Cocktails, then the next day; After-party, last of all)
    expect(await linesOf('1', items)).toEqual(['line', 'none', 'none'])
    // Two columns: the item beside the last shares its row, so only phones (one column) draw its line
    expect(await linesOf('2', sameDay)).toEqual(['line', 'line', 'phone only', 'none'])
    expect(await linesOf('2', sameDay.slice(0, 3))).toEqual(['line', 'line', 'none'])
  })

  it('poster: shows the venue, "with" and the speakers, then the note, smallest and softest, without icons', async () => {
    const item = (await mountLayout('poster')).find('[data-program-item]')

    expect(inOrder(item.text(), ['Ceremony', 'Manila Cathedral', 'with', 'Fr. Jose Cruz', 'Please be seated by 2:45.'])).toBe(true)
    expect(item.find('[data-program-description]').classes()).toEqual(expect.arrayContaining(['text-xs', ...backgroundStyles.primary.muted.split(' ')]))
    expect(item.find('[data-program-speakers]').exists()).toBe(true)
    // The marker is text; nothing else has an icon
    expect(item.findAll('svg')).toHaveLength(0)
  })

  it('menu card: shows the venue, "with" and the speakers, then the note, centred and without icons', async () => {
    const item = (await mountLayout('menu-card')).find('[data-program-item]')

    expect(inOrder(item.text(), ['Ceremony', 'Manila Cathedral', 'with', 'Fr. Jose Cruz', 'Please be seated by 2:45.'])).toBe(true)
    expect(item.find('[data-program-speakers]').classes()).toContain('justify-center')
    expect(item.find('[data-program-venue] svg').exists()).toBe(false)
  })

  it('tickets: shows the speakers as a quiet "with …" line between the venue and the note', async () => {
    const ticket = (await mountLayout('tickets')).find('[data-program-item]')

    expect(inOrder(ticket.text(), ['Ceremony', 'Manila Cathedral', 'with', 'Fr. Jose Cruz', 'Please be seated by 2:45.'])).toBe(true)
    const speakers = ticket.find('[data-program-speakers]')
    expect(speakers.text()).toBe('with Fr. Jose Cruz')
    // Not in the venue's spaced capitals
    expect(speakers.classes()).not.toContain('uppercase')
    expect(speakers.find('span').classes()).toContain(backgroundStyles.light.muted)
  })

  it('cards, tickets and the pinned note: give each day its own label, not the ruled divider', async () => {
    const cards = await mountLayout('cards')
    expect(cards.findComponent(ProgramDayDivider).exists()).toBe(false)
    // Each day's cards in a soft outlined panel, the date in plain text centred in its top line
    const panels = cards.findAll('[data-program-day-panel]')
    expect(panels).toHaveLength(2)
    expect(panels[0]!.classes()).toEqual(expect.arrayContaining(['border', 'border-current/15']))
    expect(panels[0]!.find('legend').classes()).toContain('mx-auto')
    expect(panels[0]!.find('legend [data-program-day]').text()).toBe('Sun, 14 Feb')
    expect(panels[0]!.find('[data-program-day] svg').exists()).toBe(false)
    expect(panels[0]!.findAll('[data-program-item]')).toHaveLength(2)

    const tickets = await mountLayout('tickets')
    expect(tickets.findComponent(ProgramDayDivider).exists()).toBe(false)
    expect(tickets.find('[data-program-day]').classes()).toEqual(expect.arrayContaining(['border-2', 'border-dashed']))

    const note = await mountLayout('note')
    expect(note.findComponent(ProgramDayDivider).exists()).toBe(false)
    expect(note.find('[data-program-day]').classes()).toContain('[font-style:var(--site-font-heading-italic)]')

    // The other ruled layouts keep it
    expect((await mountLayout('timeline')).findComponent(ProgramDayDivider).exists()).toBe(true)
  })

  it('cards: shows the venue behind a map pin and the speakers behind a person icon', async () => {
    const card = (await mountLayout('cards')).find('[data-program-item]')

    expect(card.find('[data-program-venue]').text()).toBe('Venue: Manila Cathedral')
    expect(card.find('[data-program-venue] svg').classes()).toContain('lucide-map-pin')
    expect(card.find('[data-program-speakers]').text()).toBe('With: Fr. Jose Cruz')
    expect(card.find('[data-program-speakers] svg').classes()).toContain('lucide-user-round')
  })

  it('table: shows the venue column only when an item has a venue', async () => {
    const withVenues = await mountLayout('table')
    expect(withVenues.findAll('th').map(th => th.text())).toContain('Venue')

    const withoutVenues = await mountLayout('table', { content: { ...content, items: items.map(({ venue: _, ...item }) => item) } })
    expect(withoutVenues.findAll('th').map(th => th.text())).not.toContain('Venue')
  })

  it('cards, big times, poster and tickets: set the columns', async () => {
    expect(await classesOf('cards', '[data-program-items]', { columns: '2' })).toContain('@3xl:grid-cols-2')
    expect(await classesOf('cards', '[data-program-items]', { columns: '3' })).toContain('@3xl:grid-cols-3')
    expect(await classesOf('big-times', '[data-program-items]', { columns: '1' })).not.toContain('@3xl:grid-cols-2')
    expect(await classesOf('big-times', '[data-program-items]', { columns: '2' })).toContain('@3xl:grid-cols-2')
    expect(await classesOf('poster', '[data-program-items]', { columns: '3' })).toContain('@3xl:grid-cols-3')
    expect(await classesOf('poster', '[data-program-items]', { columns: '2' })).not.toContain('@3xl:grid-cols-3')
    expect(await classesOf('tickets', '[data-program-items]', { columns: '1' })).not.toContain('@2xl:grid-cols-2')
    expect(await classesOf('tickets', '[data-program-items]', { columns: '2' })).toContain('@2xl:grid-cols-2')
  })

  it('printed: draws a line, a dot or nothing between items', async () => {
    expect(await classesOf('printed', '[data-program-divider]', { divider: 'line' })).toContain('w-12')
    expect(await classesOf('printed', '[data-program-divider]', { divider: 'dot' })).toContain('rounded-full')
    expect((await mountLayout('printed', { options: { divider: 'none' } })).find('[data-program-divider]').exists()).toBe(false)
  })

  it('horizontal: marks items with a dot by default, or the chosen icon in the avatar colours', async () => {
    const dots = await mountLayout('horizontal')
    expect(dots.findAll('[data-program-marker-dot]')).toHaveLength(3)
    expect(dots.find('[data-program-marker-icon]').exists()).toBe(false)

    const hearts = await mountLayout('horizontal', { background: 'accent', options: { marker: 'heart' } })
    const icons = hearts.findAll('[data-program-marker-icon]')
    expect(icons).toHaveLength(3)
    expect(icons[0]!.find('svg').classes()).toContain('lucide-heart')
    expect(icons[0]!.classes()).toEqual(expect.arrayContaining(backgroundStyles.accent.avatar.split(' ')))
    expect(hearts.find('[data-program-marker-dot]').exists()).toBe(false)
  })

  it('horizontal: offers the dot and twelve icons in a dropdown, each with its own icon', async () => {
    const option = definitionOf('horizontal').options.find(o => o.key === 'marker')!
    expect(option.control).toBe('select')
    expect(option.default).toBe('dot')
    expect(option.choices.map(choice => choice.label)).toEqual(['Dot', 'Heart', 'Flower', 'Gem', 'Balloon', 'Cake', 'Party popper', 'Microphone', 'Light bulb', 'Briefcase', 'Candle flame', 'Leaf', 'Dove'])
    for (const choice of option.choices.filter(c => c.value !== 'dot'))
      expect((await mountLayout('horizontal', { options: { marker: choice.value } })).find('[data-program-marker-icon] svg').exists(), choice.value).toBe(true)
  })

  it('horizontal: shows the venue behind a map pin and the speakers behind a person icon', async () => {
    const item = (await mountLayout('horizontal')).find('[data-program-item]')

    expect(item.find('[data-program-venue] svg').classes()).toContain('lucide-map-pin')
    expect(item.find('[data-program-speakers]').text()).toBe('With: Fr. Jose Cruz')
    expect(item.find('[data-program-speakers] svg').classes()).toContain('lucide-user-round')
  })

  it('horizontal: shows a swipe indicator under the row once it overflows, its thumb following the scroll', async () => {
    const wrapper = await mountLayout('horizontal')
    expect(wrapper.find('[data-scroll-hint]').exists()).toBe(false)

    const row = wrapper.find('[data-program-items]').element as HTMLOListElement
    Object.defineProperties(row, { clientWidth: { value: 500 }, scrollWidth: { value: 1000 }, scrollLeft: { value: 0, writable: true } })
    row.dispatchEvent(new Event('scroll'))
    await nextTick()

    expect(wrapper.find('[data-scroll-thumb]').attributes('style')).toBe('width: 50%; left: 0%;')
  })

  it('agenda: shows everything in each row, nothing collapsed, and switches days with the tabs', async () => {
    const wrapper = await mountLayout('agenda')
    const row = wrapper.find('[data-program-item]')
    expect(wrapper.find('details').exists()).toBe(false)
    expect(row.find('[data-program-date]').text()).toBe('14Feb')
    expect(inOrder(row.text(), ['3:00 PM – 4:00 PM', 'Ceremony', 'Manila Cathedral', 'Fr. Jose Cruz', 'Please be seated by 2:45.'])).toBe(true)
    expect(row.find('[data-program-venue] svg').classes()).toContain('lucide-map-pin')
    expect(row.find('[data-program-speakers]').text()).toBe('With: Fr. Jose Cruz')
    expect(row.find('[data-program-speakers] svg').classes()).toContain('lucide-user-round')
    // The note under a dashed rule
    expect(row.find('[data-program-description]').classes()).toEqual(expect.arrayContaining(['border-t', 'border-dashed']))

    await wrapper.findAll('[data-program-tab]')[1]!.trigger('click')
    expect(wrapper.text()).toContain('After-party')
    expect(wrapper.text()).not.toContain('Ceremony')
    expect(wrapper.find('[data-program-date]').text()).toBe('15Feb')

    const hidden = await mountLayout('agenda', { options: { showSpeaker: 'hide' } })
    expect(hidden.find('[data-program-speakers]').exists()).toBe(false)
  })

  it('agenda: joins several speakers with commas and an ampersand', async () => {
    const two = await mountLayout('agenda', { content: { ...content, items: [{ ...items[0]!, speakers: 'Migs Cruz, Tita Lorna' }] } })
    expect(two.find('[data-program-speakers]').text()).toBe('With: Migs Cruz & Tita Lorna')
    const three = await mountLayout('agenda', { content: { ...content, items: [{ ...items[0]!, speakers: 'Ana Lim, Paolo Tan, Rina Cruz' }] } })
    expect(three.find('[data-program-speakers]').text()).toBe('With: Ana Lim, Paolo Tan & Rina Cruz')
  })

  it('menu card: draws the chosen divider between items (the flourish by default), or nothing', async () => {
    const flourish = await mountLayout('menu-card')
    expect(flourish.findAll('svg[data-program-ornament]')).toHaveLength(1)
    expect(flourish.find('[data-program-ornament]').attributes('data-site-divider')).toBe('flourish')
    expect((await mountLayout('menu-card', { options: { ornament: 'balloons' } })).find('[data-program-ornament]').attributes('data-site-divider')).toBe('balloons')
    expect((await mountLayout('menu-card', { options: { ornament: 'none' } })).find('[data-program-ornament]').exists()).toBe(false)
  })

  it('menu card: offers none and every divider in a dropdown', () => {
    const option = definitionOf('menu-card').options.find(o => o.key === 'ornament')!
    expect(option.control).toBe('select')
    expect(option.choices).toHaveLength(31)
    expect(option.choices.slice(0, 3).map(choice => choice.value)).toEqual(['none', 'flourish', 'dot'])
    // Under a heading per kind of event, None on its own first
    expect(groupedChoices(option.choices).map(group => [group.group, group.choices.length])).toEqual([
      [undefined, 1],
      ['Any event', 10],
      ['Weddings & engagements', 5],
      ['Birthdays & parties', 5],
      ['Business & conferences', 5],
      ['Memorials & tributes', 5],
    ])
  })

  it('note: pins the paper with the button colour by default, or clips it, or neither', async () => {
    const pinned = await mountLayout('note')
    expect(pinned.find('[data-program-pin]').attributes('style')).toContain('var(--site-button-accent)')
    expect(pinned.find('[data-program-clip]').exists()).toBe(false)

    const clipped = await mountLayout('note', { options: { attachment: 'clip' } })
    expect(clipped.find('[data-program-clip]').exists()).toBe(true)
    expect(clipped.find('[data-program-pin]').exists()).toBe(false)

    const plain = await mountLayout('note', { options: { attachment: 'none' } })
    expect(plain.find('[data-program-pin]').exists() || plain.find('[data-program-clip]').exists()).toBe(false)
  })

  it('note: sets the eyebrow in italics over a capitals heading, on light paper whatever the background', async () => {
    const wrapper = await mountLayout('note', { background: 'primary' })
    expect(wrapper.find('[data-program-note]').classes()).toEqual(expect.arrayContaining(backgroundStyles.light.root.split(' ')))
    expect(wrapper.find('[data-program-heading] p').classes()).toContain('[font-style:var(--site-font-heading-italic)]')
    expect(wrapper.find('h2').classes()).toContain('uppercase')
  })

  it('note: shows the venue, "with" the speakers and the note beside detailed rows, or on one small line when compact', async () => {
    const detailed = (await mountLayout('note')).find('[data-program-item]')
    expect(inOrder(detailed.find('[data-program-details]').text(), ['Manila Cathedral', 'with Fr. Jose Cruz', 'Please be seated by 2:45.'])).toBe(true)

    const compact = (await mountLayout('note', { options: { rows: 'compact' } })).find('[data-program-item]')
    expect(compact.find('[data-program-details]').text().replace(/\s+/g, ' ')).toBe('Manila Cathedral · with Fr. Jose Cruz · Please be seated by 2:45.')
    expect(compact.find('[data-program-speakers]').exists()).toBe(true)
  })

  it('vertical: sets the heading sideways, a photo on top (or none), then time ranges and "By" the speakers', async () => {
    const wrapper = await mountLayout('vertical', { content: { ...content, layoutPhotos: ['https://example.com/banner.jpg'] } })
    expect(wrapper.find('h2').classes()).toContain('[writing-mode:vertical-rl]')
    expect(wrapper.find('[data-program-photo]').attributes('src')).toBe('https://example.com/banner.jpg')
    const item = wrapper.find('[data-program-item]')
    expect(item.find('[data-program-time]').text()).toBe('3:00 PM – 4:00 PM')
    expect(inOrder(item.text(), ['Ceremony', 'Manila Cathedral', 'By Fr. Jose Cruz', 'Please be seated by 2:45.'])).toBe(true)

    expect((await mountLayout('vertical', { options: { showPhoto: 'hide' } })).find('[data-program-photo]').exists()).toBe(false)
  })

  it.each([
    ['light', ['accent', 'primary']],
    ['primary', ['accent', 'light']],
    ['accent', ['primary', 'light']],
  ] as const)('date blocks: on %s, alternate two other colours, with the month in a badge', async (background, colours) => {
    const wrapper = await mountLayout('date-blocks', { background, options: { blockPer: 'day' } })
    const blocks = wrapper.findAll('[data-program-block]')
    expect(blocks).toHaveLength(2)
    blocks.forEach((block, i) => expect(block.classes()).toEqual(expect.arrayContaining(backgroundStyles[colours[i]!].root.split(' '))))
    expect(wrapper.find('[data-program-month]').text()).toBe('February 2027')
    expect(blocks[0]!.find('[data-program-date]').text()).toBe('14SunFeb')
  })

  it('date blocks: one block per item by default, each with its date, alternating colours', async () => {
    const blocks = (await mountLayout('date-blocks')).findAll('[data-program-block]')
    expect(blocks.map(block => block.find('[data-program-date]').text())).toEqual(['14SunFeb', '14SunFeb', '15MonFeb'])
    expect(blocks[0]!.classes()).toEqual(expect.arrayContaining(backgroundStyles.accent.root.split(' ')))
    expect(blocks[1]!.classes()).toEqual(expect.arrayContaining(backgroundStyles.primary.root.split(' ')))
  })

  it('date blocks: shows the venue and "with" the speakers on a line, then the note, with no option to hide notes', async () => {
    const item = (await mountLayout('date-blocks')).find('[data-program-item]')
    expect(inOrder(item.text(), ['Ceremony', 'Manila Cathedral', 'with Fr. Jose Cruz', 'Please be seated by 2:45.'])).toBe(true)
    expect(definitionOf('date-blocks').options.map(option => option.key)).toEqual(['showTime', 'blockPer'])
  })

  it('photo cards: puts the photo on photoSide and a light card per date with ticked items', async () => {
    const wrapper = await mountLayout('photo-cards', { content: { ...content, layoutPhotos: ['https://example.com/half.jpg'] } })
    expect(wrapper.find('[data-program-photo]').attributes('src')).toBe('https://example.com/half.jpg')
    expect(wrapper.find('[data-program-photo-column]').classes()).toEqual(expect.arrayContaining(['end-0', 'inset-y-0']))
    expect(await classesOf('photo-cards', '[data-program-photo-column]', { photoSide: 'left' })).toContain('start-0')
    // Sticks while the cards scroll, a screen tall at most (an <img> needs a height of its own)
    expect(wrapper.find('[data-program-photo]').classes()).toEqual(expect.arrayContaining(['sticky', 'top-0', 'h-svh', 'max-h-full']))

    // One card per item by default: its date and day, the title large, no ticks
    const cards = wrapper.findAll('[data-program-card]')
    expect(cards).toHaveLength(3)
    expect(cards.map(card => card.find('[data-program-date]').text())).toEqual(['14Feb', '14Feb', '15Feb'])
    expect(cards[2]!.text()).toContain('Mon · Day 2')
    expect(cards[0]!.find('svg').exists()).toBe(false)
    expect(cards[0]!.find('h3:not(.sr-only)').classes()).toContain('font-(family-name:--site-font-heading)')
    expect(inOrder(cards[0]!.text(), ['3:00 PM', 'Ceremony', 'Manila Cathedral', 'with Fr. Jose Cruz', 'Please be seated by 2:45.'])).toBe(true)
  })

  it('photo cards: one card per date with the day\'s items as ticked lines', async () => {
    const cards = (await mountLayout('photo-cards', { options: { blockPer: 'day' } })).findAll('[data-program-card]')
    expect(cards).toHaveLength(2)
    expect(cards[1]!.text()).toContain('Mon · Day 2')
    expect(cards[0]!.findAll('[data-program-item]')).toHaveLength(2)
    expect(cards[0]!.find('[data-program-item] svg').classes()).toContain('lucide-check')
    expect(inOrder(cards[0]!.text(), ['3:00 PM', 'Ceremony', 'Manila Cathedral', 'with Fr. Jose Cruz', 'Please be seated by 2:45.', 'Cocktails'])).toBe(true)
  })

  it.each(['date-blocks', 'photo-cards'])('%s: offers one item or one day per block, one item by default', (key) => {
    const option = definitionOf(key).options.find(o => o.key === 'blockPer')!
    expect(option.choices.map(choice => choice.value)).toEqual(['item', 'day'])
    expect(option.default).toBe('item')
  })

  it('tab cards: a notched header in another colour, the short month in the notch', async () => {
    const wrapper = await mountLayout('tab-cards')
    expect(wrapper.find('[data-program-heading]').classes()).toEqual(expect.arrayContaining(backgroundStyles.primary.root.split(' ')))
    expect(wrapper.find('[data-program-band]').attributes('style')).toContain('--card: var(--site-primary)')
    expect(wrapper.find('[data-program-month]').text()).toBe('Feb 2027')
    expect((await mountLayout('tab-cards', { background: 'primary' })).find('[data-program-band]').attributes('style')).toContain('--card: var(--site-bg)')
  })

  it('tab cards: a card per item, the date in a pill and the time on the tab, cycling through four colours', async () => {
    const wrapper = await mountLayout('tab-cards')
    const cards = wrapper.findAll('[data-program-card]')
    expect(cards.map(card => card.find('[data-program-date]').text())).toEqual(['14 Feb', '14 Feb', '15 Feb'])
    expect(cards.map(card => card.find('[data-program-tab]').text())).toEqual(['3:00 PM', '6:00 PM', '12:30 AM'])
    expect(cards.map(card => card.attributes('style'))).toEqual([
      expect.stringContaining('--card: var(--site-accent)'),
      expect.stringContaining('--card: var(--site-primary)'),
      expect.stringContaining('--card: var(--site-accent-100)'),
    ])
    expect(wrapper.findAll('[data-program-day]').map(day => day.text())).toEqual(['Sun, 14 Feb', 'Mon, 15 Feb'])
  })

  it.each([['primary', 'var(--site-primary)'], ['accent', 'var(--site-accent)']] as const)('tab cards: leaves out cards in the section\'s colour on %s', async (background, colour) => {
    const cards = (await mountLayout('tab-cards', { background })).findAll('[data-program-card]')
    expect(cards).toHaveLength(3)
    expect(cards.every(card => !card.attributes('style')!.includes(`--card: ${colour};`))).toBe(true)
  })

  it('tab cards: shows the speakers and the note as a tag line, then the venue behind a pin, and sets the columns', async () => {
    const item = (await mountLayout('tab-cards')).find('[data-program-item]')
    expect(inOrder(item.text(), ['Ceremony', 'Fr. Jose Cruz', '·', 'Please be seated by 2:45.', 'Manila Cathedral'])).toBe(true)
    expect(item.find('[data-program-speakers]').text()).toBe('Fr. Jose Cruz')
    expect(item.find('[data-program-venue] svg').classes()).toContain('lucide-map-pin')

    expect(await classesOf('tab-cards', '[data-program-items]', { columns: '2' })).toContain('@2xl:grid-cols-2')
    expect(await classesOf('tab-cards', '[data-program-items]', { columns: '1' })).not.toContain('@2xl:grid-cols-2')
  })
})
