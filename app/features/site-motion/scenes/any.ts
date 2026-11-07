import type { IntroContent, Scene } from './scene.kit'
import { EASE, esc, NOISE, OUT, PAPER, rng } from './scene.kit'

// Scenes for any occasion (site-motion.type.ts `sceneIntroKeys.any`), from the intros reference. Only the theme's colours
// and the event's own words: the hero's heading, under its small label where a scene has one (left out without it); the
// card flip's front shows the label, or the heading without one (`mainText`).
// Fixed colours only for real things: black film, the map, sunlight, the viewfinder.

// The card's front: the hero's small label, else its heading
const mainText = (content: IntroContent) => content.eyebrow || content.title

// A small label line, or nothing without the text
const labelLine = (text: string | undefined, style: string) => (text ? `<div style="${style}">${esc(text)}</div>` : '')

// A font size (px) at which `text` fits in at most two lines `room` px wide: `base` when it fits, smaller when long
function twoLines(text: string, base: number, room: number, em = 0.56, min = 16): number {
  const longest = Math.max(1, ...text.split(/\s+/).map(word => word.length))
  return Math.max(min, Math.floor(Math.min(base, room / (longest * em), 2 * room / (Math.max(1, text.length) * em))))
}

// How much fixed-size pieces (a card, a calendar, rings) grow on bigger screens: as designed on a phone, up to 1.6 times
const growth = (width: number, height: number) => Math.min(1.6, Math.max(1, Math.min(width / 360, height / 640)))

// An endless loop (orbiting dots, scrolling text, a blinking light), timed by the intensity; the kit cancels it when the
// intro stops
function loop(target: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions, scale: number) {
  if (typeof target.animate !== 'function')
    return
  target.animate(keyframes, { ...options, duration: (Number(options.duration) || 0) * scale, delay: (options.delay ?? 0) * scale, iterations: Infinity })
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// The event's day from its long date ("Sunday, February 14, 2027", already in the event's timezone), as a UTC calendar
// day, or undefined without one
function eventDay(content: IntroContent): Date | undefined {
  const match = content.dateLong?.match(/^\w+, (\w+) (\d+), (\d+)$/)
  const month = match ? MONTHS.indexOf(match[1]!) : -1
  return match && month >= 0 ? new Date(Date.UTC(Number(match[3]), month, Number(match[2]))) : undefined
}

// The light background as paper: its grain, a little deeper towards the bottom
const LIGHT_PAPER = `background:${NOISE(0.85, 0.14)},linear-gradient(170deg,var(--bgS),color-mix(in oklab,var(--bgS),#000 6%));`

// Shutter: a camera iris holds the event's name, then its blades twist open onto the page
const shutter: Scene = async ({ layer, content }, { A, el, wait, reveal, tween }) => {
  const count = 7
  // Seven wide blades, each turned a seventh and pushed out from the middle: their inner edges make the aperture
  const svg = el(`<svg class="fill" width="100%" height="100%" viewBox="-180 -320 360 640" preserveAspectRatio="xMidYMid slice">${Array.from({ length: count }, (_, i) => `<g class="bl"><rect x="-500" y="0" width="1000" height="800" style="fill:color-mix(in oklab,var(--p),${i % 2 ? '#000 8%' : '#fff 6%'})"/><line x1="-500" y1="0" x2="500" y2="0" stroke="rgba(255,255,255,.18)" stroke-width="1.2"/></g>`).join('')}</svg>`)
  layer.append(svg)
  const t = el(`<div class="center"><div style="text-align:center;color:var(--on);max-width:84%">${labelLine(content.eyebrow, 'font:600 10px var(--f-body);letter-spacing:.3em;text-transform:uppercase;opacity:.7;margin-bottom:6px')}<div style="font:600 ${twoLines(content.title, 34, 280)}px/1.05 var(--f-display);letter-spacing:-.02em">${esc(content.title)}</div></div></div>`)
  layer.append(t)
  const blades = [...svg.querySelectorAll('.bl')]
  const open = (radius: number, twist: number) => blades.forEach((blade, i) => blade.setAttribute('transform', `rotate(${i * 360 / count + twist}) translate(0 ${radius})`))
  open(0, 0)
  await A(t.firstElementChild!, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 600, fill: 'both' })
  await wait(500)
  A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 })
  reveal()
  // The blades twist open past the screen's corners
  await tween(1000, (k) => {
    const e = k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2
    open(e * 420, e * 50)
  })
}

