import type { Component } from 'vue'
import type { ProgramContent, ProgramItem, ProgramVenue, SectionProgram } from '~/features/sections/program/program.type'
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
import ProgramTable from '~/components/sections/program/ProgramTable.vue'
import ProgramTickets from '~/components/sections/program/ProgramTickets.vue'
import ProgramTimeline from '~/components/sections/program/ProgramTimeline.vue'
import ProgramVertical from '~/components/sections/program/ProgramVertical.vue'
import { programBlockColours } from '~/features/sections/program/program.helpers'
import { backgroundStyles } from '~/features/sections/section.background'
import { groupedChoices, resolveLayoutOptions } from '~/features/sections/section.options'
import { getSectionLayout, getSectionType } from '~/features/sections/section.registry'

const backgroundPhoto = 'https://example.com/background.jpg'
// 14 Feb 2027 in Manila
const event = { name: 'Bea & Carlo', venue: 'Manila Cathedral', startsAt: '2027-02-14T06:00:00Z', timezone: 'Asia/Manila' }

const items: ProgramItem[] = [
  { id: 'a', date: '2027-02-14', startTime: '15:00', endTime: '16:00', title: 'Ceremony', venue: 'Manila Cathedral', description: 'Please be seated by 2:45.', speakers: 'Fr. Jose Cruz' },
  { id: 'b', date: '2027-02-14', startTime: '18:00', title: 'Cocktails', venue: 'Pool deck' },
  { id: 'c', date: '2027-02-15', startTime: '00:30', title: 'After-party', venue: 'Poolside Bar' },
]
const content: ProgramContent = { eyebrow: 'The day', heading: 'Program', venuesHeading: 'Getting there', layoutPhotos: [], backgroundPhoto }
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
]

const definitionOf = (key: string) => getSectionLayout('program', key)!

