// The toolkit the scene intros (wedding.ts, party.ts, business.ts, memorial.ts) are drawn and played with: DOM built
// from HTML strings inside the intro's layer, moved with the Web Animations API. Every duration and delay goes through
// the kit so the intensity (`scale`) applies, and everything stops at once when the intro is skipped.
//
// Colours come from the site theme through short names the scene wrapper sets (see `.intro-scene` in site-motion.css):
// --p primary, --a accent (the secondary without one), --a-text the accent as small text on a light surface
// (contrast-checked; use it for labels on paper or a veil, never --a), --a2 secondary, --pop the accent or else the
// primary (use it, not --a, for anything on or next to --a2: without an accent --a is the secondary), --bgS page
// background, --on text on primary, --on2 text on secondary, --txt text, --p-text the primary as text on the page background (contrast-checked), --a-on-p the accent as it reads on the primary, --seal a deep primary for wax, --hero-bg and
// --hero-heading the hero's background and heading colours (PageIntroScene sets them from `heroBackground`; the
// primary's without a hero); fonts --f-display / --f-script (the heading font) and --f-body.
// Natural colours (paper, wax light, flame, glass, night sky) stay as they are.

import type { SectionBackground } from '~/features/sections/section.type'
import type { EventKind } from '~/site-theme/eventKinds'

/** What a scene shows, from the event's website (`introContentFor`). Host text: always put it in HTML with `esc`. */
export interface IntroContent {
  // The hero's heading, or the event's name ("Bea & Carlo", "Mika turns 7!", "Northwind Summit 2027")
  title: string
  // The hero's eyebrow, when it has one ("Together with their families")
  eyebrow?: string
  // "B & C" for two names, else the title's first letters ("M", "NS")
  initials: string
  // The title's first word, without punctuation ("Bea", "Mika", "Northwind")
  firstName: string
  // Dates are always month, day, year: "Sunday, February 14, 2027"
  dateLong?: string
  // "02 · 14 · 2027"
  dateNumeric?: string
  // The hero's venue
  venue?: string
  // A memorial's life dates as its hero shows them ("1938 – 2026" or "1 May 1938 – 3 October 2026"), or none when the
  // hero leaves them out; scenes leave the line out without them
  lifeDates?: string
  // The program's item titles, in order (the card stack shows them all)
  programTitles: string[]
  // The program's numbers: days, sessions, speakers (only those above zero)
  stats: { value: number, label: string }[]
  // The kind of event, for scenes that fall back to sample text that suits it (the card stack's titles)
  kind: EventKind
  // The background the hero renders with (a photo background without a photo is primary), for scenes that match it
  heroBackground?: SectionBackground
}

export interface SceneContext {
  // Where the scene draws: fills the intro, above the page
  layer: HTMLElement
  content: IntroContent
  // The site's page under the intro; `kit.reveal()` brings it in as the cover leaves
  page: HTMLElement | null
  // Multiplies every duration and delay: the intensity (0.6 / 1 / 1.3)
  scale: number
}

/** A scene plays once and resolves when the page is uncovered. */
export type Scene = (ctx: SceneContext, kit: SceneKit) => Promise<void>

