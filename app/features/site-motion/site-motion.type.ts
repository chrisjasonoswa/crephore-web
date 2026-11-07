import type { EventType } from '~/features/events/event.type'
import type { EventKind } from '~/site-theme/eventKinds'
import { eventKindFor } from '~/site-theme/eventKinds'

// An event website's motion, part of its theme (SiteTheme.motion): the intro animation when the site opens (`intro`)
// and how fast it plays (`intensity`). The keys are stored on saved websites and checked by the API (crephore-backend
// WebsiteKeys): never rename them.

// The intros, drawn and played by script (scenes/, PageIntroScene), by kind of event in picker order: `any` suits every
// event, the others their own kind
export const sceneIntroKeys = {
  any: ['shutter', 'film-strip', 'card-flip', 'stamp', 'calendar', 'pin-drop', 'assemble', 'color-bands', 'orbit', 'word-cycle', 'paper-tear', 'brush', 'stardust', 'window-light', 'frosted-glass', 'accordion', 'date-roll', 'focus-pull', 'ribbon-tape', 'counter-scroll'],
  wedding: ['envelope', 'signature', 'veil', 'wax-seal', 'ring-box', 'golden-frame', 'bloom', 'meet', 'light-leak', 'pages', 'ribbon', 'polaroid', 'toast', 'doors', 'vellum', 'foil-press', 'ink-wash', 'aisle', 'lace', 'letter'],
  party: ['countdown', 'balloon', 'candle', 'stickers', 'gift-box', 'disco', 'popper', 'marquee-lights', 'bouncy', 'slot', 'champagne', 'fireworks', 'neon', 'vinyl', 'ticket-tear', 'pinata', 'photo-booth', 'splash', 'karaoke', 'bunting'],
  business: ['counter', 'split-title', 'tiles', 'kinetic', 'blinds', 'line-expand', 'typewriter', 'stack-cards', 'scramble', 'zoom-through', 'badge', 'blueprint', 'spotlight', 'aurora', 'stats', 'ribbon-cut', 'split-flap', 'globe', 'keynote', 'network'],
  memorial: ['wreath-seal', 'candlelight', 'dove', 'portrait', 'dates', 'lily', 'first-light', 'mist', 'verse', 'lanterns', 'feather', 'album', 'stars', 'ripple', 'butterfly', 'after-rain', 'tree', 'sampaguita', 'paper-boat', 'bokeh'],
} as const
export type SceneKind = keyof typeof sceneIntroKeys
export type SceneIntroKey = (typeof sceneIntroKeys)[SceneKind][number]

// `none`: no intro, the page shows straight away
export const pageIntroKeys = [
  'none',
  ...sceneIntroKeys.any,
  ...sceneIntroKeys.wedding,
  ...sceneIntroKeys.party,
  ...sceneIntroKeys.business,
  ...sceneIntroKeys.memorial,
] as const
export type PageIntroKey = (typeof pageIntroKeys)[number]

const sceneKinds = Object.keys(sceneIntroKeys) as SceneKind[]
/** The kind of event an intro is for (`any` for every event); undefined for `none`. */
export function sceneKindOf(key: PageIntroKey): SceneKind | undefined {
  return sceneKinds.find(kind => (sceneIntroKeys[kind] as readonly string[]).includes(key))
}

export const motionIntensities = ['subtle', 'normal', 'bold'] as const
export type MotionIntensity = (typeof motionIntensities)[number]

export interface SiteMotion {
  // The intro when the site opens
  intro: PageIntroKey
  // Scales the intro's duration (0.6× / 1× / 1.3×)
  intensity: MotionIntensity
}

export const defaultSiteMotion: SiteMotion = { intro: 'shutter', intensity: 'bold' }

export interface MotionChoice<K extends string> {
  key: K
  label: string
  description: string
  // The picker's group: the scene's kind (`any` for every event, and for `none`)
  kind: EventKind
  // A scene's feel, shown on its card
  mood?: string
}

