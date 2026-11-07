import type { MotionIntensity, PageIntroKey, SiteMotion } from './site-motion.type'

// How long each intro plays (see site-motion.type.ts) and how `intensity` scales it. The scenes time their own steps
// (scenes/); these lengths are what they measure at normal intensity, for the timers that end an intro that stalls or
// runs without script (`motionVars`).

/** `intensity` multiplies the intro's duration. */
export const intensityScale: Record<MotionIntensity, number> = { subtle: 0.6, normal: 1, bold: 1.3 }

export interface IntroPreset {
  // ms, at normal intensity
  duration: number
}

export const introPresets: Record<PageIntroKey, IntroPreset> = {
  'none': { duration: 0 },
  // Scenes (scenes/): how long each plays at normal intensity, as measured; the scene itself times its steps
  'shutter': { duration: 2300 },
  'film-strip': { duration: 3000 },
  'card-flip': { duration: 3200 },
  'stamp': { duration: 3000 },
  'calendar': { duration: 3200 },
  'pin-drop': { duration: 3300 },
  'assemble': { duration: 2900 },
  'color-bands': { duration: 3100 },
  'orbit': { duration: 3100 },
  'word-cycle': { duration: 2900 },
  'paper-tear': { duration: 2600 },
  'brush': { duration: 2900 },
  'stardust': { duration: 3000 },
  'window-light': { duration: 3300 },
  'frosted-glass': { duration: 2600 },
  'accordion': { duration: 2900 },
  'date-roll': { duration: 3000 },
  'focus-pull': { duration: 2500 },
  'ribbon-tape': { duration: 2800 },
  'counter-scroll': { duration: 3500 },
  'envelope': { duration: 3700 },
  'signature': { duration: 2600 },
  'veil': { duration: 2800 },
  'wax-seal': { duration: 2400 },
  'ring-box': { duration: 4600 },
  'golden-frame': { duration: 2700 },
  'bloom': { duration: 2300 },
  'meet': { duration: 2500 },
  'light-leak': { duration: 2200 },
  'pages': { duration: 2500 },
  'ribbon': { duration: 4200 },
  'polaroid': { duration: 2800 },
  'toast': { duration: 2700 },
  'doors': { duration: 2500 },
  'vellum': { duration: 3900 },
  'foil-press': { duration: 3800 },
  'ink-wash': { duration: 3400 },
  'aisle': { duration: 3200 },
  'lace': { duration: 2800 },
  'letter': { duration: 3400 },
  'countdown': { duration: 3100 },
  'balloon': { duration: 2700 },
  'candle': { duration: 3200 },
  'stickers': { duration: 2800 },
  'gift-box': { duration: 3800 },
  'disco': { duration: 2200 },
  'popper': { duration: 3500 },
  'marquee-lights': { duration: 2300 },
  'bouncy': { duration: 2600 },
  'slot': { duration: 3900 },
  'champagne': { duration: 2500 },
  'fireworks': { duration: 2900 },
  'neon': { duration: 2600 },
  'vinyl': { duration: 3000 },
  'ticket-tear': { duration: 2300 },
  'pinata': { duration: 3200 },
  'photo-booth': { duration: 3800 },
  'splash': { duration: 2900 },
  'karaoke': { duration: 3000 },
  'bunting': { duration: 3300 },
  'counter': { duration: 2000 },
  'split-title': { duration: 2100 },
  'tiles': { duration: 2200 },
  'kinetic': { duration: 2500 },
  'blinds': { duration: 2100 },
  'line-expand': { duration: 2600 },
  'typewriter': { duration: 3200 },
  'stack-cards': { duration: 2900 },
  'scramble': { duration: 2300 },
  'zoom-through': { duration: 1800 },
  'badge': { duration: 2500 },
  'blueprint': { duration: 3300 },
  'spotlight': { duration: 2800 },
  'aurora': { duration: 3100 },
  'stats': { duration: 2900 },
  'ribbon-cut': { duration: 3000 },
  'split-flap': { duration: 2800 },
  'globe': { duration: 2900 },
  'keynote': { duration: 3000 },
  'network': { duration: 2900 },
  'wreath-seal': { duration: 5200 },
  'candlelight': { duration: 3500 },
  'dove': { duration: 2600 },
  'portrait': { duration: 2900 },
  'dates': { duration: 3600 },
  'lily': { duration: 3800 },
  'first-light': { duration: 2900 },
  'mist': { duration: 3100 },
  'verse': { duration: 4000 },
  'lanterns': { duration: 3000 },
  'feather': { duration: 3500 },
  'album': { duration: 3900 },
  'stars': { duration: 3600 },
  'ripple': { duration: 3100 },
  'butterfly': { duration: 3400 },
  'after-rain': { duration: 3600 },
  'tree': { duration: 3600 },
  'sampaguita': { duration: 3600 },
  'paper-boat': { duration: 3500 },
  'bokeh': { duration: 3400 },
}

/** With reduced motion every intro is a short fade. */
export const REDUCED_INTRO_MS = 200

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** The intro's length at this intensity, ms. */
export function introDuration(key: PageIntroKey, intensity: MotionIntensity): number {
  return Math.round(introPresets[key].duration * intensityScale[intensity])
}

/** The custom property the intro's CSS reads (its timer without script), set on the site's root. */
export function motionVars(motion: SiteMotion): Record<string, string> {
  return { '--motion-intro-duration': `${introDuration(motion.intro, motion.intensity)}ms` }
}
