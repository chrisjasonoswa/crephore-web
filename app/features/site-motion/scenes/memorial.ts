import type { IntroContent, Scene, SceneKit } from './scene.kit'
import { ensureDark, normalizeHex } from '~/site-theme/color'
import { esc, NOISE, OUT, PAPER, rng, sealSVG, sweepLight } from './scene.kit'

// Memorial scenes (site-motion.type.ts `sceneIntroKeys.memorial`), from the intros reference. Quiet and slow; the name
// is the hero's heading, the life dates under it as the hero shows them (none when it leaves them out).

// The small label above the name: the hero's eyebrow, or the scene's own phrase
const label = (content: IntroContent, phrase: string) => esc(content.eyebrow || phrase)

// A name's font size: as designed for short names, smaller for long ones so they still fit
function nameSize(title: string, base: number): number {
  const length = Math.max(1, title.length)
  return Math.max(Math.round(base * 0.55), Math.round(base * Math.min(1, 16 / length)))
}

// The name, wrapping and shrinking to fit
const nameStyle = (title: string, base: number) =>
  `font-family:var(--f-display);font-size:${nameSize(title, base)}px;overflow-wrap:anywhere;text-wrap:balance`

// The life dates' usual look: small, spaced, softer than the name
const LIFE_DATES = 'font:500 11px var(--f-body);letter-spacing:.24em;opacity:.7;margin-top:6px'

// The life dates under a name, or nothing without them
const lifeDatesLine = (content: IntroContent, style = LIFE_DATES) =>
  content.lifeDates ? `<div style="${style}">${esc(content.lifeDates)}</div>` : ''

// An endless loop (a flame's flicker, wings): durations follow the intensity, and it stops with the intro
function loop(kit: SceneKit, scale: number, target: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions = {}) {
  if (kit.stopped() || typeof target.animate !== 'function')
    return
  const duration = typeof options.duration === 'number' ? options.duration : 600
  target.animate(keyframes, { ...options, duration: duration * scale, delay: (options.delay ?? 0) * scale, iterations: Infinity })
}

// Wreath seal: an envelope sealed with wax and a pressed wreath; light moves across the wax, the flap lifts, and the
// card dissolves into the page
const wreathSeal: Scene = async ({ layer, content }, kit) => {
  const { A, el, wait, reveal } = kit
  const P = PAPER('#FFFFFF', '#E6E3DF', 172)
  const sc = el(`<div class="fill">
     <div class="fill" style="background:${NOISE(0.8, 0.1)},linear-gradient(180deg,#CFCAC3,#BDB7AF)"></div>
     <div class="cd" style="position:absolute;left:7%;right:7%;top:12%;height:78%;${PAPER('#FFFFFF', '#F4F2EE')}box-shadow:0 1px 3px rgba(0,0,0,.18);display:flex;flex-direction:column;align-items:center;padding:15% 16px 0;text-align:center;color:var(--txt)">
        <div style="font:600 8px var(--f-body);letter-spacing:.32em;text-transform:uppercase;color:var(--p);opacity:.75">${label(content, 'In loving memory')}</div>
        <div style="${nameStyle(content.title, 32)};line-height:1.1;margin-top:6px">${esc(content.title)}</div>
        ${lifeDatesLine(content, 'font-family:var(--f-display);font-size:13px;letter-spacing:.18em;margin-top:2px')}</div>
     <div style="position:absolute;inset:0;clip-path:polygon(0 24%,50% 66%,100% 24%,100% 100%,0 100%);${P}filter:drop-shadow(0 -1px 2px rgba(0,0,0,.12))"></div>
     <div class="fl" style="position:absolute;left:0;right:0;top:0;height:58%;transform-origin:50% 0;filter:drop-shadow(0 3px 3px rgba(0,0,0,.15)) drop-shadow(0 12px 16px rgba(0,0,0,.08))">
        <div class="fill" style="clip-path:polygon(0 0,100% 0,100% 50%,51.5% 97%,50% 100%,48.5% 97%,0 50%);${PAPER('#FFFFFF', '#EDEBE7', 178)}"></div>
        <div class="sl" style="position:absolute;left:50%;top:100%;width:176px;height:176px;margin:-104px 0 0 -88px;opacity:0">${sealSVG(kit, { motif: 'wreath', seed: 11 })}</div></div></div>`)
  layer.append(sc)
  const fl = sc.querySelector('.fl')!
  const sl = sc.querySelector('.sl')!
  const cd = sc.querySelector('.cd')!
  await wait(250)
  await A(sl, [{ transform: 'scale(1.3)', opacity: 0, filter: 'blur(3px)' }, { transform: 'scale(.97)', opacity: 1, filter: 'blur(0)', offset: 0.75 }, { transform: 'scale(1)', opacity: 1, filter: 'blur(0)' }], { duration: 800, easing: 'ease-out' })
  await sweepLight(kit, sl, 300, 1100)
  await A(fl, [{ transform: 'perspective(1100px) rotateX(0)' }, { transform: 'perspective(1100px) rotateX(92deg)' }], { duration: 800, easing: 'cubic-bezier(.55,0,.6,1)' })
  await A(cd, [{ transform: 'none' }, { transform: 'translateY(-7%)' }], { duration: 700, easing: OUT })
  await wait(350)
  reveal()
  await A(sc, [{ opacity: 1, filter: 'blur(0)', transform: 'none' }, { opacity: 0, filter: 'blur(6px)', transform: 'scale(1.04)' }], { duration: 1000, easing: 'ease-in-out' })
}

