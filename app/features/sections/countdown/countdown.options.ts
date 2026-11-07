import type { LayoutOptionCatalogue, LayoutOptionValues } from '../section.options'
import { allSectionLayoutOptions } from '../section.layout-options'
import { sideChoices } from '../section.options'

// Every option a countdown layout can offer, defined once; layouts pick theirs by key in countdown.registry.ts. Options
// several section types share (text alignment and position, photo side) are in `allSectionLayoutOptions`.
export const countdownSectionLayoutOptions = {
  // Which side the calendar page is on
  calendarSide: { label: 'Calendar side', choices: sideChoices, default: 'left' },
  // Which side of the strip the date is on
  dateSide: { label: 'Date side', choices: sideChoices, default: 'left' },
} as const satisfies LayoutOptionCatalogue

// What countdown layouts pick from: the countdown's options and the shared ones
export const countdownLayoutOptionCatalogue = { ...allSectionLayoutOptions, ...countdownSectionLayoutOptions }
export type CountdownLayoutOptionKey = keyof typeof countdownLayoutOptionCatalogue
export type CountdownLayoutOptions<K extends CountdownLayoutOptionKey> = LayoutOptionValues<typeof countdownLayoutOptionCatalogue, K>