const scene = (kind: SceneKind) => (key: SceneIntroKey, label: string, mood: string, description: string): MotionChoice<PageIntroKey> => ({ key, label, description, kind, mood })
const any = scene('any')
const wedding = scene('wedding')
const party = scene('party')
const business = scene('business')
const memorial = scene('memorial')

// For the Style tab, in picker order. Scenes name the event from its hero (see IntroContent).
export const pageIntros: MotionChoice<PageIntroKey>[] = [
  { key: 'none', label: 'None', description: 'The page shows straight away.', kind: 'any' },
  any('shutter', 'Shutter', 'Signature', 'A camera iris holds the event name, then its blades twist open onto the page.'),
  any('film-strip', 'Film strip', 'Cinematic', 'A film strip races past and slows to a stop on the frame with the event name.'),
  any('card-flip', 'Card flip', 'Classic', 'An invitation card lands face down, flips over to show the details, then grows into the page.'),
  any('stamp', 'Save-the-date stamp', 'Tactile', 'A rubber stamp slams "Save the date" onto paper in inky texture, then the paper slides away.'),
  any('calendar', 'Calendar', 'Playful', 'Tear-off calendar pages fly away until the event\'s date is left.'),
  any('pin-drop', 'Pin drop', 'Location', 'A pin drops onto a map at the venue with a ripple, and a label pops up.'),
  any('assemble', 'Assemble', 'Modern', 'The letters fly in from everywhere and lock into place.'),
  any('color-bands', 'Colour bands', 'Bold', 'The page blurs, bands of your colours close in, then slide away to reveal it.'),
  any('orbit', 'Orbit', 'Calm', 'Rings pop out with points of light circling, then expand as the cover closes away.'),
  any('word-cycle', 'Word cycle', 'Warm', 'Under your small label, the words of your heading and then the date cycle one by one before the cover lifts.'),
  any('paper-tear', 'Paper tear', 'Tactile', 'A sheet of paper with the event name tears across a ragged edge and the halves pull apart.'),
  any('brush', 'Brush stroke', 'Artful', 'A painted brush stroke sweeps across and the event name appears on it.'),
  any('stardust', 'Stardust', 'Magical', 'Gold dust spirals in and the event name glows, then the dust scatters.'),
  any('window-light', 'Window light', 'Serene', 'Afternoon light through a window drifts across a wall with the event name.'),
  any('frosted-glass', 'Frosted glass', 'Soft', 'The page sits behind frosted glass with the name on it, then the glass is wiped clear.'),
  any('accordion', 'Accordion fold', 'Crafted', 'Folded panels open out like a paper fan, then fold away.'),
  any('date-roll', 'Date roll', 'Precise', 'The event date rolls into place digit by digit like an odometer.'),
  any('focus-pull', 'Focus pull', 'Signature', 'A camera viewfinder focuses on the page with a REC dot and focus box, then the shutter clicks.'),
  any('ribbon-tape', 'Ribbon tape', 'Energetic', 'Two crossing bands of scrolling text sweep in and out across the screen.'),
  any('counter-scroll', 'Counter scroll', 'Editorial', 'Two columns of the event name scroll in opposite directions and line up on a rule.'),

  wedding('envelope', 'Envelope', 'Elegant', 'A lined envelope sealed in wax. The flap lifts, a foil-printed card slides out, then grows to become the page.'),
  wedding('signature', 'Signature', 'Elegant', 'Your names write themselves, stroke by stroke. A line draws beneath, then the cover lifts.'),
  wedding('veil', 'Veil & petals', 'Romantic', 'Petals drift through a soft veil while your names come into focus. The veil rises like it\'s being lifted.'),
  wedding('wax-seal', 'Wax seal', 'Classic', 'A wax seal with your initials presses into the paper, catches the light, cracks, and the paper parts.'),
  wedding('ring-box', 'Ring box', 'Engagement', 'A velvet ring box in your main colour opens to a solitaire. The diamond catches one quiet glint, then the scene fades into the page.'),
  wedding('golden-frame', 'Golden frame', 'Elegant', 'A double frame draws itself, your names and date fade in, then the frame expands past the edges.'),
  wedding('bloom', 'Bloom', 'Romantic', 'A flower blooms open in the centre, then the petals rush toward you and clear the screen.'),
  wedding('meet', 'Meet in the middle', 'Elegant', 'Your two initials glide in from opposite sides, an ampersand appears between them, and everything lifts away.'),
  wedding('light-leak', 'Film light leak', 'Cinematic', 'A warm film light leak sweeps across the date, like the first frame of a wedding film.'),
  wedding('pages', 'Open the book', 'Classic', 'The page is a closed invitation booklet. Its two covers swing open from the spine.'),
  wedding('ribbon', 'Satin ribbon', 'Elegant', 'A satin ribbon wraps the screen and ties into a bow. The bow unties and the ribbon slips away.'),
  wedding('polaroid', 'Instant photo', 'Nostalgic', 'An instant photo drops in and develops from dark to full colour, then grows into the page.'),
  wedding('toast', 'The toast', 'Celebratory', 'Two champagne flutes meet with a sparkle as "Cheers to" your names appears.'),
  wedding('doors', 'Chapel doors', 'Grand', 'Tall panelled doors with brass handles swing open into warm light.'),
  wedding('vellum', 'Vellum overlay', 'Refined', 'Your names are printed on a sheet of frosted vellum over the page, which then lifts off.'),
  wedding('foil-press', 'Foil press', 'Luxe', 'A press comes down on thick paper and lifts, leaving your names debossed in gold foil that shimmers once.'),
  wedding('ink-wash', 'Ink wash', 'Artful', 'Drops of ink land on the paper and bloom into a soft watercolour wash behind your names.'),
  wedding('aisle', 'Down the aisle', 'Romantic', 'Candles light one by one down an aisle toward your names, then the camera walks forward.'),
  wedding('lace', 'Lace', 'Delicate', 'Two scalloped lace panels frame your names, then sway and part like curtains.'),
  wedding('letter', 'Folded letter', 'Classic', 'A tri-folded letter lands and unfolds panel by panel: families, names, then date and venue.'),
  party('countdown', 'Countdown pop', 'Playful', 'A 3, 2, 1 countdown with a ring timer, then "Let\'s go!" and a confetti burst blows the cover away.'),
  party('balloon', 'Balloon pop', 'Playful', 'A balloon floats up and wobbles, then pops. The page bursts out from the pop point.'),
  party('candle', 'Make a wish', 'Sweet', 'A candle flickers in the dark, the flame blows out with a puff of smoke, and the lights come up on the party.'),
  party('stickers', 'Sticker slap', 'Loud', 'Stickers slap onto the screen one after another, the heading last and biggest, then peel away and fall off.'),
  party('gift-box', 'Gift box', 'Playful', 'A present shakes, the lid pops off with confetti, and the box drops away.'),
  party('disco', 'Disco ball', 'Night', 'A disco ball drops in, coloured lights swirl, the heading flashes, then the lights come on.'),
  party('popper', 'Party poppers', 'Loud', 'Two poppers in the corners fire confetti and ribbons into the middle, and the page drops in.'),
  party('marquee-lights', 'Marquee lights', 'Showtime', 'A sign with the heading drops in and its bulbs light up one by one around it.'),
  party('bouncy', 'Bouncy letters', 'Playful', 'Each letter of the heading drops in and bounces, then they all jump off the top.'),
  party('slot', 'Jackpot', 'Fun', 'A slot machine per word spins and lands on the heading, with a confetti win.'),
  party('champagne', 'Champagne pop', 'Night out', 'A bottle shakes, the cork flies, and bubbles fizz up and wash the cover away.'),
  party('fireworks', 'Fireworks', 'Big night', 'Fireworks burst in the night sky behind "Party tonight".'),
  party('neon', 'Neon sign', 'Club', 'The heading as a neon sign buzzes and flickers to life, then the lights come up.'),
  party('vinyl', 'Drop the needle', 'Music', 'A record spins in, the needle drops, and the heading comes up as "Now playing".'),
  party('ticket-tear', 'Ticket tear', 'VIP', 'An "Admit one" ticket with the heading drops in, its stub tears off, and you\'re in.'),
  party('pinata', 'Piñata', 'Fiesta', 'A star piñata swings in, takes two hits, and bursts into pieces and confetti.'),
  party('photo-booth', 'Photo booth', 'Fun', 'Three camera flashes, and a photo strip prints out with each shot developing.'),
  party('splash', 'Make a splash', 'Summer', '"Make a splash!" pops in, then a wave rises with bubbles and washes the cover away.'),
  party('karaoke', 'Karaoke', 'Sing-along', 'Lyrics fill in word by word like a karaoke screen, then a "100 Perfect!" score pops.'),
  party('bunting', 'Banderitas', 'Fiesta', 'Strings of colourful fabric bunting drop in and flutter like a fiesta, then lift away to reveal the page.'),
  business('counter', 'Loading counter', 'Modern', 'A big 0–100 counter with a hairline progress bar, then the cover slides up with a slight skew.'),
  business('split-title', 'Split title', 'Editorial', 'The event name rises line by line from behind a mask, then the cover splits through the middle.'),
  business('tiles', 'Tile cascade', 'Structured', 'The name fades, then a grid of tiles flips away in a diagonal wave.'),
  business('kinetic', 'Kinetic type', 'Bold', 'Rows of the event name glide in opposite directions, collapse into one line, and clear the stage.'),
  business('blinds', 'Blinds', 'Structured', 'The name spaces out, then twelve horizontal blinds tilt open in sequence.'),
  business('line-expand', 'Line to window', 'Minimal', 'A hairline draws across with the date beneath, then opens into a panel that slides away.'),
  business('typewriter', 'Typewriter', 'Tech', 'The date and event name type out with a blinking caret, then the cover slides off to the left.'),
  business('stack-cards', 'Card stack', 'Modern', 'A card for each item of your program (or samples that suit your event) stacks up, fans out, and flies off.'),
  business('scramble', 'Decoder', 'Tech', 'The event name scrambles through random characters and locks into place, then wipes away.'),
  business('zoom-through', 'Zoom through the ring', 'Bold', 'The camera zooms through the hole in a ring and comes out on the site.'),
  business('badge', 'Lanyard badge', 'Conference', 'An event badge swings down on its lanyard, settles, then lifts away with the cover.'),
  business('blueprint', 'Blueprint grid', 'Structured', 'A grid draws itself and a frame forms around the event name, like a technical drawing.'),
  business('spotlight', 'Spotlight', 'Keynote', 'A stage spotlight searches the dark, lands on the title, then widens to light the whole page.'),
  business('aurora', 'Aurora', 'Modern', 'Soft gradient lights drift and blend while the title rises line by line.'),
  business('stats', 'By the numbers', 'Data', 'The programme\'s numbers count up (days, sessions, speakers), then the cover lifts.'),
  business('ribbon-cut', 'Ribbon cutting', 'Launch', 'Scissors cut a ribbon stretched between gold posts, the ends fall away, and "Now open" appears.'),
  business('split-flap', 'Departure board', 'Travel', 'Split-flap tiles flip through letters and settle on the event name, date and venue.'),
  business('globe', 'Globe', 'Global', 'A dotted globe turns with pulsing city points, then the camera dives in.'),
  business('keynote', 'Keynote slide', 'Keynote', 'A presentation slide moves from "Welcome" to the title slide, then expands into the page.'),
  business('network', 'Network', 'Connect', 'Points appear and connect into a network around the event name.'),
  memorial('wreath-seal', 'Wreath seal', 'Quiet', 'An envelope sealed with wax and a pressed wreath. Light moves across the wax, the flap lifts, and the card dissolves into the page.'),
  memorial('candlelight', 'Candlelight', 'Warm', 'A single candle is lit in a dark room. Its warm glow grows until it fills the page.'),
  memorial('dove', 'Dove', 'Hopeful', 'A white dove flies across "Forever in our hearts", lifting the cover as it rises.'),
  memorial('portrait', 'Portrait', 'Personal', 'An oval portrait develops out of soft light, the name appears beneath, and the oval opens into the page.'),
  memorial('dates', 'Name & years', 'Dignified', 'The name comes into focus, the years appear on either side, and a fine line joins them.'),
  memorial('lily', 'Lily', 'Gentle', 'A single calla lily draws itself in fine line, takes a wash of colour, then lifts away.'),
  memorial('first-light', 'First light', 'Hopeful', 'Night turns to dawn as a soft sun rises over the horizon behind the name.'),
  memorial('mist', 'Morning mist', 'Calm', 'Soft mist drifts apart and the name comes slowly into focus.'),
  memorial('verse', 'Verse', 'Reflective', 'A short line of remembrance appears word by word, followed by the name.'),
  memorial('lanterns', 'Lanterns', 'Uplifting', 'Paper lanterns rise into the evening sky around the name.'),
  memorial('feather', 'Feather', 'Gentle', 'A single white feather drifts down slowly as the name appears.'),
  memorial('album', 'Photo album', 'Personal', 'Three sepia photos are laid down one by one, followed by the name.'),
  memorial('stars', 'Among the stars', 'Hopeful', 'Stars come out one by one, a single star shines brighter, and the name appears.'),
  memorial('ripple', 'Ripple', 'Calm', 'A drop falls into still water and the ripples gently open into the page.'),
  memorial('butterfly', 'Butterfly', 'Uplifting', 'A butterfly flutters up around the name, then flies away as the page appears.'),
  memorial('after-rain', 'After the rain', 'Hopeful', 'Rain runs down the glass, slows and stops, warm light breaks through, and the name comes into focus.'),
  memorial('tree', 'Tree of life', 'Legacy', 'A tree grows branch by branch and comes into leaf above the name.'),
  memorial('sampaguita', 'Sampaguita garland', 'Filipino', 'A garland of sampaguita flowers forms a circle around the name, one flower at a time.'),
  memorial('paper-boat', 'Paper boat', 'Peaceful', 'A small paper boat drifts across calm water toward the centre.'),
  memorial('bokeh', 'Soft lights', 'Warm', 'Soft warm lights drift into focus around the name.'),
]