// Candlelight: a single candle is lit in a dark room; its warm glow grows until it fills the page
const candlelight: Scene = async ({ layer, content, scale }, kit) => {
  const { A, el, wait, reveal } = kit
  const room = el(`<div class="fill" style="background:${NOISE(0.7, 0.18)},#100E0C"></div>`)
  layer.append(room)
  const glow = el(`<div style="position:absolute;left:50%;top:44%;width:560px;height:560px;margin:-280px 0 0 -280px;border-radius:50%;background:radial-gradient(circle,rgba(255,200,130,.6),rgba(255,160,80,.2) 32%,transparent 64%);opacity:0"></div>`)
  layer.append(glow)
  const txt = el(`<div style="position:absolute;left:0;right:0;top:15%;padding:0 24px;text-align:center;color:#F4E6CF;opacity:0"><div style="font:600 9px var(--f-body);letter-spacing:.32em;text-transform:uppercase;opacity:.7">${label(content, 'In loving memory')}</div><div style="${nameStyle(content.title, 36)};line-height:1.1;margin-top:4px">${esc(content.title)}</div>${lifeDatesLine(content)}</div>`)
  layer.append(txt)
  const c = el(`<div style="position:absolute;left:50%;top:38%;width:66px;margin-left:-33px;height:280px">
     <div class="fm" style="position:absolute;left:50%;top:0;width:18px;height:44px;margin-left:-9px;border-radius:50% 50% 50% 50% / 64% 64% 36% 36%;background:radial-gradient(ellipse at 50% 78%,#fff 0 14%,#FFEFC0 28%,#FFB54D 56%,rgba(255,110,40,.0) 76%);filter:blur(.5px);transform-origin:50% 90%;opacity:0"></div>
     <div style="position:absolute;left:50%;top:39px;width:2px;height:10px;margin-left:-1px;background:#2A2018;border-radius:1px"></div>
     <div style="position:absolute;left:0;right:0;top:46px;bottom:0;border-radius:6px 6px 3px 3px;background:${NOISE(1, 0.08, 90)},linear-gradient(90deg,#8F8474,#E8DFD1 30%,#FFFCF5 48%,#DCD1BF 72%,#7E7364);box-shadow:inset 0 22px 22px -6px rgba(255,190,110,.55)">
       <div style="position:absolute;left:0;right:0;top:-6px;height:13px;border-radius:50%;background:radial-gradient(ellipse at 50% 40%,#FFF4DA,#E2D3BA 70%)"></div></div></div>`)
  layer.append(c)
  const fm = c.querySelector('.fm')!
  await A(c, [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 600 })
  A(fm, [{ opacity: 0, transform: 'scale(.2)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 500, easing: OUT })
  loop(kit, scale, fm, [{ transform: 'scale(1) skewX(0)' }, { transform: 'scale(1.05,.95) skewX(2deg)' }, { transform: 'scale(.96,1.05) skewX(-2deg)' }, { transform: 'scale(1.02,.98) skewX(1deg)' }, { transform: 'scale(1)' }], { duration: 520, delay: 500 })
  A(glow, [{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 1100, easing: OUT })
  await A(txt, [{ opacity: 0, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 1100, delay: 200 })
  await wait(400)
  reveal()
  await Promise.all([
    A(glow, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(3)' }], { duration: 1100, easing: 'ease-in-out' }),
    A(room, [{ opacity: 1 }, { opacity: 0 }], { duration: 1000, delay: 100, easing: 'ease-in-out' }),
    A(c, [{ opacity: 1 }, { opacity: 0 }], { duration: 700 }),
    A(txt, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 }),
  ])
}

// Dove: a white dove flies across "Forever in our hearts", lifting the cover as it rises
const dove: Scene = async ({ layer, scale }, kit) => {
  const { A, el, reveal, size } = kit
  const cover = el(`<div class="fill" style="background:linear-gradient(180deg,color-mix(in oklab,var(--p),#fff 18%),var(--p))"></div>`)
  layer.append(cover)
  const t = el(`<div class="center"><div style="text-align:center;color:var(--on)"><div style="font-family:var(--f-display);font-style:italic;font-size:30px">Forever in our hearts</div></div></div>`)
  layer.append(t)
  // 110px on a phone, larger on bigger screens (a quarter of a desktop's height), so it never looks lost
  const r = size()
  const bird = Math.round(Math.min(240, Math.max(110, Math.min(r.width * 0.3, r.height * 0.25))))
  const d = el(`<div style="position:absolute;left:0;top:0;width:${bird}px;filter:drop-shadow(0 6px 8px rgba(0,0,0,.25))"><svg viewBox="0 0 104 80" style="width:100%;overflow:visible">
     <path d="M18 42C32 33 56 30 72 35 79 30 88 29 93 32L102 34 94 37C90 41 84 43 77 43 66 51 44 53 30 49L4 58 13 47Z" fill="#fff"/>
     <circle cx="88" cy="33" r="1.4" fill="#2B2F29"/>
     <path class="wu" d="M44 39C38 20 48 5 70 0 66 14 64 27 60 39Z" fill="#F4F2EE"/>
     <path class="wd" d="M44 41C42 58 52 71 70 78 65 63 63 51 60 41Z" fill="#F4F2EE" opacity="0"/></svg></div>`)
  layer.append(d)
  // The wings flap: up and down swap every 170 ms
  loop(kit, scale, d.querySelector('.wu')!, [{ opacity: 1, easing: 'step-end' }, { opacity: 0, easing: 'step-end' }, { opacity: 1 }], { duration: 340 })
  loop(kit, scale, d.querySelector('.wd')!, [{ opacity: 0, easing: 'step-end' }, { opacity: 1, easing: 'step-end' }, { opacity: 0 }], { duration: 340 })
  await A(t.firstElementChild!, [{ opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 800 })
  reveal()
  await Promise.all([
    A(d, [{ transform: `translate(${-1.1 * bird}px,${r.height * 0.82}px) scale(.8) rotate(-18deg)` }, { transform: `translate(${r.width * 0.45}px,${r.height * 0.42}px) scale(1) rotate(-14deg)`, offset: 0.5 }, { transform: `translate(${r.width + 0.6 * bird}px,${-1.1 * bird}px) scale(1.15) rotate(-20deg)` }], { duration: 1700, easing: 'cubic-bezier(.4,0,.6,1)' }),
    A(cover, [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 1100, delay: 500, easing: 'cubic-bezier(.65,0,.35,1)' }),
    A(t, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-40px)' }], { duration: 700, delay: 400 }),
  ])
}

// Portrait: an oval portrait develops out of soft light, the name appears beneath, and the oval opens into the page
const portrait: Scene = async ({ layer, content }, kit) => {
  const { A, el, wait, reveal, size, tween } = kit
  const cover = el(`<div class="fill" style="background:${NOISE(0.8, 0.12)},var(--bgS)"></div>`)
  layer.append(cover)
  // The frame is antique gold like the sepia photo inside, never the theme's colours
  const g = el(`<div class="fill"><div class="ov" style="position:absolute;left:50%;top:40%;width:150px;height:190px;margin:-95px 0 0 -75px;border-radius:50%;padding:7px;border:1px solid #B89B6A">
       <div class="ph" style="width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 50% 40%,#7A6A5A 0 21%,transparent 22%),radial-gradient(70% 45% at 50% 100%,#5F5246 0 70%,transparent 71%),linear-gradient(180deg,#DCD2C4,#B8AA96);filter:sepia(.5)"></div></div>
     <div class="nm" style="position:absolute;left:0;right:0;top:calc(40% + 112px);padding:0 24px;text-align:center;color:var(--txt)"><div style="${nameStyle(content.title, 30)}">${esc(content.title)}</div>${lifeDatesLine(content)}</div></div>`)
  layer.append(g)
  await Promise.all([
    A(g.querySelector('.ph')!, [{ filter: 'sepia(.5) blur(10px) brightness(1.5)', opacity: 0 }, { filter: 'sepia(.5) blur(0) brightness(1)', opacity: 1 }], { duration: 1300, easing: 'ease-out' }),
    A(g.querySelector('.ov')!, [{ transform: 'scale(.96)', borderColor: 'transparent' }, { transform: 'none' }], { duration: 1300 }),
    A(g.querySelector('.nm')!, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: 500 }),
  ])
  await wait(350)
  reveal()
  const ov = g.querySelector('.ov')!.getBoundingClientRect()
  const s = layer.getBoundingClientRect()
  const { width, height } = size()
  const cx = ov.left - s.left + ov.width / 2 || width / 2
  const cy = ov.top - s.top + ov.height / 2 || height * 0.4
  const far = Math.hypot(width, height)
  A(g, [{ opacity: 1 }, { opacity: 0 }], { duration: 500 })
  // The oval grows past the screen's corners, opening the cover onto the page
  await tween(1100, (k) => {
    const e = k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2
    const ry = 95 + e * far
    const mask = `radial-gradient(${(ry * 0.79).toFixed(1)}px ${ry.toFixed(1)}px at ${cx}px ${cy}px, transparent 98%, #000 100%)`
    cover.style.setProperty('-webkit-mask-image', mask)
    cover.style.setProperty('mask-image', mask)
  })
}

// Name & years: the name comes into focus, the years appear on either side, and a fine line joins them
const dates: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const cover = el(`<div class="fill" style="background:var(--p)"></div>`)
  layer.append(cover)
  const [born, died] = (content.lifeDates ?? '').split(' – ')
  // Full dates are longer than years: smaller, with a shorter line between them
  const full = (born?.length ?? 0) > 4
  const line = full ? 36 : 70
  const t = el(`<div class="center"><div style="text-align:center;color:var(--on);padding:0 24px">
     <div class="e" style="font:600 9px var(--f-body);letter-spacing:.32em;text-transform:uppercase;opacity:0">${esc(content.eyebrow || 'In loving memory')}</div>
     <div class="n" style="font-family:var(--f-display);font-size:42px;line-height:1.1;margin:6px 0 14px">${esc(content.title)}</div>
     ${born && died
       ? `<div style="display:flex;align-items:center;justify-content:center;gap:${full ? 8 : 12}px;font-family:var(--f-display);font-size:${full ? 14 : 22}px;letter-spacing:${full ? '.06em' : '.12em'};color:var(--a)">
       <span class="y1">${esc(born)}</span><svg width="${line}" height="2" style="flex:none"><line x1="0" y1="1" x2="${line}" y2="1" stroke="currentColor" stroke-width="1" stroke-dasharray="${line}" stroke-dashoffset="${line}" class="ln"/></svg><span class="y2">${esc(died)}</span></div>`
       : `<svg width="70" height="2" style="color:var(--a)"><line x1="0" y1="1" x2="70" y2="1" stroke="currentColor" stroke-width="1" stroke-dasharray="70" stroke-dashoffset="70" class="ln"/></svg>`}
  </div></div>`)
  layer.append(t)
  await A(t.querySelector('.n')!, [{ opacity: 0, filter: 'blur(10px)', letterSpacing: '.15em' }, { opacity: 1, filter: 'blur(0)', letterSpacing: '0' }], { duration: 1100 })
  A(t.querySelector('.e')!, [{ opacity: 0 }, { opacity: 0.7 }], { duration: 600 })
  await Promise.all([
    ...[['.y1', -14], ['.y2', 14]].map(([selector, x]) => {
      const year = t.querySelector(selector as string)
      return year ? A(year, [{ opacity: 0, transform: `translateX(${x}px)` }, { opacity: 1, transform: 'none' }], { duration: 700 }) : undefined
    }),
    A(t.querySelector('.ln')!, [{ strokeDashoffset: line }, { strokeDashoffset: 0 }], { duration: 800, delay: 150, easing: 'ease-in-out' }),
  ])
  await wait(400)
  reveal()
  await Promise.all([
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 1000, easing: 'ease-in-out' }),
    A(t, [{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(6px)' }], { duration: 700 }),
  ])
}

// Lily: a single calla lily draws itself in fine line, takes a wash of colour, then lifts away
const lily: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const cover = el(`<div class="fill" style="background:${NOISE(0.8, 0.1)},var(--bgS)"></div>`)
  layer.append(cover)
  const s = el(`<div class="fill"><svg viewBox="0 0 300 380" style="position:absolute;left:50%;top:8%;width:min(62%,240px);transform:translateX(-50%);overflow:visible" fill="none" stroke="var(--p)" stroke-width="1.3" stroke-linecap="round">
     <path pathLength="1" d="M150 360C148 290 152 220 150 160"/>
     <path pathLength="1" d="M150 320C118 300 104 258 114 226 130 254 146 280 150 310"/>
     <path class="pt" pathLength="1" d="M150 160C118 150 106 108 122 66 138 86 162 90 182 74 186 116 176 150 150 160Z" style="fill:color-mix(in oklab,var(--a),transparent 100%)"/>
     <path pathLength="1" d="M151 148C149 126 152 106 160 92"/></svg>
     <div class="nm" style="position:absolute;left:0;right:0;bottom:16%;padding:0 24px;text-align:center;color:var(--txt);opacity:0"><div style="${nameStyle(content.title, 32)}">${esc(content.title)}</div>${lifeDatesLine(content)}</div></div>`)
  layer.append(s)
  const ps = [...s.querySelectorAll<SVGPathElement>('path')]
  ps.forEach((p) => {
    p.style.strokeDasharray = '1'
    p.style.strokeDashoffset = '1'
  })
  await A(ps[0]!, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 600, easing: 'ease-in-out' })
  A(ps[1]!, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 600, easing: 'ease-in-out' })
  await A(ps[2]!, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 900, delay: 150, easing: 'ease-in-out' })
  A(ps[3]!, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 400 })
  A(ps[2]!, [{ fill: 'color-mix(in oklab,var(--a),transparent 100%)' }, { fill: 'color-mix(in oklab,var(--a),transparent 65%)' }], { duration: 700 })
  await A(s.querySelector('.nm')!, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 700 })
  await wait(350)
  reveal()
  await Promise.all([
    A(cover, [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 1000, easing: 'cubic-bezier(.65,0,.35,1)' }),
    A(s, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-50px)' }], { duration: 800, easing: 'ease-in' }),
  ])
}

