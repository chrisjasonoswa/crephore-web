import type { LayoutOptionCatalogue, LayoutOptionValues } from '../section.options'
import { allSectionLayoutOptions } from '../section.layout-options'
import { sideChoices } from '../section.options'

// Every option a message layout can offer, defined once; layouts pick theirs by key in message.registry.ts. Options
// several section types share (text alignment, photo side and position) are in `allSectionLayoutOptions`.
export const messageSectionLayoutOptions = {
  // The side photo's frame
  frame: {
    label: 'Frame',
    choices: [{ value: 'plain', label: 'Plain' }, { value: 'arch', label: 'Arch' }, { value: 'framed', label: 'Framed' }],
    default: 'arch',
  },
  // The portrait's photo at the top, or by the signature
  photoPlacement: {
    label: 'Photo',
    choices: [{ value: 'top', label: 'Top' }, { value: 'signature', label: 'By signature' }],
    default: 'top',
  },
  // Which top corner of the card the photo sits in
  photoCorner: { label: 'Photo corner', choices: sideChoices, default: 'right' },
} as const satisfies LayoutOptionCatalogue

// What message layouts pick from: the message's options and the shared ones
export const messageLayoutOptionCatalogue = { ...allSectionLayoutOptions, ...messageSectionLayoutOptions }
export type MessageLayoutOptionKey = keyof typeof messageLayoutOptionCatalogue
export type MessageLayoutOptions<K extends MessageLayoutOptionKey> = LayoutOptionValues<typeof messageLayoutOptionCatalogue, K>