// Film strip: a film strip races past and slows to a stop on the frame with the event's name
const filmStrip: Scene = async ({ layer, content }, { A, el, wait, reveal, size }) => {
  // Black film, its frames tinted in the theme's colours; the one before last is the title card on the page's colour
  const cover = el(`<div class="fill" style="background:#111"></div>`)
  layer.append(cover)
  const { height } = size()
  const frameHeight = 180
  const count = 9
  const tint = (i: number) => ['var(--p)', 'var(--a)', 'color-mix(in oklab,var(--p),#fff 30%)', 'color-mix(in oklab,var(--a),#000 25%)'][i % 4]
  const text = content.title
  const titleCard = `<div style="text-align:center;padding:0 10px">${labelLine(content.dateLong, 'font:600 9px var(--f-body);letter-spacing:.3em;text-transform:uppercase;opacity:.6;margin-bottom:4px')}<div style="font:600 ${twoLines(text, 26, 200)}px/1.05 var(--f-display);letter-spacing:-.02em">${esc(text)}</div></div>`
  const frames = Array.from({ length: count }, (_, i) => i === count - 2
    ? `<div style="height:${frameHeight - 14}px;margin:7px 0;border-radius:3px;background:var(--bgS);display:grid;place-items:center;color:var(--txt)">${titleCard}</div>`
    : `<div style="height:${frameHeight - 14}px;margin:7px 0;border-radius:3px;background:radial-gradient(circle at ${30 + i * 7 % 50}% 40%,rgba(255,255,255,.35) 0 12%,transparent 13%),linear-gradient(160deg,${tint(i)},color-mix(in oklab,${tint(i)},#000 35%))"></div>`).join('')
  // Sprocket holes down both sides
  const holes = 'radial-gradient(circle at 50% 50%,#000 0 4px,transparent 4.5px)'
  const strip = el(`<div style="position:absolute;left:12%;right:12%;top:0;max-width:520px;margin:0 auto;padding:0 26px;background:#1A1A1A;background-image:${holes},${holes};background-size:14px 18px;background-position:6px 0,calc(100% - 6px) 0;background-repeat:repeat-y">${frames}</div>`)
  cover.append(strip)
  // It stops with the title card in the middle
  const end = -((count - 2) * frameHeight) + height / 2 - frameHeight / 2
  await A(strip, [{ transform: 'translateY(40px)', filter: 'blur(3px)' }, { transform: `translateY(${end}px)`, filter: 'blur(0)' }], { duration: 1700, easing: 'cubic-bezier(.15,.7,.2,1)', fill: 'both' })
  await wait(500)
  reveal()
  await A(cover, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(1.25)' }], { duration: 800, easing: EASE })
}

// Card flip: an invitation card lands face down, flips over to show the details, then grows into the page
const cardFlip: Scene = async ({ layer, content }, { A, el, wait, reveal, size }) => {
  const cover = el(`<div class="fill" style="background:${NOISE(0.7, 0.08)},color-mix(in oklab,var(--bgS),#8a7a66 12%)"></div>`)
  layer.append(cover)
  // As on a phone's card (62% of the width, 5:7), no taller than 70% of the screen; its text grows with it
  const { width, height } = size()
  const cardWidth = Math.min(width * 0.62, height * 0.7 * 5 / 7)
  const k = cardWidth / 223
  const front = mainText(content)
  const details = [content.dateLong, content.venue].filter(Boolean).map(esc).join('<br>')
  // The front in the primary with a hairline accent frame and the label (or heading) in the accent; the back paper white
  // The shadow and the fades are on a wrapper: a filter or opacity on the card itself would flatten its flip
  const card = el(`<div class="center"><div class="cw" style="perspective:1000px;filter:drop-shadow(0 18px 24px rgba(0,0,0,.2));opacity:0"><div class="cd" style="position:relative;width:${cardWidth}px;height:${cardWidth * 7 / 5}px;transform-style:preserve-3d">
     <div class="front" style="position:absolute;inset:0;backface-visibility:hidden;border-radius:${6 * k}px;background:var(--p);display:grid;place-items:center;padding:${22 * k}px;text-align:center;box-shadow:inset 0 0 0 ${10 * k}px var(--p),inset 0 0 0 ${11 * k}px var(--a)"><div style="font:600 ${twoLines(front, 34, 170) * k}px/1.1 var(--f-display);color:var(--a-on-p);letter-spacing:-.02em;overflow-wrap:break-word">${esc(front)}</div></div>
     <div class="back" style="position:absolute;inset:0;backface-visibility:hidden;transform:rotateY(180deg);border-radius:${6 * k}px;${PAPER('#FFFFFF', '#F3EEE6')}display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:${18 * k}px;color:var(--txt);box-shadow:inset 0 0 0 ${10 * k}px #fff,inset 0 0 0 ${11 * k}px color-mix(in oklab,var(--a),transparent 40%)">
       ${labelLine(content.eyebrow, `font:600 ${8 * k}px var(--f-body);letter-spacing:.3em;text-transform:uppercase;opacity:.6`)}<div style="font:600 ${twoLines(content.title, 26, 180) * k}px/1.05 var(--f-display);letter-spacing:-.02em;margin:${8 * k}px 0">${esc(content.title)}</div>${details ? `<div style="font:500 ${11 * k}px var(--f-body);opacity:.7">${details}</div>` : ''}</div></div></div></div>`)
  layer.append(card)
  const cd = card.querySelector('.cd')!
  const wrap = card.querySelector('.cw')!
  A(wrap, [{ opacity: 0 }, { opacity: 1 }], { duration: 650 })
  await A(cd, [{ transform: 'translateY(60px) rotateX(20deg)' }, { transform: 'none' }], { duration: 650 })
  await wait(250)
  await A(cd, [{ transform: 'rotateY(0)' }, { transform: 'rotateY(180deg)' }], { duration: 900, easing: 'cubic-bezier(.6,0,.3,1)' })
  await wait(600)
  reveal()
  await Promise.all([
    A(cd, [{ transform: 'rotateY(180deg)' }, { transform: 'rotateY(180deg) scale(2.6)' }], { duration: 800, easing: EASE }),
    A(wrap, [{ opacity: 1 }, { opacity: 0 }], { duration: 800, easing: EASE }),
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: 100 }),
  ])
}

// Save-the-date stamp: a rubber stamp slams "Save the date" onto paper in inky texture, then the paper slides away with
// the heading and venue under it
const stamp: Scene = async ({ layer, content }, { A, el, wait, reveal, size }) => {
  const paper = el(`<div class="fill" style="${LIGHT_PAPER}"></div>`)
  layer.append(paper)
  const { width, height } = size()
  const k = growth(width, height)
  const words = 'Save the date'
  // Inked unevenly: the grain as a mask; a double border in the accent (as it reads on paper)
  const ink = NOISE(0.9, 2.2, 120)
  const s = el(`<div class="center"><div class="st" style="max-width:84%;padding:${14 * k}px ${20 * k}px;border:${3 * k}px solid var(--a-text);outline:${1.5 * k}px solid var(--a-text);outline-offset:${4 * k}px;border-radius:6px;color:var(--a-text);text-align:center;transform:rotate(-8deg);-webkit-mask-image:${ink};mask-image:${ink};opacity:0">
     <div style="font:800 ${twoLines(words, 34, 260) * k}px/1 var(--f-display);letter-spacing:.04em;text-transform:uppercase;overflow-wrap:break-word">${esc(words)}</div>${labelLine(content.dateNumeric, `font:600 ${13 * k}px var(--f-body);letter-spacing:.3em;margin-top:6px`)}</div></div>`)
  layer.append(s)
  // Under it, the heading and the venue
  const below = `<div style="font:600 ${twoLines(content.title, 28, 300) * k}px/1.1 var(--f-display);letter-spacing:-.02em">${esc(content.title)}</div>${labelLine(content.venue, `font:500 ${12 * k}px var(--f-body);opacity:.65;margin-top:4px`)}`
  const t = el(`<div style="position:absolute;left:0;right:0;top:64%;padding:0 24px;text-align:center;color:var(--txt);opacity:0">${below}</div>`)
  layer.append(t)
  const st = s.querySelector('.st')!
  await wait(300)
  // Slam: down from big, a little overshoot, and the paper jolts
  await A(st, [{ transform: 'rotate(-8deg) scale(2.4)', opacity: 0 }, { transform: 'rotate(-8deg) scale(.94)', opacity: 0.95, offset: 0.8 }, { transform: 'rotate(-8deg) scale(1)', opacity: 0.9 }], { duration: 420, easing: 'cubic-bezier(.6,0,1,.6)' })
  A(paper, [{ transform: 'none' }, { transform: 'translate(1px,2px)' }, { transform: 'none' }], { duration: 120 })
  await A(t, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 250 })
  await wait(600)
  reveal()
  // All of it goes up together, a screen's height (the text too, not just its own)
  await Promise.all([paper, s, t].map(node => A(node, [{ transform: 'none' }, { transform: `translateY(${-height}px)` }], { duration: 850, easing: EASE })))
}

