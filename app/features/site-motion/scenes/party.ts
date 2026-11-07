import type { Scene } from './scene.kit'
import { EASE, esc, NOISE, OUT, rng } from './scene.kit'

// Party scenes (site-motion.type.ts `sceneIntroKeys.party`), from the intros reference. Loud and playful; the celebrant
// is the hero's heading (its first word in the small spots), the party phrases are the scenes' own.

// A third, lighter colour for confetti, lights and streamers
const LIGHT_P = 'color-mix(in oklab,var(--p),#fff 35%)'
const LIGHT_A2 = 'color-mix(in oklab,var(--a2),#fff 30%)'

// An endless loop (a flame's flicker, a spinning record), timed by the intensity; the kit cancels it when the intro stops
function loop(target: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions, scale: number) {
  if (typeof target.animate !== 'function')
    return
  target.animate(keyframes, { ...options, duration: (Number(options.duration) || 0) * scale, delay: (options.delay ?? 0) * scale })
}

// A font size that fits `text` in about `room` px at the reference's `size` (long names shrink)
const fit = (text: string, size: number, room: number, min = 14) => Math.max(min, Math.min(size, Math.floor(room / Math.max(1, text.length) * 1.7)))

// The hero's heading as a scene shows it, wrapped and sized like the hero's (HeroText, display size: 48px, 72px from a
// 42rem wide screen, 96px from 56rem; balanced lines up to 42rem wide; the heading font at its normal weight, as typed)
function heroHeading(width: number) {
  return `max-width:min(90%,42rem);font-family:var(--f-display);font-weight:400;font-size:${width >= 896 ? 96 : width >= 672 ? 72 : 48}px;line-height:1.05;text-align:center;text-wrap:balance;overflow-wrap:break-word`
}

// The biggest size (px, up to `max`) at which a heading's longest word fits on a line of the screen and the whole heading
// in about three, for letters about `em` wide (0.72 for capitals, about 0.6 for mixed case)
function headingSize(text: string, width: number, max: number, em = 0.72, min = 22) {
  const room = width * 0.88
  const longest = Math.max(1, ...text.split(/\s+/).map(word => word.length))
  return Math.max(min, Math.floor(Math.min(max, room / (longest * em), 3 * room / (Math.max(1, text.length) * em))))
}

// Countdown pop: 3, 2, 1 with a ring timer, then "Let's go!" and a confetti burst blows the cover away
const countdown: Scene = async ({ layer }, { A, el, reveal, wait, confetti }) => {
  const cover = el(`<div class="fill" style="background:var(--p)"></div>`)
  layer.append(cover)
  const ring = el(`<svg class="center" viewBox="0 0 200 200" style="width:100%;height:100%"><circle cx="100" cy="100" r="74" fill="none" style="stroke:color-mix(in srgb,var(--on) 15%,transparent)" stroke-width="5"/><circle class="rg" cx="100" cy="100" r="74" fill="none" style="stroke:var(--a2)" stroke-width="5" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" transform="rotate(-90 100 100)"/></svg>`)
  layer.append(ring)
  const n = el(`<div class="center"><div style="font:800 150px/1 var(--f-display);color:var(--on);letter-spacing:-.04em">3</div></div>`)
  layer.append(n)
  const d = n.firstElementChild as HTMLElement
  const rg = ring.querySelector('.rg')!
  for (const k of [3, 2, 1]) {
    d.textContent = String(k)
    d.style.color = k === 1 ? 'var(--a2)' : 'var(--on)'
    A(rg, [{ strokeDashoffset: 1.05 }, { strokeDashoffset: 0 }], { duration: 430, easing: 'linear' })
    await A(d, [{ transform: 'scale(1.6)', opacity: 0 }, { transform: 'scale(.94)', opacity: 1, offset: 0.45 }, { transform: 'scale(1)', opacity: 1, offset: 0.7 }, { transform: 'scale(.8)', opacity: 0 }], { duration: 460, easing: 'ease-out' })
  }
  d.textContent = 'Let\'s go!'
  Object.assign(d.style, { fontSize: '46px', whiteSpace: 'nowrap', textTransform: 'uppercase', color: 'var(--a2)' })
  confetti(0.5, 0.5, 110)
  await A(d, [{ transform: 'scale(.4) rotate(-10deg)', opacity: 0 }, { transform: 'scale(1.1) rotate(3deg)', opacity: 1, offset: 0.6 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: 'ease-out' })
  reveal()
  await Promise.all([
    A(cover, [{ clipPath: 'circle(150% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }], { duration: 800, easing: EASE }),
    A(ring, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }),
    A(d, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(2.2)', opacity: 0 }], { duration: 600, easing: EASE }),
  ])
  await wait(400)
}

// Balloon pop: a balloon floats up and wobbles, then pops; the page bursts out from the pop point
const balloon: Scene = async ({ layer }, { A, el, reveal, wait, size, confetti }) => {
  const cover = el(`<div class="fill" style="background:var(--a2)"></div>`)
  layer.append(cover)
  const b = el(`<div style="position:absolute;left:50%;top:100%;width:120px;margin-left:-60px">
     <svg viewBox="0 0 120 200" width="120"><path d="M60 8C30 8 12 34 12 64c0 36 28 62 46 70h4c18-8 46-34 46-70C108 34 90 8 60 8Z" style="fill:var(--pop)"/><path d="M54 136h12l-6 9Z" style="fill:var(--pop)"/><path d="M60 145c-8 14 8 22 0 34s6 16 0 20" style="stroke:var(--txt)" stroke-width="1.5" fill="none"/><ellipse cx="40" cy="44" rx="9" ry="16" fill="#fff" opacity=".45" transform="rotate(20 40 44)"/></svg></div>`)
  layer.append(b)
  await A(b, [{ transform: 'translateY(0)' }, { transform: 'translateY(-128%) translateY(-50%)' }], { duration: 900, easing: OUT })
  await A(b, [{ rotate: '0deg' }, { rotate: '6deg' }, { rotate: '-5deg' }, { rotate: '0deg' }], { duration: 450, easing: 'ease-in-out', composite: 'add' })
  await A(b, [{ scale: '1' }, { scale: '1.18' }], { duration: 160, easing: 'ease-in', composite: 'add' })
  const rect = b.getBoundingClientRect()
  const area = layer.getBoundingClientRect()
  const { width, height } = size()
  const percent = (value: number, fallback: number) => (Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : fallback).toFixed(1)
  const cx = percent((rect.left + rect.width / 2 - area.left) / width * 100, 50)
  const cy = percent((rect.top + 60 - area.top) / height * 100, 40)
  b.remove()
  const burst = el(`<div style="position:absolute;left:${cx}%;top:${cy}%;width:0;height:0">${Array.from({ length: 10 }, (_, i) => `<span style="position:absolute;width:3px;height:22px;background:var(--pop);border-radius:2px;transform:rotate(${i * 36}deg) translateY(-40px);transform-origin:50% 0"></span>`).join('')}</div>`)
  layer.append(burst)
  A(burst, [{ transform: 'scale(.4)', opacity: 1 }, { transform: 'scale(1.6)', opacity: 0 }], { duration: 450 })
  confetti(Number(cx) / 100, Number(cy) / 100, 60)
  reveal()
  // The reveal grows from the pop point
  await A(cover, [{ clipPath: `circle(150% at ${cx}% ${cy}%)` }, { clipPath: `circle(0% at ${cx}% ${cy}%)` }], { duration: 750, easing: EASE })
  await wait(400)
}

// Make a wish: a candle flickers in the dark, the flame blows out with a puff of smoke, and the lights come up
const candle: Scene = async ({ layer, scale }, { A, el, reveal, wait, confetti }) => {
  const dark = el(`<div class="fill" style="background:#0F0B1E"></div>`)
  layer.append(dark)
  const glow = el(`<div class="fill" style="background:radial-gradient(40% 30% at 50% 46%,rgba(255,190,90,.35),transparent 70%)"></div>`)
  layer.append(glow)
  const c = el(`<div class="center"><div style="position:relative;width:120px;height:220px;text-align:center">
     <div class="fl" style="position:absolute;left:50%;top:18px;width:22px;height:38px;margin-left:-11px;border-radius:50% 50% 50% 50%/62% 62% 38% 38%;background:radial-gradient(circle at 50% 70%,#FFF6C9,#FFC23F 55%,#FF7A1A);box-shadow:0 0 24px 6px rgba(255,170,60,.6)"></div>
     <div style="position:absolute;left:50%;top:56px;width:2px;height:10px;margin-left:-1px;background:#222"></div>
     <div style="position:absolute;left:50%;top:64px;width:16px;height:70px;margin-left:-8px;border-radius:3px;background:repeating-linear-gradient(45deg,#fff 0 6px,var(--a) 6px 12px)"></div>
     <div style="position:absolute;left:0;right:0;top:132px;height:50px;border-radius:10px 10px 4px 4px;background:var(--a);box-shadow:inset 0 10px 0 #fff"></div>
     <div class="wish" style="position:absolute;left:-40px;right:-40px;top:196px;font:600 13px var(--f-body);letter-spacing:.2em;text-transform:uppercase;color:#FFE7B0">Make a wish</div></div></div>`)
  layer.append(c)
  const fl = c.querySelector('.fl')!
  loop(fl, [{ transform: 'scale(1) rotate(-2deg)' }, { transform: 'scale(1.06,.94) rotate(2deg)' }, { transform: 'scale(.97,1.04) rotate(-1deg)' }], { duration: 300, iterations: Infinity, direction: 'alternate' }, scale)
  await A(c.querySelector('.wish')!, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: 200 })
  await wait(500)
  await A(fl, [{ opacity: 1, transform: 'translateX(0) scale(1)' }, { opacity: 0, transform: 'translateX(14px) scale(.2,.6)' }], { duration: 260, easing: 'ease-in' })
  for (let i = 0; i < 3; i++) {
    const s = el(`<div style="position:absolute;left:50%;top:calc(50% - 90px);width:14px;height:14px;margin-left:-7px;border-radius:50%;background:rgba(220,220,230,.5);filter:blur(3px)"></div>`)
    layer.append(s)
    A(s, [{ transform: 'translate(0,0) scale(.6)', opacity: 0.7 }, { transform: `translate(${(i - 1) * 14}px,-60px) scale(2.2)`, opacity: 0 }], { duration: 900, delay: i * 90, easing: 'linear' })
  }
  A(glow, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 })
  await wait(450)
  reveal()
  await Promise.all([
    A(dark, [{ opacity: 1 }, { opacity: 0 }], { duration: 700 }),
    A(c, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.9)' }], { duration: 500 }),
  ])
  confetti(0.5, 0.35, 50)
  await wait(500)
}

// Sticker slap: stickers slap onto the screen one after another, the hero's heading last and biggest in the middle,
// then they peel away and fall off. They're laid out on a board in the middle of the screen, scaled to fit it, so the
// cluster looks the same on a phone and a desktop.
const stickers: Scene = async ({ layer, content }, { A, el, reveal, wait, size }) => {
  const cover = el(`<div class="fill" style="background:var(--bgS)"></div>`)
  layer.append(cover)
  const { width, height } = size()
  const [boardW, boardH] = [360, 500]
  const zoom = Math.min(1.7, Math.max(0.85, Math.min(width / (boardW + 20), height / (boardH + 40))))
  const board = el(`<div style="position:absolute;left:50%;top:50%;width:${boardW}px;height:${boardH}px;margin:${-boardH / 2}px 0 0 ${-boardW / 2}px;transform:scale(${zoom})"></div>`)
  layer.append(board)
  // Around the edges of the board (x, y: the sticker's centre; size: its width), then the heading in the middle
  const S = [
    { t: 'IT\'S A', x: 105, y: 92, r: -10, bg: 'var(--a2)', s: 'pill', w: 140 },
    { t: 'PARTY', x: 262, y: 104, r: 8, bg: 'var(--a)', s: 'burst', c: '#fff', w: 132 },
    { t: '★', x: 78, y: 408, r: -6, bg: 'var(--a)', s: 'circle', c: '#fff', w: 104 },
    { t: 'YAY!', x: 274, y: 404, r: 12, bg: 'var(--a2)', s: 'star', w: 140 },
  ]
  const shape = (s: string, bg: string) => s === 'star'
    ? `<svg viewBox="0 0 100 100" class="fill"><path d="M50 4 61 36 96 38 68 59 78 94 50 74 22 94 32 59 4 38 39 36Z" style="fill:${bg};stroke:var(--txt)" stroke-width="4" stroke-linejoin="round"/></svg>`
    : s === 'burst'
      ? `<svg viewBox="0 0 100 100" class="fill"><path d="M50 2 58 20 78 10 76 32 98 34 84 50 98 66 76 68 78 90 58 80 50 98 42 80 22 90 24 68 2 66 16 50 2 34 24 32 22 10 42 20Z" style="fill:${bg};stroke:var(--txt)" stroke-width="4" stroke-linejoin="round"/></svg>`
      : ''
  const placed: [HTMLElement, number][] = []
  const slap = (e: HTMLElement, r: number) => A(e, [{ transform: `scale(1.7) rotate(${r - 20}deg)`, opacity: 0 }, { transform: `scale(.94) rotate(${r}deg)`, opacity: 1, offset: 0.75 }, { transform: `scale(1) rotate(${r}deg)`, opacity: 1 }], { duration: 230, easing: 'ease-out' })
  for (const s of S) {
    const h = s.s === 'pill' ? 60 : s.w
    const round = s.s === 'pill' || s.s === 'circle'
    // The text fits the shape's flat middle: most of a pill, about half a burst, a little over a third of a star
    const room = s.w * (s.s === 'pill' ? 0.8 : s.s === 'burst' ? 0.44 : 0.38)
    const fontSize = s.s === 'circle' ? 52 : fit(s.t, 24, room, 12)
    const e = el(`<div style="position:absolute;left:${s.x - s.w / 2}px;top:${s.y - h / 2}px;width:${s.w}px;height:${h}px;display:grid;place-items:center;${round ? `background:${s.bg};border:4px solid var(--txt);border-radius:999px;box-shadow:4px 5px 0 var(--txt);` : 'filter:drop-shadow(4px 5px 0 var(--txt));'}">${shape(s.s, s.bg)}<span style="position:relative;white-space:nowrap;font:800 ${fontSize}px/1 var(--f-display);color:${s.c ?? 'var(--txt)'};letter-spacing:-.01em">${esc(s.t)}</span></div>`)
    board.append(e)
    placed.push([e, s.r])
    await slap(e, s.r)
  }
  // The hero's heading: a big rounded sticker in the middle, in the primary with its readable text, up to three lines,
  // its size fitted to the heading's length
  const title = content.title.trim()
  if (title) {
    const fontSize = Math.min(40, Math.max(20, Math.floor(1000 / Math.max(1, title.length))))
    const row = el(`<div style="position:absolute;left:0;right:0;top:250px;height:0;display:flex;align-items:center;justify-content:center"></div>`)
    const e = el(`<div style="max-width:316px;padding:14px 24px;background:var(--p);border:4px solid var(--txt);border-radius:30px;box-shadow:5px 6px 0 var(--txt);text-align:center;font:800 ${fontSize}px/1.05 var(--f-display);color:var(--on);letter-spacing:-.01em;text-transform:uppercase;text-wrap:balance;overflow-wrap:anywhere">${esc(title)}</div>`)
    row.append(e)
    board.append(row)
    placed.push([e, -3])
    await slap(e, -3)
  }
  await wait(450)
  reveal()
  const fall = height / zoom + 200
  placed.forEach(([e, r], i) => A(e, [{ transform: `rotate(${r}deg)` }, { transform: `translateY(${fall}px) rotate(${r + (i % 2 ? 40 : -40)}deg)` }], { duration: 750, delay: i * 60, easing: 'cubic-bezier(.5,0,.75,0)' }))
  await A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: 200 })
  await wait(500)
}