export const EASE = 'cubic-bezier(.76,0,.24,1)'
export const OUT = 'cubic-bezier(.22,1,.36,1)'

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }
/** Host text made safe for an HTML string (names, dates, venues). */
export function esc(text: string | number | undefined): string {
  return String(text ?? '').replace(/[&<>"']/g, char => HTML_ESCAPES[char]!)
}

export interface SceneKit {
  /** Animate `target` (fill forwards, OUT easing and 600 ms unless given); resolves when it ends or the intro stops. */
  A: (target: Element, keyframes: Keyframe[], options?: KeyframeAnimationOptions) => Promise<void>
  /** Waits `ms` (scaled). */
  wait: (ms: number) => Promise<void>
  /** Calls `frame` with progress 0…1 on every animation frame for `ms` (scaled), for things keyframes can't do. */
  tween: (ms: number, frame: (k: number) => void) => Promise<void>
  /** One element from HTML (its first element). Put host text in with `esc`. */
  el: <T extends HTMLElement = HTMLElement>(html: string) => T
  /** A unique id for SVG gradients, filters and masks, so two scenes never share one. */
  uid: (prefix?: string) => string
  /** Brings the site's page in (a short rise and fade), as the cover starts to leave. */
  reveal: () => void
  /** The layer's size in px. */
  size: () => { width: number, height: number }
  /** True once the intro was skipped or removed: long loops should stop. */
  stopped: () => boolean
  /**
   * A burst of confetti from (x, y), fractions of the layer, in the theme's colours; all round, or `aim`ed one way.
   * Resolves once it's gone: an aimed burst falls all the way down, so a scene awaits it before it ends.
   */
  confetti: (x?: number, y?: number, count?: number, aim?: ConfettiAim) => Promise<void>
}

/**
 * A burst aimed one way, like a popper's: `angle` in degrees from straight up (clockwise), `spread` the cone's width in
 * degrees, `distance` about how far (px) the farthest pieces fly before they flutter down, `size` scales the pieces,
 * `colours` the scene colours to use (default `--a`, `--a2`, `--p`, `--pop`; leave out the background's, e.g. `--p` on
 * a primary cover). Mixed shapes: strips, squares, dots and stars.
 */
export interface ConfettiAim { angle: number, spread: number, distance: number, size?: number, colours?: string[] }

let nextId = 0

export function createSceneKit(ctx: SceneContext): SceneKit & { stop: () => void } {
  let stopped = false
  const scaled = (ms: number | undefined) => Math.max(0, (ms ?? 0) * ctx.scale)
  const canAnimate = typeof Element !== 'undefined' && typeof Element.prototype.animate === 'function'
  const frame = (callback: FrameRequestCallback) =>
    typeof requestAnimationFrame === 'function' ? requestAnimationFrame(callback) : setTimeout(() => callback(performance.now()), 16)

  const kit: SceneKit & { stop: () => void } = {
    A(target, keyframes, options = {}) {
      if (stopped || !canAnimate)
        return Promise.resolve()
      const duration = typeof options.duration === 'number' ? options.duration : 600
      const animation = target.animate(keyframes, {
        easing: OUT,
        fill: 'forwards',
        ...options,
        duration: scaled(duration),
        delay: scaled(options.delay),
      })
      return animation.finished.then(() => {}, () => {})
    },
    wait(ms) {
      if (stopped)
        return Promise.resolve()
      return new Promise(resolve => setTimeout(resolve, scaled(ms)))
    },
    tween(ms, onFrame) {
      const length = scaled(ms)
      if (stopped || length <= 0) {
        onFrame(1)
        return Promise.resolve()
      }
      return new Promise((resolve) => {
        const start = performance.now()
        const step = (now: number) => {
          if (stopped)
            return resolve()
          const k = Math.min(1, Math.max(0, (now - start) / length))
          onFrame(k)
          if (k < 1)
            frame(step)
          else
            resolve()
        }
        frame(step)
      })
    },
    el<T extends HTMLElement = HTMLElement>(html: string) {
      const template = document.createElement('template')
      template.innerHTML = html.trim()
      return template.content.firstElementChild as T
    },
    uid(prefix = 'is') {
      nextId += 1
      return `${prefix}${nextId}`
    },
    reveal() {
      if (stopped || !canAnimate || !ctx.page)
        return
      ctx.page.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: scaled(600), easing: OUT })
    },
    size() {
      const rect = ctx.layer.getBoundingClientRect()
      return { width: rect.width || 360, height: rect.height || 640 }
    },
    stopped: () => stopped,
    confetti(x = 0.5, y = 0.5, count = 90, aim) {
      return confetti(kit, ctx.layer, x, y, count, ctx.scale, aim)
    },
    stop() {
      stopped = true
      if (canAnimate)
        ctx.layer.getAnimations?.({ subtree: true }).forEach(animation => animation.cancel())
    },
  }
  return kit
}