// Calendar: tear-off calendar pages fly away until the event's day is left
const calendar: Scene = async ({ layer, content }, { A, el, wait, reveal, size }) => {
  const cover = el(`<div class="fill" style="background:var(--bgS)"></div>`)
  layer.append(cover)
  const { width, height } = size()
  const k = growth(width, height)
  // The six days before the event's, then its own (in the event's timezone), the month of the event in the header
  const day = eventDay(content)
  const days = day ? Array.from({ length: 7 }, (_, i) => new Date(day.getTime() - (6 - i) * 86_400_000)) : []
  const header = day ? `${MONTHS[day.getUTCMonth()]} ${day.getUTCFullYear()}` : ''
  const pad = el(`<div class="center"><div class="pad" style="position:relative;width:${200 * k}px;height:${230 * k}px;filter:drop-shadow(0 16px 22px rgba(0,0,0,.18));opacity:0">
     <div style="position:absolute;left:0;right:0;top:0;height:${44 * k}px;border-radius:${10 * k}px ${10 * k}px 0 0;background:var(--p);color:var(--on);display:grid;place-items:center;font:600 ${13 * k}px var(--f-body);letter-spacing:.24em;text-transform:uppercase;z-index:20">${esc(header)}</div>
     ${days.map((date, i) => `<div class="pg" style="position:absolute;left:0;right:0;top:${44 * k}px;bottom:0;border-radius:0 0 ${10 * k}px ${10 * k}px;background:#fff;border-top:2px dashed #ddd;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--txt);z-index:${10 - i};transform-origin:50% 0"><div style="font:600 ${92 * k}px/1 var(--f-display);letter-spacing:-.05em;${i === 6 ? 'color:var(--a-text)' : ''}">${date.getUTCDate()}</div><div style="font:500 ${13 * k}px var(--f-body);opacity:.6">${WEEKDAYS[date.getUTCDay()]}</div></div>`).join('')}</div></div>`)
  layer.append(pad)
  const pages = [...pad.querySelectorAll('.pg')]
  const text = content.title
  const t = el(`<div style="position:absolute;left:0;right:0;top:calc(50% + ${140 * k}px);padding:0 24px;text-align:center;color:var(--txt);font:600 ${twoLines(text, 26, 300) * k}px/1.1 var(--f-display);letter-spacing:-.02em;opacity:0">${esc(text)}</div>`)
  layer.append(t)
  await A(pad.querySelector('.pad')!, [{ transform: 'translateY(40px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 550 })
  // The days before fly off, left and right in turn, faster and faster
  for (let i = 0; i < pages.length - 1; i++) {
    A(pages[i]!, [{ transform: 'none', opacity: 1 }, { transform: `translate(${(i % 2 ? 1 : -1) * 120}px,-160px) rotate(${(i % 2 ? 1 : -1) * 35}deg)`, opacity: 0 }], { duration: 420, easing: 'cubic-bezier(.4,0,.6,1)' })
    await wait(i < 3 ? 190 : 130)
  }
  if (pages.length)
    A(pages.at(-1)!, [{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: 300 })
  await A(t, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: 200 })
  await wait(500)
  reveal()
  await Promise.all([
    A(cover, [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 800, easing: EASE }),
    A(pad, [{ transform: 'none' }, { transform: 'translateY(-110%)' }], { duration: 800, easing: EASE }),
    A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }),
  ])
}

// Pin drop: an empty map, then a pin drops onto it at the venue with a ripple, and a label pops up
const pinDrop: Scene = async ({ layer, content }, { A, el, wait, reveal, size }) => {
  const { width: W, height: H } = size()
  const R = rng(8)
  // A drawn map (never a real map): neutral land, white roads, parks and a pale water band, in fixed colours
  let roads = ''
  for (let i = 0; i < 14; i++) {
    const vertical = i % 2
    const at = R() * (vertical ? W : H)
    roads += vertical
      ? `<path d="M${at} -20 L${at + (R() - 0.5) * 60} ${H + 20}" stroke="#fff" stroke-width="${3 + R() * 6}"/>`
      : `<path d="M-20 ${at} L${W + 20} ${at + (R() - 0.5) * 60}" stroke="#fff" stroke-width="${3 + R() * 6}"/>`
  }
  const map = el(`<div class="fill" style="background:#ECE8E1;transform-origin:50% 46%"><svg class="fill" width="100%" height="100%" viewBox="0 0 ${W} ${H}">
     <path d="M-20 ${H * 0.7}C${W * 0.3} ${H * 0.62} ${W * 0.5} ${H * 0.85} ${W + 20} ${H * 0.76}" stroke="#B9D3E1" stroke-width="28" fill="none" opacity=".7"/>
     ${Array.from({ length: 10 }, () => `<rect x="${R() * W}" y="${R() * H}" width="${30 + R() * 60}" height="${20 + R() * 50}" rx="4" fill="#DDE5D3" opacity=".8"/>`).join('')}${roads}</svg></div>`)
  layer.append(map)
  // The pin, its shadow and the label wait out of sight until the map is in
  const pin = el(`<div style="position:absolute;left:50%;top:46%;width:44px;height:58px;margin:-58px 0 0 -22px;transform-origin:50% 100%;opacity:0"><svg viewBox="0 0 44 58" style="width:100%;filter:drop-shadow(0 4px 3px rgba(0,0,0,.25))"><path d="M22 2C11 2 3 10 3 21c0 14 19 35 19 35s19-21 19-35C41 10 33 2 22 2Z" style="fill:var(--p)"/><circle cx="22" cy="21" r="7" style="fill:var(--a)"/></svg></div>`)
  const shadow = el(`<div style="position:absolute;left:50%;top:46%;width:24px;height:8px;margin:-4px 0 0 -12px;border-radius:50%;background:rgba(0,0,0,.25);filter:blur(2px);opacity:0"></div>`)
  const text = content.title
  const label = el(`<div style="position:absolute;left:50%;top:calc(46% - 112px);transform:translateX(-50%);max-width:86%;padding:10px 14px;border-radius:12px;background:#fff;color:var(--txt);box-shadow:0 10px 24px rgba(0,0,0,.15);text-align:center;opacity:0"><div style="font:600 15px/1.2 var(--f-display)">${esc(text)}</div>${labelLine(content.venue, 'font:500 11px var(--f-body);opacity:.6')}</div>`)
  layer.append(shadow, pin, label)
  await A(map, [{ opacity: 0, transform: 'scale(1.08)' }, { opacity: 1, transform: 'none' }], { duration: 600, fill: 'both' })
  // The pin drops, squashes and bounces while its shadow grows under it
  A(shadow, [{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 500, easing: 'ease-in' })
  await A(pin, [{ transform: 'translateY(-300px)', opacity: 1 }, { transform: 'translateY(0) scaleY(.85)', opacity: 1, offset: 0.7 }, { transform: 'translateY(-14px)', opacity: 1, offset: 0.85 }, { transform: 'none', opacity: 1 }], { duration: 650, easing: 'cubic-bezier(.5,0,.75,0)' })
  for (let i = 0; i < 2; i++) {
    const ring = el(`<div style="position:absolute;left:50%;top:46%;width:20px;height:8px;margin:-4px 0 0 -10px;border-radius:50%;border:2px solid var(--p);opacity:0"></div>`)
    layer.insertBefore(ring, pin)
    A(ring, [{ transform: 'scale(1)', opacity: 0.8 }, { transform: 'scale(7)', opacity: 0 }], { duration: 1000, delay: i * 250, easing: 'linear' })
  }
  await A(label, [{ opacity: 0, transform: 'translate(-50%,10px)' }, { opacity: 1, transform: 'translate(-50%,0)' }], { duration: 450 })
  await wait(700)
  reveal()
  await Promise.all([
    ...[...layer.children].filter(node => node !== map).map(node => A(node, [{ opacity: 1 }, { opacity: 0 }], { duration: 700 })),
    A(map, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(2.4)' }], { duration: 800, easing: 'ease-in' }),
  ])
}

// Assemble: the letters fly in from everywhere and lock into place
const assemble: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const cover = el(`<div class="fill" style="background:var(--p)"></div>`)
  layer.append(cover)
  const text = content.title
  // Each letter flies on its own, each word kept together, and plain spaces between, so the line wraps between words
  const word = (letters: string) => `<span style="white-space:nowrap">${[...letters].map(char => `<span style="display:inline-block;opacity:0">${esc(char)}</span>`).join('')}</span>`
  const t = el(`<div class="center"><div style="max-width:86%;text-align:center;font:600 ${twoLines(text, 46, 300)}px/1.05 var(--f-display);letter-spacing:-.03em;color:var(--on)">${text.split(/\s+/).filter(Boolean).map(word).join(' ')}</div></div>`)
  layer.append(t)
  const R = rng(3)
  await Promise.all([...t.querySelectorAll('span span')].map((char, i) => A(char, [{ transform: `translate(${(R() - 0.5) * 500}px,${(R() - 0.5) * 700}px) rotate(${(R() - 0.5) * 240}deg) scale(${0.4 + R()})`, opacity: 0, filter: 'blur(6px)' }, { transform: 'none', opacity: 1, filter: 'blur(0)' }], { duration: 1100, delay: i * 35, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' })))
  const date = content.dateLong ? el(`<div style="position:absolute;left:0;right:0;top:calc(50% + 70px);text-align:center;font:600 10px var(--f-body);letter-spacing:.3em;text-transform:uppercase;color:var(--a-on-p);opacity:0">${esc(content.dateLong)}</div>`) : undefined
  if (date) {
    layer.append(date)
    await A(date, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 })
  }
  await wait(450)
  reveal()
  await Promise.all([cover, t, ...(date ? [date] : [])].map(node => A(node, [{ transform: 'none' }, { transform: 'translateY(-100vh)' }], { duration: 800, easing: EASE })))
}

// Colour bands: the page blurs, bands of the theme's colours close in from alternate sides, the heading shows and
// fades, then the bands open onto the page
const colorBands: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  // The page, blurred, from the start; under the bands once they close
  const blur = el(`<div class="fill" style="background:color-mix(in oklab,var(--bgS),transparent 65%);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)"></div>`)
  layer.append(blur)
  const colours = ['var(--p)', 'color-mix(in oklab,var(--p),var(--a) 35%)', 'var(--a)', 'color-mix(in oklab,var(--a),#fff 45%)', 'var(--bgS)']
  const bands = colours.map((colour, i) => el(`<div style="position:absolute;left:0;right:0;top:${i * 20}%;height:20.5%;background:${colour};transform:translateX(${i % 2 ? 100 : -100}%)"></div>`))
  bands.forEach(band => layer.append(band))
  const text = content.title
  const t = el(`<div class="center"><div style="font:600 ${twoLines(text, 40, 290)}px/1.05 var(--f-display);letter-spacing:-.03em;text-align:center;color:var(--on);text-shadow:0 2px 14px rgba(0,0,0,.25);max-width:80%;opacity:0">${esc(text)}</div></div>`)
  layer.append(t)
  await wait(250)
  await Promise.all(bands.map((band, i) => A(band, [{ transform: `translateX(${i % 2 ? 100 : -100}%)` }, { transform: 'none' }], { duration: 700, delay: i * 90, easing: EASE, fill: 'both' })))
  blur.remove()
  await A(t.firstElementChild!, [{ opacity: 0, letterSpacing: '.2em' }, { opacity: 1, letterSpacing: '-.03em' }], { duration: 700 })
  await wait(400)
  await A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 })
  reveal()
  await Promise.all(bands.map((band, i) => A(band, [{ transform: 'none' }, { transform: `translateX(${i % 2 ? -100 : 100}%)` }], { duration: 700, delay: (4 - i) * 80, easing: EASE })))
}

// Orbit: on an empty background the rings pop out from the middle with points of light circling them, the heading
// fades in, then the rings expand and the cover closes away
const orbit: Scene = async ({ layer, content, scale }, { A, el, wait, reveal, size }) => {
  const cover = el(`<div class="fill" style="background:var(--p)"></div>`)
  layer.append(cover)
  const { width, height } = size()
  const k = growth(width, height)
  // Three thin rings with a glowing dot each (the middle one in the accent), small and hidden until they pop out
  const rings = [90, 130, 170].map((base, i) => {
    const radius = base * k
    const ring = el(`<div style="position:absolute;left:50%;top:50%;width:${radius * 2}px;height:${radius * 2}px;margin:${-radius}px 0 0 ${-radius}px;border-radius:50%;border:1px solid color-mix(in oklab,var(--on),transparent 86%);scale:0;opacity:0"><span style="position:absolute;left:50%;top:-5px;width:10px;height:10px;margin-left:-5px;border-radius:50%;background:${i === 1 ? 'var(--a)' : 'var(--on)'};box-shadow:0 0 12px ${i === 1 ? 'var(--a)' : 'var(--on)'}"></span></div>`)
    layer.append(ring)
    // They circle at their own speeds and ways round until the intro ends (the kit stops the loops)
    loop(ring, [{ transform: `rotate(${i * 120}deg)` }, { transform: `rotate(${i * 120 + (i % 2 ? -360 : 360)}deg)` }], { duration: 2400 + i * 700, easing: 'linear' }, scale)
    return ring
  })
  const text = content.title
  const t = el(`<div class="center"><div style="text-align:center;color:var(--on);max-width:${150 * k}px;opacity:0"><div style="font:600 ${twoLines(text, 24, 150) * k}px/1.05 var(--f-display);letter-spacing:-.02em">${esc(text)}</div>${labelLine(content.dateNumeric, `font:600 ${9 * k}px var(--f-body);letter-spacing:.26em;text-transform:uppercase;opacity:.65;margin-top:8px`)}</div></div>`)
  layer.append(t)
  await wait(200)
  // The rings pop out from the middle, inner first, a little past their size
  await Promise.all(rings.map((ring, i) => A(ring, [{ opacity: 0, scale: 0 }, { opacity: 1, scale: 1.08, offset: 0.7 }, { opacity: 1, scale: 1 }], { duration: 750, delay: i * 120, easing: OUT, fill: 'both' })))
  await A(t.firstElementChild!, [{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 700 })
  await wait(700)
  reveal()
  await Promise.all([
    ...rings.map((ring, i) => A(ring, [{ scale: 1, opacity: 1 }, { scale: 4 + i, opacity: 0 }], { duration: 800, easing: 'cubic-bezier(.6,0,.8,.4)' })),
    A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 }),
    A(cover, [{ clipPath: 'circle(150% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }], { duration: 850, delay: 150, easing: EASE }),
  ])
}

// Word cycle: under the hero's small label, the heading's words cycle one by one, then the date, before the cover lifts
const wordCycle: Scene = async ({ layer, content }, { A, el, wait, reveal, size }) => {
  const cover = el(`<div class="fill" style="background:var(--p)"></div>`)
  layer.append(cover)
  // Each word of the heading, then the date as one
  const words = [...content.title.split(/\s+/).filter(Boolean), ...(content.dateLong ? [content.dateLong] : [])]
  // One line each, each as large as it fits (the reference's 50px when it does), centred in rows of the largest's height
  const { width } = size()
  const room = Math.min(width, 720) - 56
  const sizeOf = (word: string) => Math.max(18, Math.floor(Math.min(50, room / (Math.max(1, word.length) * 0.55))))
  const line = Math.round(Math.max(...words.map(sizeOf), 18) * 1.12)
  const box = el(`<div style="position:absolute;left:28px;right:28px;top:50%;transform:translateY(-50%);color:var(--on)">${labelLine(content.eyebrow, 'font:600 11px var(--f-body);letter-spacing:.3em;text-transform:uppercase;color:var(--a-on-p);margin-bottom:10px')}<div style="overflow:hidden;height:${line}px;font-family:var(--f-display);font-weight:600;letter-spacing:-.03em;white-space:nowrap"><div class="in">${words.map(word => `<div style="height:${line}px;display:flex;align-items:center;font-size:${sizeOf(word)}px;line-height:1">${esc(word)}</div>`).join('')}</div></div></div>`)
  layer.append(box)
  const inner = box.querySelector('.in')!
  // A long heading cycles faster, so it takes about as long
  const pause = Math.min(280, 1120 / Math.max(1, words.length - 1))
  for (let i = 1; i < words.length; i++) {
    await wait(i === 1 ? 500 : pause)
    await A(inner, [{ transform: `translateY(${-(i - 1) * line}px)` }, { transform: `translateY(${-i * line}px)` }], { duration: 320, easing: EASE })
  }
  await wait(600)
  reveal()
  await Promise.all([
    A(cover, [{ transform: 'none' }, { transform: 'translateY(-100%)' }], { duration: 800, easing: EASE }),
    A(box, [{ opacity: 1, transform: 'translateY(-50%)' }, { opacity: 0, transform: 'translateY(-120%)' }], { duration: 600, easing: EASE }),
  ])
}

// Paper tear: a sheet with the event's name tears across a ragged edge and the halves pull apart
const paperTear: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  // One seeded jagged edge makes both halves, each with the same centred text, so it lines up exactly
  const R = rng(6)
  const middle = 50
  const edge: [number, number][] = []
  for (let x = 0; x <= 100; x += 2.5)
    edge.push([x, middle + (R() - 0.5) * 3.2])
  const top = `polygon(0 0,100% 0,${[...edge].reverse().map(([x, y]) => `${x}% ${y}%`).join(',')})`
  const bottom = `polygon(${edge.map(([x, y]) => `${x}% ${y}%`).join(',')},100% 100%,0 100%)`
  const text = `<div class="center"><div class="tx" style="text-align:center;color:var(--txt);max-width:280px;padding:0 12px;opacity:0">${labelLine(content.eyebrow, 'font:600 10px var(--f-body);letter-spacing:.3em;text-transform:uppercase;color:var(--a-text);margin-bottom:6px')}<div style="font:600 ${twoLines(content.title, 36, 260)}px/1.05 var(--f-display);letter-spacing:-.02em">${esc(content.title)}</div></div></div>`
  const upper = el(`<div class="fill" style="${LIGHT_PAPER}clip-path:${top};filter:drop-shadow(0 2px 2px rgba(0,0,0,.15))">${text}</div>`)
  const lower = el(`<div class="fill" style="${LIGHT_PAPER}clip-path:${bottom}">${text}</div>`)
  // A thin white fibre along the tear
  const fibre = el(`<div class="fill" style="clip-path:${bottom};background:linear-gradient(180deg,transparent ${middle - 3}%,rgba(255,255,255,.9) ${middle}%,transparent ${middle + 2}%);opacity:0"></div>`)
  layer.append(lower, upper, fibre)
  await Promise.all([...layer.querySelectorAll('.tx')].map(node => A(node, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 })))
  await wait(600)
  A(fibre, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 })
  await Promise.all([
    A(upper, [{ transform: 'none' }, { transform: 'translateY(-6px) rotate(-1deg)' }], { duration: 220 }),
    A(lower, [{ transform: 'none' }, { transform: 'translateY(6px) rotate(1deg)' }], { duration: 220 }),
  ])
  reveal()
  await Promise.all([
    A(upper, [{ transform: 'translateY(-6px) rotate(-1deg)' }, { transform: 'translateY(-110%) rotate(-6deg)' }], { duration: 900, easing: 'cubic-bezier(.5,0,.3,1)' }),
    A(lower, [{ transform: 'translateY(6px) rotate(1deg)' }, { transform: 'translateY(110%) rotate(5deg)' }], { duration: 900, easing: 'cubic-bezier(.5,0,.3,1)' }),
    A(fibre, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }),
  ])
}

