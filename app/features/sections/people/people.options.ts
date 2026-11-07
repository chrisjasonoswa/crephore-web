import type { LayoutOptionCatalogue, LayoutOptionValues } from '../section.options'
import { allSectionLayoutOptions } from '../section.layout-options'

const columnValues = ['1', '2', '3', '4', '5'] as const
// The column counts a layout offers (`columnChoices('3', '4', '5')`)
export const columnChoices = (...values: (typeof columnValues)[number][]) => values.map(value => ({ value, label: value }))

const photoShapeLabels = { circle: 'Circle', arch: 'Arch', square: 'Square', rounded: 'Rounded' } as const
type PhotoShape = keyof typeof photoShapeLabels
// The photo shapes a layout offers, in its order (`photoShapeChoices('arch', 'circle')`)
export const photoShapeChoices = (...values: PhotoShape[]) => values.map(value => ({ value, label: photoShapeLabels[value] }))

// Every option a people layout can offer, defined once; layouts pick theirs by key in people.registry.ts. Options
// several section types share are in `allSectionLayoutOptions`.
export const peopleSectionLayoutOptions = {
  columns: { label: 'Columns', choices: columnChoices(...columnValues), default: '3' },
  photoShape: { label: 'Photo shape', choices: photoShapeChoices('circle', 'arch', 'square', 'rounded'), default: 'arch' },
  // The spotlight's photos on alternating sides, or all on one
  alternate: {
    label: 'Photo sides',
    choices: [{ value: 'yes', label: 'Alternate' }, { value: 'no', label: 'Same side' }],
    default: 'yes',
  },
  // The polaroids slightly turned
  tilt: { label: 'Tilt', choices: [{ value: 'on', label: 'On' }, { value: 'off', label: 'Off' }], default: 'on' },
  // The credits' role above or below each name
  roleFirst: {
    label: 'Role',
    choices: [{ value: 'yes', label: 'Above name' }, { value: 'no', label: 'Below name' }],
    default: 'yes',
  },
} as const satisfies LayoutOptionCatalogue

// What people layouts pick from: the people's options and the shared ones
export const peopleLayoutOptionCatalogue = { ...allSectionLayoutOptions, ...peopleSectionLayoutOptions }
export type PeopleLayoutOptionKey = keyof typeof peopleLayoutOptionCatalogue
export type PeopleLayoutOptions<K extends PeopleLayoutOptionKey> = LayoutOptionValues<typeof peopleLayoutOptionCatalogue, K>