// Gift box: a present shakes, the lid pops off and confetti bursts up out of the box, and the box drops away
const giftBox: Scene = async ({ layer }, { A, el, reveal, wait, confetti, size }) => {
  const cover = el(`<div class="fill" style="background:var(--p)"></div>`)
  layer.append(cover)
  // The ribbon: a light tint of the accent (the primary without one), so it shows on the box and on the background
  const g = el(`<div class="center"><div style="position:relative;width:140px;height:150px;--ribbon:color-mix(in oklab,var(--pop),#fff 55%)">
     <div class="box" style="position:absolute;left:10px;right:10px;bottom:0;height:100px;background:var(--a2);border-radius:6px"><div style="position:absolute;left:50%;top:0;bottom:0;width:20px;margin-left:-10px;background:var(--ribbon)"></div></div>
     <div class="lid" style="position:absolute;left:0;right:0;top:20px;height:34px;background:var(--a2);border-radius:6px;box-shadow:inset 0 -6px 0 rgba(0,0,0,.12)"><div style="position:absolute;left:50%;top:0;bottom:0;width:22px;margin-left:-11px;background:var(--ribbon)"></div>
       <div style="position:absolute;left:50%;top:-26px;width:60px;height:30px;margin-left:-30px"><span style="position:absolute;left:0;width:30px;height:26px;border:7px solid var(--ribbon);border-radius:50% 50% 0 50%;transform:rotate(-20deg)"></span><span style="position:absolute;right:0;width:30px;height:26px;border:7px solid var(--ribbon);border-radius:50% 50% 50% 0;transform:rotate(20deg)"></span></div></div></div></div>`)
  layer.append(g)
  const box = g.firstElementChild!
  const lid = g.querySelector('.lid')!
  await A(box, [{ transform: 'translateY(60px) scale(.6)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 450, easing: 'cubic-bezier(.34,1.56,.64,1)' })
  await A(box, [{ transform: 'rotate(0)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(0)' }], { duration: 500 })
  // Out of the box's opening: a big, wide burst up, then a second one a moment later, in colours that show on the
  // primary cover. It falls over the page as it comes in, and the scene ends once it has landed.
  let landed: Promise<unknown> = Promise.resolve()
  const [area, opening] = [layer.getBoundingClientRect(), g.querySelector('.box')!.getBoundingClientRect()]
  if (area.width && area.height) {
    const { width, height } = size()
    const k = width >= 900 ? 1.4 : 1
    const [x, y] = [(opening.left + opening.width / 2 - area.left) / area.width, (opening.top - area.top) / area.height]
    const burst = { angle: 0, spread: 130, distance: Math.min(height * 0.85, 720), size: 1.3 * k, colours: ['--a', '--a2', '--on'] }
    landed = Promise.all([
      confetti(x, y, Math.round(170 * k), burst),
      wait(140).then(() => confetti(x, y, Math.round(90 * k), { ...burst, spread: 80, distance: burst.distance * 0.8 })),
    ])
  }
  await A(lid, [{ transform: 'none' }, { transform: 'translate(70px,-260px) rotate(50deg)' }], { duration: 500, easing: 'cubic-bezier(.2,.7,.3,1)' })
  reveal()
  await Promise.all([
    // The box drops off the bottom of the screen, taking the lid with it
    A(box, [{ transform: 'none' }, { transform: `translateY(${size().height + 400}px) rotate(10deg)` }], { duration: 700, easing: 'cubic-bezier(.5,0,.75,0)' }),
    A(cover, [{ clipPath: 'circle(150% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }], { duration: 800, delay: 100, easing: EASE }),
  ])
  await landed
}

// Disco ball: a disco ball drops in, coloured lights swirl, the hero's heading (set like the hero's) flashes under it,
// then the lights come on
const disco: Scene = async ({ layer, content, scale }, { A, el, reveal, size }) => {
  const cover = el(`<div class="fill" style="background:#0E0A1C"></div>`)
  layer.append(cover)
  const lights = ['var(--a)', 'var(--a2)', LIGHT_P, LIGHT_A2]
  // A wide screen gets more, bigger lights and a bigger ball, so it's as full as a phone
  const { width } = size()
  const k = width >= 900 ? 1.5 : 1
  const spots: HTMLElement[] = []
  for (let i = 0; i < (k > 1 ? 30 : 14); i++) {
    const s = el(`<div style="position:absolute;left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${(30 + Math.random() * 50) * k}px;height:${(30 + Math.random() * 50) * k}px;border-radius:50%;background:${lights[i % 4]};opacity:.55;filter:blur(6px)"></div>`)
    layer.append(s)
    spots.push(s)
    A(s, [{ transform: 'translate(0,0)' }, { transform: `translate(${(Math.random() - 0.5) * 220}px,${(Math.random() - 0.5) * 220}px)` }], { duration: 1800, easing: 'ease-in-out' })
  }
  const ball = el(`<div style="position:absolute;left:50%;top:0;width:${90 * k}px;margin-left:${-45 * k}px"><div style="width:2px;height:${80 * k}px;margin:0 auto;background:#888"></div>
     <div class="bl" style="width:${90 * k}px;height:${90 * k}px;border-radius:50%;background:repeating-linear-gradient(0deg,rgba(0,0,0,.25) 0 1px,transparent 1px 10px),repeating-linear-gradient(90deg,rgba(0,0,0,.25) 0 1px,transparent 1px 10px),radial-gradient(circle at 35% 30%,#fff,#B8B8C8 45%,#6A6A80);box-shadow:0 0 30px rgba(255,255,255,.4)"></div></div>`)
  layer.append(ball)
  const heading = content.title.trim()
  const title = el(`<div class="center"><div style="${heroHeading(width)};color:#fff;margin-top:${120 * k}px">${esc(heading)}</div></div>`)
  layer.append(title)
  loop(ball.querySelector('.bl')!, [{ backgroundPosition: '0 0,0 0,0 0' }, { backgroundPosition: '0 0,40px 0,0 0' }], { duration: 600, iterations: 4 }, scale)
  await A(ball, [{ transform: 'translateY(-200px)' }, { transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.34,1.3,.64,1)' })
  await A(title.firstElementChild!, [{ opacity: 0 }, { opacity: 1, textShadow: '0 0 18px var(--a)' }, { opacity: 0.3 }, { opacity: 1, textShadow: '0 0 18px var(--a2)' }], { duration: 900 })
  reveal()
  await Promise.all([
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 }),
    A(ball, [{ transform: 'none' }, { transform: 'translateY(-260px)' }], { duration: 600, easing: EASE }),
    A(title, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 }),
    ...spots.map(s => A(s, [{ opacity: 0.55 }, { opacity: 0 }], { duration: 500 })),
  ])
}

// Party poppers: a striped popper in each bottom corner, aimed at the middle, fires a burst of confetti and a few wavy
// ribbons that meet over the page, and the page drops in. Each popper is drawn upright around its base and turned into
// place, so its ribbons always leave its own mouth; they're drawn over the hole and clipped to it and what's past the
// rim, so they come out of the tube without crossing it.
const popper: Scene = async ({ layer }, { A, el, reveal, wait, confetti, size, uid }) => {
  const cover = el(`<div class="fill" style="background:var(--bgS)"></div>`)
  layer.append(cover)
  const { width, height } = size()
  const k = width >= 900 ? 1.7 : 1
  const f = (n: number) => n.toFixed(1)
  const L = 118 * k // the tube's length, from its rounded bottom (the base) to the rim
  const h = 23 * k // half its width
  const base = [Math.max(56 * k, width * 0.12), height - 46 * k] as const
  // Turned to aim at the middle of the screen, a little above centre
  const aim = Math.atan2(width / 2 - base[0], base[1] - height * 0.38) * 180 / Math.PI
  const turn = Math.min(38, Math.max(22, aim))
  const rad = turn * Math.PI / 180
  const mouth = [base[0] + L * Math.sin(rad), base[1] - L * Math.cos(rad)] as const
  const reach = Math.hypot(width / 2 - base[0], base[1] - height * 0.38)
  const colours = ['var(--a)', 'var(--p)', 'var(--a2)', LIGHT_P]

  // A ribbon from the hole: a long, loose wave along a gently bending line `angle` degrees from the tube's axis, its
  // waves growing as it flies
  const ribbon = (random: () => number, angle: number, colour: string) => {
    const a = angle * Math.PI / 180
    const [ux, uy] = [Math.sin(a), -Math.cos(a)]
    const [vx, vy] = [Math.cos(a), Math.sin(a)]
    const length = reach * (0.6 + random() * 0.35)
    const waves = 2.5 + random() * 1.5
    const bend = (random() - 0.5) * 0.6
    const amp = (10 + random() * 8) * k
    const points = Array.from({ length: 61 }, (_, i) => {
      const along = length * i / 60
      const across = amp * (0.3 + i / 60) * Math.sin(waves * 2 * Math.PI * i / 60) + bend * along * along / length
      return `${f(ux * along + vx * across)} ${f(-L + 6 * k + uy * along + vy * across)}`
    })
    return `<path d="M${points.join('L')}" fill="none" style="stroke:${colour}" stroke-width="${f(4 * k)}" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 2" stroke-dashoffset="1.05"/>`
  }

  const tube = (side: 1 | -1) => {
    const [body, shade, out] = [uid('pb'), uid('ps'), uid('po')]
    const outline = `M${f(-h)} ${f(-L)}L${f(-h)} ${f(-h * 0.6)}A${f(h)} ${f(h * 0.6)} 0 0 0 ${f(h)} ${f(-h * 0.6)}L${f(h)} ${f(-L)}Z`
    const stripes = [0.2, 0.42, 0.64, 0.86].map(t => `<path d="M${f(-h)} ${f(-L * t + 7 * k)}Q0 ${f(-L * t + 13 * k)} ${f(h)} ${f(-L * t - 6 * k)}" fill="none" style="stroke:var(--a)" stroke-width="${f(7 * k)}"/>`).join('')
    const hole = (attrs: string) => `<ellipse cx="0" cy="${f(-L)}" rx="${f(h)}" ry="${f(h * 0.32)}" ${attrs}/>`
    // Each popper's own ribbons (seeded by side), so the two bursts aren't mirror images
    const random = rng(side === 1 ? 11 : 29)
    const ribbons = [-22, 0, 22].map((angle, i) => ribbon(random, angle + (random() - 0.5) * 10, colours[i % 4]!)).join('')
    const at = side === 1 ? base[0] : width - base[0]
    return `<g transform="translate(${f(at)} ${f(base[1])}) scale(${side} 1) rotate(${f(turn)})"><g class="tube">
      <defs>
        <clipPath id="${body}"><path d="${outline}"/></clipPath>
        <clipPath id="${out}">${hole('')}<rect x="${f(-reach * 3)}" y="${f(-reach * 3)}" width="${f(reach * 6)}" height="${f(reach * 3 - L)}"/></clipPath>
        <linearGradient id="${shade}"><stop offset="0" stop-color="#000" stop-opacity=".4"/><stop offset=".3" stop-color="#fff" stop-opacity=".3"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
      </defs>
      <path d="M0 ${f(2 * k)}C${f(-16 * k)} ${f(-2 * k)} ${f(-34 * k)} ${f(8 * k)} ${f(-40 * k)} ${f(-6 * k)}C${f(-45 * k)} ${f(-19 * k)} ${f(-27 * k)} ${f(-22 * k)} ${f(-28 * k)} ${f(-9 * k)}C${f(-29 * k)} ${f(5 * k)} ${f(-54 * k)} ${f(14 * k)} ${f(-72 * k)} ${f(4 * k)}" fill="none" style="stroke:var(--a)" stroke-width="${f(3 * k)}" stroke-linecap="round"/>
      <path d="M${f(-5 * k)} 0L${f(5 * k)} 0L${f(10 * k)} ${f(17 * k)}L${f(-10 * k)} ${f(17 * k)}Z" style="fill:color-mix(in oklab,var(--p),#000 35%)"/>
      <g clip-path="url(#${body})"><path d="${outline}" style="fill:var(--p)"/>${stripes}<rect x="${f(-h)}" y="${f(-L)}" width="${f(2 * h)}" height="${f(L)}" fill="url(#${shade})"/></g>
      ${hole('style="fill:color-mix(in oklab,var(--p),#000 55%);stroke:color-mix(in oklab,var(--p),#fff 35%)" stroke-width="' + f(2 * k) + '"')}
      <g class="ribbons" clip-path="url(#${out})">${ribbons}</g>
    </g></g>`
  }

  const s = el(`<svg class="fill" viewBox="0 0 ${f(width)} ${f(height)}">${tube(1)}${tube(-1)}</svg>`)
  layer.append(s)
  const tubes = [...s.querySelectorAll('.tube')]
  await Promise.all(tubes.map(t => A(t, [{ transform: `translateY(${f(L + 80 * k)}px)` }, { transform: 'none' }], { duration: 450, easing: OUT })))
  await Promise.all(tubes.map(t => A(t, [{ transform: 'none' }, { transform: `translateY(${f(10 * k)}px) scaleY(.94)` }, { transform: 'none' }], { duration: 200 })))
  // Most of the burst is confetti, aimed along each popper: a big, wide burst whose farthest pieces reach the top of the
  // screen, then a second one a moment later. It falls over the page as it comes in, and the scene ends once it has
  // landed.
  const burst = { spread: 95, distance: mouth[1] / Math.cos(rad) * 1.75, size: 1.3 * k }
  const fire = (count: number, more: Partial<typeof burst> = {}) => Promise.all([
    confetti(mouth[0] / width, mouth[1] / height, Math.round(count * k), { ...burst, ...more, angle: turn }),
    confetti(1 - mouth[0] / width, mouth[1] / height, Math.round(count * k), { ...burst, ...more, angle: -turn }),
  ])
  const landed = Promise.all([fire(160), wait(140).then(() => fire(80, { spread: 60, distance: burst.distance * 0.8 }))])
  await Promise.all([...s.querySelectorAll('.ribbons path')].map((p, i) => A(p, [{ strokeDashoffset: 1.05 }, { strokeDashoffset: 0 }], { duration: 850, delay: (i % 3) * 60, easing: OUT })))
  await wait(200)
  reveal()
  await Promise.all([
    A(cover, [{ transform: 'none' }, { transform: 'translateY(100%)' }], { duration: 750, easing: EASE }),
    A(s, [{ opacity: 1 }, { opacity: 0 }], { duration: 500 }),
  ])
  await landed
}

// Marquee lights: a sign with the hero's heading drops in and its bulbs light up one by one around it. The sign is sized
// to the heading (about three lines at most, as wide as the screen allows) and the bulbs are spaced evenly around its
// edge.
const marqueeLights: Scene = async ({ layer, content }, { A, el, reveal, wait, size }) => {
  const cover = el(`<div class="fill" style="background:#1D1440"></div>`)
  layer.append(cover)
  const title = content.title.trim()
  const { width } = size()
  const W = Math.round(Math.min(width - 48, 600))
  // The biggest size at which the heading fits in three lines (a capital is about 0.8em wide), smaller on a phone
  const room = W - 48
  const sizes = [56, 52, 48, 44, 40, 36, 32, 28, 24, 22, 20].filter(px => W >= 480 || px <= 40)
  const fontSize = sizes.find(px => Math.ceil(title.length * 0.8 * px / room) <= 3) ?? 20
  const lines = Math.max(1, Math.ceil(title.length * 0.8 * fontSize / room))
  // The sign takes the heading's height; the bulbs go around the size it ends up (the estimate where nothing is laid out)
  const sign = el(`<div class="center"><div style="position:relative;box-sizing:border-box;width:${W}px;min-height:130px;padding:34px 24px;background:var(--p);border-radius:8px;display:grid;place-items:center;text-align:center;color:var(--on)">
     <div style="font:800 ${fontSize}px/1.02 var(--f-display);text-transform:uppercase;letter-spacing:-.02em;overflow-wrap:anywhere;text-wrap:balance">${esc(title)}</div></div></div>`)
  layer.append(sign)
  const plate = sign.firstElementChild as HTMLElement
  const H = plate.offsetHeight || Math.round(Math.max(130, lines * fontSize * 1.02 + 68))
  const perimeter = 2 * (W + H)
  const n = Math.round(perimeter / 22 / 2) * 2
  plate.insertAdjacentHTML('afterbegin', Array.from({ length: n }, (_, i) => {
    const d = i / n * perimeter
    const [x, y] = d < W ? [d, 0] : d < W + H ? [W, d - W] : d < 2 * W + H ? [W - (d - W - H), H] : [0, H - (d - 2 * W - H)]
    return `<span style="position:absolute;left:${(x - 6).toFixed(1)}px;top:${(y - 6).toFixed(1)}px;width:12px;height:12px;border-radius:50%;background:#5A4A30" class="bu"></span>`
  }).join(''))
  const bu = sign.querySelectorAll('.bu')
  await A(plate, [{ transform: 'translateY(-400px)' }, { transform: 'none' }], { duration: 550, easing: 'cubic-bezier(.34,1.4,.64,1)' })
  // Two laps of lights, at the same speed whatever the sign's size
  const step = Math.max(8, Math.round(400 / n))
  for (let r = 0; r < 2; r++) {
    for (let i = 0; i < n; i += 2) {
      [bu[i], bu[i + 1]].forEach(b => b && A(b, [{ background: '#5A4A30' }, { background: '#FFE38A', boxShadow: '0 0 10px #FFD23F' }], { duration: 120 }))
      await wait(step)
    }
  }
  bu.forEach((b, i) => A(b, [{ opacity: 1 }, { opacity: 0.3 }, { opacity: 1 }], { duration: 240, iterations: 2, delay: (i % 2) * 120, fill: 'none' }))
  await wait(500)
  reveal()
  await Promise.all([
    A(plate, [{ transform: 'none' }, { transform: `translateY(${size().height}px) rotate(8deg)` }], { duration: 650, easing: 'cubic-bezier(.5,0,.75,0)' }),
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 600, delay: 150 }),
  ])
}

// Bouncy letters: each letter of the hero's heading drops in and bounces, then they all jump off the top. The heading
// is as big as the screen allows (words stay whole, about three lines at most), and the letters drop in over about the
// same time however long it is.
const bouncy: Scene = async ({ layer, content }, { A, el, reveal, wait, size }) => {
  const cover = el(`<div class="fill" style="background:var(--a2)"></div>`)
  layer.append(cover)
  const title = content.title.trim().toUpperCase()
  const { width } = size()
  const fontSize = headingSize(title, width, width >= 900 ? 84 : 48)
  // Words stay whole when the heading wraps
  const words = title.split(/\s+/).filter(Boolean).map(w => `<span style="display:inline-flex;white-space:nowrap">${[...w].map(c => `<span class="ch" style="display:inline-block">${esc(c)}</span>`).join('')}</span>`).join('')
  const w = el(`<div class="center"><div style="display:flex;flex-wrap:wrap;justify-content:center;column-gap:.3em;row-gap:.1em;max-width:90%;font:800 ${fontSize}px/1 var(--f-display);color:var(--p);letter-spacing:-.02em">${words}</div></div>`)
  layer.append(w)
  const ch = [...w.querySelectorAll('.ch')]
  const drop = Math.min(55, 800 / Math.max(1, ch.length))
  await Promise.all(ch.map((c, i) => A(c, [{ transform: 'translateY(-500px)' }, { transform: 'translateY(0) scaleY(.8)', offset: 0.6 }, { transform: 'translateY(-30px) scaleY(1.05)', offset: 0.8 }, { transform: 'none' }], { duration: 700, delay: i * drop, easing: 'cubic-bezier(.3,0,.4,1)' })))
  await wait(250)
  reveal()
  const jump = Math.min(35, 600 / Math.max(1, ch.length))
  ch.forEach((c, i) => A(c, [{ transform: 'none' }, { transform: 'translateY(18px)', offset: 0.25 }, { transform: `translateY(-${size().height + 200}px) rotate(${(i % 2 ? 1 : -1) * 30}deg)` }], { duration: 650, delay: i * jump, easing: 'cubic-bezier(.5,0,.75,0)' }))
  await A(cover, [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 700, delay: 250, easing: EASE })
}

// Jackpot: a slot machine per word of the hero's heading, stacked, whose reels spin and land on it letter by letter,
// with a confetti win. The reels are sized so the longest word's machine and all the machines fit the screen.
const slot: Scene = async ({ layer, content }, { A, el, reveal, wait, confetti, size }) => {
  const cover = el(`<div class="fill" style="background:var(--p)"></div>`)
  layer.append(cover)
  const rows = content.title.trim().toUpperCase().split(/\s+/).filter(Boolean).map(w => [...w])
  const words = rows.length ? rows : [['★']]
  const pool = 'PARTY7★!CAKE'.split('')
  const { width, height } = size()
  const gap = 6
  const longest = Math.max(...words.map(w => w.length))
  const byWidth = (Math.min(width * 0.92, 980) - 38) / longest - gap
  // Each machine adds its padding and border (up to 16 + 3 a side), and they're 12px apart
  const byHeight = (height * 0.82 - words.length * 38 - (words.length - 1) * 12) / words.length / 1.34
  const reelWidth = Math.max(16, Math.floor(Math.min(width >= 900 ? 72 : 58, byWidth, byHeight)))
  const reelHeight = Math.round(reelWidth * 1.34)
  const spins = words.flat().length > 24 ? 9 : 14
  const reel = (f: string) => {
    const seq = Array.from({ length: spins }, () => pool[Math.floor(Math.random() * pool.length)]!).concat(f)
    return `<div style="box-sizing:border-box;width:${reelWidth}px;height:${reelHeight}px;overflow:hidden;background:#fff;border-radius:${Math.round(reelWidth * 0.17)}px;border:${reelWidth < 32 ? 2 : 3}px solid var(--txt)"><div class="strip">${seq.map((c, i) => `<div style="height:${reelHeight - (reelWidth < 32 ? 4 : 6)}px;display:grid;place-items:center;font:800 ${Math.round(reelWidth * 0.86)}px/1 var(--f-display);color:${i === seq.length - 1 ? 'var(--a-text)' : 'var(--txt)'}">${esc(c)}</div>`).join('')}</div></div>`
  }
  const pad = Math.round(Math.min(16, Math.max(8, reelWidth * 0.28)))
  const machine = (w: string[]) => `<div class="machine" style="padding:${pad}px;background:var(--a2);border-radius:${pad + 4}px;border:3px solid var(--txt);box-shadow:5px 6px 0 var(--txt);display:flex;gap:${gap}px">${w.map(reel).join('')}</div>`
  const m = el(`<div class="center"><div style="display:flex;flex-direction:column;align-items:center;gap:12px">${words.map(machine).join('')}</div></div>`)
  layer.append(m)
  const machines = [...m.querySelectorAll('.machine')]
  const strips = [...m.querySelectorAll('.strip')]
  const step = reelHeight - (reelWidth < 32 ? 4 : 6)
  // The machines pop in one after another
  const stagger = Math.min(90, 400 / Math.max(1, machines.length - 1))
  await Promise.all(machines.map((box, i) => A(box, [{ transform: 'scale(.7)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 350, delay: i * stagger, easing: 'cubic-bezier(.34,1.56,.64,1)' })))
  // Reading order, the last landing about a second after the first however many reels there are
  const spread = Math.min(220, 1000 / Math.max(1, strips.length - 1))
  await Promise.all(strips.map((s, i) => A(s, [{ transform: 'translateY(0)' }, { transform: `translateY(-${spins * step}px)` }], { duration: 900 + i * spread, easing: 'cubic-bezier(.2,.7,.25,1.05)' })))
  confetti(0.5, 0.5, 60)
  await wait(250)
  reveal()
  await Promise.all([
    A(m, [{ transform: 'none', opacity: 1 }, { transform: 'scale(1.4)', opacity: 0 }], { duration: 500, easing: EASE }),
    A(cover, [{ clipPath: 'circle(150% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }], { duration: 750, easing: EASE }),
  ])
  await wait(300)
}

// Champagne pop: a bottle shakes, the cork flies, and bubbles fizz up and wash the cover away. The glass is the primary
// (dark at the edges, a light highlight down the middle) and the label the secondary.
const champagne: Scene = async ({ layer }, { A, el, reveal, wait, size, uid }) => {
  const cover = el(`<div class="fill" style="background:radial-gradient(70% 55% at 50% 60%,#2C2250,#0F0B20)"></div>`)
  layer.append(cover)
  const glass = uid('chg')
  const foil = uid('chf')
  const b = el(`<div style="position:absolute;left:50%;bottom:-6%;width:110px;margin-left:-55px;transform-origin:50% 100%;transform:rotate(-14deg)"><svg viewBox="0 0 110 330" style="width:100%;overflow:visible">
     <defs><linearGradient id="${glass}" x1="0" x2="1"><stop offset="0" style="stop-color:color-mix(in oklab,var(--p),#000 60%)"/><stop offset=".35" style="stop-color:color-mix(in oklab,var(--p),#000 15%)"/><stop offset=".5" style="stop-color:color-mix(in oklab,var(--p),#fff 45%)"/><stop offset=".62" style="stop-color:color-mix(in oklab,var(--p),#000 20%)"/><stop offset="1" style="stop-color:color-mix(in oklab,var(--p),#000 65%)"/></linearGradient>
     <linearGradient id="${foil}" x1="0" x2="1"><stop offset="0" stop-color="#8E6C30"/><stop offset=".5" stop-color="#F4E2A8"/><stop offset="1" stop-color="#8E6C30"/></linearGradient></defs>
     <path d="M40 40H70V100C70 130 100 140 100 180V330H10V180C10 140 40 130 40 100Z" fill="url(#${glass})"/>
     <path d="M38 34H72V110C72 128 86 136 92 148H18C24 136 38 128 38 110Z" fill="url(#${foil})"/>
     <rect x="18" y="200" width="74" height="62" rx="3" style="fill:var(--a2)"/><text x="55" y="236" text-anchor="middle" style="font:800 13px var(--f-display);fill:var(--on2)">PARTY</text></svg>
     <div class="ck" style="position:absolute;left:50%;top:-14px;width:28px;height:30px;margin-left:-14px;border-radius:6px 6px 3px 3px;background:linear-gradient(90deg,#B58E5A,#E9CFA0,#A07A48)"></div></div>`)
  layer.append(b)
  const ck = b.querySelector('.ck')!
  await A(b, [{ transform: 'translateY(60%) rotate(-14deg)' }, { transform: 'rotate(-14deg)' }], { duration: 550, easing: OUT })
  await A(b, [{ transform: 'rotate(-14deg)' }, { transform: 'rotate(-11deg)' }, { transform: 'rotate(-17deg)' }, { transform: 'rotate(-14deg)' }], { duration: 400 })
  A(ck, [{ transform: 'none' }, { transform: 'translate(120px,-560px) rotate(540deg)' }], { duration: 700, easing: 'cubic-bezier(.2,.7,.4,1)' })
  const { width, height } = size()
  for (let i = 0; i < 34; i++) {
    const s = 4 + Math.random() * 10
    const d = el(`<div style="position:absolute;left:${width * 0.47}px;top:${height * 0.66}px;width:${s}px;height:${s}px;border-radius:50%;border:1.5px solid rgba(255,240,200,.85);background:rgba(255,240,200,.15)"></div>`)
    layer.append(d)
    A(d, [{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${(Math.random() - 0.3) * 260}px,${-200 - Math.random() * 500}px)`, opacity: 0 }], { duration: 900 + Math.random() * 700, delay: Math.random() * 300, easing: 'cubic-bezier(.2,.7,.4,1)' })
  }
  await wait(650)
  reveal()
  await Promise.all([
    A(cover, [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 800, easing: EASE }),
    A(b, [{ transform: 'rotate(-14deg)' }, { transform: 'translateY(110%) rotate(-14deg)' }], { duration: 700, easing: 'cubic-bezier(.5,0,.75,0)' }),
  ])
}

// Fireworks: fireworks burst in the night sky behind "Party tonight". Bursts grow with the screen, and a wide screen
// gets more of them, so a desktop sky is as full as a phone's.
const fireworks: Scene = async ({ layer, scale }, { A, el, reveal, tween, size }) => {
  const cover = el(`<div class="fill" style="background:linear-gradient(180deg,#0B0920,#1F1846)"></div>`)
  layer.append(cover)
  const canvas = el<HTMLCanvasElement>(`<canvas class="fill"></canvas>`)
  layer.append(canvas)
  const { width, height } = size()
  const ratio = window.devicePixelRatio || 1
  canvas.width = width * ratio
  canvas.height = height * ratio
  // Shown at the layer's size (a canvas is otherwise shown at its pixel size, twice as big on a 2x screen)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  const g = canvas.getContext?.('2d') ?? null
  g?.scale(ratio, ratio)
  // The theme's colours, as the canvas needs them (resolved), plus white
  const style = getComputedStyle(layer)
  const colours = ['--a2', '--a', '--p'].map(name => style.getPropertyValue(name).trim()).filter(Boolean).concat('#FFFFFF', '#FFE7B0')
  const parts: { x: number, y: number, vx: number, vy: number, life: number, col: string }[] = []
  // (x, y) where it bursts, as fractions of the screen, and when (ms); the middle left too, and more across a wide screen
  const spots = [[0.3, 0.28, 0], [0.72, 0.22, 350], [0.36, 0.52, 480], [0.5, 0.4, 700], [0.2, 0.5, 1000], [0.8, 0.48, 1150]]
  if (width >= 900)
    spots.push([0.1, 0.24, 250], [0.9, 0.3, 600], [0.14, 0.72, 820], [0.62, 0.66, 950], [0.88, 0.7, 1300])
  const shells = spots.map(([x, y, t], i) => ({ x: x!, y: y!, t: t!, col: colours[i % colours.length]!, done: false }))
  const burst = Math.min(1.8, Math.max(1, Math.min(width, height) / 560))
  const txt = el(`<div class="center"><div style="font:800 ${Math.round(52 * burst)}px/1 var(--f-display);color:#fff;text-transform:uppercase;letter-spacing:-.02em;text-align:center;opacity:0">Party<br>tonight</div></div>`)
  layer.append(txt)
  A(txt.firstElementChild!, [{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: 900 })
  const length = 2100
  // Steps are per 60 Hz frame, scaled by the time that passed (so the sparks move the same on a 120 Hz screen) and by the
  // intensity (faster when the intro is shorter)
  let last = performance.now()
  await tween(length, (k) => {
    const t = k * length
    const now = performance.now()
    const dt = Math.min(3, (now - last) / (1000 / 60) / Math.max(0.1, scale))
    last = now
    if (!g)
      return
    g.fillStyle = `rgba(11,9,32,${(1 - 0.78 ** dt).toFixed(3)})`
    g.fillRect(0, 0, width, height)
    for (const s of shells) {
      if (s.done || t <= s.t)
        continue
      const progress = Math.min(1, (t - s.t) / 420)
      const X = s.x * width
      const Y = height - (height - s.y * height) * (1 - (1 - progress) ** 3)
      g.fillStyle = '#FFE7B0'
      g.beginPath()
      g.arc(X, Y, 2, 0, 7)
      g.fill()
      if (progress >= 1) {
        s.done = true
        for (let i = 0; i < 60; i++) {
          const a = i / 60 * Math.PI * 2
          const v = (2.2 + Math.random() * 1.6) * burst
          parts.push({ x: X, y: Y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, col: s.col })
        }
      }
    }
    for (const p of parts) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 0.045 * burst * dt
      p.vx *= 0.985 ** dt
      p.life -= 0.014 * dt
      if (p.life > 0) {
        g.globalAlpha = p.life
        g.fillStyle = p.col
        g.beginPath()
        g.arc(p.x, p.y, 1.8 * burst, 0, 7)
        g.fill()
        g.globalAlpha = 1
      }
    }
  })
  reveal()
  await Promise.all([
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 700 }),
    A(canvas, [{ opacity: 1 }, { opacity: 0 }], { duration: 700 }),
    A(txt, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(1.3)' }], { duration: 600 }),
  ])
}

// Neon sign: the hero's heading (set like the hero's) as a neon sign buzzes and flickers to life, glows in a second
// colour, then the lights come up
const neon: Scene = async ({ layer, content }, { A, el, reveal, wait, size }) => {
  const cover = el(`<div class="fill" style="background:linear-gradient(180deg,#1A1522,#0E0B14)"></div>`)
  layer.append(cover)
  const glow = (c: string) => `color:#fff;text-shadow:0 0 4px #fff,0 0 10px ${c},0 0 22px ${c},0 0 44px ${c}`
  const heading = content.title.trim()
  const { width } = size()
  const s = el(`<div class="center"><div class="n1" style="${heroHeading(width)};${glow('var(--a)')};opacity:.08">${esc(heading)}</div></div>`)
  layer.append(s)
  const sign = s.querySelector('.n1')!
  await A(sign, [{ opacity: 0.08 }, { opacity: 1, offset: 0.1 }, { opacity: 0.15, offset: 0.2 }, { opacity: 1, offset: 0.3 }, { opacity: 0.3, offset: 0.36 }, { opacity: 1 }], { duration: 900, easing: 'steps(1,end)' })
  // A second buzz, and it glows in the other colour
  await A(sign, [{ opacity: 1 }, { opacity: 0.2, offset: 0.2 }, { opacity: 1, offset: 0.35, textShadow: `0 0 4px #fff,0 0 10px var(--a2),0 0 22px var(--a2),0 0 44px var(--a2)` }, { opacity: 1, textShadow: `0 0 4px #fff,0 0 10px var(--a2),0 0 22px var(--a2),0 0 44px var(--a2)` }], { duration: 500, easing: 'steps(1,end)' })
  await wait(450)
  reveal()
  await Promise.all([
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 700 }),
    A(s, [{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(10px)' }], { duration: 600 }),
  ])
}

// Drop the needle: a record spins in, the needle drops, and a "Now playing" card slides up with the hero's heading as
// the track, the equalizer bouncing above it and its progress bar running
const vinyl: Scene = async ({ layer, content, scale }, { A, el, reveal, wait, size }) => {
  const cover = el(`<div class="fill" style="background:var(--p)"></div>`)
  layer.append(cover)
  const { width } = size()
  const k = width >= 900 ? 1.3 : 1
  // The record and its arm, around the record's centre, scaled up on a wide screen
  const deck = el(`<div style="position:absolute;left:50%;top:33%;width:0;height:0;transform:scale(${k})"></div>`)
  layer.append(deck)
  const rec = el(`<div style="position:absolute;left:-120px;top:-120px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,var(--a2) 0 17%,#111 17.5% 19%,transparent 19.5%),repeating-radial-gradient(circle,#161616 0 2px,#222 2px 3px),#111;box-shadow:0 18px 30px rgba(0,0,0,.4)">
     <div style="position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 30deg,transparent 0 10%,rgba(255,255,255,.18) 14%,transparent 20% 60%,rgba(255,255,255,.12) 64%,transparent 70%)"></div>
     <div style="position:absolute;left:50%;top:50%;width:8px;height:8px;margin:-4px;border-radius:50%;background:#ddd"></div>
     <div style="position:absolute;left:50%;top:39%;transform:translateX(-50%);font:800 10px var(--f-display);color:var(--on2);letter-spacing:.1em">SIDE A</div></div>`)
  deck.append(rec)
  const arm = el(`<div style="position:absolute;left:118px;top:-130px;width:10px;height:150px;transform-origin:5px 5px;transform:rotate(30deg)"><div style="width:10px;height:10px;border-radius:50%;background:#ccc"></div><div style="width:4px;height:130px;margin:0 auto;background:linear-gradient(90deg,#999,#eee,#999)"></div><div style="width:14px;height:20px;margin-left:-2px;background:#bbb;border-radius:2px"></div></div>`)
  deck.append(arm)
  // Now playing: a card tinted towards the primary's text colour, so its text (that colour) always reads
  const title = content.title.trim()
  const cardWidth = Math.min(width * 0.88, 480)
  // The track's size: two lines or so, in the heading font as typed
  const titleSize = Math.max(18, Math.min(width >= 900 ? 34 : 26, Math.floor(2 * (cardWidth - 40) / (Math.max(1, title.length) * 0.55))))
  // The equalizer sits above the card, as wide as it with a gap between, its bars (about one per 16px) rising up
  const bars = Array.from({ length: Math.round(cardWidth / 16) }, (_, i) => `<span style="flex:1;height:100%;border-radius:3px 3px 0 0;background:${i % 3 ? 'var(--a2)' : 'var(--a)'};transform-origin:bottom;transform:scaleY(.12)"></span>`).join('')
  const card = el(`<div style="position:absolute;left:50%;bottom:7%;overflow:visible;width:${Math.round(cardWidth)}px;margin-left:${-Math.round(cardWidth / 2)}px;box-sizing:border-box;padding:16px 20px 14px;border-radius:16px;background:color-mix(in oklab,var(--p),var(--on) 12%);border:1px solid color-mix(in oklab,var(--on) 22%,transparent);color:var(--on);box-shadow:0 14px 30px rgba(0,0,0,.25);opacity:0">
     <div class="eq" style="position:absolute;left:0;right:0;bottom:calc(100% + ${Math.round(12 * k)}px);display:flex;gap:${Math.round(5 * k)}px;align-items:flex-end;height:${Math.round(56 * k)}px">${bars}</div>
     <div style="font:600 10px var(--f-body);letter-spacing:.28em;text-transform:uppercase;opacity:.75">Now playing</div>
     <div style="margin-top:8px;font:400 ${titleSize}px/1.1 var(--f-display);text-wrap:balance;overflow-wrap:break-word">${esc(title)}</div>
     <div style="margin-top:14px;height:4px;border-radius:2px;background:color-mix(in oklab,var(--on) 25%,transparent);overflow:hidden"><div class="bar" style="height:100%;width:100%;background:var(--on);transform-origin:left;transform:scaleX(.04)"></div></div>
     <div style="display:flex;justify-content:space-between;margin-top:6px;font:500 10px var(--f-body);opacity:.7"><span>0:01</span><span>3:24</span></div></div>`)
  layer.append(card)
  await A(rec, [{ transform: 'translateX(-130%) rotate(-200deg)' }, { transform: 'none' }], { duration: 700, easing: OUT })
  loop(rec, [{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 1100, iterations: Infinity }, scale)
  await A(arm, [{ transform: 'rotate(30deg)' }, { transform: 'rotate(8deg)' }], { duration: 450, easing: EASE })
  // The needle's down: the card slides up, the equalizer bounces and the track starts
  A(card, [{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: OUT })
  ;[...card.querySelector('.eq')!.children].forEach((bar, i) => loop(bar, [{ transform: 'scaleY(.12)' }, { transform: `scaleY(${0.4 + Math.random() * 0.6})` }, { transform: 'scaleY(.2)' }, { transform: `scaleY(${0.5 + Math.random() * 0.5})` }], { duration: 380, iterations: Infinity, direction: 'alternate', delay: (i % 8) * 30 }, scale))
  A(card.querySelector('.bar')!, [{ transform: 'scaleX(.04)' }, { transform: 'scaleX(.3)' }], { duration: 1600, easing: 'linear' })
  await wait(1000)
  reveal()
  await Promise.all([
    A(cover, [{ transform: 'none' }, { transform: 'translateY(100%)' }], { duration: 800, easing: EASE }),
    ...[rec, arm].map(node => A(node, [{ transform: getComputedStyle(node).transform || 'none', opacity: 1 }, { opacity: 0, transform: 'translateY(300px)' }], { duration: 700, easing: EASE })),
    A(card, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(300px)' }], { duration: 700, easing: EASE }),
  ])
}

// Ticket tear: an "Admit one" ticket with the hero's heading drops in, its stub tears off, and you're in. The ticket
// grows to fit the heading.
const ticketTear: Scene = async ({ layer, content }, { A, el, reveal, wait, size }) => {
  const cover = el(`<div class="fill" style="background:var(--a2)"></div>`)
  layer.append(cover)
  const title = content.title.trim()
  // A different ticket number each time it plays (0001 to 9999)
  const number = String(1 + Math.floor(Math.random() * 9999)).padStart(4, '0')
  const notch = (side: '0' | '100%') => `-webkit-mask:radial-gradient(circle 10px at ${side} 0,#0000 98%,#000) top,radial-gradient(circle 10px at ${side} 100%,#0000 98%,#000) bottom;-webkit-mask-size:100% 51%;-webkit-mask-repeat:no-repeat;mask:radial-gradient(circle 10px at ${side} 0,#0000 98%,#000) top,radial-gradient(circle 10px at ${side} 100%,#0000 98%,#000) bottom;mask-size:100% 51%;mask-repeat:no-repeat`
  // Bigger on a wide screen
  const zoom = size().width >= 900 ? 1.4 : 1
  const T = el(`<div class="center"><div class="tk" style="position:relative;width:min(78%,420px);zoom:${zoom};filter:drop-shadow(0 12px 18px rgba(0,0,0,.25))">
     <div class="main" style="position:relative;box-sizing:border-box;min-height:150px;width:72%;background:var(--p);border-radius:12px 0 0 12px;color:var(--on);padding:16px 18px;${notch('100%')}">
       <div style="font:600 9px var(--f-body);letter-spacing:.3em;text-transform:uppercase;opacity:.7">Admit one</div><div style="font:800 28px/0.95 var(--f-display);text-transform:uppercase;margin-top:8px">You're on<br>the list</div>${title ? `<div style="font:400 17px/1.15 var(--f-display);margin-top:12px;opacity:.9;text-wrap:balance;overflow-wrap:break-word">${esc(title)}</div>` : ''}</div>
     <div class="stub" style="position:absolute;right:0;top:0;bottom:0;width:28%;background:var(--pop);border-radius:0 12px 12px 0;border-left:2px dashed rgba(255,255,255,.6);display:grid;place-items:center;${notch('0')}">
       <div style="transform:rotate(90deg);white-space:nowrap;font:800 18px var(--f-display);color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.35);letter-spacing:.1em">Nº ${number}</div></div></div></div>`)
  layer.append(T)
  const tk = T.firstElementChild!
  const stub = T.querySelector('.stub')!
  const main = T.querySelector('.main')!
  await A(tk, [{ transform: 'translateY(-140%) rotate(-12deg)' }, { transform: 'rotate(3deg)', offset: 0.75 }, { transform: 'rotate(-2deg)' }], { duration: 650, easing: OUT })
  await wait(300)
  await A(stub, [{ transform: 'none' }, { transform: 'translate(6px,4px) rotate(4deg)' }], { duration: 180 })
  A(stub, [{ transform: 'translate(6px,4px) rotate(4deg)' }, { transform: 'translate(160px,600px) rotate(70deg)' }], { duration: 700, easing: 'cubic-bezier(.5,0,.75,0)' })
  await wait(200)
  reveal()
  await Promise.all([
    A(main, [{ transform: 'none' }, { transform: 'translate(-40px,-700px) rotate(-20deg)' }], { duration: 700, easing: 'cubic-bezier(.5,0,.75,0)' }),
    A(cover, [{ clipPath: 'circle(150% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }], { duration: 800, delay: 100, easing: EASE }),
  ])
}

// Piñata: a star piñata swings in, takes two hits, and bursts into pieces and confetti
const pinata: Scene = async ({ layer }, { A, el, wait, reveal, uid, confetti }) => {
  const cover = el(`<div class="fill" style="background:var(--bgS)"></div>`)
  layer.append(cover)
  // Stripes in the party's colours, with a paper fringe across each
  const colours = ['var(--a)', 'var(--a2)', LIGHT_P, LIGHT_A2, 'var(--p)']
  const clip = uid('pinata')
  const stripes = Array.from({ length: 14 }, (_, i) => `<rect x="0" y="${i * 10}" width="140" height="10" style="fill:${colours[i % 5]}"/>`).join('')
  const fringe = Array.from({ length: 14 }, (_, i) => `<path d="M0 ${i * 10 + 10}${'l5 3l5 -3'.repeat(14)}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1"/>`).join('')
  const star = el(`<div style="position:absolute;left:50%;top:0;width:150px;margin-left:-75px;transform-origin:50% 0">
     <div style="width:2px;height:120px;margin:0 auto;background:#9A8B74"></div>
     <svg viewBox="0 0 140 140" style="width:150px;overflow:visible;filter:drop-shadow(0 8px 10px rgba(0,0,0,.2))"><defs><clipPath id="${clip}"><path d="M70 4 86 50 136 52 96 82 110 132 70 102 30 132 44 82 4 52 54 50Z"/></clipPath></defs>
     <g clip-path="url(#${clip})">${stripes}${fringe}</g>
     <circle cx="70" cy="70" r="18" fill="#fff" opacity=".9"/><circle cx="64" cy="66" r="2.4" fill="#1D1440"/><circle cx="76" cy="66" r="2.4" fill="#1D1440"/><path d="M63 75q7 6 14 0" stroke="#1D1440" stroke-width="2" fill="none" stroke-linecap="round"/></svg></div>`)
  layer.append(star)
  const stick = el(`<div style="position:absolute;left:-30%;top:40%;width:150px;height:10px;border-radius:5px;background:linear-gradient(90deg,#8A5A2B,#C79A5E);transform-origin:0 50%"></div>`)
  layer.append(stick)
  await A(star, [{ transform: 'translateY(-110%)' }, { transform: 'rotate(10deg)', offset: 0.6 }, { transform: 'rotate(-8deg)', offset: 0.8 }, { transform: 'rotate(0)' }], { duration: 900, easing: 'ease-out' })
  // Two hits
  await A(stick, [{ transform: 'rotate(30deg)' }, { transform: 'translateX(120px) rotate(-14deg)' }], { duration: 260, easing: 'cubic-bezier(.5,0,1,.6)' })
  A(star, [{ transform: 'rotate(0)' }, { transform: 'rotate(14deg)' }, { transform: 'rotate(-6deg)' }], { duration: 200 })
  await A(stick, [{ transform: 'translateX(120px) rotate(-14deg)' }, { transform: 'rotate(30deg)' }], { duration: 220 })
  await A(stick, [{ transform: 'rotate(30deg)' }, { transform: 'translateX(130px) rotate(-18deg)' }], { duration: 220, easing: 'cubic-bezier(.5,0,1,.6)' })
  // It bursts where it hangs: confetti and five triangle pieces
  const box = star.querySelector('svg')!.getBoundingClientRect()
  const area = layer.getBoundingClientRect()
  const cx = box.width ? box.left - area.left + box.width / 2 : area.width / 2
  const cy = box.height ? box.top - area.top + box.height / 2 : area.height * 0.4
  confetti(area.width ? cx / area.width : 0.5, area.height ? cy / area.height : 0.4, 140)
  const pieces = colours.map((colour) => {
    const piece = el(`<div style="position:absolute;left:${cx - 22}px;top:${cy - 22}px;width:44px;height:44px;background:${colour};clip-path:polygon(50% 0,100% 100%,0 100%)"></div>`)
    layer.append(piece)
    return piece
  })
  star.remove()
  pieces.forEach((piece, i) => A(piece, [{ transform: 'none' }, { transform: `translate(${(i - 2) * 90}px,${500 + i * 30}px) rotate(${(i - 2) * 160}deg)` }], { duration: 900, easing: 'cubic-bezier(.3,0,.8,.6)' }))
  A(stick, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 })
  await wait(250)
  reveal()
  await A(cover, [{ clipPath: 'circle(150% at 50% 40%)' }, { clipPath: 'circle(0% at 50% 40%)' }], { duration: 800, easing: EASE })
  await wait(300)
}

// Photo booth: a camera flash for each of three shots, which develop on a photo strip as it prints out, then one more
// for the caption, the hero's heading, printed under them
const photoBooth: Scene = async ({ layer, content }, { A, el, wait, reveal, size }) => {
  // The booth's dark curtain keeps its own colour
  const cover = el(`<div class="fill" style="background:linear-gradient(180deg,#2A1E4A,#140E26)"></div>`)
  layer.append(cover)
  const flash = el(`<div class="fill" style="background:#fff;opacity:0"></div>`)
  // Three drawn shots (no photos): a head and shoulders on the party's colours
  const poses = ['50% 42%', '40% 46%', '60% 40%']
  const tones = ['var(--a)', 'var(--a2)', LIGHT_P]
  const strip = el(`<div style="position:absolute;left:50%;bottom:0;width:130px;margin-left:-65px;padding:8px 8px 12px;background:#fff;box-shadow:0 10px 26px rgba(0,0,0,.4);transform:translateY(100%) rotate(-3deg)">
     ${poses.map((pose, i) => `<div class="fr" style="height:100px;margin-bottom:6px;background:radial-gradient(circle at ${pose},#3A2D55 0 14%,transparent 15%),radial-gradient(60% 40% at ${pose.split(' ')[0]} 100%,#3A2D55 0 70%,transparent 71%),linear-gradient(160deg,${tones[i]},color-mix(in oklab,${tones[i]},#000 30%));opacity:0"></div>`).join('')}
     <div class="fr" style="margin-top:8px;text-align:center;font-family:var(--f-display);font-size:${fit(content.title, 20, 228, 12)}px;line-height:1.1;color:#1D1440;text-wrap:balance;overflow-wrap:break-word;opacity:0">${esc(content.title)}</div></div>`)
  layer.append(strip, flash)
  // The strip prints out the whole time, all of it by the last flash
  A(strip, [{ transform: 'translateY(100%) rotate(-3deg)' }, { transform: 'translateY(0) rotate(-3deg)' }], { duration: 2100, easing: 'linear' })
  // A flash for each shot, and one more for the caption
  for (const frame of strip.querySelectorAll<HTMLElement>('.fr')) {
    await wait(260)
    await A(flash, [{ opacity: 0 }, { opacity: 0.95, offset: 0.15 }, { opacity: 0 }], { duration: 300 })
    frame.style.opacity = '1'
  }
  await wait(700)
  reveal()
  const { height } = size()
  await Promise.all([
    A(strip, [{ transform: 'translateY(0) rotate(-3deg)' }, { transform: `translateY(${-height - 40}px) rotate(4deg)` }], { duration: 750, easing: 'cubic-bezier(.5,0,.75,0)' }),
    A(cover, [{ transform: 'none' }, { transform: 'translateY(-100%)' }], { duration: 800, delay: 150, easing: EASE }),
  ])
}

// Make a splash: "Make a splash!" pops in, then a wave rises with bubbles and washes the cover away
const splash: Scene = async ({ layer, content, scale }, { A, el, wait, reveal, size }) => {
  const { width, height } = size()
  const phrase = content.eyebrow || 'Make a splash!'
  // Coloured like the hero: its background, and the phrase in its heading's colour
  const cover = el(`<div class="fill" style="background:var(--hero-bg);display:grid;place-items:center"><div style="max-width:88%;font:800 ${headingSize(phrase, width, 54)}px/0.95 var(--f-display);color:var(--hero-heading);text-transform:uppercase;text-align:center;letter-spacing:-.02em;text-wrap:balance;overflow-wrap:break-word">${esc(phrase)}</div></div>`)
  layer.append(cover)
  // The water keeps its own blue; its wavy edge rolls along
  const water = el(`<div style="position:absolute;left:0;right:0;top:100%;height:130%;background:linear-gradient(180deg,#38C6E8,#1B5FA8)"><svg viewBox="0 0 720 60" preserveAspectRatio="none" style="position:absolute;left:0;top:-38px;width:200%;height:40px"><path d="M0 30Q45 0 90 30T180 30T270 30T360 30T450 30T540 30T630 30T720 30V60H0Z" fill="#38C6E8"/></svg><div style="position:absolute;inset:0;background:repeating-linear-gradient(170deg,transparent 0 40px,rgba(255,255,255,.08) 40px 44px)"></div></div>`)
  layer.append(water)
  loop(water.querySelector('svg')!, [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 900, iterations: Infinity }, scale)
  await A(cover.firstElementChild!, [{ transform: 'scale(.6) rotate(-6deg)', opacity: 0 }, { transform: 'scale(1.06)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], { duration: 600 })
  await wait(350)
  await A(water, [{ transform: 'translateY(0)' }, { transform: `translateY(${-height * 1.05}px)` }], { duration: 800, easing: 'cubic-bezier(.4,0,.2,1)' })
  for (let i = 0; i < 18; i++) {
    const s = 6 + Math.random() * 14
    const bubble = el(`<div style="position:absolute;left:${Math.random() * 100}%;bottom:${Math.random() * 30}%;width:${s}px;height:${s}px;border-radius:50%;border:1.5px solid rgba(255,255,255,.7)"></div>`)
    layer.append(bubble)
    A(bubble, [{ transform: 'none', opacity: 1 }, { transform: `translateY(${-300 - Math.random() * 300}px)`, opacity: 0 }], { duration: 1000 + Math.random() * 500, easing: 'linear' })
  }
  // The water covers the screen: the cover goes, and the water rises off
  cover.remove()
  reveal()
  await A(water, [{ transform: `translateY(${-height * 1.05}px)` }, { transform: `translateY(${-height * 2.4}px)` }], { duration: 900, easing: 'cubic-bezier(.5,0,.3,1)' })
  await wait(400)
}

// Karaoke: lyrics fill in word by word like a karaoke screen, then a "100 Perfect!" score pops
const karaoke: Scene = async ({ layer, content, scale }, { A, el, wait, reveal, confetti }) => {
  // A karaoke video's glow in the theme's colours: a deep primary, the primary, then towards the accent
  const DEEP = 'color-mix(in oklab,var(--p),#000 50%)'
  const cover = el(`<div class="fill" style="background:linear-gradient(160deg,color-mix(in oklab,var(--p),#000 40%),var(--p) 55%,color-mix(in oklab,var(--a),var(--p) 30%))"></div>`)
  const R = rng(8)
  cover.insertAdjacentHTML('beforeend', Array.from({ length: 12 }, () => `<span style="position:absolute;left:${R() * 100}%;top:${R() * 60}%;width:3px;height:3px;border-radius:50%;background:#fff;opacity:${0.3 + R() * 0.5}"></span>`).join(''))
  layer.append(cover)
  const words = (content.eyebrow || 'Sing it loud tonight!').split(/\s+/).filter(Boolean)
  // The lyrics low and the score above them, apart even when the lyrics take two lines
  // The lyrics in the body font (it renders clearly at any weight): the text on the primary, filling with the accent
  const lyrics = el(`<div style="position:absolute;left:0;right:0;bottom:24%;padding:0 20px;text-align:center;font:600 30px/1.2 var(--f-body);overflow-wrap:break-word;filter:drop-shadow(0 2px 0 ${DEEP})">${words.map(word => `<span class="w" style="display:inline-block;margin:0 .14em;background:linear-gradient(90deg,var(--a) 50%,var(--on) 50%);background-size:200% 100%;background-position:100% 0;-webkit-background-clip:text;background-clip:text;color:transparent">${esc(word)}</span>`).join('')}</div>`)
  const mic = el(`<div style="position:absolute;left:50%;top:22%;width:60px;margin-left:-30px"><svg viewBox="0 0 60 120"><rect x="16" y="2" width="28" height="40" rx="14" fill="#D9D9E3"/><path d="M16 22h28" stroke="#9A9AB0" stroke-width="2"/><path d="M22 42h16l-4 70h-8Z" style="fill:${DEEP}"/></svg></div>`)
  const score = el(`<div style="position:absolute;left:0;right:0;top:39%;text-align:center;opacity:0"><div style="font:800 64px/1 var(--f-display);color:var(--a);-webkit-text-stroke:2px ${DEEP};paint-order:stroke fill">100</div><div style="font:600 14px var(--f-body);letter-spacing:.2em;color:var(--on);text-transform:uppercase">Perfect!</div></div>`)
  layer.append(lyrics, mic, score)
  loop(mic, [{ transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }], { duration: 300, iterations: Infinity, direction: 'alternate' }, scale)
  await A(lyrics, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 350 })
  // Each word fills in turn; a long line fills faster, so it takes about as long
  const perWord = Math.min(280, 1120 / Math.max(1, words.length))
  for (const word of lyrics.querySelectorAll('.w'))
    await A(word, [{ backgroundPosition: '100% 0' }, { backgroundPosition: '0% 0' }], { duration: perWord, easing: 'linear' })
  confetti(0.5, 0.5, 60)
  await A(score, [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1.1)', offset: 0.6 }, { opacity: 1, transform: 'none' }], { duration: 450 })
  await wait(400)
  reveal()
  await Promise.all([
    A(cover, [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 0 100%)' }], { duration: 750, easing: EASE }),
    ...[lyrics, mic, score].map(node => A(node, [{ opacity: 1 }, { opacity: 0 }], { duration: 350 })),
  ])
  await wait(300)
}

// Banderitas: strings of fabric bunting drop in and flutter like a fiesta, then lift away to reveal the page
const bunting: Scene = async ({ layer, content, scale }, { A, el, wait, reveal, size }) => {
  const cover = el(`<div class="fill" style="background:var(--bgS)"></div>`)
  layer.append(cover)
  // A fiesta's colours: the accent and secondary, a purple and a teal, and the primary
  const colours = ['var(--a)', 'var(--a2)', '#8E7BFF', '#2BD4C1', 'var(--p)']
  const { width: W, height: H } = size()
  // Three strings: where each hangs (a fraction of the height), how far it sags (px) and how many flags it carries
  const strings: [number, number, number][] = [[0.1, 34, 9], [0.27, 44, 8], [0.44, 30, 10]]
  const rows = strings.map(([top, sag, count], r) => {
    const row = el(`<div style="position:absolute;left:0;top:${top * H}px;width:${W}px;height:${sag + 50}px"><svg width="${W}" height="${sag + 10}" viewBox="0 0 ${W} ${sag + 10}" style="position:absolute;left:0;top:0;overflow:visible"><path d="M-10 0Q${W / 2} ${sag * 2} ${W + 10} 0" fill="none" stroke="#8C7B63" stroke-width="1.4"/></svg></div>`)
    // Each flag hangs on the curve, tilted with it; the rows' colours are offset so they don't line up
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count
      const x = -10 + t * (W + 20)
      const y = 4 * t * (1 - t) * sag
      const tilt = Math.atan2(4 * (1 - 2 * t) * sag, W + 20) * 180 / Math.PI
      row.insertAdjacentHTML('beforeend', `<div class="fl" style="position:absolute;left:${x - 13}px;top:${y - 1}px;width:26px;height:32px;transform-origin:50% 0;rotate:${tilt.toFixed(1)}deg">
        <div style="width:100%;height:100%;clip-path:polygon(0 0,100% 0,50% 100%);background:linear-gradient(100deg,rgba(255,255,255,.28),transparent 40%,rgba(0,0,0,.14)),${NOISE(1.6, 0.18, 60)},${colours[(i + r * 2) % colours.length]};box-shadow:inset 0 2px 0 rgba(0,0,0,.15)"></div></div>`)
    }
    layer.append(row)
    return row
  })
  // The small label (when the hero has one) and the hero's heading, at most two lines, clear of the bottom row
  const room = W * 0.88
  const longest = Math.max(1, ...content.title.split(/\s+/).map(word => word.length))
  const headingPx = Math.max(22, Math.floor(Math.min(50, room / (longest * 0.72), 2 * room / (Math.max(1, content.title.length) * 0.72))))
  const t = el(`<div style="position:absolute;left:0;right:0;top:62%;padding:0 6%;text-align:center;color:var(--p-text);opacity:0">${content.eyebrow ? `<div style="font:600 10px var(--f-body);letter-spacing:.3em;text-transform:uppercase;opacity:.7;margin-bottom:6px">${esc(content.eyebrow)}</div>` : ''}<div style="font:800 ${headingPx}px/0.95 var(--f-display);text-transform:uppercase;letter-spacing:-.02em;text-wrap:balance;overflow-wrap:break-word">${esc(content.title)}</div></div>`)
  layer.append(t)
  // The flags flutter round their top edges until the intro ends (the kit stops the loops)
  layer.querySelectorAll('.fl').forEach((flag, i) => loop(flag, [{ transform: 'rotate(-5deg)' }, { transform: 'rotate(6deg)' }], { duration: 700 + (i % 4) * 120, delay: i * 40, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }, scale))
  // The strings drop in from above, one after another, overshoot and settle; each stays above the screen until its turn
  rows.forEach((row, i) => A(row, [{ transform: `translateY(${-(strings[i]![0] * H + 120)}px)` }, { transform: 'translateY(10px)', offset: 0.7 }, { transform: 'translateY(-4px)', offset: 0.85 }, { transform: 'none' }], { duration: 900, delay: i * 160, easing: 'cubic-bezier(.3,0,.4,1)', fill: 'both' }))
  await wait(700)
  await A(t, [{ opacity: 0, transform: 'translateY(30px) scale(.9)' }, { opacity: 1, transform: 'translateY(-6px) scale(1.03)', offset: 0.7 }, { opacity: 1, transform: 'none' }], { duration: 600 })
  await wait(700)
  reveal()
  // They lift away, the bottom string first, and the cover wipes up
  await Promise.all([
    ...rows.map((row, i) => A(row, [{ transform: 'none' }, { transform: `translateY(${-(strings[i]![0] * H + 160)}px)` }], { duration: 700, delay: (2 - i) * 90, easing: 'cubic-bezier(.5,0,.75,0)' })),
    A(t, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-30px)' }], { duration: 500 }),
    A(cover, [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 800, delay: 250, easing: EASE }),
  ])
}

export const scenes: Record<string, Scene> = {
  'countdown': countdown,
  'balloon': balloon,
  'candle': candle,
  'stickers': stickers,
  'gift-box': giftBox,
  'disco': disco,
  'popper': popper,
  'marquee-lights': marqueeLights,
  'bouncy': bouncy,
  'slot': slot,
  'champagne': champagne,
  'fireworks': fireworks,
  'neon': neon,
  'vinyl': vinyl,
  'ticket-tear': ticketTear,
  'pinata': pinata,
  'photo-booth': photoBooth,
  'splash': splash,
  'karaoke': karaoke,
  'bunting': bunting,
}