// The program is the event's (the occasion's), the rest the section's
const mountLayout = (key: string, props: { content?: ProgramContent, program?: SectionProgram, background?: SectionBackground, options?: Record<string, string> } = {}) => {
  const definition = definitionOf(key)
  const component = layouts.find(layout => layout.key === key)!.component
  return mountSuspended(component, {
    props: {
      content: props.content ?? content,
      background: props.background ?? definition.backgrounds[0]!,
      options: resolveLayoutOptions(definition.options, props.options),
      occasion: { ...event, program: props.program ?? { items } },
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

it('starts the bold poster on primary and the paper layouts on secondary', () => {
  for (const key of ['poster', 'photo-cards'])
    expect(definitionOf(key).backgrounds[0], key).toBe('primary')
  for (const key of ['printed', 'menu-card', 'tickets', 'note'])
    expect(definitionOf(key).backgrounds[0], key).toBe('secondary')
  for (const key of ['timeline', 'list', 'cards', 'big-times', 'horizontal', 'agenda', 'table', 'vertical', 'date-blocks'])
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
    const wrapper = await mountLayout(key, { program: { items: items.slice(0, 2) } })

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

    const venue = (await mountLayout(key, { program: { venue: 'Manila Cathedral', items } })).find('[data-program-heading] [data-program-overall-venue]')
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
    const wrapper = await mountLayout(key, { content: { heading: 'Program', venuesHeading: 'Getting there', layoutPhotos: [] }, program: { items: [] } })

    expect(wrapper.find('h2').text()).toBe('Program')
    expect(wrapper.find('[data-program-items]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('The day')
  })
})

describe('program colours', () => {
  it.each(['light', 'primary', 'secondary', 'photo'] as const)('uses the brand text colour for titles and the label colour for times on %s', async (background) => {
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

  it.each([
    ['start', 'items-start'],
    ['center', 'items-center'],
    ['end', 'items-end'],
  ])('timeline: puts the program\'s and the venues\' titles %s', async (titleAlign, alignClass) => {
    const wrapper = await mountLayout('timeline', { options: { titleAlign }, program: { items, venues: [{ id: 'v1', name: 'Manila Cathedral', address: 'Cabildo St' }] } })

    expect(wrapper.find('[data-program-heading]').classes()).toContain(alignClass)
    expect(wrapper.find('[data-program-venues-heading]').classes()).toContain(alignClass)
  })

  it('timeline, list, big times and printed: rule off the venues in the day dividers\' label colour; the table (ending on its own line) not at all; the vertical title in the text colour', async () => {
    const program = { items, venues: [{ id: 'v1', name: 'Manila Cathedral', address: 'Cabildo St' }] }
    const timeline = await mountLayout('timeline', { background: 'primary', program })
    const list = await mountLayout('list', { background: 'primary', program })
    const table = await mountLayout('table', { background: 'primary', program })
    const bigTimes = await mountLayout('big-times', { background: 'primary', program })
    const vertical = await mountLayout('vertical', { background: 'primary', program })

    for (const wrapper of [timeline, list, bigTimes]) {
      expect(wrapper.find('[data-venues-rule]').classes()).toEqual(expect.arrayContaining(['bg-current/30', backgroundStyles.primary.eyebrow]))
      expect(wrapper.find('[data-program-day]').classes()).toContain(backgroundStyles.primary.eyebrow)
    }
    expect(table.find('[data-venues-rule]').exists()).toBe(false)

    // The printed programme rules its plain venues off the same way, between the program and the venues
    const printed = await mountLayout('printed', { background: 'primary', program })
    const html = printed.html()
    expect(printed.find('[data-venues-rule]').classes()).toEqual(expect.arrayContaining(['bg-current/30', backgroundStyles.primary.eyebrow]))
    expect(html.indexOf('data-venues-rule')).toBeGreaterThan(html.lastIndexOf('data-program-item'))
    expect(html.indexOf('data-venues-rule')).toBeLessThan(html.indexOf('data-program-venues'))
    expect((await mountLayout('printed', { program: { items, venues: [] } })).find('[data-venues-rule]').exists()).toBe(false)
    expect(table.find('[data-program-venues] .border-t').exists()).toBe(false)
    expect(vertical.find('[data-program-venues] .border-t').classes()).toContain('border-current/15')
  })

  // Each layout with the option, and where it put the titles before the option existed (its default)
  const titleDefaults: [string, 'start' | 'center'][] = [
    ['timeline', 'center'],
    ['list', 'center'],
    ['table', 'start'],
    ['cards', 'center'],
    ['big-times', 'start'],
    ['horizontal', 'center'],
    ['poster', 'start'],
    ['agenda', 'start'],
    ['menu-card', 'center'],
    ['tickets', 'center'],
    ['note', 'center'],
    ['date-blocks', 'start'],
  ]
  const withVenue = { items, venues: [{ id: 'v1', name: 'Manila Cathedral', address: 'Cabildo St' }] }

  it.each(titleDefaults)('%s: offers the titles left, centred or right, first among its options, %s by default', async (key, initial) => {
    const option = definitionOf(key).options[0]!
    expect(option.key).toBe('titleAlign')
    expect(option.choices.map(choice => choice.value)).toEqual(['start', 'center', 'end'])
    expect(option.default).toBe(initial)

    const wrapper = await mountLayout(key, { program: withVenue })
    expect(wrapper.find('[data-program-heading]').classes()).toContain(`items-${initial}`)
  })

  it.each(titleDefaults.flatMap(([key]) => (['start', 'center', 'end'] as const).map(align => [key, align] as const)))('%s: puts the program\'s and the venues\' titles %s', async (key, titleAlign) => {
    const wrapper = await mountLayout(key, { options: { titleAlign }, program: withVenue })

    expect(wrapper.find('[data-program-heading]').classes()).toContain(`items-${titleAlign}`)
    expect(wrapper.find('[data-program-venues-heading]').classes()).toContain(`items-${titleAlign}`)
  })

  it('date blocks: keeps the month badge beside the heading on the left, under it centred, across from it on the right', async () => {
    const header = async (titleAlign: string) => (await mountLayout('date-blocks', { options: { titleAlign } })).find('[data-program-month]').element.parentElement!.classList
    expect(await header('start')).toContain('justify-between')
    expect(await header('center')).toContain('flex-col')
    expect(await header('end')).toContain('flex-row-reverse')
  })

  it('vertical title: puts the heading across the top, left by default, or centred or right (a saved "vertical" reads as left)', async () => {
    const option = definitionOf('vertical').options[0]!
    expect(option.choices.map(choice => [choice.value, choice.label])).toEqual([['start', 'Left'], ['center', 'Center'], ['end', 'Right']])
    expect(option.default).toBe('start')

    const left = await mountLayout('vertical', { options: { titleAlign: 'vertical' }, program: withVenue })
    expect(left.find('[data-program-heading]').classes()).toContain('items-start')
    expect(left.find('[data-program-venues-heading]').classes()).toContain('items-start')

    const centred = await mountLayout('vertical', { options: { titleAlign: 'center' }, program: withVenue })
    expect(centred.find('[data-program-heading] h2').text()).toBe('Program')
    expect(centred.find('[data-program-heading]').classes()).toContain('items-center')
    expect(centred.find('[data-program-venues-heading]').classes()).toContain('items-center')
    // The eyebrow shows once, in the heading across the top
    expect(centred.findAll('[data-program-heading]')).toHaveLength(1)
  })

  it('photo cards: puts the venues\' titles on the left, like the program\'s', async () => {
    const wrapper = await mountLayout('photo-cards', { program: withVenue })

    expect(wrapper.find('[data-program-heading]').classes()).toContain('items-start')
    expect(wrapper.find('[data-program-venues-heading]').classes()).toContain('items-start')
  })

  it('timeline: centres the titles by default', async () => {
    const wrapper = await mountLayout('timeline', { program: { items, venues: [{ id: 'v1', name: 'Manila Cathedral', address: 'Cabildo St' }] } })

    expect(wrapper.find('[data-program-heading]').classes()).toContain('items-center')
    expect(wrapper.find('[data-program-venues-heading]').classes()).toContain('items-center')
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

  it('list: puts the titles on the right when no item has a venue, speakers or a note', async () => {
    const titleOf = async (list: ProgramItem[]) => (await mountLayout('list', { program: { items: list } })).find('[data-program-item] h3').classes()

    expect(await titleOf(items)).not.toContain('text-end')
    const plain = items.map(({ venue: _venue, speakers: _speakers, description: _description, ...item }) => item)
    expect(await titleOf(plain)).toEqual(expect.arrayContaining(['ms-auto', 'text-end']))
    // One item with a detail keeps every title on the left
    expect(await titleOf([...plain, { ...plain[0]!, id: 'd', description: 'A note' }])).not.toContain('text-end')
  })

  it('list: keeps each date close to its items and leaves a wide gap before the next day', async () => {
    const wrapper = await mountLayout('list')
    const divider = wrapper.find('[data-program-day]')

    expect(divider.classes()).not.toContain('mb-4')
    expect(divider.element.parentElement!.parentElement!.classList).toContain('gap-6')
  })

  it('list: draws a line under each item, except a day\'s last', async () => {
    const lines = (await mountLayout('list')).findAll('[data-program-item]').map(item => item.classes().includes('border-b'))

    // Ceremony, Cocktails (last of the event day, then the next day's divider), After-party (last of all)
    expect(lines).toEqual([true, false, false])
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

  it('big times: centres the title, venue, speakers and note on the time', async () => {
    const item = (await mountLayout('big-times')).find('[data-program-item]')

    expect(item.classes()).toContain('items-center')
    expect(item.find('[data-program-text]').classes()).not.toContain('pt-1')
  })

  it('big times: draws a line under each item except those in a day\'s last row', async () => {
    const linesOf = async (columns: string, list: ProgramItem[]) =>
      (await mountLayout('big-times', { options: { columns }, program: { items: list } }))
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

    const withoutVenues = await mountLayout('table', { program: { items: items.map(({ venue: _, ...item }) => item) } })
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

    const hearts = await mountLayout('horizontal', { background: 'secondary', options: { marker: 'heart' } })
    const icons = hearts.findAll('[data-program-marker-icon]')
    expect(icons).toHaveLength(3)
    expect(icons[0]!.find('svg').classes()).toContain('lucide-heart')
    expect(icons[0]!.classes()).toEqual(expect.arrayContaining(backgroundStyles.secondary.avatar.split(' ')))
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
  })

  it('agenda: joins several speakers with commas and an ampersand', async () => {
    const two = await mountLayout('agenda', { program: { items: [{ ...items[0]!, speakers: 'Migs Cruz, Tita Lorna' }] } })
    expect(two.find('[data-program-speakers]').text()).toBe('With: Migs Cruz & Tita Lorna')
    const three = await mountLayout('agenda', { program: { items: [{ ...items[0]!, speakers: 'Ana Lim, Paolo Tan, Rina Cruz' }] } })
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
      ['Any', 10],
      ['Weddings & engagements', 5],
      ['Birthdays & parties', 5],
      ['Business & conferences', 5],
      ['Memorials & tributes', 5],
    ])
  })

  it('note: pins the paper with the button colour by default, or clips it, or neither', async () => {
    const pinned = await mountLayout('note')
    expect(pinned.find('[data-program-pin]').attributes('style')).toContain('var(--site-button-secondary)')
    expect(pinned.find('[data-program-clip]').exists()).toBe(false)

    const clipped = await mountLayout('note', { options: { attachment: 'clip' } })
    expect(clipped.find('[data-program-clip]').exists()).toBe(true)
    expect(clipped.find('[data-program-pin]').exists()).toBe(false)

    const plain = await mountLayout('note', { options: { attachment: 'none' } })
    expect(plain.find('[data-program-pin]').exists() || plain.find('[data-program-clip]').exists()).toBe(false)
  })

  it('note: sets the eyebrow in italics over the heading, on light paper whatever the background', async () => {
    const wrapper = await mountLayout('note', { background: 'primary' })
    expect(wrapper.find('[data-program-note]').classes()).toEqual(expect.arrayContaining(backgroundStyles.light.root.split(' ')))
    expect(wrapper.find('[data-program-heading] p').classes()).toContain('[font-style:var(--site-font-heading-italic)]')
  })

  it.each(['note', 'date-blocks', 'vertical', 'photo-cards'])('%s: sets the heading as written, never in capitals', async (key) => {
    const heading = (await mountLayout(key)).find('[data-program-heading] h2')
    expect(heading.text()).toBe('Program')
    expect(heading.classes().some(name => name === 'uppercase' || name.includes('text-transform'))).toBe(false)
  })

  it('note: shows the venue, "with" the speakers and the note beside detailed rows, or on one small line when compact', async () => {
    const detailed = (await mountLayout('note')).find('[data-program-item]')
    expect(inOrder(detailed.find('[data-program-details]').text(), ['Manila Cathedral', 'with Fr. Jose Cruz', 'Please be seated by 2:45.'])).toBe(true)

    const compact = (await mountLayout('note', { options: { rows: 'compact' } })).find('[data-program-item]')
    expect(compact.find('[data-program-details]').text().replace(/\s+/g, ' ')).toBe('Manila Cathedral · with Fr. Jose Cruz · Please be seated by 2:45.')
    expect(compact.find('[data-program-speakers]').exists()).toBe(true)
  })

  it('vertical: divides the items with thin rules, none after a day\'s last item', async () => {
    const item = (await mountLayout('vertical')).find('[data-program-item]')
    expect(item.classes()).toEqual(expect.arrayContaining(['border-b', 'border-current/20', 'last:border-b-0']))
    expect(item.classes()).not.toContain('border-b-2')
  })

  it('vertical: a photo on top (or none), then time ranges and "By" the speakers', async () => {
    const wrapper = await mountLayout('vertical', { content: { ...content, layoutPhotos: ['https://example.com/banner.jpg'] } })
    expect(wrapper.find('[data-program-photo]').attributes('src')).toBe('https://example.com/banner.jpg')
    const item = wrapper.find('[data-program-item]')
    expect(item.find('[data-program-time]').text()).toBe('3:00 PM – 4:00 PM')
    expect(inOrder(item.text(), ['Ceremony', 'Manila Cathedral', 'By Fr. Jose Cruz', 'Please be seated by 2:45.'])).toBe(true)

    expect((await mountLayout('vertical', { options: { showPhoto: 'hide' } })).find('[data-program-photo]').exists()).toBe(false)
  })

  it.each([
    ['light', ['secondary', 'primary']],
    ['primary', ['secondary', 'light']],
    ['secondary', ['primary', 'light']],
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
    expect(blocks[0]!.classes()).toEqual(expect.arrayContaining(backgroundStyles.secondary.root.split(' ')))
    expect(blocks[1]!.classes()).toEqual(expect.arrayContaining(backgroundStyles.primary.root.split(' ')))
  })

  it('date blocks: shows the venue and "with" the speakers on a line, then the note, with no option to hide notes', async () => {
    const item = (await mountLayout('date-blocks')).find('[data-program-item]')
    expect(inOrder(item.text(), ['Ceremony', 'Manila Cathedral', 'with Fr. Jose Cruz', 'Please be seated by 2:45.'])).toBe(true)
    expect(definitionOf('date-blocks').options.map(option => option.key)).toEqual(['titleAlign', 'showTime', 'blockPer'])
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
})

describe('item notes', () => {
  // The font size an element gets from its own or its nearest ancestor's size class (phone sizes, before @ variants)
  const pixels: Record<string, number> = { 'text-[0.7rem]': 11.2, 'text-xs': 12, 'text-sm': 14, 'text-base': 16 }
  function sizeOf(element: Element | null): number {
    for (let node = element; node; node = node.parentElement) {
      const size = [...node.classList].find(name => name in pixels)
      if (size)
        return pixels[size]!
    }
    return 16
  }

  it.each(layouts.map(layout => layout.key))('%s sets an item\'s note smaller than its venue', async (key) => {
    // Each at its own venue (so each item shows it), with a note
    const withNotes = items.map((item, index) => ({ ...item, venue: `Hall ${index + 1}`, description: 'Please be seated by 2:45.' }))
    const wrapper = await mountLayout(key, { program: { items: withNotes } })
    const item = wrapper.findAll('[data-program-item]').find(found => found.find('[data-program-venue]').exists() && found.find('[data-program-description]').exists())

    expect(item, key).toBeDefined()
    expect(sizeOf(item!.find('[data-program-description]').element)).toBeLessThan(sizeOf(item!.find('[data-program-venue]').element))
  })
})

describe('program venues', () => {
  const venues: ProgramVenue[] = [
    { id: 'v1', name: 'Manila Cathedral', address: 'Cabildo St, Intramuros', notes: 'Main doors.', photo: 'https://cdn.example/church.jpg', latitude: 14.59, longitude: 120.97, googleMapsUrl: 'https://maps.app.goo.gl/a', appleMapsUrl: 'https://maps.apple/p/b' },
    { id: 'v2', name: 'The Manila Hotel', address: 'One Rizal Park', latitude: 14.58, longitude: 120.97, googleMapsUrl: 'https://maps.app.goo.gl/c' },
  ]

  it.each(layouts.map(layout => layout.key))('%s shows the program\'s venues at the bottom, after the items', async (key) => {
    const wrapper = await mountLayout(key, { program: { items, venues } })
    const block = wrapper.find('[data-program-venues]')

    expect(block.exists()).toBe(true)
    expect(block.findAll('[data-venue-name]').map(name => name.text())).toEqual(['Manila Cathedral', 'The Manila Hotel'])
    expect(block.find('[data-venue-address]').text()).toBe('Cabildo St, Intramuros')
    expect(block.find('[data-venue-notes]').text()).toBe('Main doors.')
    // Below the schedule
    const html = wrapper.html()
    expect(html.indexOf('data-program-venues')).toBeGreaterThan(html.lastIndexOf('After-party'))
  })

  it.each(layouts.map(layout => layout.key))('%s heads the venues with their eyebrow and heading', async (key) => {
    const wrapper = await mountLayout(key, {
      content: { ...content, venuesEyebrow: 'Find us', venuesHeading: 'Where to go' },
      program: { items, venues },
    })
    const block = wrapper.find('[data-program-venues]')

    expect(block.attributes('aria-label')).toBe('Where to go')
    expect(block.find('[data-venues-eyebrow]').text()).toBe('Find us')
    expect(block.find('h3[data-venues-heading]').text()).toBe('Where to go')
  })

  // Font size classes: text-3xl, @2xl:text-4xl, …
  const sizesOf = (classes: string[]) => classes.filter(name => /^(@\w+:)?text-\d?xl$/.test(name)).sort()

  it.each(layouts.map(layout => layout.key))('%s sets its heading at the usual size, never bold, and the venues heading at the same size', async (key) => {
    const wrapper = await mountLayout(key, { program: { items, venues } })
    const venuesHeading = sizesOf(wrapper.find('[data-venues-heading]').classes())

    expect(venuesHeading).not.toEqual([])
    expect(venuesHeading).toEqual(sizesOf(wrapper.find('h2').classes()))
    expect(venuesHeading).toEqual(['@2xl:text-4xl', 'text-3xl'])
    expect(wrapper.find('h2').classes()).not.toContain('font-bold')
  })

  it.each(layouts.map(layout => layout.key))('%s shows a venue\'s address in the text colour and its notes softer and smaller', async (key) => {
    const wrapper = await mountLayout(key, { program: { items, venues } })
    const muted = Object.values(backgroundStyles).map(styles => styles.muted)
    const isMuted = (classes: string[]) => classes.some(name => muted.includes(name))

    expect(isMuted(wrapper.find('[data-venue-address]').classes())).toBe(false)
    expect(isMuted(wrapper.find('[data-venue-notes]').classes())).toBe(true)
    expect(wrapper.find('[data-venue-address]').classes()).toContain('text-sm')
    expect(wrapper.find('[data-venue-notes]').classes()).toContain('text-xs')
  })

  it('leaves out the venues\' empty eyebrow and heading', async () => {
    const onlyHeading = await mountLayout('timeline', { program: { items, venues } })
    expect(onlyHeading.find('[data-venues-heading]').text()).toBe('Getting there')
    expect(onlyHeading.find('[data-venues-eyebrow]').exists()).toBe(false)

    const none = await mountLayout('cards', { content: { ...content, venuesHeading: '' }, program: { items, venues } })
    expect(none.find('[data-program-venues-heading]').exists()).toBe(false)
    expect(none.find('[data-program-venues]').attributes('aria-label')).toBe('Venues')
  })

  it.each(layouts.map(layout => layout.key))('%s shows no venue block without venue details', async (key) => {
    const wrapper = await mountLayout(key, { program: { items, venues: [] } })

    expect(wrapper.find('[data-program-venues]').exists()).toBe(false)
  })

  it('previews a venue with its photo, else Google Maps at its pin, else a placeholder when another venue has a preview', async () => {
    const wrapper = await mountLayout('timeline', { program: { items, venues: [...venues, { id: 'v3', name: 'Garden', notes: 'Behind the hall.' }] } })
    const entries = wrapper.findAll('[data-program-venue-entry]')
    const previews = entries.map(venue => venue.find('[data-venue-preview]'))

    expect(previews[0]!.find('img').attributes('src')).toBe('https://cdn.example/church.jpg')
    expect(previews[1]!.find('iframe').attributes('src')).toBe('https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s14.58,120.97!6i17')
    expect(previews[2]!.exists()).toBe(false)
    const placeholder = entries[2]!.find('[data-venue-preview-placeholder]')
    // A pin in a badge over the venue's name, in the section's soft tint (no gradient)
    expect(placeholder.find('[data-venue-placeholder-name]').text()).toBe('Garden')
    expect(placeholder.find('svg').exists()).toBe(true)
    expect(placeholder.classes()).toEqual(expect.arrayContaining(backgroundStyles.light.avatar.split(' ')))
    expect(placeholder.classes().some(name => name.startsWith('bg-linear'))).toBe(false)
    // The ones with a preview show no placeholder
    expect(entries[0]!.find('[data-venue-preview-placeholder]').exists()).toBe(false)
  })

  it.each(layouts.map(layout => layout.key).filter(key => key !== 'tickets'))('%s gives a venue without a preview a placeholder only when another venue has one', async (key) => {
    const garden = { id: 'v3', name: 'Garden', notes: 'Behind the hall.' }
    const mixed = await mountLayout(key, { program: { items, venues: [venues[0]!, garden] } })
    const noneHave = await mountLayout(key, { program: { items, venues: [garden, { id: 'v4', name: 'Hall', address: 'Rizal Ave' }] } })

    expect(mixed.findAll('[data-program-venue-entry]')[1]!.find('[data-venue-preview-placeholder]').exists()).toBe(true)
    expect(noneHave.find('[data-venue-preview-placeholder]').exists()).toBe(false)
  })

  it('tints the placeholder like the surface it sits on (the light card in cards, the section elsewhere), its badge in the other brand colour', async () => {
    const program = { items, venues: [venues[0]!, { id: 'v3', name: 'Garden', notes: 'Behind the hall.' }] }
    const cards = await mountLayout('cards', { background: 'secondary', program })
    const timeline = await mountLayout('timeline', { background: 'secondary', program })

    expect(cards.find('[data-venue-preview-placeholder]').classes()).toEqual(expect.arrayContaining(backgroundStyles.light.avatar.split(' ')))
    expect(timeline.find('[data-venue-preview-placeholder]').classes()).toEqual(expect.arrayContaining(backgroundStyles.secondary.avatar.split(' ')))
    // The badge in the other brand colour: the secondary on the primary tint, the primary on the secondary's
    expect(cards.find('[data-venue-placeholder-badge]').classes()).toContain('text-(--site-secondary-text)')
    expect(timeline.find('[data-venue-placeholder-badge]').classes()).toContain('text-(--site-primary-text)')
  })

  it('horizontal shows its venues without a card: the preview as it is, the details under it on the section\'s colours', async () => {
    const wrapper = await mountLayout('horizontal', { background: 'secondary', program: { items, venues } })
    const entry = wrapper.find('[data-program-venue-entry]')

    expect(wrapper.find('[data-program-venues]').attributes('data-look')).toBe('open')
    expect(entry.classes()).not.toEqual(expect.arrayContaining(['shadow-md']))
    expect(entry.classes()).not.toEqual(expect.arrayContaining(backgroundStyles.light.root.split(' ')))
    expect(entry.find('[data-venue-name]').classes()).toContain(backgroundStyles.secondary.brandText)
    // The preview first, then the details
    expect(entry.element.firstElementChild!.hasAttribute('data-venue-preview')).toBe(true)
  })

  it('poster sets its venues like its items: the item rule, the name in small bold capitals, the heading in the heading font', async () => {
    const wrapper = await mountLayout('poster', { program: { items, venues } })
    const venue = wrapper.find('[data-program-venue-entry]')
    const itemTitle = wrapper.find('[data-program-item] h3')

    expect(wrapper.find('[data-venues-heading]').classes()).toContain('font-(family-name:--site-font-heading)')
    expect(venue.find('[data-venue-name]').classes()).toEqual(expect.arrayContaining(itemTitle.classes().filter(name => name !== 'mt-4')))
    expect(venue.find('span.h-0\\.5').exists()).toBe(true)
    expect(venue.find('[data-venue-preview]').classes()).not.toContain('border-4')
  })

  it('agenda boxes its venues like its items: the border, the preview at the top, then the details', async () => {
    const wrapper = await mountLayout('agenda', { background: 'primary', program: { items, venues } })
    const venue = wrapper.find('[data-program-venue-entry]')
    const item = wrapper.find('[data-program-item]')

    expect(wrapper.find('[data-program-venues]').attributes('data-look')).toBe('agenda')
    expect(venue.classes()).toEqual(expect.arrayContaining(['border', 'border-current/15', 'rounded-(--site-radius)']))
    expect(item.classes()).toEqual(expect.arrayContaining(['border', 'border-current/15', 'rounded-(--site-radius)']))
    expect(venue.element.firstElementChild!.hasAttribute('data-venue-preview')).toBe(true)
    expect(venue.find('[data-venue-name]').classes()).toContain(backgroundStyles.primary.brandText)
    expect(venue.find('[data-venue-notes]').classes()).toContain('border-dashed')
  })

  it('date blocks colour their venue cards like the blocks, in turn and without a shadow; the other card layouts stay light with one', async () => {
    const program = { items, venues }
    const dateBlocks = await mountLayout('date-blocks', { background: 'light', program })
    const [first, second] = dateBlocks.findAll('[data-program-venue-entry]')
    const [secondary, primary] = programBlockColours('light')

    expect(first!.classes()).toEqual(expect.arrayContaining(backgroundStyles[secondary].root.split(' ')))
    expect(second!.classes()).toEqual(expect.arrayContaining(backgroundStyles[primary].root.split(' ')))
    expect(first!.classes()).not.toContain('shadow-md')
    // Text and button in the card's colours
    expect(second!.find('[data-venue-name]').classes()).toContain(backgroundStyles[primary].brandText)
    expect(second!.find('[data-venue-map-link]').classes()).toEqual(expect.arrayContaining(backgroundStyles[primary].button.split(' ')))

    const cards = await mountLayout('cards', { background: 'light', program })
    expect(cards.find('[data-program-venue-entry]').classes()).toEqual(expect.arrayContaining(['shadow-md', ...backgroundStyles.light.root.split(' ')]))
  })

  it('tickets keep the "Admit" stub for a venue without a preview', async () => {
    const wrapper = await mountLayout('tickets', { program: { items, venues: [venues[0]!, { id: 'v3', name: 'Garden', notes: 'Behind the hall.' }] } })
    const garden = wrapper.findAll('[data-program-venue-entry]')[1]!

    expect(garden.text()).toContain('Admit')
    expect(garden.find('[data-venue-preview-placeholder]').exists()).toBe(false)
  })

  it('opens the only map link directly, offers a choice with both, and hides "See map" without one', async () => {
    const wrapper = await mountLayout('cards', { program: { items, venues: [...venues, { id: 'v3', name: 'Garden', notes: 'Behind the hall.' }] } })
    const [both, google, none] = wrapper.findAll('[data-program-venue-entry]')

    expect(google!.find('a[data-venue-map-link]').attributes()).toMatchObject({ href: 'https://maps.app.goo.gl/c', target: '_blank' })
    expect(none!.find('[data-venue-map-link]').exists()).toBe(false)
    const button = both!.find('button[data-venue-map-link]')
    expect(button.text()).toContain('See map')
    expect(both!.findAll('[data-venue-map-choice]').map(link => [link.text(), link.attributes('href')])).toEqual([
      ['Google Maps (opens in a new tab)', 'https://maps.app.goo.gl/a'],
      ['Apple Maps (opens in a new tab)', 'https://maps.apple/p/b'],
    ])
  })

  it('never links a map link that isn\'t a web address', async () => {
    const wrapper = await mountLayout('list', { program: { items, venues: [{ id: 'v1', name: 'Hall', notes: 'x', googleMapsUrl: 'javascript:alert(1)' }] } })

    expect(wrapper.find('[data-venue-map-link]').exists()).toBe(false)
  })

  it('puts the pinned note\'s venues on another note', async () => {
    const wrapper = await mountLayout('note', { program: { items, venues } })

    expect(wrapper.find('[data-program-note] [data-program-venues]').exists()).toBe(false)
    expect(wrapper.find('[data-program-venues-note] [data-program-venues]').exists()).toBe(true)
  })
})