// Brush stroke: on an empty background a painted stroke sweeps across once, the heading appears on it, then everything
// wipes off
const brush: Scene = async ({ layer, content }, { A, el, wait, reveal, uid }) => {
  const cover = el(`<div class="fill" style="background:var(--bgS)"></div>`)
  layer.append(cover)
  // A band roughened by turbulence, hidden until the sweep paints it on from the left
  const rough = uid('brush')
  const stroke = el(`<svg class="fill" width="100%" height="100%" viewBox="0 0 360 640" preserveAspectRatio="none" style="clip-path:inset(0 100% 0 0)"><defs><filter id="${rough}"><feTurbulence type="fractalNoise" baseFrequency=".04 .5" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="14"/></filter></defs>
     <path d="M-20 300C80 280 200 330 380 296L380 368C220 392 100 350 -20 372Z" filter="url(#${rough})" style="fill:var(--p)"/></svg>`)
  layer.append(stroke)
  const text = content.title
  const t = el(`<div style="position:absolute;left:0;right:0;top:calc(52% - 18px);padding:0 24px;text-align:center;color:var(--on);font:600 ${twoLines(text, 30, 300)}px/1.1 var(--f-display);letter-spacing:-.02em;clip-path:inset(0 100% 0 0)">${esc(text)}</div>`)
  layer.append(t)
  await wait(200)
  await A(stroke, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 700, easing: 'cubic-bezier(.6,0,.2,1)' })
  await A(t, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 500, easing: 'ease-out' })
  await wait(600)
  reveal()
  await Promise.all([
    A(cover, [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 0 100%)' }], { duration: 800, easing: EASE }),
    A(stroke, [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 0 100%)' }], { duration: 800, easing: EASE }),
    A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }),
  ])
}