// First light: night turns to dawn as a soft sun rises over the horizon behind the name
const firstLight: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const night = el(`<div class="fill" style="background:linear-gradient(180deg,#1B2030,#3A3F52 70%,#585B6A)"></div>`)
  const dawn = el(`<div class="fill" style="background:linear-gradient(180deg,#E8E2DA,#F2D9C0 55%,#F4C49A);opacity:0"></div>`)
  const sun = el(`<div style="position:absolute;left:50%;bottom:22%;width:220px;height:220px;margin-left:-110px;border-radius:50%;background:radial-gradient(circle,#FFF7E4 0 22%,rgba(255,214,160,.85) 34%,rgba(255,190,130,.25) 52%,transparent 70%)"></div>`)
  const hill = el(`<svg viewBox="0 0 360 120" preserveAspectRatio="none" style="position:absolute;left:0;right:0;bottom:0;width:100%;height:26%"><path d="M0 50C60 30 120 40 180 52S300 40 360 30V120H0Z" fill="#262A36" class="h"/></svg>`)
  const t = el(`<div style="position:absolute;left:0;right:0;top:20%;padding:0 24px;text-align:center;color:#fff"><div style="font:600 9px var(--f-body);letter-spacing:.32em;text-transform:uppercase;opacity:.7">${label(content, 'Celebrating a life')}</div><div style="${nameStyle(content.title, 38)};margin-top:4px">${esc(content.title)}</div>${lifeDatesLine(content)}</div>`)
  layer.append(night, dawn, sun, hill, t)
  // The text turns from white on the night to the site's text colour on the dawn
  A(t, [{ opacity: 0, color: '#fff' }, { opacity: 1, color: '#fff', offset: 0.35 }, { opacity: 1, color: 'var(--txt)' }], { duration: 1700 })
  A(hill.querySelector('.h')!, [{ fill: '#262A36' }, { fill: '#8C8577' }], { duration: 1700 })
  A(dawn, [{ opacity: 0 }, { opacity: 1 }], { duration: 1700, easing: 'ease-in-out' })
  await A(sun, [{ transform: 'translateY(160px) scale(.8)', opacity: 0.5 }, { transform: 'translateY(0) scale(1.1)', opacity: 1 }], { duration: 1700, easing: 'cubic-bezier(.3,0,.3,1)' })
  await wait(250)
  reveal()
  await Promise.all([night, dawn, sun, hill, t].map(n => A(n, [{ opacity: getComputedStyle(n).opacity }, { opacity: 0 }], { duration: 900, easing: 'ease-in-out' })))
}

