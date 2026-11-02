import type { SectionLayoutOption } from '../section.options'
import type { SectionBackground } from '../section.type'
import type { SectionTypeDefinition } from '../section.registry.type'
import { sideChoices } from '../section.options'
import { siteDividerKindLabels, siteDividers } from '~/components/site-graphics/dividers/site-dividers'
import { layout, onColour, onPaper } from '../section.layout'
import { sampleProgramItems } from './program.helpers'

// Every program layout can show or hide the times (some events don't give exact times)
const showTime = (): SectionLayoutOption => ({
  key: 'showTime',
  label: 'Time',
  choices: [{ value: 'show', label: 'Show' }, { value: 'hide', label: 'Hide' }],
  default: 'show',
})
const showHide = (key: string, label: string, initial: 'show' | 'hide' = 'show'): SectionLayoutOption => ({
  key,
  label,
  choices: [{ value: 'show', label: 'Show' }, { value: 'hide', label: 'Hide' }],
  default: initial,
})
const columns = (values: string[], initial: string): SectionLayoutOption => ({
  key: 'columns',
  label: 'Columns',
  choices: values.map(value => ({ value, label: value })),
  default: initial,
})
// What marks each item on the horizontal timeline: a dot, or an icon that suits the event (three each for weddings and
// engagements, birthdays and parties, business and conferences, memorials and tributes, in that order)
const markers: SectionLayoutOption = {
  key: 'marker',
  label: 'Markers',
  control: 'select',
  choices: [
    { value: 'dot', label: 'Dot' },
    { value: 'heart', label: 'Heart' },
    { value: 'flower', label: 'Flower' },
    { value: 'gem', label: 'Gem' },
    { value: 'balloon', label: 'Balloon' },
    { value: 'cake', label: 'Cake' },
    { value: 'party-popper', label: 'Party popper' },
    { value: 'mic', label: 'Microphone' },
    { value: 'lightbulb', label: 'Light bulb' },
    { value: 'briefcase', label: 'Briefcase' },
    { value: 'flame', label: 'Candle flame' },
    { value: 'leaf', label: 'Leaf' },
    { value: 'bird', label: 'Dove' },
  ],
  default: 'dot',
}
// What each block or card of the date-led layouts holds: one item (with its date), or a whole day's items
const blockPer = (label: string): SectionLayoutOption => ({
  key: 'blockPer',
  label,
  choices: [{ value: 'item', label: 'One item' }, { value: 'day', label: 'One day' }],
  default: 'item',
})
// A bold block of colour by default
const onPrimary: SectionBackground[] = ['primary', 'accent', 'light', 'photo']

