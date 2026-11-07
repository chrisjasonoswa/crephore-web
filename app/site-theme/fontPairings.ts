export interface SiteFont {
  family: string
  fallback: string
  weights: number[]
  italic?: boolean
  // A handwritten or script face: it already flows, so text that would be italic stays upright (slanted, it looks wrong)
  script?: boolean
}

// Groups in the font picker, by the events each suits (script and modern ones suit any event), in title case
export type FontPairingGroup = 'wedding' | 'script' | 'modern' | 'party' | 'business' | 'memorial'

export const fontPairingGroups: { key: FontPairingGroup, label: string }[] = [
  { key: 'wedding', label: 'Weddings & Engagements' },
  { key: 'script', label: 'Any (Script & Calligraphy)' },
  { key: 'modern', label: 'Any (Modern & Minimal)' },
  { key: 'party', label: 'Birthdays & Parties' },
  { key: 'business', label: 'Business & Conferences' },
  { key: 'memorial', label: 'Memorials & Tributes' },
]

export interface FontPairing {
  // Stored on saved websites (and listed in the API's WebsiteKeys): never rename one
  key: string
  name: string
  group: FontPairingGroup
  heading: SiteFont
  body: SiteFont
}

const serif = 'Georgia, serif'
const sans = 'system-ui, sans-serif'
const cursive = 'cursive'

/*
 * Headings use one weight (400; sections never make them bold), plus italic when the face has one (the message's
 * signature, the countdown sentence). Body text uses 400, 500 and 600 (labels and buttons are semibold); faces without
 * those weights list the ones they have. Every family is a Google Font, by its exact name, served from the app.
 */
const heading = (family: string, fallback: string, extra: Partial<SiteFont> = {}): SiteFont =>
  ({ family, fallback, weights: [400], ...extra })
const body = (family: string, weights = [400, 500, 600]): SiteFont => ({ family, fallback: sans, weights })