// Morning mist: soft mist drifts apart and the name comes slowly into focus
const mist: Scene = async ({ layer, content }, { A, el, reveal }) => {
  const cover = el(`<div class="fill" style="background:#E7E5E1"></div>`)
  layer.append(cover)
  const t = el(`<div class="center"><div style="text-align:center;color:var(--txt);padding:0 24px"><div style="font:600 9px var(--f-body);letter-spacing:.32em;text-transform:uppercase;opacity:.6">${label(content, 'In loving memory')}</div><div style="${nameStyle(content.title, 38)}">${esc(content.title)}</div>${lifeDatesLine(content)}</div></div>`)
  layer.append(t)
  const R = rng(5)
  const blobs: [HTMLElement, boolean][] = []
  for (let i = 0; i < 10; i++) {
    const left = i % 2 === 0
    const b = el(`<div style="position:absolute;left:${(left ? -10 : 40) + R() * 40}%;top:${R() * 90 - 10}%;width:${220 + R() * 160}px;height:${140 + R() * 100}px;border-radius:50%;background:rgba(255,255,255,.9);filter:blur(28px)"></div>`)
    layer.append(b)
    blobs.push([b, left])
  }
  A(t.firstElementChild!, [{ filter: 'blur(12px)', opacity: 0.2 }, { filter: 'blur(0)', opacity: 1 }], { duration: 1600, easing: 'ease-out' })
  await Promise.all(blobs.map(([b, left], i) => A(b, [{ transform: 'none', opacity: 1 }, { transform: `translateX(${left ? -220 : 220}px)`, opacity: 0.15 }], { duration: 1800, delay: i * 30, easing: 'ease-in-out' })))
  reveal()
  await Promise.all([
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 900 }),
    A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 }),
    ...blobs.map(([b]) => A(b, [{ opacity: 0.15 }, { opacity: 0 }], { duration: 500 })),
  ])
}

// Verse: a short line of remembrance appears word by word, followed by the name (and years)
const verse: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const cover = el(`<div class="fill" style="background:var(--p)"></div>`)
  layer.append(cover)
  const words = ['Forever', 'in', 'our', 'hearts']
  const signature = content.lifeDates ? `${esc(content.title)} · ${esc(content.lifeDates)}` : esc(content.title)
  const t = el(`<div class="center"><div style="text-align:center;color:var(--on);max-width:80%">
     <div style="font-family:var(--f-display);font-style:italic;font-size:44px;line-height:1.1">${words.map(w => `<span class="w" style="display:inline-block;margin:0 .12em;opacity:0">${w}</span>`).join('')}</div>
     <div class="ru" style="width:60px;height:1px;background:var(--a);margin:16px auto 12px;transform:scaleX(0)"></div>
     <div class="nm" style="font:600 10px var(--f-body);letter-spacing:.3em;text-transform:uppercase;overflow-wrap:anywhere;opacity:0">${signature}</div></div></div>`)
  layer.append(t)
  await Promise.all([...t.querySelectorAll('.w')].map((w, i) => A(w, [{ opacity: 0, filter: 'blur(8px)', transform: 'translateY(10px)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }], { duration: 800, delay: i * 230 })))
  await A(t.querySelector('.ru')!, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 500, easing: 'ease-in-out' })
  await A(t.querySelector('.nm')!, [{ opacity: 0 }, { opacity: 0.8 }], { duration: 500 })
  await wait(350)
  reveal()
  await Promise.all([
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 1000, easing: 'ease-in-out' }),
    A(t, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-24px)' }], { duration: 800 }),
  ])
}

// Lanterns: paper lanterns rise into the evening sky around the name
const lanterns: Scene = async ({ layer, content }, { A, el, wait, reveal, size }) => {
  const cover = el(`<div class="fill" style="background:linear-gradient(180deg,#161B29,#2C3245 70%,#45475A)"></div>`)
  layer.append(cover)
  const t = el(`<div class="center"><div style="text-align:center;color:#F7EBD6;padding:0 24px;opacity:0"><div style="font:600 9px var(--f-body);letter-spacing:.32em;text-transform:uppercase;opacity:.7">${label(content, 'Always remembered')}</div><div style="${nameStyle(content.title, 38)}">${esc(content.title)}</div>${lifeDatesLine(content)}</div></div>`)
  layer.append(t)
  const R = rng(9)
  const ls: [HTMLElement, number][] = []
  for (let i = 0; i < 11; i++) {
    const z = 0.45 + R() * 0.75
    const w = 22 * z
    const h = 30 * z
    const l = el(`<div style="position:absolute;left:${4 + R() * 88}%;bottom:-50px;width:${w}px;height:${h}px;border-radius:${w * 0.3}px ${w * 0.3}px ${w * 0.2}px ${w * 0.2}px / ${h * 0.3}px ${h * 0.3}px ${h * 0.15}px ${h * 0.15}px;background:radial-gradient(ellipse at 50% 70%,#FFF0C8,#F7A24E 60%,#C0612A);box-shadow:0 0 ${18 * z}px ${6 * z}px rgba(255,170,80,.42);filter:blur(${(1.2 - z) * 1.6}px);opacity:${0.55 + z * 0.4}"></div>`)
    layer.append(l)
    ls.push([l, z])
  }
  const r = size()
  ls.forEach(([l, z], i) => A(l, [{ transform: 'translate(0,0)' }, { transform: `translate(${(R() - 0.5) * 60}px,${-(r.height + 80) * (0.55 + z * 0.35)}px)` }], { duration: 3200 - z * 600, delay: i * 70, easing: 'cubic-bezier(.3,.1,.5,1)' }))
  await A(t.firstElementChild!, [{ opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 1000, delay: 300 })
  await wait(600)
  reveal()
  await Promise.all([
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 1000, easing: 'ease-in-out' }),
    A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 }),
    ...ls.map(([l]) => A(l, [{ opacity: getComputedStyle(l).opacity }, { opacity: 0 }], { duration: 900 })),
  ])
}

