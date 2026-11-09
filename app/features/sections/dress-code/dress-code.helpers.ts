import type { DressCodeContent, DressColour } from './dress-code.type'
import { readableTextOn } from '~/site-theme/color'

// Up to five of each: enough for a palette, few enough that guests remember them
export const dressColourMax = 5
// Inspiration photos a layout may show at most
export const inspirationPhotoMax = 6

/** The attire motif as guests read it ("" without one). */
export function attireOf(content: Pick<DressCodeContent, 'attire'>): string {
  return content.attire?.trim() ?? ''
}

/** Text that reads on a colour swatch (its name on a paint chip, a ribbon, a poster block). */
export const textOnColour = (hex: string) => readableTextOn(hex)

/** Names joined for a sentence: "sage", "sage or linen", "sage, linen, ochre or taupe" (`word`: "or", "and"). */
export function joinColourNames(colours: DressColour[], word: 'or' | 'and'): string {
  const names = colours.map(colour => colour.name.trim()).filter(Boolean).map(name => name.toLowerCase())
  return names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} ${word} ${names.at(-1)}`
}

/** "Kindly avoid white and ivory." (empty without colours to avoid). */
export function avoidSentence(colours: DressColour[]): string {
  const names = joinColourNames(colours, 'and')
  return names ? `Kindly avoid ${names}.` : ''
}

/** A new colour for the editor's lists. */
export function blankDressColour(hex = '#B8974A'): DressColour {
  return { id: crypto.randomUUID(), name: '', hex }
}

// The sample a new section starts with (hosts change every part of it); no attire motif, the host adds their own
export const sampleDressCode = {
  description: 'Light suits or barong for gentlemen; long dresses or Filipiniana for ladies. The reception is on the lawn, so choose comfortable shoes.',
  colours: [
    { id: 'sage', name: 'Sage', hex: '#33493A' },
    { id: 'linen', name: 'Linen', hex: '#E9DCCB' },
    { id: 'ochre', name: 'Ochre', hex: '#B8914A' },
    { id: 'taupe', name: 'Taupe', hex: '#8B7D6B' },
  ],
  avoidColours: [
    { id: 'white', name: 'White', hex: '#FFFFFF' },
    { id: 'ivory', name: 'Ivory', hex: '#FFFDF0' },
  ],
} satisfies Pick<DressCodeContent, 'description' | 'colours' | 'avoidColours'>