/** A tiling grain as a CSS background image (paper, wax, a dark room). */
export function NOISE(frequency = 0.85, alpha = 0.25, size = 160): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="${frequency}" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${alpha} 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`
  return `url('data:image/svg+xml,${encodeURIComponent(svg)}')`
}

/** A paper surface as a `background:` declaration (with its trailing semicolon). */
export function PAPER(from = '#FFFEFB', to = '#EFE8DD', angle = 165): string {
  return `background:${NOISE(0.85, 0.14)},linear-gradient(${angle}deg,${from},${to});`
}

/** A seeded random number generator (0…1), so a scene looks the same every time. */
export function rng(seed: number): () => number {
  let state = seed
  return () => (state = (state * 16807) % 2147483647) / 2147483647
}

/** Where a seal's light starts (an SVG azimuth: 180 is the left, 270 the top). */
export const SEAL_LIGHT = 190

/**
 * A wax seal as SVG: an irregular poured edge, a raised stamp rim and an embossed motif (a wreath, or `text` such as
 * the initials, already escaped), lit with SVG lighting so it reads as real wax, the light from the left
 * (`SEAL_LIGHT`). Move the light with `sweepLight`.
 */
export function sealSVG(kit: SceneKit, { motif = 'wreath', text = '', seed = 7, color = 'var(--seal)' }: { motif?: 'wreath' | 'text', text?: string, seed?: number, color?: string } = {}): string {
  const id = kit.uid('seal')
  const R = rng(seed * 997 + 13)
  const [p1, p2, p3] = [R() * 6, R() * 6, R() * 6]
  let edge = ''
  for (let i = 0; i <= 90; i++) {
    const t = i / 90 * Math.PI * 2
    const r = 86 + 3.4 * Math.sin(t * 4 + p1) + 2.4 * Math.sin(t * 7 + p2) + 1.2 * Math.sin(t * 13 + p3)
    edge += `${i ? 'L' : 'M'}${(100 + r * Math.cos(t)).toFixed(1)} ${(100 + r * Math.sin(t)).toFixed(1)}`
  }
  let mark = ''
  if (motif === 'wreath') {
    for (let i = 0; i < 34; i++) {
      const a = i / 34 * 360
      const rad = a * Math.PI / 180
      const side = i % 2 ? 1 : -1
      const rr = 46 + side * 5.5
      const x = (100 + rr * Math.cos(rad)).toFixed(1)
      const y = (100 + rr * Math.sin(rad)).toFixed(1)
      mark += `<ellipse cx="${x}" cy="${y}" rx="6.4" ry="2.5" transform="rotate(${(a + 90 + side * 40).toFixed(1)} ${x} ${y})"/>`
    }
    for (let k = 0; k < 7; k++) {
      const a = (k * 360 / 7 + 20) * Math.PI / 180
      const x = 100 + 46 * Math.cos(a)
      const y = 100 + 46 * Math.sin(a)
      mark += [[0, 0], [3.6, 1.4], [-1.4, 3.6], [2.2, -3.4], [-3.2, -1.2]].map(([dx, dy]) => `<circle cx="${(x + dx!).toFixed(1)}" cy="${(y + dy!).toFixed(1)}" r="2.1"/>`).join('')
    }
    mark += `<circle cx="100" cy="100" r="46" fill="none" stroke-width="1.5" style="stroke:${color}"/>`
  }
  else {
    // Long text shrinks to fit the stamp
    const fontSize = Math.min(52, Math.round(180 / Math.max(1, text.replace(/&[a-z#0-9]+;/gi, '&').length) * 1.6))
    mark = `<text x="100" y="${100 + fontSize * 0.3}" text-anchor="middle" style="font-family:var(--f-script);font-size:${fontSize}px">${text}</text>`
  }
  const filter = (name: string, blur: number, surface: number, noise: number) => `<filter id="${id}${name}" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="${blur}" result="b"/>
    <feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="${seed}" result="t"/>
    <feComposite in="b" in2="t" operator="arithmetic" k2="1" k3="${noise}" result="h"/>
    <feDiffuseLighting in="h" surfaceScale="${surface}" diffuseConstant="1.25" lighting-color="#fff" result="df"><feDistantLight class="lt" azimuth="${SEAL_LIGHT}" elevation="50"/></feDiffuseLighting>
    <feSpecularLighting in="h" surfaceScale="${surface}" specularConstant=".8" specularExponent="26" lighting-color="#fff" result="sp"><feDistantLight class="lt" azimuth="${SEAL_LIGHT}" elevation="38"/></feSpecularLighting>
    <feBlend in="SourceGraphic" in2="df" mode="multiply" result="lit"/>
    <feComposite in="lit" in2="SourceAlpha" operator="in" result="lit2"/>
    <feComposite in="sp" in2="SourceAlpha" operator="in" result="sp2"/>
    <feComposite in="lit2" in2="sp2" operator="arithmetic" k2="1" k3=".9"/></filter>`
  return `<svg viewBox="0 0 200 200" style="width:100%;height:100%;overflow:visible;filter:drop-shadow(0 1.5px 1px rgba(0,0,0,.35)) drop-shadow(0 8px 10px rgba(0,0,0,.2))">
    <defs>${filter('o', 6, 7, 0.3)}${filter('r', 1.8, 4, 0.15)}${filter('m', 0.8, 2.4, 0.08)}
      <radialGradient id="${id}g" cx="58%" cy="60%" r="62%"><stop offset="72%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".28"/></radialGradient></defs>
    <path d="${edge}Z" style="fill:${color}" filter="url(#${id}o)"/>
    <circle cx="100" cy="100" r="60" fill="url(#${id}g)"/>
    <circle cx="100" cy="100" r="64" fill="none" stroke-width="8" style="stroke:${color}" filter="url(#${id}r)"/>
    <g style="fill:${color}" filter="url(#${id}m)">${mark}</g></svg>`
}

/**
 * Moves the light across a seal (or anything with `.lt` lights) to `to` so the wax catches a glint. It starts where the
 * light already is, so the wax never jumps to another light first.
 */
export function sweepLight(kit: SceneKit, root: Element, to = 300, ms = 1000): Promise<void> {
  const lights = root.querySelectorAll('.lt')
  const from = Number(lights[0]?.getAttribute('azimuth') ?? SEAL_LIGHT)
  return kit.tween(ms, (k) => {
    const eased = 0.5 - 0.5 * Math.cos(k * Math.PI)
    lights.forEach(light => light.setAttribute('azimuth', (from + (to - from) * eased).toFixed(1)))
  })
}

const SHAPES = ['strip', 'square', 'dot', 'star'] as const

function star(context: CanvasRenderingContext2D, radius: number) {
  context.beginPath()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? radius * 0.45 : radius
    const a = i * Math.PI / 5 - Math.PI / 2
    context.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  context.fill()
}

function confetti(kit: SceneKit, layer: HTMLElement, x: number, y: number, count: number, scale: number, aim?: ConfettiAim): Promise<void> {
  const canvas = kit.el<HTMLCanvasElement>('<canvas class="fill"></canvas>')
  const context = canvas.getContext?.('2d')
  if (!context)
    return Promise.resolve()
  layer.append(canvas)
  const { width, height } = kit.size()
  // Drawn at the screen's pixel density but shown at the layer's size (a canvas is otherwise shown at its pixel size, so
  // on a 2x screen the burst would be twice as big and off towards the bottom right)
  const ratio = window.devicePixelRatio || 1
  canvas.width = width * ratio
  canvas.height = height * ratio
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  context.scale(ratio, ratio)
  const style = getComputedStyle(layer)
  // An aimed burst (on the page's light background) leaves out white
  const colours = (aim ? aim.colours ?? ['--a', '--a2', '--p', '--pop'] : ['--a', '--a2', '--p']).map(name => style.getPropertyValue(name).trim()).filter(Boolean)
  if (!aim)
    colours.push('#FFFFFF')
  const random = Math.random
  const size = aim?.size ?? 1
  const pieces = Array.from({ length: count }, () => {
    // Aimed: anywhere in the cone, fast enough to fly up to `distance` against the drag; else all round
    const angle = aim ? (aim.angle - 90 + (random() - 0.5) * aim.spread) * Math.PI / 180 : random() * Math.PI * 2
    const speed = aim ? aim.distance * (0.25 + random() * 0.75) / 30 : 4 + random() * 7
    const shape = aim ? SHAPES[Math.floor(random() * SHAPES.length)]! : 'square'
    const [w, h] = shape === 'strip' ? [3 * size, (10 + random() * 6) * size] : [(5 + random() * 6) * size, (3 + random() * 4) * size]
    // Aimed pieces fall at their own speed (reaching the bottom in about 1.5 s whatever the screen) and sway as they go
    const fall = height / 90 * (0.8 + random() * 0.45)
    return { x: width * x, y: height * y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - (aim ? 0 : 4), w, h, shape, r: random() * 6, vr: (random() - 0.5) * 0.4, c: colours[Math.floor(random() * colours.length)]!, fall, sway: random() * 6, swaySpeed: 0.05 + random() * 0.05 }
  })
  // Steps are per 60 Hz frame, scaled by the time that passed (so the confetti moves the same on a 120 Hz screen) and by
  // the intensity (faster when the intro is shorter), so the burst always lands as its time runs out
  let last = performance.now()
  let frames = 0
  return kit.tween(aim ? 2700 : 1800, (k) => {
    const now = performance.now()
    const dt = Math.min(3, (now - last) / (1000 / 60) / Math.max(0.1, scale))
    last = now
    frames += dt
    context.clearRect(0, 0, width, height)
    for (const p of pieces) {
      if (aim) {
        // Air drag while it flies up, then it falls to its own speed, swaying
        p.vx *= 0.967 ** dt
        p.vy = p.vy < 0 ? p.vy * 0.967 ** dt + 0.3 * dt : Math.min(p.vy + 0.3 * dt, p.fall)
        p.x += Math.sin(p.sway + frames * p.swaySpeed) * 0.9 * dt
      }
      else {
        p.vy += 0.22 * dt
        p.vx *= 0.99 ** dt
      }
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.r += p.vr * dt
      context.save()
      // Aimed: each piece fades over the bottom quarter of the screen, so it falls all the way and melts away (and anything
      // still in the air fades in the last moment); all round: the burst fades as it goes
      context.globalAlpha = aim ? Math.max(0, Math.min(1, (height - p.y) / (height * 0.25), (1 - k) / 0.08)) : Math.max(0, 1 - k)
      context.translate(p.x, p.y)
      context.rotate(p.r)
      context.fillStyle = p.c
      if (p.shape === 'dot') {
        context.beginPath()
        context.arc(0, 0, p.w / 2, 0, Math.PI * 2)
        context.fill()
      }
      else if (p.shape === 'star') {
        star(context, p.w * 0.75)
      }
      else {
        context.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      }
      context.restore()
    }
  }).then(() => canvas.remove())
}
