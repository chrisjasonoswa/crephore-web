export interface SiteFont {
  family: string
  fallback: string
  weights: number[]
  italic?: boolean
}

export interface FontPairing {
  key: string
  name: string
  heading: SiteFont
  body: SiteFont
}

export const fontPairings: FontPairing[] = [
  {
    key: 'serif_classic',
    name: 'Serif classic',
    heading: { family: 'Playfair Display', fallback: 'Georgia, serif', weights: [400, 600, 700], italic: true },
    body: { family: 'Lato', fallback: 'system-ui, sans-serif', weights: [400, 700] },
  },
  {
    key: 'modern_sans',
    name: 'Modern sans',
    heading: { family: 'Montserrat', fallback: 'system-ui, sans-serif', weights: [500, 600, 700] },
    body: { family: 'Inter', fallback: 'system-ui, sans-serif', weights: [400, 500, 600] },
  },
  {
    key: 'romantic',
    name: 'Romantic',
    heading: { family: 'Cormorant Garamond', fallback: 'Georgia, serif', weights: [400, 500, 600, 700], italic: true },
    body: { family: 'Nunito Sans', fallback: 'system-ui, sans-serif', weights: [400, 600, 700] },
  },
  {
    key: 'playful',
    name: 'Playful',
    heading: { family: 'Fredoka', fallback: 'system-ui, sans-serif', weights: [400, 500, 600] },
    body: { family: 'Nunito', fallback: 'system-ui, sans-serif', weights: [400, 600, 700] },
  },
]

export function getFontPairing(key: string): FontPairing {
  return fontPairings.find(pairing => pairing.key === key) ?? fontPairings[0]!
}

export function fontStack(font: SiteFont): string {
  return `"${font.family}", ${font.fallback}`
}

// Fonts only referenced through CSS variables aren't detected by @nuxt/fonts,
// so nuxt.config.ts registers these explicitly.
export const siteFontFamilies = fontPairings
  .flatMap(pairing => [pairing.heading, pairing.body])
  .map(font => ({
    name: font.family,
    weights: font.weights,
    styles: (font.italic ? ['normal', 'italic'] : ['normal']) as ('normal' | 'italic')[],
    global: true,
  }))