// Stardust: gold dust spirals in and the heading glows, then the dust scatters
const stardust: Scene = async ({ layer, content }, { A, el, wait, reveal, size, tween }) => {
  const cover = el(`<div class="fill" style="background:radial-gradient(70% 50% at 50% 50%,color-mix(in oklab,var(--p),#fff 8%),color-mix(in oklab,var(--p),#000 30%))"></div>`)
  layer.append(cover)
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
  const gold = getComputedStyle(layer).getPropertyValue('--a').trim() || '#C9A96A'
  const cx = width / 2
  const cy = height / 2
  const specks = Array.from({ length: 220 }, () => ({ a: Math.random() * Math.PI * 2, d: 120 + Math.random() * Math.max(width, height) * 0.7, s: 0.6 + Math.random() * 1.8, w: 0.6 + Math.random() * 1.2 }))
  const text = content.title
  const t = el(`<div class="center"><div style="text-align:center;color:var(--on);opacity:0;text-shadow:0 0 18px ${gold};max-width:280px;font:600 ${twoLines(text, 36, 260)}px/1.05 var(--f-display);letter-spacing:-.02em">${esc(text)}</div></div>`)
  layer.append(t)
  const glow = t.firstElementChild as HTMLElement
  const draw = (angle: (speck: typeof specks[number]) => number, distance: (speck: typeof specks[number]) => number, alpha: (speck: typeof specks[number]) => number) => {
    if (!g)
      return
    g.clearRect(0, 0, width, height)
    g.fillStyle = gold
    for (const speck of specks) {
      g.globalAlpha = alpha(speck)
      g.beginPath()
      g.arc(cx + Math.cos(angle(speck)) * distance(speck), cy + Math.sin(angle(speck)) * distance(speck) * 0.7, speck.s, 0, 7)
      g.fill()
    }
  }
  // In: the dust spirals in to 18% of its distance, twinkling; the text glows on from 55%
  await tween(1700, (k) => {
    const e = 1 - (1 - k) ** 3
    draw(speck => speck.a + e * speck.w * 4, speck => speck.d * (1 - e * 0.82), speck => 0.4 + 0.6 * Math.sin(k * 14 + speck.a) ** 2)
    if (k > 0.55)
      glow.style.opacity = String(Math.min(1, (k - 0.55) / 0.35))
  })
  await wait(450)
  reveal()
  A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 })
  // Out: it bursts outward as the cover fades
  await tween(800, (k) => {
    draw(speck => speck.a + speck.w * 4, speck => speck.d * 0.18 + k * k * speck.d * 1.4, () => 1 - k)
    cover.style.opacity = String(1 - k)
  })
  canvas.remove()
}

