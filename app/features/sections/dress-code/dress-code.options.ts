import type { Align, LayoutOptionCatalogue, LayoutOptionValues } from '../section.options'
import { allSectionLayoutOptions } from '../section.layout-options'
import { alignWithEndChoices, sideChoices } from '../section.options'

const countChoices = <V extends string>(...values: V[]) => values.map(value => ({ value, label: value }))

// Every option a dress-code layout can offer, defined once; layouts pick theirs by key in dress-code.registry.ts.
// Options several section types share (text alignment, photo side) are in `allSectionLayoutOptions`.
export const dressCodeSectionLayoutOptions = {
  swatchShape: {
    label: 'Swatches',
    choices: [{ value: 'circle', label: 'Circle' }, { value: 'square', label: 'Square' }],
    default: 'circle',
  },
  // How many inspiration photos a layout shows (each layout offers the counts that suit it)
  photoCount: { label: 'Photos', choices: countChoices('1', '2', '3', '4', '5'), default: '3' },
  columns: { label: 'Columns', choices: countChoices('2', '3', '4'), default: '3' },
  // Where the colour field's card sits across the stripes
  cardAlign: { label: 'Card', choices: alignWithEndChoices, default: 'center' },
  // Which side the colours are on (the colour split's colour half, the fan, the ribbons; the circles' and the tag's
  // labels say so)
  colourSide: { label: 'Colour side', choices: sideChoices, default: 'left' },
} as const satisfies LayoutOptionCatalogue

export { countChoices }

// What dress-code layouts pick from: the dress code's options and the shared ones
export const dressCodeLayoutOptionCatalogue = { ...allSectionLayoutOptions, ...dressCodeSectionLayoutOptions }
export type DressCodeLayoutOptionKey = keyof typeof dressCodeLayoutOptionCatalogue
export type DressCodeLayoutOptions<K extends DressCodeLayoutOptionKey> = LayoutOptionValues<typeof dressCodeLayoutOptionCatalogue, K>

// A full layout's options: its own (`K`) plus where its title and text sit. Text align is shared with other types as
// left or centred; the dress code also offers right (dress-code.registry.ts `aligned`).
export type DressCodeAlignedOptions<K extends DressCodeLayoutOptionKey = never> =
  Omit<DressCodeLayoutOptions<K | 'textAlign'>, 'textAlign'> & { textAlign: Align }