// Feather: a single white feather drifts down slowly as the name appears
const feather: Scene = async ({ layer, content }, { A, el, wait, reveal, size }) => {
  const cover = el(`<div class="fill" style="background:${NOISE(0.8, 0.1)},linear-gradient(180deg,#EEECE7,#DEDAD2)"></div>`)
  layer.append(cover)
  const f = el(`<div style="position:absolute;left:50%;top:-60px;width:46px;margin-left:-23px;filter:drop-shadow(0 10px 8px rgba(0,0,0,.12))"><svg viewBox="0 0 46 130" style="width:100%">
     <path d="M23 4C8 26 6 64 14 98L23 126 32 98C40 64 38 26 23 4Z" fill="#FBFAF7"/>
     <path d="M23 4C14 30 12 60 16 92M23 4C32 30 34 60 30 92" fill="none" stroke="#E2DED6" stroke-width=".6"/>
     ${Array.from({ length: 14 }, (_, i) => `<path d="M23 ${20 + i * 6}L${i % 2 ? 36 : 10} ${14 + i * 6}" stroke="#E6E2DA" stroke-width=".6"/>`).join('')}
     <path d="M23 6V128" stroke="#CFC8BC" stroke-width="1.1"/></svg></div>`)
  layer.append(f)
  const t = el(`<div style="position:absolute;left:0;right:0;top:58%;padding:0 24px;text-align:center;color:var(--txt);opacity:0"><div style="${nameStyle(content.title, 34)}">${esc(content.title)}</div>${lifeDatesLine(content)}</div>`)
  layer.append(t)
  const r = size()
  A(t, [{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 1000 })
  await A(f, [{ transform: 'translate(-60px,0) rotate(-30deg)' }, { transform: `translate(50px,${r.height * 0.18}px) rotate(25deg)`, offset: 0.3 }, { transform: `translate(-40px,${r.height * 0.34}px) rotate(-20deg)`, offset: 0.62 }, { transform: `translate(0,${r.height * 0.44}px) rotate(80deg)` }], { duration: 2200, easing: 'ease-in-out' })
  await wait(300)
  reveal()
  await Promise.all([
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 900 }),
    A(f, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 }),
    A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 }),
  ])
}

// Photo album: three sepia photos are laid down one by one, followed by the name
const album: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const cover = el(`<div class="fill" style="background:var(--p)"></div>`)
  layer.append(cover)
  const ph: [string, string, number][] = [['#D8C9B4', '#8D7A63', 38], ['#CFC6BA', '#6E6559', 62], ['#E1D3BE', '#9C8468', 50]]
  const cards = ph.map(([a, b, x], i) => el(`<div style="position:absolute;left:50%;top:40%;width:180px;height:220px;margin:-110px 0 0 -90px;padding:10px 10px 30px;background:#F7F3EC;box-shadow:0 12px 24px rgba(0,0,0,.3);transform:rotate(${(i - 1) * 6}deg);opacity:0">
     <div style="height:100%;background:radial-gradient(circle at ${x}% 38%,rgba(90,75,60,.85) 0 13%,transparent 14%),radial-gradient(60% 40% at ${x}% 100%,rgba(80,66,52,.85) 0 70%,transparent 71%),linear-gradient(180deg,${a},${b});filter:sepia(.55) contrast(.95)"></div></div>`))
  cards.forEach(c => layer.append(c))
  const t = el(`<div style="position:absolute;left:0;right:0;bottom:16%;padding:0 24px;text-align:center;color:var(--on);opacity:0"><div style="font:600 9px var(--f-body);letter-spacing:.3em;text-transform:uppercase;opacity:.7">${label(content, 'A life well loved')}</div><div style="${nameStyle(content.title, 34)}">${esc(content.title)}</div>${lifeDatesLine(content)}</div>`)
  layer.append(t)
  for (let i = 0; i < 3; i++)
    await A(cards[i]!, [{ opacity: 0, transform: `translateY(30px) rotate(${(i - 1) * 6 + 8}deg)` }, { opacity: 1, transform: `rotate(${(i - 1) * 6}deg)` }], { duration: 650, easing: OUT })
  await A(t, [{ opacity: 0 }, { opacity: 1 }], { duration: 600 })
  await wait(350)
  reveal()
  await Promise.all([
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 900, easing: 'ease-in-out' }),
    A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 500 }),
    ...cards.map((c, i) => A(c, [{ opacity: 1, transform: `rotate(${(i - 1) * 6}deg)` }, { opacity: 0, transform: `translateY(-30px) rotate(${(i - 1) * 6}deg) scale(1.05)` }], { duration: 700, delay: (2 - i) * 80 })),
  ])
}

// Among the stars: stars come out one by one, a single star shines brighter, and the name appears
const stars: Scene = async ({ layer, content }, kit) => {
  const { A, el, wait, reveal, uid } = kit
  const cover = el(`<div class="fill" style="background:linear-gradient(180deg,#0C1020,#1C2236 70%,#2B3046)"></div>`)
  layer.append(cover)
  const R = rng(21)
  const st: HTMLElement[] = []
  for (let i = 0; i < 70; i++) {
    const s = 0.8 + R() * 1.8
    const d = el(`<div style="position:absolute;left:${R() * 100}%;top:${R() * 80}%;width:${s}px;height:${s}px;border-radius:50%;background:#fff;opacity:0"></div>`)
    layer.append(d)
    st.push(d)
  }
  const gradient = uid('star')
  const big = el(`<div style="position:absolute;left:62%;top:22%;width:40px;height:40px;margin:-20px;opacity:0"><svg viewBox="-20 -20 40 40"><defs><radialGradient id="${gradient}"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><circle r="10" fill="url(#${gradient})"/><path d="M0-18 1.4-1.4 18 0 1.4 1.4 0 18-1.4 1.4-18 0-1.4-1.4Z" fill="#FFF6DD"/></svg></div>`)
  layer.append(big)
  const t = el(`<div style="position:absolute;left:0;right:0;top:46%;padding:0 24px;text-align:center;color:#F1EAD9;opacity:0"><div style="font:600 9px var(--f-body);letter-spacing:.3em;text-transform:uppercase;opacity:.7">${label(content, 'Forever among the stars')}</div><div style="${nameStyle(content.title, 36)}">${esc(content.title)}</div>${lifeDatesLine(content)}</div>`)
  layer.append(t)
  st.forEach(d => A(d, [{ opacity: 0 }, { opacity: 0.3 + R() * 0.7 }], { duration: 500, delay: R() * 1100 }))
  await wait(900)
  A(big, [{ opacity: 0, transform: 'scale(.2) rotate(0)' }, { opacity: 1, transform: 'scale(1) rotate(45deg)' }], { duration: 900, easing: OUT })
  await A(t, [{ opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 900, delay: 300 })
  await wait(400)
  reveal()
  await Promise.all([
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 1000, easing: 'ease-in-out' }),
    A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 }),
    A(big, [{ opacity: 1 }, { opacity: 0 }], { duration: 800 }),
    ...st.map(d => A(d, [{ opacity: getComputedStyle(d).opacity }, { opacity: 0 }], { duration: 800 })),
  ])
}