// Window light: afternoon light through a window drifts across a wall with the event's name
const windowLight: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  // The wall is the page's light background, a touch deeper so the sunlight shows on it; the light is fixed warm
  // sunlight, the window's bars dark
  const wall = el(`<div class="fill" style="background:${NOISE(0.7, 0.07)},linear-gradient(180deg,color-mix(in oklab,var(--bgS),#000 3%),color-mix(in oklab,var(--bgS),#000 7%))"></div>`)
  layer.append(wall)
  const light = el(`<div style="position:absolute;left:-10%;top:12%;width:76%;height:62%;transform:skewX(-14deg);filter:blur(5px);mix-blend-mode:screen;opacity:0;background:linear-gradient(90deg,transparent 48%,rgba(0,0,0,.6) 48% 52%,transparent 52%),linear-gradient(180deg,transparent 48%,rgba(0,0,0,.6) 48% 52%,transparent 52%),rgba(255,218,160,.75)"></div>`)
  layer.append(light)
  const text = content.title
  const t = el(`<div class="center"><div style="text-align:center;color:color-mix(in oklab,var(--txt),#000 20%);max-width:280px;padding:0 12px;opacity:0">${labelLine(content.dateLong, 'font:600 10px var(--f-body);letter-spacing:.3em;text-transform:uppercase;opacity:.65;margin-bottom:6px')}<div style="font:600 ${twoLines(text, 34, 260)}px/1.05 var(--f-display);letter-spacing:-.02em">${esc(text)}</div></div></div>`)
  layer.append(t)
  A(light, [{ opacity: 0, transform: 'translateX(-30%) skewX(-14deg)' }, { opacity: 1, transform: 'translateX(30%) skewX(-14deg)' }], { duration: 2400, easing: 'ease-in-out' })
  await A(t.firstElementChild!, [{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 500, fill: 'both' })
  await wait(900)
  reveal()
  await Promise.all([
    A(wall, [{ opacity: 1, filter: 'brightness(1)' }, { opacity: 0, filter: 'brightness(1.6)' }], { duration: 900 }),
    A(light, [{ opacity: 1 }, { opacity: 0 }], { duration: 700 }),
    A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 500 }),
  ])
}

// Whether the browser can blur what's behind an element
const canBlurBehind = () => typeof CSS !== 'undefined' && (CSS.supports?.('backdrop-filter', 'blur(1px)') || CSS.supports?.('-webkit-backdrop-filter', 'blur(1px)'))

// Frosted glass: the page sits behind frosted glass with the name on it, then the glass is wiped clear
const frostedGlass: Scene = async ({ layer, content }, { A, el, wait, reveal, tween }) => {
  // The page comes in first: it shows through the glass
  reveal()
  // Without backdrop blur, a solid tinted pane
  const glass = canBlurBehind()
    ? 'background:' + NOISE(0.9, 0.08) + ',rgba(255,255,255,.45);backdrop-filter:blur(18px) saturate(1.1);-webkit-backdrop-filter:blur(18px) saturate(1.1)'
    : 'background:' + NOISE(0.9, 0.08) + ',color-mix(in oklab,var(--bgS),#fff 30%)'
  const pane = el(`<div class="fill" style="${glass}"></div>`)
  layer.append(pane)
  const t = el(`<div class="center"><div style="text-align:center;color:var(--txt);max-width:280px;padding:0 12px;opacity:0">${labelLine(content.eyebrow, 'font:600 10px var(--f-body);letter-spacing:.3em;text-transform:uppercase;opacity:.6;margin-bottom:6px')}<div style="font:600 ${twoLines(content.title, 36, 260)}px/1.05 var(--f-display);letter-spacing:-.02em">${esc(content.title)}</div></div></div>`)
  layer.append(t)
  await A(t.firstElementChild!, [{ opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 800 })
  await wait(700)
  A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 })
  // Wiped clear on a slant, like a window
  await tween(1000, (k) => {
    const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2
    const x = -30 + e * 160
    const mask = `linear-gradient(105deg, transparent ${x - 30}%, #000 ${x}%)`
    pane.style.setProperty('-webkit-mask-image', mask)
    pane.style.setProperty('mask-image', mask)
  })
}