// The first is the default for new websites
export const fontPairings: FontPairing[] = [
  // Weddings & engagements: classic and romantic serifs
  {
    key: 'serif_classic',
    name: 'Serif classic',
    group: 'wedding',
    heading: { family: 'Playfair Display', fallback: serif, weights: [400, 600, 700], italic: true },
    body: { family: 'Lato', fallback: sans, weights: [400, 700] },
  },
  {
    key: 'romantic',
    name: 'Romantic',
    group: 'wedding',
    heading: { family: 'Cormorant Garamond', fallback: serif, weights: [400, 500, 600, 700], italic: true },
    body: { family: 'Nunito Sans', fallback: sans, weights: [400, 600, 700] },
  },
  { key: 'timeless', name: 'Timeless', group: 'wedding', heading: heading('Libre Baskerville', serif, { italic: true }), body: body('Source Sans 3') },
  { key: 'grand_ballroom', name: 'Grand ballroom', group: 'wedding', heading: heading('Cinzel', serif), body: body('Raleway', [400, 500, 600, 700]) },
  { key: 'modern_romance', name: 'Modern romance', group: 'wedding', heading: heading('DM Serif Display', serif, { italic: true }), body: body('DM Sans') },
  { key: 'editorial', name: 'Editorial', group: 'wedding', heading: heading('Bodoni Moda', serif, { italic: true }), body: body('Jost', [400, 500, 600, 700]) },
  { key: 'garden', name: 'Garden', group: 'wedding', heading: heading('Lora', serif, { italic: true }), body: body('Karla') },
  { key: 'vintage', name: 'Vintage', group: 'wedding', heading: heading('Old Standard TT', serif, { italic: true }), body: body('Open Sans') },
  { key: 'heirloom', name: 'Heirloom', group: 'wedding', heading: heading('EB Garamond', serif, { italic: true }), body: body('Montserrat') },
  { key: 'soft_serif', name: 'Soft serif', group: 'wedding', heading: heading('Fraunces', serif, { italic: true }), body: body('Figtree') },
  { key: 'marble', name: 'Marble', group: 'wedding', heading: heading('Italiana', serif), body: body('Josefin Sans') },
  { key: 'chapel', name: 'Chapel', group: 'wedding', heading: heading('Prata', serif), body: body('Mulish') },

  // Script & calligraphy: handwritten headings with a quiet body
  {
    key: 'script',
    name: 'Script',
    group: 'script',
    heading: { family: 'Great Vibes', fallback: cursive, weights: [400], script: true },
    body: { family: 'Raleway', fallback: sans, weights: [400, 500, 600, 700] },
  },
  {
    key: 'luxurious_script',
    name: 'Luxurious script',
    group: 'script',
    heading: { family: 'Luxurious Script', fallback: cursive, weights: [400], script: true },
    body: { family: 'Jost', fallback: sans, weights: [400, 500, 600, 700] },
  },
  { key: 'parisian', name: 'Parisian', group: 'script', heading: heading('Parisienne', cursive, { script: true }), body: body('Lora') },
  { key: 'love_letter', name: 'Love letter', group: 'script', heading: heading('Allura', cursive, { script: true }), body: body('Montserrat') },
  { key: 'calligraphy', name: 'Calligraphy', group: 'script', heading: heading('Pinyon Script', cursive, { script: true }), body: body('Karla') },
  { key: 'handwritten_vows', name: 'Handwritten vows', group: 'script', heading: heading('Dancing Script', cursive, { script: true }), body: body('Quicksand') },
  { key: 'ribbon', name: 'Ribbon', group: 'script', heading: heading('Alex Brush', cursive, { script: true }), body: body('Nunito Sans', [400, 600, 700]) },
  { key: 'formal_invitation', name: 'Formal invitation', group: 'script', heading: heading('Petit Formal Script', cursive, { script: true }), body: body('Lato', [400, 700]) },
  { key: 'sunset', name: 'Sunset', group: 'script', heading: heading('Sacramento', cursive, { script: true }), body: body('Josefin Sans') },
  { key: 'royal_script', name: 'Royal script', group: 'script', heading: heading('Imperial Script', cursive, { script: true }), body: body('Mulish') },

  // Modern & minimal: clean sans and contemporary serifs
  {
    key: 'modern_sans',
    name: 'Modern sans',
    group: 'modern',
    heading: { family: 'Montserrat', fallback: sans, weights: [500, 600, 700] },
    body: { family: 'Inter', fallback: sans, weights: [400, 500, 600] },
  },
  { key: 'minimal', name: 'Minimal', group: 'modern', heading: heading('Outfit', sans), body: body('Inter') },
  { key: 'gallery', name: 'Gallery', group: 'modern', heading: heading('Instrument Serif', serif, { italic: true }), body: body('Instrument Sans') },
  { key: 'clean', name: 'Clean', group: 'modern', heading: heading('Plus Jakarta Sans', sans, { italic: true }), body: body('Plus Jakarta Sans') },
  { key: 'architect', name: 'Architect', group: 'modern', heading: heading('Space Grotesk', sans), body: body('Work Sans') },
  { key: 'studio', name: 'Studio', group: 'modern', heading: heading('Syne', sans), body: body('Inter') },
  { key: 'art_deco', name: 'Art deco', group: 'modern', heading: heading('Poiret One', sans), body: body('Josefin Sans') },
  { key: 'journal', name: 'Journal', group: 'modern', heading: heading('Newsreader', serif, { italic: true }), body: body('Inter') },

  // Birthdays & parties: bold, rounded and handwritten faces
  {
    key: 'playful',
    name: 'Playful',
    group: 'party',
    heading: { family: 'Fredoka', fallback: sans, weights: [400, 500, 600] },
    body: { family: 'Nunito', fallback: sans, weights: [400, 600, 700] },
  },
  { key: 'confetti', name: 'Confetti', group: 'party', heading: heading('Baloo 2', sans), body: body('Quicksand') },
  { key: 'party_pop', name: 'Party pop', group: 'party', heading: heading('Pacifico', cursive, { script: true }), body: body('Poppins') },
  { key: 'diner', name: 'Diner', group: 'party', heading: heading('Lobster', cursive, { script: true }), body: body('Cabin') },
  { key: 'bold_bash', name: 'Bold bash', group: 'party', heading: heading('Bebas Neue', sans), body: body('Montserrat') },
  { key: 'kids_party', name: 'Kids\' party', group: 'party', heading: heading('Chewy', sans), body: body('Nunito', [400, 600, 700]) },
  { key: 'neon', name: 'Neon night', group: 'party', heading: heading('Righteous', sans), body: body('Rubik') },
  { key: 'sketchbook', name: 'Sketchbook', group: 'party', heading: heading('Caveat', cursive, { script: true }), body: body('Nunito', [400, 600, 700]) },
  { key: 'sunny', name: 'Sunny', group: 'party', heading: heading('Comfortaa', sans), body: body('Karla') },
  { key: 'glam', name: 'Glam', group: 'party', heading: heading('Abril Fatface', serif), body: body('Poppins') },

  // Business & conferences: professional and easy to read
  { key: 'plex', name: 'Plex', group: 'business', heading: heading('IBM Plex Serif', serif, { italic: true }), body: body('IBM Plex Sans') },
  { key: 'keynote', name: 'Keynote', group: 'business', heading: heading('Archivo', sans, { italic: true }), body: body('Inter') },
  { key: 'summit', name: 'Summit', group: 'business', heading: heading('Oswald', sans), body: body('Source Sans 3') },
  { key: 'trusted', name: 'Trusted', group: 'business', heading: heading('Merriweather', serif, { italic: true }), body: body('Open Sans') },
  { key: 'startup', name: 'Startup', group: 'business', heading: heading('Sora', sans), body: body('DM Sans') },
  { key: 'annual_report', name: 'Annual report', group: 'business', heading: heading('Libre Franklin', sans, { italic: true }), body: body('Source Serif 4') },

  // Memorials & tributes: gentle, quiet serifs
  { key: 'remembrance', name: 'Remembrance', group: 'memorial', heading: heading('Cormorant', serif, { italic: true }), body: body('Source Sans 3') },
  { key: 'tribute', name: 'Tribute', group: 'memorial', heading: heading('Crimson Pro', serif, { italic: true }), body: body('Lato', [400, 700]) },
  { key: 'quiet_light', name: 'Quiet light', group: 'memorial', heading: heading('Spectral', serif, { italic: true }), body: body('Mulish') },
  { key: 'hymn', name: 'Hymn', group: 'memorial', heading: heading('Alegreya', serif, { italic: true }), body: body('Alegreya Sans', [400, 500, 700]) },
]

export function getFontPairing(key: string): FontPairing {
  return fontPairings.find(pairing => pairing.key === key) ?? fontPairings[0]!
}

export function fontStack(font: SiteFont): string {
  return `"${font.family}", ${font.fallback}`
}

// Fonts only referenced through CSS variables aren't detected by @nuxt/fonts, so nuxt.config.ts registers these
// explicitly: one entry per family, with every weight and style any pairing uses (a family can be a heading in one
// pairing and the body in another).
export const siteFontFamilies = Object.values(
  fontPairings
    .flatMap(pairing => [pairing.heading, pairing.body])
    .reduce<Record<string, { name: string, weights: number[], styles: ('normal' | 'italic')[], global: true }>>((families, font) => {
      const family = families[font.family] ?? { name: font.family, weights: [], styles: ['normal'], global: true }
      family.weights = [...new Set([...family.weights, ...font.weights])].sort((a, b) => a - b)
      if (font.italic && !family.styles.includes('italic'))
        family.styles = [...family.styles, 'italic']
      families[font.family] = family
      return families
    }, {}),
)