// Ripple: a drop falls into still water and the ripples gently open into the page
const ripple: Scene = async ({ layer, content }, { A, el, wait, reveal, size, tween }) => {
  const cover = el(`<div class="fill" style="background:radial-gradient(80% 60% at 50% 45%,#6F7A78,#2F3837)"></div>`)
  layer.append(cover)
  const drop = el(`<div style="position:absolute;left:50%;top:-20px;width:10px;height:14px;margin-left:-5px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:linear-gradient(160deg,#fff,#B9C6C4)"></div>`)
  layer.append(drop)
  const r = size()
  await A(drop, [{ transform: 'translateY(0)' }, { transform: `translateY(${r.height * 0.45}px)` }], { duration: 600, easing: 'cubic-bezier(.5,0,1,1)' })
  drop.remove()
  const rings = [0, 1, 2, 3].map((i) => {
    const c = el(`<div style="position:absolute;left:50%;top:45%;width:20px;height:8px;margin:-4px 0 0 -10px;border-radius:50%;border:1.5px solid rgba(255,255,255,.55)"></div>`)
    layer.append(c)
    A(c, [{ transform: 'scale(1)', opacity: 0.9 }, { transform: 'scale(22)', opacity: 0 }], { duration: 1800, delay: i * 260, easing: 'cubic-bezier(.2,.6,.4,1)' })
    return c
  })
  const t = el(`<div style="position:absolute;left:0;right:0;top:56%;padding:0 24px;text-align:center;color:#EEF1EE;opacity:0"><div style="font:600 9px var(--f-body);letter-spacing:.3em;text-transform:uppercase;opacity:.7">${label(content, 'In loving memory')}</div><div style="${nameStyle(content.title, 36)}">${esc(content.title)}</div>${lifeDatesLine(content)}</div>`)
  layer.append(t)
  await A(t, [{ opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 900, delay: 200 })
  await wait(300)
  reveal()
  const far = Math.hypot(r.width, r.height)
  A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 500 })
  // The water opens from the ripples' centre onto the page
  await tween(1000, (k) => {
    const e = k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2
    const R = e * far
    const mask = `radial-gradient(${R}px ${R * 0.55}px at 50% 45%, transparent 92%, #000 100%)`
    cover.style.setProperty('-webkit-mask-image', mask)
    cover.style.setProperty('mask-image', mask)
  })
  rings.forEach(c => c.remove())
}

// Butterfly: a butterfly flutters up around the name, then flies away as the page appears
const butterfly: Scene = async ({ layer, content, scale }, kit) => {
  const { A, el, wait, reveal, size } = kit
  // The site's light background, a little deeper towards the bottom
  const cover = el(`<div class="fill" style="background:${NOISE(0.8, 0.1)},linear-gradient(180deg,var(--bgS),color-mix(in oklab,var(--bgS),#000 7%))"></div>`)
  layer.append(cover)
  const wing = (side: number) => `<path d="M0 0C${side * 10} -26 ${side * 40} -30 ${side * 42} -12 ${side * 44} 4 ${side * 22} 8 0 4C${side * 20} 10 ${side * 34} 24 ${side * 24} 34 ${side * 12} 40 ${side * 2} 22 0 6Z" style="fill:color-mix(in oklab,var(--a),#fff 15%)" stroke="var(--p)" stroke-width=".8"/>`
  const b = el(`<div style="position:absolute;left:0;top:0;width:80px;height:80px"><svg viewBox="-45 -40 90 85" style="width:100%;overflow:visible"><g class="wl" style="transform-origin:0 0">${wing(-1)}</g><g class="wr" style="transform-origin:0 0">${wing(1)}</g><path d="M0-10V30" stroke="var(--p)" stroke-width="3" stroke-linecap="round"/><path d="M0-10-6-22M0-10 6-22" stroke="var(--p)" stroke-width=".8" fill="none"/></svg></div>`)
  layer.append(b)
  const t = el(`<div style="position:absolute;left:0;right:0;top:56%;padding:0 24px;text-align:center;color:var(--txt);opacity:0"><div style="font:600 9px var(--f-body);letter-spacing:.3em;text-transform:uppercase;opacity:.6">${label(content, 'Celebrating a life')}</div><div style="${nameStyle(content.title, 34)}">${esc(content.title)}</div>${lifeDatesLine(content)}</div>`)
  layer.append(t)
  for (const selector of ['.wl', '.wr'])
    loop(kit, scale, b.querySelector(selector)!, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(.2)' }], { duration: 220, direction: 'alternate', easing: 'ease-in-out' })
  const { width: W, height: H } = size()
  A(t, [{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 700 })
  await A(b, [{ transform: `translate(${W * 0.1}px,${H * 0.85}px) rotate(20deg)` }, { transform: `translate(${W * 0.55}px,${H * 0.6}px) rotate(-10deg)`, offset: 0.35 }, { transform: `translate(${W * 0.3}px,${H * 0.38}px) rotate(15deg)`, offset: 0.7 }, { transform: `translate(${W * 0.45}px,${H * 0.3}px) rotate(0)` }], { duration: 2000, easing: 'ease-in-out' })
  await wait(250)
  reveal()
  await Promise.all([
    A(b, [{ transform: `translate(${W * 0.45}px,${H * 0.3}px)` }, { transform: `translate(${W * 0.8}px,${-100}px) rotate(20deg)` }], { duration: 900, easing: 'ease-in' }),
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 900, delay: 150 }),
    A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 }),
  ])
}

// After the rain: rain runs down the glass, slows and stops, warm light breaks through, and the name comes into focus
const afterRain: Scene = async ({ layer, content }, { A, el, wait, reveal, size, tween }) => {
  // The rainy sky is the theme's primary, kept dark (at most about 0.42 lightness, 4 on a scale where black is 0 and
  // white 10) so the rain and the light text show on it; the warm light breaks through over a lighter tint of it. The
  // rain and the light keep their own colours
  const sky = ensureDark(normalizeHex(getComputedStyle(layer).getPropertyValue('--p').trim(), '#4E575E'), 0.42)
  const cover = el(`<div class="fill" style="background:linear-gradient(180deg,color-mix(in oklab,${sky},#fff 8%),color-mix(in oklab,${sky},#000 22%))"></div>`)
  const warm = el(`<div class="fill" style="background:radial-gradient(70% 50% at 50% 30%,rgba(255,222,180,.75),transparent 70%),linear-gradient(180deg,color-mix(in oklab,${sky},#fff 55%),color-mix(in oklab,${sky},#fff 38%));opacity:0"></div>`)
  const t = el(`<div class="center"><div style="text-align:center;color:#F4F1EA;padding:0 24px;filter:blur(6px)"><div style="font:600 9px var(--f-body);letter-spacing:.3em;text-transform:uppercase;opacity:.75">${label(content, 'In loving memory')}</div><div style="${nameStyle(content.title, 38)}">${esc(content.title)}</div>${lifeDatesLine(content)}</div></div>`)
  layer.append(cover, warm, t)
  const { width, height } = size()
  const canvas = el<HTMLCanvasElement>(`<canvas class="fill"></canvas>`)
  // Drawn at the screen's pixel density (at most 2) but shown at the layer's size
  const ratio = Math.min(2, globalThis.devicePixelRatio || 1)
  canvas.width = width * ratio
  canvas.height = height * ratio
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  layer.append(canvas)
  const g = canvas.getContext?.('2d') ?? null
  g?.scale(ratio, ratio)
  // Streaks running down, and drops on the glass sliding slowly (speeds per 60 Hz frame, moved by time); bigger on
  // bigger screens (as designed on a phone, about 1.8 times on a 1440 × 900 desktop, up to 2.2 times)
  const grain = Math.min(2.2, 1 + 2 * Math.max(0, Math.min(width / 360, height / 640) - 1))
  const streaks = Array.from({ length: 70 }, () => ({ x: Math.random() * width, y: Math.random() * height, v: (7 + Math.random() * 6) * grain }))
  const drops = Array.from({ length: 26 }, () => ({ x: Math.random() * width, y: Math.random() * height, s: (2 + Math.random() * 5) * grain, v: Math.random() * 0.6 * grain }))
  const D = 2400
  // The rain stops by 60%, the warm light rises from 45%, and the name unblurs
  A(t.firstElementChild!, [{ filter: 'blur(6px)' }, { filter: 'blur(6px)', offset: 0.4 }, { filter: 'blur(0)' }], { duration: D, easing: 'linear' })
  A(warm, [{ opacity: 0 }, { opacity: 0, offset: 0.45 }, { opacity: 1 }], { duration: D, easing: 'ease-in-out' })
  let last = 0
  await tween(D, (k) => {
    const frames = (k - last) * D / (1000 / 60)
    last = k
    if (!g)
      return
    const rain = Math.max(0, 1 - k * 1.6)
    const glass = Math.max(0, 1 - Math.max(0, k - 0.4) * 1.8)
    g.clearRect(0, 0, width, height)
    g.strokeStyle = `rgba(255,255,255,${0.35 * rain})`
    g.lineWidth = grain
    g.beginPath()
    for (const streak of streaks) {
      streak.y += streak.v * frames
      streak.x -= frames
      if (streak.y > height) {
        streak.y = -20
        streak.x = Math.random() * width
      }
      g.moveTo(streak.x, streak.y)
      g.lineTo(streak.x + 2 * grain, streak.y - 14 * grain)
    }
    g.stroke()
    for (const drop of drops) {
      drop.y += drop.v * frames
      const shine = g.createRadialGradient(drop.x - drop.s * 0.3, drop.y - drop.s * 0.3, 0, drop.x, drop.y, drop.s)
      shine.addColorStop(0, `rgba(255,255,255,${0.7 * glass})`)
      shine.addColorStop(1, `rgba(255,255,255,${0.08 * glass})`)
      g.fillStyle = shine
      g.beginPath()
      g.arc(drop.x, drop.y, drop.s, 0, 7)
      g.fill()
    }
  })
  await wait(250)
  reveal()
  await Promise.all([cover, warm, t, canvas].map(node => A(node, [{ opacity: getComputedStyle(node).opacity }, { opacity: 0 }], { duration: 900, easing: 'ease-in-out' })))
  canvas.remove()
}