// Accordion fold: folded panels open out like a paper fan, then fold away
const accordion: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const count = 5
  const shade = (i: number) => (i % 2 ? 'color-mix(in oklab,var(--p),#000 14%)' : 'var(--p)')
  const wrap = el(`<div class="fill" style="display:flex;perspective:900px"></div>`)
  layer.append(wrap)
  // Five panels, hinged on alternating edges, folded flat to start
  const panels = Array.from({ length: count }, (_, i) => {
    const panel = el(`<div style="flex:1;margin:0 -.5px;background:${shade(i)};transform-origin:${i % 2 ? 'left' : 'right'} center;transform:rotateY(${i % 2 ? -90 : 90}deg)"></div>`)
    wrap.append(panel)
    return panel
  })
  const text = content.title
  const t = el(`<div class="center"><div style="text-align:center;color:var(--on);max-width:290px;padding:0 12px;opacity:0">${labelLine(content.eyebrow, 'font:600 10px var(--f-body);letter-spacing:.3em;text-transform:uppercase;color:var(--a-on-p);margin-bottom:6px')}<div style="font:600 ${twoLines(text, 38, 270)}px/1.05 var(--f-display);letter-spacing:-.02em">${esc(text)}</div></div></div>`)
  layer.append(t)
  await Promise.all(panels.map((panel, i) => A(panel, [{ transform: `rotateY(${i % 2 ? -90 : 90}deg)` }, { transform: 'rotateY(0)' }], { duration: 650, delay: i * 90, fill: 'both' })))
  await A(t.firstElementChild!, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 500 })
  await wait(600)
  A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 })
  reveal()
  await Promise.all(panels.map((panel, i) => A(panel, [{ transform: 'rotateY(0)' }, { transform: `rotateY(${i % 2 ? 90 : -90}deg)` }], { duration: 650, delay: (count - 1 - i) * 80, easing: 'cubic-bezier(.6,0,.8,.4)' })))
}

// Date roll: the event's date rolls into place digit by digit like an odometer
const dateRoll: Scene = async ({ layer, content }, { A, el, wait, reveal, size }) => {
  const cover = el(`<div class="fill" style="background:var(--p)"></div>`)
  layer.append(cover)
  const { width, height } = size()
  const k = growth(width, height)
  // Month first like every intro: "02 · 14 · 2027" → 02·14·27
  const [month, day, year] = (content.dateNumeric ?? '').split(' · ')
  const digits = month && day && year ? `${month}.${day}.${year.slice(-2)}` : ''
  const rowHeight = 76 * k
  // Each digit is a column of 0–9 twice, rolled to its second copy
  const column = (digit: number) => `<div style="height:${rowHeight}px;overflow:hidden;width:${44 * k}px"><div class="rl" data-d="${digit}">${Array.from({ length: 20 }, (_, n) => `<div style="height:${rowHeight}px;line-height:${rowHeight}px;text-align:center">${n % 10}</div>`).join('')}</div></div>`
  const text = content.title
  const g = el(`<div class="center"><div style="text-align:center;color:var(--on);padding:0 16px">${digits ? `<div style="display:flex;align-items:center;justify-content:center;font:600 ${68 * k}px var(--f-display);font-variant-numeric:tabular-nums;letter-spacing:-.03em">${[...digits].map(char => (char === '.' ? `<span style="color:var(--a-on-p);padding:0 2px">·</span>` : column(Number(char)))).join('')}</div>` : ''}
     <div class="tt" style="font:600 ${13 * k}px var(--f-body);letter-spacing:.26em;text-transform:uppercase;margin-top:14px;opacity:0;overflow-wrap:break-word">${esc(text)}</div></div></div>`)
  layer.append(g)
  // Like an odometer: each column rolls a little longer than the one before
  await Promise.all([...g.querySelectorAll<HTMLElement>('.rl')].map((roll, i) => A(roll, [{ transform: 'translateY(0)' }, { transform: `translateY(${-(10 + Number(roll.dataset.d)) * rowHeight}px)` }], { duration: 1100 + i * 150, easing: 'cubic-bezier(.2,.7,.2,1.02)' })))
  await A(g.querySelector('.tt')!, [{ opacity: 0, letterSpacing: '.5em' }, { opacity: 0.85, letterSpacing: '.26em' }], { duration: 600 })
  await wait(400)
  reveal()
  await Promise.all([cover, g].map(node => A(node, [{ transform: 'none' }, { transform: 'translateY(-100%)' }], { duration: 800, easing: EASE })))
}

// Focus pull: a camera viewfinder focuses on the page with a REC dot and a focus box, then the shutter clicks
const focusPull: Scene = async ({ layer, scale }, { A, el, reveal, size }) => {
  // The page comes in first: it's what the camera focuses on
  reveal()
  // Without backdrop blur, a dark tinted pane that clears instead
  const canBlur = canBlurBehind()
  const lens = el(`<div class="fill" style="${canBlur ? 'backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);background:rgba(0,0,0,.18)' : 'background:rgba(0,0,0,.55)'}"></div>`)
  layer.append(lens)
  // The viewfinder keeps its own colours: white marks, a red REC dot, a green box once focused. Its readouts grow on
  // bigger screens
  const { width, height } = size()
  const k = growth(width, height)
  const corner = (position: string) => `<span style="position:absolute;${position};width:26px;height:26px;border-color:#fff;border-style:solid;border-width:0"></span>`
  const ui = el(`<div class="fill" style="opacity:0">
     <div style="position:absolute;inset:14% 10%">${corner('left:0;top:0;border-left-width:2px;border-top-width:2px')}${corner('right:0;top:0;border-right-width:2px;border-top-width:2px')}${corner('left:0;bottom:0;border-left-width:2px;border-bottom-width:2px')}${corner('right:0;bottom:0;border-right-width:2px;border-bottom-width:2px')}</div>
     <div class="fb" style="position:absolute;left:50%;top:50%;width:120px;height:120px;margin:-60px 0 0 -60px;border:1.5px solid #fff"></div>
     <div style="position:absolute;left:10%;top:8%;display:flex;gap:${8 * k}px;align-items:center;font:600 ${11 * k}px ui-monospace,Menlo,monospace;color:#fff"><span class="rec" style="width:${8 * k}px;height:${8 * k}px;border-radius:50%;background:#FF3B30"></span>REC</div>
     <div style="position:absolute;right:10%;top:8%;font:600 ${11 * k}px ui-monospace,Menlo,monospace;color:#fff">f/1.8 · 1/250</div></div>`)
  layer.append(ui)
  const flash = el(`<div class="fill" style="background:#fff;opacity:0"></div>`)
  layer.append(flash)
  loop(ui.querySelector('.rec')!, [{ opacity: 1 }, { opacity: 0.2 }], { duration: 500, direction: 'alternate' }, scale)
  await A(ui, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 })
  // It hunts for focus: the blur eases, comes back a little, then clears as the box shrinks and turns green
  await Promise.all([
    A(ui.querySelector('.fb')!, [{ transform: 'scale(1.6)' }, { transform: 'scale(.7)', borderColor: '#fff' }, { transform: 'scale(.8)', borderColor: '#34C759' }], { duration: 1100, easing: 'ease-in-out' }),
    canBlur
      ? A(lens, [{ backdropFilter: 'blur(16px)' }, { backdropFilter: 'blur(9px)', offset: 0.4 }, { backdropFilter: 'blur(12px)', offset: 0.6 }, { backdropFilter: 'blur(0px)' }], { duration: 1100, easing: 'ease-in-out' })
      : A(lens, [{ opacity: 1 }, { opacity: 0.5, offset: 0.4 }, { opacity: 0.7, offset: 0.6 }, { opacity: 0 }], { duration: 1100, easing: 'ease-in-out' }),
  ])
  await A(flash, [{ opacity: 0 }, { opacity: 0.85, offset: 0.15 }, { opacity: 0 }], { duration: 450 })
  await A(ui, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 })
  lens.remove()
}

