import type { LayoutOptionCatalogue, LayoutOptionValues } from '../section.options'
import { allSectionLayoutOptions } from '../section.layout-options'
import { showHideChoices, sideChoices } from '../section.options'

// Every option an about layout can offer, defined once; layouts pick theirs by key in about.registry.ts. Options
// several section types share (text alignment, photo side and position) are in `allSectionLayoutOptions`.
export const aboutSectionLayoutOptions = {
  // The photo row's heading over the story, or beside it
  textLayout: {
    label: 'Heading and story',
    choices: [{ value: 'stacked', label: 'Stacked' }, { value: 'side', label: 'Side by side' }],
    default: 'stacked',
  },
  // The portrait's photo frame
  frame: {
    label: 'Frame',
    choices: [{ value: 'arch', label: 'Arch' }, { value: 'oval', label: 'Oval' }, { value: 'circle', label: 'Circle' }],
    default: 'oval',
  },
  // The zigzag timeline's first chapter photo; the rest alternate from it
  firstPhotoSide: { label: 'First photo', choices: sideChoices, default: 'left' },
  // The zigzag timeline's line down the middle
  line: { label: 'Line', choices: showHideChoices, default: 'show' },
} as const satisfies LayoutOptionCatalogue

// What about layouts pick from: the about's options and the shared ones
export const aboutLayoutOptionCatalogue = { ...allSectionLayoutOptions, ...aboutSectionLayoutOptions }
export type AboutLayoutOptionKey = keyof typeof aboutLayoutOptionCatalogue
export type AboutLayoutOptions<K extends AboutLayoutOptionKey> = LayoutOptionValues<typeof aboutLayoutOptionCatalogue, K>