// Tree of life: a tree grows branch by branch and comes into leaf above the name
const tree: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const cover = el(`<div class="fill" style="background:${NOISE(0.8, 0.1)},var(--bgS)"></div>`)
  layer.append(cover)
  // A seeded tree, five levels deep: the trunk and branches in the primary, the leaves in the accent
  const R = rng(31)
  const branches: [number, number, number, number, number][] = []
  const tips: [number, number][] = []
  const grow = (x: number, y: number, angle: number, length: number, depth: number) => {
    const x2 = x + Math.cos(angle) * length
    const y2 = y - Math.sin(angle) * length
    branches.push([x, y, x2, y2, depth])
    if (depth >= 5) {
      tips.push([x2, y2])
      return
    }
    const count = depth < 2 ? 2 : 2 + (R() > 0.6 ? 1 : 0)
    for (let i = 0; i < count; i++)
      grow(x2, y2, angle + (i - (count - 1) / 2) * (0.55 + R() * 0.25) + (R() - 0.5) * 0.2, length * (0.68 + R() * 0.12), depth + 1)
  }
  grow(150, 330, Math.PI / 2, 78, 0)
  const svg = el(`<svg viewBox="0 0 300 340" style="position:absolute;left:50%;top:6%;width:84%;max-width:420px;transform:translateX(-50%);overflow:visible">
     ${branches.map(([x, y, x2, y2, depth]) => `<path d="M${x.toFixed(1)} ${y.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="var(--p)" stroke-width="${Math.max(0.6, 5 - depth * 0.9)}" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" data-depth="${depth}"/>`).join('')}
     ${tips.map(([x, y]) => `<circle cx="${(x + (R() - 0.5) * 6).toFixed(1)}" cy="${(y + (R() - 0.5) * 6).toFixed(1)}" r="${(3 + R() * 3).toFixed(1)}" style="fill:color-mix(in oklab,var(--a),transparent ${Math.round(R() * 40)}%)" opacity="0"/>`).join('')}</svg>`)
  layer.append(svg)
  const t = el(`<div style="position:absolute;left:0;right:0;bottom:12%;padding:0 24px;text-align:center;color:var(--txt);opacity:0"><div style="${nameStyle(content.title, 34)}">${esc(content.title)}</div>${lifeDatesLine(content)}</div>`)
  layer.append(t)
  const paths = [...svg.querySelectorAll<SVGPathElement>('path')]
  for (let depth = 0; depth <= 5; depth++) {
    paths.filter(path => Number(path.dataset.depth) === depth).forEach(path => A(path, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 300, easing: 'ease-out' }))
    await wait(230)
  }
  svg.querySelectorAll('circle').forEach((leaf, i) => A(leaf, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: (i % 12) * 40 }))
  await A(t, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: 200 })
  await wait(450)
  reveal()
  await Promise.all([
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 900 }),
    A(svg, [{ opacity: 1 }, { opacity: 0 }], { duration: 800 }),
    A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 }),
  ])
}

