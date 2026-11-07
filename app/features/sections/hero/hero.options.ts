import type { LayoutOptionCatalogue, LayoutOptionValues } from '../section.options'
import { allSectionLayoutOptions } from '../section.layout-options'
import { aboveBelowChoices, positionChoices, positionLabels } from '../section.options'

// Every option a hero layout can offer, defined once; layouts pick theirs by key in hero.registry.ts. Options several
// section types share (text alignment and position, photo side and position) are in `allSectionLayoutOptions`.
export const heroSectionLayoutOptions = {
  // The arch frame's names above or below the photo
  namesPlacement: { label: 'Names', choices: aboveBelowChoices, default: 'above' },
  // Where the overlay card sits on the photo, on a 3×3 grid
  cardPosition: { label: 'Card position', choices: positionChoices, default: 'bottom-left' },
} as const satisfies LayoutOptionCatalogue

// The collage's text: centred, or to one side (a row of the 3×3 grid)
export const middleRowChoices = (['center', 'left', 'right'] as const).map(value => ({ value, label: positionLabels[value] }))

// What hero layouts pick from: the hero's options and the shared ones
export const heroLayoutOptionCatalogue = { ...allSectionLayoutOptions, ...heroSectionLayoutOptions }
export type HeroLayoutOptionKey = keyof typeof heroLayoutOptionCatalogue
export type HeroLayoutOptions<K extends HeroLayoutOptionKey> = LayoutOptionValues<typeof heroLayoutOptionCatalogue, K>