export const motionIntensityLabels: Record<MotionIntensity, string> = { subtle: 'Subtle', normal: 'Normal', bold: 'Bold' }

/** The motion a new website starts with, by the kind of event. */
export function motionForEventType(type: EventType | undefined): SiteMotion {
  switch (eventKindFor(type)) {
    case 'wedding':
      return { intro: 'envelope', intensity: 'bold' }
    case 'party':
      return { intro: 'countdown', intensity: 'bold' }
    case 'business':
      return { intro: 'counter', intensity: 'bold' }
    case 'memorial':
      return { intro: 'wreath-seal', intensity: 'bold' }
    default:
      return defaultSiteMotion
  }
}

const oneOf = <K extends string>(keys: readonly K[], value: unknown, fallback: K): K => keys.includes(value as K) ? value as K : fallback

// Intros replaced by another, so websites saved with them keep a similar one (Glow sticks became Banderitas)
const renamedIntros: Record<string, PageIntroKey> = { 'glow-sticks': 'bunting' }

/**
 * The motion with anything missing or unknown set to the default, and a replaced intro as its replacement. Also reads
 * `transition`, the intro's first name, which a few websites were saved with; any other fields (earlier scroll
 * animations) are dropped.
 */
export function normalizeSiteMotion(motion?: object | null): SiteMotion {
  const fields = (motion ?? {}) as Record<string, unknown>
  const intro = fields.intro ?? fields.transition
  return {
    intro: oneOf(pageIntroKeys, renamedIntros[String(intro)] ?? intro, defaultSiteMotion.intro),
    intensity: oneOf(motionIntensities, fields.intensity, defaultSiteMotion.intensity),
  }
}