// Sampaguita garland: a garland of sampaguita flowers forms a circle around the name, one flower at a time
const sampaguita: Scene = async ({ layer, content }, { A, el, wait, reveal, uid }) => {
  const cover = el(`<div class="fill" style="background:${NOISE(0.8, 0.1)},linear-gradient(180deg,color-mix(in oklab,var(--p),#fff 8%),var(--p))"></div>`)
  layer.append(cover)
  // 26 white five-petal flowers on a green string; both keep their own colours
  const petal = uid('sampaguita')
  const count = 26
  const radius = 112
  const flower = (x: number, y: number, turn: number) => `<g class="fw" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${turn.toFixed(0)})" opacity="0">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-5.5" rx="3.6" ry="6" transform="rotate(${a})" fill="url(#${petal})"/>`).join('')}<circle r="2" fill="#E9E2B8"/></g>`
  const svg = el(`<svg viewBox="0 0 300 300" style="position:absolute;left:50%;top:44%;width:300px;height:300px;margin:-150px 0 0 -150px;overflow:visible">
     <defs><radialGradient id="${petal}" cx="50%" cy="80%" r="80%"><stop offset="0" stop-color="#F4F1E6"/><stop offset=".6" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E4E0D2"/></radialGradient></defs>
     <circle class="str" cx="150" cy="150" r="${radius}" fill="none" stroke="#7F9A6A" stroke-width="1.2" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" transform="rotate(-90 150 150)"/>
     ${Array.from({ length: count }, (_, i) => {
       const a = i / count * Math.PI * 2 - Math.PI / 2
       return flower(150 + radius * Math.cos(a), 150 + radius * Math.sin(a), i * 37)
     }).join('')}</svg>`)
  layer.append(svg)
  // The name inside the garland
  const t = el(`<div style="position:absolute;left:50%;top:44%;width:190px;transform:translate(-50%,-50%);text-align:center;color:var(--on);opacity:0"><div style="font:600 9px var(--f-body);letter-spacing:.3em;text-transform:uppercase;opacity:.7">${label(content, 'In loving memory')}</div><div style="${nameStyle(content.title, 32)};line-height:1.1">${esc(content.title)}</div>${lifeDatesLine(content, 'font:500 10px var(--f-body);letter-spacing:.2em;opacity:.75;margin-top:4px')}</div>`)
  layer.append(t)
  A(svg.querySelector('.str')!, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 1400, easing: 'ease-in-out' })
  svg.querySelectorAll('.fw').forEach((bud, i) => A(bud, [{ opacity: 0 }, { opacity: 1 }], { duration: 350, delay: 150 + i * 48 }))
  await wait(800)
  await A(t, [{ opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 900 })
  await wait(500)
  reveal()
  await Promise.all([
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 900, easing: 'ease-in-out' }),
    A(svg, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(1.15) rotate(10deg)' }], { duration: 900 }),
    A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 }),
  ])
}

// Paper boat: a small paper boat drifts across calm water toward the centre
const paperBoat: Scene = async ({ layer, content, scale }, kit) => {
  const { A, el, wait, reveal, size } = kit
  // The sky is the site's light background, the sea its primary kept dark like the rain's sky (at most about 0.42
  // lightness), a little lighter at the horizon and deeper below
  const sea = ensureDark(normalizeHex(getComputedStyle(layer).getPropertyValue('--p').trim(), '#4E575E'), 0.42)
  const sky = el(`<div class="fill" style="background:linear-gradient(180deg,var(--bgS),color-mix(in oklab,var(--bgS),#000 6%) 55%,color-mix(in oklab,${sea},#fff 12%) 56%,color-mix(in oklab,${sea},#000 18%))"></div>`)
  const ripples = el(`<div style="position:absolute;left:0;right:0;top:56%;bottom:0;background:repeating-linear-gradient(180deg,transparent 0 10px,rgba(255,255,255,.18) 10px 11px)"></div>`)
  layer.append(sky, ripples)
  loop(kit, scale, ripples, [{ backgroundPosition: '0 0' }, { backgroundPosition: '0 22px' }], { duration: 2000, easing: 'linear' })
  const boat = el(`<div style="position:absolute;left:0;top:calc(56% - 44px);width:90px"><svg viewBox="0 0 90 56" style="width:100%;overflow:visible;filter:drop-shadow(0 4px 3px rgba(0,0,0,.12))">
     <path d="M45 2 30 34H60Z" fill="#F4F2EC"/><path d="M45 2 60 34H52Z" fill="#DCD8CE"/><path d="M4 34H86L72 50H18Z" fill="#FBFAF6"/><path d="M4 34 18 50H30L22 34Z" fill="#E6E2D8"/><path d="M45 34 40 50" stroke="#D3CEC2" stroke-width=".8"/></svg>
     <div style="position:absolute;left:10%;right:10%;top:100%;height:8px;margin-top:-6px;border-radius:50%;background:rgba(255,255,255,.18);filter:blur(2px);transform:scaleY(-1)"></div></div>`)
  layer.append(boat)
  const t = el(`<div style="position:absolute;left:0;right:0;top:20%;padding:0 24px;text-align:center;color:var(--txt);opacity:0"><div style="font:600 9px var(--f-body);letter-spacing:.3em;text-transform:uppercase;opacity:.6">${label(content, 'Until we meet again')}</div><div style="${nameStyle(content.title, 38)}">${esc(content.title)}</div>${lifeDatesLine(content)}</div>`)
  layer.append(t)
  const { width } = size()
  // It bobs the whole way (the kit stops the loop when the intro ends)
  loop(kit, scale, boat, [{ rotate: '-3deg', translate: '0 0' }, { rotate: '3deg', translate: '0 3px' }], { duration: 900, direction: 'alternate', easing: 'ease-in-out' })
  A(t, [{ opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 1000, delay: 600 })
  await A(boat, [{ transform: 'translateX(-100px)' }, { transform: `translateX(${width / 2 - 45}px)` }], { duration: 2200, easing: 'cubic-bezier(.3,0,.3,1)' })
  await wait(350)
  reveal()
  await Promise.all([
    ...[sky, ripples, t].map(node => A(node, [{ opacity: 1 }, { opacity: 0 }], { duration: 900, easing: 'ease-in-out' })),
    A(boat, [{ transform: `translateX(${width / 2 - 45}px)`, opacity: 1 }, { transform: `translateX(${width * 0.8}px)`, opacity: 0 }], { duration: 900, easing: 'ease-in' }),
  ])
}

// Soft lights: soft warm lights drift into focus around the name
const bokeh: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  // A dark room in the theme's primary (at most about 0.3 lightness, so the lights glow), lit in the theme's colours:
  // the accent, the secondary and a light primary, each brightened a little, with a paler rim like out-of-focus light
  const room = ensureDark(normalizeHex(getComputedStyle(layer).getPropertyValue('--p').trim(), '#2E2620'), 0.3)
  const cover = el(`<div class="fill" style="background:radial-gradient(80% 60% at 50% 50%,color-mix(in oklab,${room},#fff 6%),color-mix(in oklab,${room},#000 50%))"></div>`)
  layer.append(cover)
  const tones = ['var(--a)', 'var(--a2)', 'color-mix(in oklab,var(--p),#fff 45%)']
  const R = rng(17)
  const lights = Array.from({ length: 20 }, (_, i) => {
    const s = 30 + R() * 90
    const tone = `color-mix(in oklab,${tones[i % tones.length]},#fff ${Math.round(15 + R() * 25)}%)`
    const light = el(`<div style="position:absolute;left:${R() * 100}%;top:${R() * 100}%;width:${s}px;height:${s}px;margin:${-s / 2}px 0 0 ${-s / 2}px;border-radius:50%;background:radial-gradient(circle,color-mix(in oklab,${tone},transparent 45%) 0 55%,color-mix(in oklab,${tone},#fff 40%) 62%,transparent 70%);filter:blur(14px);opacity:0"></div>`)
    layer.append(light)
    return light
  })
  const t = el(`<div class="center"><div style="text-align:center;color:#F6EAD6;padding:0 24px;opacity:0"><div style="font:600 9px var(--f-body);letter-spacing:.3em;text-transform:uppercase;opacity:.7">${label(content, 'With love and light')}</div><div style="${nameStyle(content.title, 38)}">${esc(content.title)}</div>${lifeDatesLine(content)}</div></div>`)
  layer.append(t)
  // The lights drift up from a blur until nearly sharp
  lights.forEach((light, i) => A(light, [{ opacity: 0, filter: 'blur(14px)', translate: '0 0' }, { opacity: 0.85, filter: 'blur(2px)', translate: `${(R() - 0.5) * 40}px ${-20 - R() * 30}px` }], { duration: 2200, delay: i * 40, easing: 'ease-out' }))
  await wait(1100)
  await A(t.firstElementChild!, [{ opacity: 0, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 900 })
  await wait(450)
  reveal()
  await Promise.all([
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 1000, easing: 'ease-in-out' }),
    A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 }),
    ...lights.map(light => A(light, [{ opacity: 0.85, transform: 'none' }, { opacity: 0, transform: 'scale(1.6)' }], { duration: 900 })),
  ])
}

export const scenes: Record<string, Scene> = {
  'wreath-seal': wreathSeal,
  candlelight,
  dove,
  portrait,
  dates,
  lily,
  'first-light': firstLight,
  mist,
  verse,
  lanterns,
  feather,
  album,
  stars,
  ripple,
  butterfly,
  'after-rain': afterRain,
  tree,
  sampaguita,
  'paper-boat': paperBoat,
  bokeh,
}