// Ribbon tape: two crossing bands of scrolling text sweep in and out across the screen
const ribbonTape: Scene = async ({ layer, content, scale }, { A, el, wait, reveal }) => {
  const cover = el(`<div class="fill" style="background:var(--bgS)"></div>`)
  layer.append(cover)
  // One line, repeated and clipped: the heading and the date
  const words = esc(`${[content.title, content.dateLong].filter(Boolean).join(' · ')} · `.toUpperCase().repeat(4))
  const band = (background: string, colour: string, turn: number, way: number, top: string) => {
    const strip = el(`<div style="position:absolute;left:-30%;right:-30%;top:${top};height:52px;background:${background};transform:rotate(${turn}deg) translateX(${way > 0 ? -120 : 120}%);display:flex;align-items:center;overflow:hidden;box-shadow:0 8px 18px rgba(0,0,0,.15)"><div class="mq" style="white-space:nowrap;font:800 22px var(--f-display);letter-spacing:.02em;color:${colour}">${words}</div></div>`)
    layer.append(strip)
    // The text scrolls until the intro ends (the kit stops the loop)
    loop(strip.querySelector('.mq')!, [{ transform: `translateX(${way > 0 ? '-50%' : '0'})` }, { transform: `translateX(${way > 0 ? '0' : '-50%'})` }], { duration: 6000, easing: 'linear' }, scale)
    return strip
  }
  const first = band('var(--p)', 'var(--on)', -12, 1, '40%')
  const second = band('var(--a)', 'var(--p)', 10, -1, '50%')
  await Promise.all([
    A(first, [{ transform: 'rotate(-12deg) translateX(-120%)' }, { transform: 'rotate(-12deg)' }], { duration: 700 }),
    A(second, [{ transform: 'rotate(10deg) translateX(120%)' }, { transform: 'rotate(10deg)' }], { duration: 700, delay: 120, fill: 'both' }),
  ])
  await wait(1000)
  reveal()
  await Promise.all([
    A(first, [{ transform: 'rotate(-12deg)' }, { transform: 'rotate(-12deg) translateX(120%)' }], { duration: 700, easing: 'cubic-bezier(.6,0,.8,.4)' }),
    A(second, [{ transform: 'rotate(10deg)' }, { transform: 'rotate(10deg) translateX(-120%)' }], { duration: 700, easing: 'cubic-bezier(.6,0,.8,.4)' }),
    A(cover, [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(50% 0 50% 0)' }], { duration: 800, delay: 150, easing: EASE }),
  ])
}

// Counter scroll: two columns of the heading scroll in opposite directions and line up, then a rule extends between
// them and they part
const counterScroll: Scene = async ({ layer, content }, { A, el, wait, reveal, size }) => {
  const cover = el(`<div class="fill" style="background:var(--p);overflow:hidden"></div>`)
  layer.append(cover)
  const words = content.title.split(/\s+/).filter(Boolean)
  const rows = 14
  // Each column one line per row, filled and outlined in turn, clipped at its half
  const column = (right: boolean) => {
    const col = el(`<div style="position:absolute;top:0;${right ? 'right' : 'left'}:0;width:50%;overflow:hidden;white-space:nowrap;font:600 32px/1.2 var(--f-display);letter-spacing:-.03em;text-align:${right ? 'left' : 'right'};padding:0 6px">${Array.from({ length: rows }, (_, k) => `<div style="${k % 2 ? 'color:transparent;-webkit-text-stroke:1px color-mix(in oklab,var(--on),transparent 60%)' : 'color:var(--on)'}">${esc(words[k % Math.max(1, words.length)] ?? '')}</div>`).join('')}</div>`)
    cover.append(col)
    return col
  }
  const left = column(false)
  const right = column(true)
  const { height } = size()
  const full = left.getBoundingClientRect().height || rows * 38
  // The rule waits, unseen, until the columns line up
  const rule = el(`<div style="position:absolute;left:0;right:0;top:50%;height:1px;background:var(--a);transform:scaleX(0)"></div>`)
  cover.append(rule)
  await Promise.all([
    A(left, [{ transform: `translateY(${-full + height}px)` }, { transform: `translateY(${height / 2 - full / 2}px)` }], { duration: 1700, easing: 'cubic-bezier(.15,.7,.2,1)', fill: 'both' }),
    A(right, [{ transform: 'translateY(0)' }, { transform: `translateY(${height / 2 - full / 2 - 25}px)` }], { duration: 1700, easing: 'cubic-bezier(.15,.7,.2,1)', fill: 'both' }),
  ])
  await A(rule, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 600, easing: EASE })
  await wait(400)
  reveal()
  await Promise.all([
    A(left, [{ translate: '0 0' }, { translate: '-110% 0' }], { duration: 750, easing: EASE }),
    A(right, [{ translate: '0 0' }, { translate: '110% 0' }], { duration: 750, easing: EASE }),
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: 350 }),
    A(rule, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }),
  ])
}

export const scenes: Record<string, Scene> = {
  'shutter': shutter,
  'film-strip': filmStrip,
  'card-flip': cardFlip,
  'stamp': stamp,
  'calendar': calendar,
  'pin-drop': pinDrop,
  'assemble': assemble,
  'color-bands': colorBands,
  'orbit': orbit,
  'word-cycle': wordCycle,
  'paper-tear': paperTear,
  'brush': brush,
  'stardust': stardust,
  'window-light': windowLight,
  'frosted-glass': frostedGlass,
  'accordion': accordion,
  'date-roll': dateRoll,
  'focus-pull': focusPull,
  'ribbon-tape': ribbonTape,
  'counter-scroll': counterScroll,
}