// The program section type and its layouts, in picker order (see section.registry.ts).
export const programSection: SectionTypeDefinition<'program'> = {
  type: 'program',
  name: 'Program',
  description: 'The order of events: what happens when and where, over one day or several.',
  // 2: layout photos (section.upgrade.ts)
  contentVersion: 2,
  defaultContent: {
    eyebrow: 'The day',
    heading: 'Program',
    items: sampleProgramItems(),
    layoutPhotos: [],
  },
  // Every layout uses the same fields; each day starts with its date (a divider, a tab, or a block or card per date in
  // the date-led layouts). Only the vertical title and photo cards have a layout photo.
  layouts: [
    layout({
      key: 'timeline',
      name: 'Timeline',
      description: 'Times beside a line with a dot per item; the title, venue and note next to them.',
      layoutPhotoCount: 0,
      backgrounds: onColour,
      options: [showTime(), { key: 'timeColumn', label: 'Times', choices: sideChoices, default: 'left' }],
    }, () => import('~/components/sections/program/ProgramTimeline.vue')),
    layout({
      key: 'list',
      name: 'Simple list',
      description: 'Time, title and venue in neat rows with dividers. Clean and compact.',
      layoutPhotoCount: 0,
      backgrounds: onColour,
      options: [showTime()],
    }, () => import('~/components/sections/program/ProgramList.vue')),
    layout({
      key: 'table',
      name: 'Table',
      description: 'A clean table: time, session, speaker and venue in columns; stacked rows on phones.',
      layoutPhotoCount: 0,
      backgrounds: onColour,
      options: [showTime()],
    }, () => import('~/components/sections/program/ProgramTable.vue')),
    layout({
      key: 'cards',
      name: 'Cards',
      description: 'Each item on its own card. Best for six items or fewer.',
      layoutPhotoCount: 0,
      backgrounds: onColour,
      options: [showTime(), columns(['2', '3'], '3')],
    }, () => import('~/components/sections/program/ProgramCards.vue')),
    layout({
      key: 'printed',
      name: 'Printed programme',
      description: 'Centred like a printed wedding programme: the time in small capitals, the title in the heading font, numbered parts if you like. For weddings, memorials and ceremonies.',
      layoutPhotoCount: 0,
      backgrounds: onPaper,
      options: [
        showTime(),
        {
          key: 'numbering',
          label: 'Numbering',
          choices: [{ value: 'none', label: 'None' }, { value: 'roman', label: 'I, II' }, { value: 'numbers', label: '1, 2' }],
          default: 'none',
        },
        {
          key: 'divider',
          label: 'Divider',
          choices: [{ value: 'line', label: 'Line' }, { value: 'dot', label: 'Dot' }, { value: 'none', label: 'None' }],
          default: 'line',
        },
      ],
    }, () => import('~/components/sections/program/ProgramPrinted.vue')),
    layout({
      key: 'big-times',
      name: 'Big times',
      description: 'Large serif times as the anchor, the details beside them. Bold and editorial.',
      layoutPhotoCount: 0,
      backgrounds: onColour,
      options: [showTime(), columns(['1', '2'], '2')],
    }, () => import('~/components/sections/program/ProgramBigTimes.vue')),
    layout({
      key: 'horizontal',
      name: 'Horizontal timeline',
      description: 'The items along a line, left to right, each marked with a dot or an icon that suits the event; guests swipe or drag through them.',
      layoutPhotoCount: 0,
      backgrounds: onColour,
      options: [showTime(), markers],
    }, () => import('~/components/sections/program/ProgramHorizontal.vue')),
    layout({
      key: 'poster',
      name: 'Poster',
      description: 'Big times in a grid, each with a title and a short note under a rule. Bold on a colour.',
      layoutPhotoCount: 0,
      backgrounds: onPrimary,
      options: [showTime(), columns(['2', '3'], '2')],
    }, () => import('~/components/sections/program/ProgramPoster.vue')),
    layout({
      key: 'agenda',
      name: 'Agenda',
      description: 'A tab per day, then rows with the date, time, speaker and title; tap a row for its note and venue. Best for conferences.',
      layoutPhotoCount: 0,
      backgrounds: onColour,
      options: [showTime(), showHide('showSpeaker', 'Speaker')],
    }, () => import('~/components/sections/program/ProgramAgenda.vue')),
    layout({
      key: 'menu-card',
      name: 'Menu card',
      description: 'Framed like a wedding dinner menu: a double border, an ornament between items, centred titles.',
      layoutPhotoCount: 0,
      backgrounds: onPaper,
      options: [
        showTime(),
        {
          key: 'ornament',
          label: 'Ornament',
          control: 'select',
          // None, then the decorative dividers (site-graphics/dividers) under a heading per kind of event
          choices: [
            { value: 'none', label: 'None' },
            ...siteDividers.map(divider => ({ value: divider.key, label: divider.label, group: siteDividerKindLabels[divider.kind] })),
          ],
          default: 'flourish',
        },
      ],
    }, () => import('~/components/sections/program/ProgramMenuCard.vue')),
    layout({
      key: 'tickets',
      name: 'Tickets',
      description: 'Each item as a ticket, the time on a perforated stub. Playful and fun.',
      layoutPhotoCount: 0,
      backgrounds: onPaper,
      options: [showTime(), columns(['1', '2'], '2')],
    }, () => import('~/components/sections/program/ProgramTickets.vue')),
    layout({
      key: 'note',
      name: 'Pinned note',
      description: 'The program on a sheet of paper pinned or clipped to the background, times and titles in rows under dashed rules. Friendly and handmade.',
      layoutPhotoCount: 0,
      backgrounds: onPaper,
      options: [
        showTime(),
        {
          key: 'attachment',
          label: 'Attachment',
          choices: [{ value: 'pin', label: 'Pin' }, { value: 'clip', label: 'Clip' }, { value: 'none', label: 'None' }],
          default: 'pin',
        },
        {
          key: 'rows',
          label: 'Rows',
          choices: [{ value: 'detailed', label: 'Detailed' }, { value: 'compact', label: 'Compact' }],
          default: 'detailed',
        },
      ],
    }, () => import('~/components/sections/program/ProgramNote.vue')),
    layout({
      key: 'vertical',
      name: 'Vertical title',
      description: 'The heading set huge and sideways down the left, a wide photo on top, then rows of times, titles and speakers. Bold and modern.',
      layoutPhotoCount: 1,
      backgrounds: onColour,
      options: [showTime(), showHide('showPhoto', 'Photo')],
    }, () => import('~/components/sections/program/ProgramVertical.vue')),
    layout({
      key: 'date-blocks',
      name: 'Date blocks',
      description: 'Blocks of colour with a huge day number: one per item, or one per date with that day\'s items listed inside. Bold; good for weekends and festivals.',
      layoutPhotoCount: 0,
      backgrounds: onColour,
      options: [showTime(), blockPer('Each block')],
    }, () => import('~/components/sections/program/ProgramDateBlocks.vue')),
    layout({
      key: 'photo-cards',
      name: 'Photo cards',
      description: 'Half colour, half photo, with cards across the split and a big day number: one per item, or one per date with its items as ticked lines.',
      layoutPhotoCount: 1,
      backgrounds: onPrimary,
      options: [showTime(), blockPer('Each card'), { key: 'photoSide', label: 'Photo side', choices: sideChoices, default: 'right' }],
    }, () => import('~/components/sections/program/ProgramPhotoCards.vue')),
    layout({
      key: 'tab-cards',
      name: 'Tab cards',
      description: 'Bold notched cards, one per item: the date in an outlined pill, the time on a raised tab, the title in big capitals. Cycles through your colours and their tints; playful.',
      layoutPhotoCount: 0,
      backgrounds: onColour,
      options: [showTime(), columns(['2', '1'], '2')],
    }, () => import('~/components/sections/program/ProgramTabCards.vue')),
  ],
}
