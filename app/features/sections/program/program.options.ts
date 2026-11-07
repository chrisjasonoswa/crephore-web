import type { LayoutOptionCatalogue, LayoutOptionValues, SectionLayoutOptionChoice } from '../section.options'
import { siteDividers } from '~/components/site-graphics/dividers/site-dividers'
import { eventKindLabels } from '~/site-theme/eventKinds'
import { allSectionLayoutOptions } from '../section.layout-options'
import { alignWithEndChoices, showHideChoices, sideChoices } from '../section.options'

// Columns from one to three; layouts offer the counts that suit them (`columnChoices('2', '3')`)
const columnValues = ['1', '2', '3'] as const
export const columnChoices = (...values: (typeof columnValues)[number][]) => values.map(value => ({ value, label: value }))

// Every option a program layout can offer, defined once; layouts pick theirs by key in program.registry.ts. Options
// several section types share are in `allSectionLayoutOptions` instead.
export const programSectionLayoutOptions = {
  // Where the program's and the venues' eyebrow and heading sit
  titleAlign: { label: 'Titles', choices: alignWithEndChoices, default: 'center' },
  // Some events don't give exact times
  showTime: { label: 'Time', choices: showHideChoices, default: 'show' },
  // Which side of the timeline's line the times go on (the details take the other)
  timeColumn: { label: 'Item layout', choices: sideChoices, default: 'left' },
  columns: { label: 'Columns', choices: columnChoices(...columnValues), default: '2' },
  // The printed programme's numbers above each part
  numbering: {
    label: 'Numbering',
    choices: [{ value: 'none', label: 'None' }, { value: 'roman', label: 'I, II' }, { value: 'numbers', label: '1, 2' }],
    default: 'none',
  },
  // Between the printed programme's parts
  divider: {
    label: 'Divider',
    choices: [{ value: 'line', label: 'Line' }, { value: 'dot', label: 'Dot' }, { value: 'none', label: 'None' }],
    default: 'line',
  },
  // What marks each item on the horizontal timeline: a dot, or an icon that suits the event (three each for weddings
  // and engagements, birthdays and parties, business and conferences, memorials and tributes, in that order)
  marker: {
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
  },
  // The menu card's ornament between items: none, then the decorative dividers (site-graphics/dividers) under a
  // heading per kind of event
  ornament: {
    label: 'Ornament',
    control: 'select',
    choices: [
      { value: 'none', label: 'None' },
      ...siteDividers.map((divider): SectionLayoutOptionChoice => ({ value: divider.key, label: divider.label, group: eventKindLabels[divider.kind] })),
    ],
    default: 'flourish',
  },
  // How the pinned note hangs
  attachment: {
    label: 'Attachment',
    choices: [{ value: 'pin', label: 'Pin' }, { value: 'clip', label: 'Clip' }, { value: 'none', label: 'None' }],
    default: 'pin',
  },
  // The pinned note's rows: the details beside each item, or on one small line
  rows: {
    label: 'Rows',
    choices: [{ value: 'detailed', label: 'Detailed' }, { value: 'compact', label: 'Compact' }],
    default: 'detailed',
  },
  // The vertical title's banner photo
  showPhoto: { label: 'Photo', choices: showHideChoices, default: 'show' },
  // What each block or card of the date-led layouts holds: one item (with its date), or a whole day's items
  blockPer: {
    label: 'Each block',
    choices: [{ value: 'item', label: 'One item' }, { value: 'day', label: 'One day' }],
    default: 'item',
  },
} as const satisfies LayoutOptionCatalogue

// What program layouts pick from: the program's options and the shared ones
export const programLayoutOptionCatalogue = { ...allSectionLayoutOptions, ...programSectionLayoutOptions }
export type ProgramLayoutOptionKey = keyof typeof programLayoutOptionCatalogue

// A program layout's `options`, typed from the keys it picks: `SectionLayoutProps<'program', ProgramLayoutOptions<'titleAlign' | 'showTime'>>`
export type ProgramLayoutOptions<K extends ProgramLayoutOptionKey> = LayoutOptionValues<typeof programLayoutOptionCatalogue, K>
