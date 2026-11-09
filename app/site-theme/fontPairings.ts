export interface SiteFont {
  family: string
  fallback: string
  weights: number[]
  italic?: boolean
  // A handwritten or script face: it already flows, so text that would be italic stays upright (slanted, it looks wrong)
  script?: boolean
  // Where @nuxt/fonts gets it: Google Fonts unless set (Fontshare for ITF's free faces, e.g. Boska and Switzer)
  provider?: 'fontshare'
  // A heading font's weight (400 unless set, e.g. a pair's Medium or Light); must be among its `weights`
  weight?: number
}

// Groups in the font picker, by how the heading font looks, in plain words hosts understand (title case, in this order).
// Only the picker uses them; they aren't saved with websites, so a pairing can move group freely.
export type FontPairingGroup = 'classic' | 'handwritten' | 'clean' | 'bold' | 'fun'

export const fontPairingGroups: { key: FontPairingGroup, label: string }[] = [
  // Serif headings: graceful, like a printed invitation
  { key: 'classic', label: 'Classic & Elegant' },
  // Every cursive heading: calligraphy, script and casual handwriting
  { key: 'handwritten', label: 'Handwritten' },
  // Plain sans headings at regular to semibold weights
  { key: 'clean', label: 'Clean & Simple' },
  // Condensed, display and heavy headings that stand out
  { key: 'bold', label: 'Big & Bold' },
  // Rounded and playful headings
  { key: 'fun', label: 'Fun & Friendly' },
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
 * those weights list the ones they have. Every family is a Google Font (or a Fontshare one, `provider`), by its exact
 * name, served from the app.
 */
const heading = (family: string, fallback: string, extra: Partial<SiteFont> = {}): SiteFont =>
  ({ family, fallback, weights: [400], ...extra })
const body = (family: string, weights = [400, 500, 600]): SiteFont => ({ family, fallback: sans, weights })

// The first is the default for new websites
export const fontPairings: FontPairing[] = [
  // Classic and romantic serifs
  {
    key: 'serif_classic',
    name: 'Serif classic',
    group: 'classic',
    heading: { family: 'Playfair Display', fallback: serif, weights: [400, 600, 700], italic: true },
    body: { family: 'Lato', fallback: sans, weights: [400, 700] },
  },
  {
    key: 'romantic',
    name: 'Romantic',
    group: 'classic',
    heading: { family: 'Cormorant Garamond', fallback: serif, weights: [400, 500, 600, 700], italic: true },
    body: { family: 'Nunito Sans', fallback: sans, weights: [400, 600, 700] },
  },
  { key: 'timeless', name: 'Timeless', group: 'classic', heading: heading('Libre Baskerville', serif, { italic: true }), body: body('Source Sans 3') },
  { key: 'grand_ballroom', name: 'Grand ballroom', group: 'classic', heading: heading('Cinzel', serif), body: body('Raleway', [400, 500, 600, 700]) },
  { key: 'modern_romance', name: 'Modern romance', group: 'classic', heading: heading('DM Serif Display', serif, { italic: true }), body: body('DM Sans') },
  { key: 'editorial', name: 'Editorial', group: 'classic', heading: heading('Bodoni Moda', serif, { italic: true }), body: body('Jost', [400, 500, 600, 700]) },
  { key: 'garden', name: 'Garden', group: 'classic', heading: heading('Lora', serif, { italic: true }), body: body('Karla') },
  { key: 'vintage', name: 'Vintage', group: 'classic', heading: heading('Old Standard TT', serif, { italic: true }), body: body('Open Sans') },
  { key: 'heirloom', name: 'Heirloom', group: 'classic', heading: heading('EB Garamond', serif, { italic: true }), body: body('Montserrat') },
  { key: 'soft_serif', name: 'Soft serif', group: 'classic', heading: heading('Fraunces', serif, { italic: true }), body: body('Figtree') },
  { key: 'marble', name: 'Marble', group: 'classic', heading: heading('Italiana', serif), body: body('Josefin Sans') },
  { key: 'chapel', name: 'Chapel', group: 'classic', heading: heading('Prata', serif), body: body('Mulish') },

  // Script and calligraphy headings with a quiet body
  {
    key: 'script',
    name: 'Script',
    group: 'handwritten',
    heading: { family: 'Great Vibes', fallback: cursive, weights: [400], script: true },
    body: { family: 'Raleway', fallback: sans, weights: [400, 500, 600, 700] },
  },
  {
    key: 'luxurious_script',
    name: 'Luxurious script',
    group: 'handwritten',
    heading: { family: 'Luxurious Script', fallback: cursive, weights: [400], script: true },
    body: { family: 'Jost', fallback: sans, weights: [400, 500, 600, 700] },
  },
  { key: 'parisian', name: 'Parisian', group: 'handwritten', heading: heading('Parisienne', cursive, { script: true }), body: body('Lora') },
  { key: 'love_letter', name: 'Love letter', group: 'handwritten', heading: heading('Allura', cursive, { script: true }), body: body('Montserrat') },
  { key: 'calligraphy', name: 'Calligraphy', group: 'handwritten', heading: heading('Pinyon Script', cursive, { script: true }), body: body('Karla') },
  { key: 'handwritten_vows', name: 'Handwritten vows', group: 'handwritten', heading: heading('Dancing Script', cursive, { script: true }), body: body('Quicksand') },
  { key: 'ribbon', name: 'Ribbon', group: 'handwritten', heading: heading('Alex Brush', cursive, { script: true }), body: body('Nunito Sans', [400, 600, 700]) },
  { key: 'formal_invitation', name: 'Formal invitation', group: 'handwritten', heading: heading('Petit Formal Script', cursive, { script: true }), body: body('Lato', [400, 700]) },
  { key: 'sunset', name: 'Sunset', group: 'handwritten', heading: heading('Sacramento', cursive, { script: true }), body: body('Josefin Sans') },
  { key: 'royal_script', name: 'Royal script', group: 'handwritten', heading: heading('Imperial Script', cursive, { script: true }), body: body('Mulish') },

  // Clean sans and contemporary serifs
  {
    key: 'modern_sans',
    name: 'Modern sans',
    group: 'clean',
    heading: { family: 'Montserrat', fallback: sans, weights: [500, 600, 700] },
    body: { family: 'Inter', fallback: sans, weights: [400, 500, 600] },
  },
  { key: 'minimal', name: 'Minimal', group: 'clean', heading: heading('Outfit', sans), body: body('Inter') },
  { key: 'gallery', name: 'Gallery', group: 'classic', heading: heading('Instrument Serif', serif, { italic: true }), body: body('Instrument Sans') },
  { key: 'clean', name: 'Clean', group: 'clean', heading: heading('Plus Jakarta Sans', sans, { italic: true }), body: body('Plus Jakarta Sans') },
  { key: 'architect', name: 'Architect', group: 'clean', heading: heading('Space Grotesk', sans), body: body('Work Sans') },
  { key: 'studio', name: 'Studio', group: 'clean', heading: heading('Syne', sans), body: body('Inter') },
  { key: 'art_deco', name: 'Art deco', group: 'classic', heading: heading('Poiret One', sans), body: body('Josefin Sans') },
  { key: 'journal', name: 'Journal', group: 'classic', heading: heading('Newsreader', serif, { italic: true }), body: body('Inter') },
  // From Fontshare: a sharp editorial serif over a clean neo-grotesk. Boska in its Light (300), its thin strokes are the
  // look; it's the only weight loaded, so headings (which ask for 400) use it
  {
    key: 'modern_editorial',
    name: 'Modern editorial',
    group: 'classic',
    heading: heading('Boska', serif, { weights: [300], weight: 300, italic: true, provider: 'fontshare' }),
    body: { ...body('Switzer'), provider: 'fontshare' },
  },

  // Bold, rounded and handwritten faces for celebrations
  {
    key: 'playful',
    name: 'Playful',
    group: 'fun',
    heading: { family: 'Fredoka', fallback: sans, weights: [400, 500, 600] },
    body: { family: 'Nunito', fallback: sans, weights: [400, 600, 700] },
  },
  { key: 'confetti', name: 'Confetti', group: 'fun', heading: heading('Baloo 2', sans), body: body('Quicksand') },
  { key: 'party_pop', name: 'Party pop', group: 'handwritten', heading: heading('Pacifico', cursive, { script: true }), body: body('Poppins') },
  { key: 'diner', name: 'Diner', group: 'handwritten', heading: heading('Lobster', cursive, { script: true }), body: body('Cabin') },
  { key: 'bold_bash', name: 'Bold bash', group: 'bold', heading: heading('Bebas Neue', sans), body: body('Montserrat') },
  { key: 'kids_party', name: 'Kids\' party', group: 'fun', heading: heading('Chewy', sans), body: body('Nunito', [400, 600, 700]) },
  { key: 'neon', name: 'Neon night', group: 'fun', heading: heading('Righteous', sans), body: body('Rubik') },
  { key: 'sketchbook', name: 'Sketchbook', group: 'handwritten', heading: heading('Caveat', cursive, { script: true }), body: body('Nunito', [400, 600, 700]) },
  { key: 'sunny', name: 'Sunny', group: 'fun', heading: heading('Comfortaa', sans), body: body('Karla') },
  { key: 'glam', name: 'Glam', group: 'bold', heading: heading('Abril Fatface', serif), body: body('Poppins') },

  // Professional and easy to read
  { key: 'plex', name: 'Plex', group: 'classic', heading: heading('IBM Plex Serif', serif, { italic: true }), body: body('IBM Plex Sans') },
  { key: 'keynote', name: 'Keynote', group: 'clean', heading: heading('Archivo', sans, { italic: true }), body: body('Inter') },
  { key: 'summit', name: 'Summit', group: 'bold', heading: heading('Oswald', sans), body: body('Source Sans 3') },
  { key: 'trusted', name: 'Trusted', group: 'classic', heading: heading('Merriweather', serif, { italic: true }), body: body('Open Sans') },
  { key: 'startup', name: 'Startup', group: 'clean', heading: heading('Sora', sans), body: body('DM Sans') },
  { key: 'annual_report', name: 'Annual report', group: 'clean', heading: heading('Libre Franklin', sans, { italic: true }), body: body('Source Serif 4') },

  // Gentle, quiet serifs
  { key: 'remembrance', name: 'Remembrance', group: 'classic', heading: heading('Cormorant', serif, { italic: true }), body: body('Source Sans 3') },
  { key: 'tribute', name: 'Tribute', group: 'classic', heading: heading('Crimson Pro', serif, { italic: true }), body: body('Lato', [400, 700]) },
  { key: 'quiet_light', name: 'Quiet light', group: 'classic', heading: heading('Spectral', serif, { italic: true }), body: body('Mulish') },
  { key: 'hymn', name: 'Hymn', group: 'classic', heading: heading('Alegreya', serif, { italic: true }), body: body('Alegreya Sans', [400, 500, 700]) },

  // Fontshare's pairs (fontshare.com/pairs), from its API: each heading in the pair's weight. Fonts Google Fonts also
  // has (Poppins, Nunito, Khand…) come from Google, like the other pairings, so a family has one source. Boska + Switzer
  // is "Modern editorial" above (in Boska Light).
  { key: 'fs_trench_slab_general_sans', name: 'Trench Slab + General Sans', group: 'bold', heading: { family: 'Trench Slab', fallback: serif, weights: [500], weight: 500, provider: 'fontshare' }, body: { family: 'General Sans', fallback: sans, weights: [400, 500, 600], provider: 'fontshare' } },
  { key: 'fs_zina_recia', name: 'Zina + Recia', group: 'classic', heading: { family: 'Zina', fallback: sans, weights: [400], provider: 'fontshare' }, body: { family: 'Recia', fallback: serif, weights: [400, 500, 600], provider: 'fontshare' } },
  { key: 'fs_technor_supreme', name: 'Technor + Supreme', group: 'bold', heading: { family: 'Technor', fallback: sans, weights: [600], weight: 600, provider: 'fontshare' }, body: { family: 'Supreme', fallback: sans, weights: [400, 500, 700], provider: 'fontshare' } },
  { key: 'fs_quilon_rowan', name: 'Quilon + Rowan', group: 'clean', heading: { family: 'Quilon', fallback: sans, weights: [500], weight: 500, provider: 'fontshare' }, body: { family: 'Rowan', fallback: serif, weights: [400, 500, 600], provider: 'fontshare' } },
  { key: 'fs_oswald_sentient', name: 'Oswald + Sentient', group: 'bold', heading: { family: 'Oswald', fallback: sans, weights: [700], weight: 700 }, body: { family: 'Sentient', fallback: serif, weights: [400, 500, 700], provider: 'fontshare' } },
  { key: 'fs_quicksand_spline_sans', name: 'Quicksand + Spline Sans', group: 'fun', heading: { family: 'Quicksand', fallback: sans, weights: [600], weight: 600 }, body: { family: 'Spline Sans', fallback: sans, weights: [400, 500, 600] } },
  { key: 'fs_general_sans_recia', name: 'General Sans + Recia', group: 'clean', heading: { family: 'General Sans', fallback: sans, weights: [500], weight: 500, italic: true, provider: 'fontshare' }, body: { family: 'Recia', fallback: serif, weights: [400, 500, 600], provider: 'fontshare' } },
  { key: 'fs_recia_supreme', name: 'Recia + Supreme', group: 'classic', heading: { family: 'Recia', fallback: serif, weights: [500], weight: 500, italic: true, provider: 'fontshare' }, body: { family: 'Supreme', fallback: sans, weights: [400, 500, 700], provider: 'fontshare' } },
  { key: 'fs_satoshi_erode', name: 'Satoshi + Erode', group: 'clean', heading: { family: 'Satoshi', fallback: sans, weights: [700], weight: 700, italic: true, provider: 'fontshare' }, body: { family: 'Erode', fallback: serif, weights: [400, 500, 600], provider: 'fontshare' } },
  { key: 'fs_poppins_bespoke_slab', name: 'Poppins + Bespoke Slab', group: 'clean', heading: { family: 'Poppins', fallback: sans, weights: [600], weight: 600 }, body: { family: 'Bespoke Slab', fallback: serif, weights: [400, 500, 700], provider: 'fontshare' } },
  { key: 'fs_chubbo_supreme', name: 'Chubbo + Supreme', group: 'fun', heading: { family: 'Chubbo', fallback: sans, weights: [700], weight: 700, italic: true, provider: 'fontshare' }, body: { family: 'Supreme', fallback: sans, weights: [400, 500, 700], provider: 'fontshare' } },
  { key: 'fs_hind_amulya', name: 'Hind + Amulya', group: 'bold', heading: { family: 'Hind', fallback: sans, weights: [700], weight: 700 }, body: { family: 'Amulya', fallback: sans, weights: [400, 500, 700], provider: 'fontshare' } },
  { key: 'fs_melodrama_nunito', name: 'Melodrama + Nunito', group: 'classic', heading: { family: 'Melodrama', fallback: sans, weights: [500], weight: 500, provider: 'fontshare' }, body: { family: 'Nunito', fallback: sans, weights: [400, 500, 600] } },
  { key: 'fs_bespoke_stencil_supreme', name: 'Bespoke Stencil + Supreme', group: 'bold', heading: { family: 'Bespoke Stencil', fallback: sans, weights: [700], weight: 700, italic: true, provider: 'fontshare' }, body: { family: 'Supreme', fallback: sans, weights: [400, 500, 700], provider: 'fontshare' } },
  { key: 'fs_tanker_bespoke_serif', name: 'Tanker + Bespoke Serif', group: 'bold', heading: { family: 'Tanker', fallback: sans, weights: [400], provider: 'fontshare' }, body: { family: 'Bespoke Serif', fallback: serif, weights: [400, 500, 700], provider: 'fontshare' } },
  { key: 'fs_excon_ranade', name: 'Excon + Ranade', group: 'clean', heading: { family: 'Excon', fallback: sans, weights: [500], weight: 500, provider: 'fontshare' }, body: { family: 'Ranade', fallback: sans, weights: [400, 500, 700], provider: 'fontshare' } },
  { key: 'fs_amulya_synonym', name: 'Amulya + Synonym', group: 'bold', heading: { family: 'Amulya', fallback: sans, weights: [700], weight: 700, italic: true, provider: 'fontshare' }, body: { family: 'Synonym', fallback: sans, weights: [400, 500, 600], provider: 'fontshare' } },
  { key: 'fs_bebas_neue_nunito', name: 'Bebas Neue + Nunito', group: 'bold', heading: { family: 'Bebas Neue', fallback: sans, weights: [400] }, body: { family: 'Nunito', fallback: sans, weights: [400, 500, 600] } },
  { key: 'fs_general_sans_gambetta', name: 'General Sans + Gambetta', group: 'clean', heading: { family: 'General Sans', fallback: sans, weights: [600], weight: 600, italic: true, provider: 'fontshare' }, body: { family: 'Gambetta', fallback: serif, weights: [400, 500, 600], provider: 'fontshare' } },
  { key: 'fs_array_khand', name: 'Array + Khand', group: 'bold', heading: { family: 'Array', fallback: sans, weights: [400], italic: true, provider: 'fontshare' }, body: { family: 'Khand', fallback: sans, weights: [400, 500, 600] } },
  { key: 'fs_pilcrow_rounded_hind', name: 'Pilcrow Rounded + Hind', group: 'fun', heading: { family: 'Pilcrow Rounded', fallback: sans, weights: [600], weight: 600, provider: 'fontshare' }, body: { family: 'Hind', fallback: sans, weights: [400, 500, 600] } },
  { key: 'fs_khand_switzer', name: 'Khand + Switzer', group: 'bold', heading: { family: 'Khand', fallback: sans, weights: [700], weight: 700 }, body: { family: 'Switzer', fallback: sans, weights: [400, 500, 600], provider: 'fontshare' } },
  { key: 'fs_khand_hind', name: 'Khand + Hind', group: 'bold', heading: { family: 'Khand', fallback: sans, weights: [700], weight: 700 }, body: { family: 'Hind', fallback: sans, weights: [400, 500, 600] } },
  { key: 'fs_rosaline_satoshi', name: 'Rosaline + Satoshi', group: 'handwritten', heading: { family: 'Rosaline', fallback: cursive, weights: [400], script: true, provider: 'fontshare' }, body: { family: 'Satoshi', fallback: sans, weights: [400, 500, 700], provider: 'fontshare' } },
  { key: 'fs_general_sans_general_sans', name: 'General Sans + General Sans', group: 'clean', heading: { family: 'General Sans', fallback: sans, weights: [600], weight: 600, italic: true, provider: 'fontshare' }, body: { family: 'General Sans', fallback: sans, weights: [400, 500, 600], provider: 'fontshare' } },
  { key: 'fs_erode_recia', name: 'Erode + Recia', group: 'classic', heading: { family: 'Erode', fallback: serif, weights: [600], weight: 600, italic: true, provider: 'fontshare' }, body: { family: 'Recia', fallback: serif, weights: [400, 500, 600], provider: 'fontshare' } },
  { key: 'fs_teko_hind', name: 'Teko + Hind', group: 'bold', heading: { family: 'Teko', fallback: sans, weights: [600], weight: 600 }, body: { family: 'Hind', fallback: sans, weights: [400, 500, 600] } },
  { key: 'fs_plein_switzer', name: 'Plein + Switzer', group: 'bold', heading: { family: 'Plein', fallback: sans, weights: [700], weight: 700, italic: true, provider: 'fontshare' }, body: { family: 'Switzer', fallback: sans, weights: [400, 500, 600], provider: 'fontshare' } },
  { key: 'fs_zodiak_plus_jakarta_sans', name: 'Zodiak + Plus Jakarta Sans', group: 'classic', heading: { family: 'Zodiak', fallback: serif, weights: [700], weight: 700, italic: true, provider: 'fontshare' }, body: { family: 'Plus Jakarta Sans', fallback: sans, weights: [400, 500, 600] } },
  { key: 'fs_britney_quicksand', name: 'Britney + Quicksand', group: 'handwritten', heading: { family: 'Britney', fallback: cursive, weights: [400], script: true, provider: 'fontshare' }, body: { family: 'Quicksand', fallback: sans, weights: [400, 500, 600] } },
  { key: 'fs_comico_zodiak', name: 'Comico + Zodiak', group: 'handwritten', heading: { family: 'Comico', fallback: cursive, weights: [400], script: true, provider: 'fontshare' }, body: { family: 'Zodiak', fallback: serif, weights: [400, 700], provider: 'fontshare' } },
  { key: 'fs_tanker_erode', name: 'Tanker + Erode', group: 'bold', heading: { family: 'Tanker', fallback: sans, weights: [400], provider: 'fontshare' }, body: { family: 'Erode', fallback: serif, weights: [400, 500, 600], provider: 'fontshare' } },
  { key: 'fs_pramukh_rounded_poppins', name: 'Pramukh Rounded + Poppins', group: 'fun', heading: { family: 'Pramukh Rounded', fallback: sans, weights: [700], weight: 700, italic: true, provider: 'fontshare' }, body: { family: 'Poppins', fallback: sans, weights: [400, 500, 600] } },
  { key: 'fs_boska_general_sans', name: 'Boska + General Sans', group: 'classic', heading: { family: 'Boska', fallback: serif, weights: [300], weight: 300, italic: true, provider: 'fontshare' }, body: { family: 'General Sans', fallback: sans, weights: [400, 500, 600], provider: 'fontshare' } },
  { key: 'fs_sharpie_ranade', name: 'Sharpie + Ranade', group: 'fun', heading: { family: 'Sharpie', fallback: sans, weights: [800], weight: 800, provider: 'fontshare' }, body: { family: 'Ranade', fallback: sans, weights: [400, 500, 700], provider: 'fontshare' } },
  { key: 'fs_bebas_neue_zodiak', name: 'Bebas Neue + Zodiak', group: 'bold', heading: { family: 'Bebas Neue', fallback: sans, weights: [400] }, body: { family: 'Zodiak', fallback: serif, weights: [400, 700], provider: 'fontshare' } },
  { key: 'fs_pally_neco', name: 'Pally + Neco', group: 'fun', heading: { family: 'Pally', fallback: sans, weights: [500], weight: 500, provider: 'fontshare' }, body: { family: 'Neco', fallback: serif, weights: [400, 500, 700], provider: 'fontshare' } },
  { key: 'fs_chillax_synonym', name: 'Chillax + Synonym', group: 'fun', heading: { family: 'Chillax', fallback: sans, weights: [600], weight: 600, provider: 'fontshare' }, body: { family: 'Synonym', fallback: sans, weights: [400, 500, 600], provider: 'fontshare' } },
  { key: 'fs_clash_display_archivo', name: 'Clash Display + Archivo', group: 'bold', heading: { family: 'Clash Display', fallback: sans, weights: [600], weight: 600, provider: 'fontshare' }, body: { family: 'Archivo', fallback: sans, weights: [400, 500, 600] } },
  { key: 'fs_switzer_switzer', name: 'Switzer + Switzer', group: 'bold', heading: { family: 'Switzer', fallback: sans, weights: [700], weight: 700, italic: true, provider: 'fontshare' }, body: { family: 'Switzer', fallback: sans, weights: [400, 500, 600], provider: 'fontshare' } },
  { key: 'fs_pilcrow_rounded_archivo', name: 'Pilcrow Rounded + Archivo', group: 'fun', heading: { family: 'Pilcrow Rounded', fallback: sans, weights: [900], weight: 900, provider: 'fontshare' }, body: { family: 'Archivo', fallback: sans, weights: [400, 500, 600] } },
  { key: 'fs_khand_general_sans', name: 'Khand + General Sans', group: 'bold', heading: { family: 'Khand', fallback: sans, weights: [600], weight: 600 }, body: { family: 'General Sans', fallback: sans, weights: [400, 500, 600], provider: 'fontshare' } },
  { key: 'fs_rajdhani_sentient', name: 'Rajdhani + Sentient', group: 'bold', heading: { family: 'Rajdhani', fallback: sans, weights: [700], weight: 700 }, body: { family: 'Sentient', fallback: serif, weights: [400, 500, 700], provider: 'fontshare' } },
  { key: 'fs_outfit_switzer', name: 'Outfit + Switzer', group: 'clean', heading: { family: 'Outfit', fallback: sans, weights: [600], weight: 600 }, body: { family: 'Switzer', fallback: sans, weights: [400, 500, 600], provider: 'fontshare' } },
  { key: 'fs_expose_bespoke_sans', name: 'Expose + Bespoke Sans', group: 'bold', heading: { family: 'Expose', fallback: sans, weights: [700], weight: 700, provider: 'fontshare' }, body: { family: 'Bespoke Sans', fallback: sans, weights: [400, 500, 700], provider: 'fontshare' } },
  { key: 'fs_general_sans_quicksand', name: 'General Sans + Quicksand', group: 'clean', heading: { family: 'General Sans', fallback: sans, weights: [500], weight: 500, italic: true, provider: 'fontshare' }, body: { family: 'Quicksand', fallback: sans, weights: [400, 500, 600] } },
  { key: 'fs_bonny_pilcrow_rounded', name: 'Bonny + Pilcrow Rounded', group: 'fun', heading: { family: 'Bonny', fallback: serif, weights: [500], weight: 500, provider: 'fontshare' }, body: { family: 'Pilcrow Rounded', fallback: sans, weights: [400, 500, 600], provider: 'fontshare' } },
  { key: 'fs_poppins_hind', name: 'Poppins + Hind', group: 'clean', heading: { family: 'Poppins', fallback: sans, weights: [600], weight: 600 }, body: { family: 'Hind', fallback: sans, weights: [400, 500, 600] } },
  { key: 'fs_nunito_supreme', name: 'Nunito + Supreme', group: 'fun', heading: { family: 'Nunito', fallback: sans, weights: [800], weight: 800 }, body: { family: 'Supreme', fallback: sans, weights: [400, 500, 700], provider: 'fontshare' } },
  { key: 'fs_cabinet_grotesk_satoshi', name: 'Cabinet Grotesk + Satoshi', group: 'bold', heading: { family: 'Cabinet Grotesk', fallback: sans, weights: [800], weight: 800, provider: 'fontshare' }, body: { family: 'Satoshi', fallback: sans, weights: [400, 500, 700], provider: 'fontshare' } },
  { key: 'fs_gambarino_switzer', name: 'Gambarino + Switzer', group: 'classic', heading: { family: 'Gambarino', fallback: serif, weights: [400], provider: 'fontshare' }, body: { family: 'Switzer', fallback: sans, weights: [400, 500, 600], provider: 'fontshare' } },
  { key: 'fs_supreme_poppins', name: 'Supreme + Poppins', group: 'clean', heading: { family: 'Supreme', fallback: sans, weights: [500], weight: 500, italic: true, provider: 'fontshare' }, body: { family: 'Poppins', fallback: sans, weights: [400, 500, 600] } },
  { key: 'fs_khand_supreme', name: 'Khand + Supreme', group: 'bold', heading: { family: 'Khand', fallback: sans, weights: [600], weight: 600 }, body: { family: 'Supreme', fallback: sans, weights: [400, 500, 700], provider: 'fontshare' } },
  { key: 'fs_new_title_amulya', name: 'New Title + Amulya', group: 'bold', heading: { family: 'New Title', fallback: sans, weights: [500], weight: 500, provider: 'fontshare' }, body: { family: 'Amulya', fallback: sans, weights: [400, 500, 700], provider: 'fontshare' } },
  { key: 'fs_roundo_pilcrow_rounded', name: 'Roundo + Pilcrow Rounded', group: 'fun', heading: { family: 'Roundo', fallback: sans, weights: [500], weight: 500, provider: 'fontshare' }, body: { family: 'Pilcrow Rounded', fallback: sans, weights: [400, 500, 600], provider: 'fontshare' } },
  { key: 'fs_archivo_ranade', name: 'Archivo + Ranade', group: 'clean', heading: { family: 'Archivo', fallback: sans, weights: [600], weight: 600 }, body: { family: 'Ranade', fallback: sans, weights: [400, 500, 700], provider: 'fontshare' } },
  { key: 'fs_pilcrow_rounded_sentient', name: 'Pilcrow Rounded + Sentient', group: 'fun', heading: { family: 'Pilcrow Rounded', fallback: sans, weights: [700], weight: 700, provider: 'fontshare' }, body: { family: 'Sentient', fallback: serif, weights: [400, 500, 700], provider: 'fontshare' } },
  { key: 'fs_bevellier_satoshi', name: 'Bevellier + Satoshi', group: 'bold', heading: { family: 'Bevellier', fallback: sans, weights: [500], weight: 500, italic: true, provider: 'fontshare' }, body: { family: 'Satoshi', fallback: sans, weights: [400, 500, 700], provider: 'fontshare' } },
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
    .reduce<Record<string, { name: string, weights: number[], styles: ('normal' | 'italic')[], global: true, provider?: 'fontshare' }>>((families, font) => {
      const family = families[font.family] ?? { name: font.family, weights: [], styles: ['normal'], global: true, ...(font.provider && { provider: font.provider }) }
      family.weights = [...new Set([...family.weights, ...font.weights])].sort((a, b) => a - b)
      if (font.italic && !family.styles.includes('italic'))
        family.styles = [...family.styles, 'italic']
      families[font.family] = family
      return families
    }, {}),
)
