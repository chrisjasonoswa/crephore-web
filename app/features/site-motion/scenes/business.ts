import type { Scene } from './scene.kit'
import type { EventKind } from '~/site-theme/eventKinds'
import { EASE, esc, OUT, rng } from './scene.kit'

// Business scenes (site-motion.type.ts `sceneIntroKeys.business`), from the intros reference. Crisp and structured; the
// name is the hero's heading (or the event's), the date, venue and numbers come from the event and its program.

// The title in up to three lines, by words (the reference's "Northwind / Summit / 2027")
function titleLines(title: string, max = 3): string[] {
  const words = title.trim().split(/\s+/).filter(Boolean)
  if (words.length <= max)
    return words.length ? words : [title]
  const perLine = Math.ceil(words.length / max)
  const lines: string[] = []
  for (let i = 0; i < words.length; i += perLine)
    lines.push(words.slice(i, i + perLine).join(' '))
  return lines
}

// A font size that fits the longest line: `base` px up to `chars` characters, smaller for longer lines
function fitSize(lines: string[], base: number, chars: number): number {
  const longest = Math.max(1, ...lines.map(line => line.length))
  return Math.round(Math.min(base, base * chars / longest))
}

// The date and venue on one line, when the event has them
function dateAndVenue(date: string | undefined, venue: string | undefined): string {
  return [date, venue].filter(Boolean).map(esc).join(' · ')
}

// A mask on both prefixed and standard properties
function setMask(target: HTMLElement, mask: string) {
  target.style.setProperty('-webkit-mask-image', mask)
  target.style.setProperty('mask-image', mask)
}

// Loading counter: a big 0–100 counter with a hairline progress bar, then the cover slides up with a slight skew
const counter: Scene = async ({ layer, content }, { A, el, tween, reveal }) => {
  const cover = el(`<div class="fill" style="background:var(--p);transform-origin:top"></div>`)
  layer.append(cover)
  const ui = el(`<div class="fill" style="color:var(--on);padding:24px">
     <div style="position:absolute;left:24px;right:24px;top:24px;font:600 11px var(--f-body);letter-spacing:.22em;text-transform:uppercase;opacity:.6">${esc(content.title)}</div>
     <div class="n" style="position:absolute;left:20px;bottom:40px;font:600 120px/1 var(--f-display);letter-spacing:-.05em;font-variant-numeric:tabular-nums">0</div>
     <div style="position:absolute;left:24px;right:24px;bottom:28px;height:1px;background:color-mix(in oklab,var(--on),transparent 80%)"><div class="bar" style="height:1px;background:var(--a);width:0"></div></div></div>`)
  layer.append(ui)
  const n = ui.querySelector<HTMLElement>('.n')!
  const bar = ui.querySelector<HTMLElement>('.bar')!
  await tween(1100, (k) => {
    const e = 1 - (1 - k) ** 3
    n.textContent = String(Math.round(e * 100))
    bar.style.width = `${e * 100}%`
  })
  reveal()
  await Promise.all([
    A(cover, [{ transform: 'translateY(0) skewY(0)' }, { transform: 'translateY(-105%) skewY(-6deg)' }], { duration: 800, easing: EASE }),
    A(ui, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-60%)', opacity: 0 }], { duration: 700, easing: EASE }),
  ])
}

// Split title: the event name rises line by line from behind a mask, then the cover splits through the middle
const splitTitle: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const top = el(`<div class="fill" style="background:var(--p);clip-path:inset(0 0 50% 0)"></div>`)
  const bottom = el(`<div class="fill" style="background:var(--p);clip-path:inset(50% 0 0 0)"></div>`)
  layer.append(top, bottom)
  const lines = titleLines(content.title)
  const t = el(`<div class="center"><div style="color:var(--on);font:600 ${fitSize(lines, 58, 9)}px/1 var(--f-display);letter-spacing:-.04em;text-align:left;padding:0 24px">${lines.map(line => `<div style="overflow:hidden;padding-bottom:4px"><div class="ln">${esc(line)}</div></div>`).join('')}</div></div>`)
  layer.append(t)
  await Promise.all([...t.querySelectorAll('.ln')].map((line, i) => A(line, [{ transform: 'translateY(110%)' }, { transform: 'none' }], { duration: 700, delay: i * 110, easing: EASE })))
  await wait(250)
  reveal()
  await Promise.all([
    A(top, [{ transform: 'none' }, { transform: 'translateY(-50%)' }], { duration: 800, easing: EASE }),
    A(bottom, [{ transform: 'none' }, { transform: 'translateY(50%)' }], { duration: 800, easing: EASE }),
    A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 350 }),
  ])
}

// Tile cascade: the name fades, then a grid of tiles flips away in a diagonal wave
const tiles: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const cols = 5
  const rows = 9
  const grid = el(`<div class="fill" style="display:grid;grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr)"></div>`)
  for (let i = 0; i < cols * rows; i++)
    grid.append(el(`<div style="background:var(--p);margin:-.5px;transform-origin:${(i % cols) % 2 ? 'top' : 'bottom'}"></div>`))
  layer.append(grid)
  const logo = el(`<div class="center"><div style="text-align:center;color:var(--on);padding:0 24px"><div style="width:44px;height:44px;margin:0 auto 10px;border-radius:10px;background:var(--a)"></div><div style="font:600 18px var(--f-display);letter-spacing:-.01em">${esc(content.firstName || content.title)}</div></div></div>`)
  layer.append(logo)
  await A(logo.firstElementChild!, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 500 })
  await wait(300)
  await A(logo, [{ opacity: 1 }, { opacity: 0 }], { duration: 250 })
  reveal()
  await Promise.all([...grid.children].map((tile, i) => {
    const x = i % cols
    const y = Math.floor(i / cols)
    return A(tile, [{ transform: 'scale(1)' }, { transform: 'scale(1,0)' }], { duration: 420, delay: (x + y) * 55, easing: EASE })
  }))
}

// Kinetic type: rows of the event name glide in opposite directions, collapse into one line, and clear the stage
const kinetic: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const cover = el(`<div class="fill" style="background:var(--p)"></div>`)
  layer.append(cover)
  const text = `${esc(content.title)} · `.repeat(4)
  const row = (direction: number, outline: boolean) => `<div class="row" style="white-space:nowrap;font:800 64px/1 var(--f-display);letter-spacing:-.04em;text-transform:uppercase;color:${outline ? 'transparent' : 'var(--on)'};-webkit-text-stroke:${outline ? '1.5px var(--on)' : '0'};padding:6px 0" data-dir="${direction}">${text}</div>`
  const box = el(`<div class="center"><div style="width:100%;overflow:hidden">${row(1, false)}${row(-1, true)}${row(1, false)}</div></div>`)
  layer.append(box)
  const rows = [...box.querySelectorAll<HTMLElement>('.row')]
  rows.forEach((r) => {
    const forward = Number(r.dataset.dir) > 0
    A(r, [{ transform: `translateX(${forward ? '-40%' : '0%'})` }, { transform: `translateX(${forward ? '0%' : '-40%'})` }], { duration: 2400, easing: 'linear' })
  })
  await wait(1000)
  await Promise.all([rows[0]!, rows[2]!].map(r => A(r, [{ transform: 'scaleY(1)', opacity: 1 }, { transform: 'scaleY(0)', opacity: 0 }], { duration: 450, easing: EASE, composite: 'add' })))
  rows[1]!.style.setProperty('-webkit-text-stroke', '0')
  await A(rows[1]!, [{ color: 'transparent' }, { color: 'var(--on)' }], { duration: 250 })
  reveal()
  await Promise.all([
    A(cover, [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(50% 0 50% 0)' }], { duration: 700, easing: EASE }),
    A(box, [{ opacity: 1 }, { opacity: 0 }], { duration: 450, delay: 150 }),
  ])
}

// Blinds: the name spaces out, then twelve horizontal blinds tilt open in sequence
const blinds: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const count = 12
  const box = el(`<div class="fill" style="display:flex;flex-direction:column;perspective:700px">${Array.from({ length: count }, () => `<div style="flex:1;background:var(--p);margin:-.5px 0"></div>`).join('')}</div>`)
  layer.append(box)
  const t = el(`<div class="center"><div style="color:var(--on);font:600 22px var(--f-display);letter-spacing:.2em;text-transform:uppercase;text-align:center;padding:0 24px">${esc(content.title)}</div></div>`)
  layer.append(t)
  await A(t.firstElementChild!, [{ opacity: 0, letterSpacing: '.6em' }, { opacity: 1, letterSpacing: '.2em' }], { duration: 700 })
  await wait(300)
  A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 250 })
  reveal()
  await Promise.all([...box.children].map((blind, i) => A(blind, [{ transform: 'rotateX(0)' }, { transform: 'rotateX(90deg)' }], { duration: 550, delay: i * 45, easing: EASE })))
}

// Line to window: a hairline draws across with the date beneath, then opens into a panel that slides away
const lineExpand: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const cover = el(`<div class="fill" style="background:var(--p)"></div>`)
  layer.append(cover)
  const band = el(`<div style="position:absolute;left:0;right:0;top:50%;height:2px;margin-top:-1px;background:var(--a);transform:scaleX(0)"></div>`)
  layer.append(band)
  const caption = dateAndVenue(content.dateLong ?? content.dateNumeric, content.venue) || esc(content.title)
  const cap = el(`<div style="position:absolute;left:24px;right:24px;top:calc(50% + 14px);color:var(--on);font:500 12px var(--f-body);letter-spacing:.2em;text-transform:uppercase;opacity:0">${caption}</div>`)
  layer.append(cap)
  await A(band, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 700, easing: EASE })
  await A(cap, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 400 })
  await wait(200)
  A(cap, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 })
  await A(band, [{ height: '2px', marginTop: '-1px', top: '50%' }, { height: '100%', marginTop: '0', top: '0' }], { duration: 550, easing: EASE })
  cover.remove()
  reveal()
  await A(band, [{ transform: 'none' }, { transform: 'translateY(-100%)' }], { duration: 650, easing: EASE })
}

// Typewriter: the date and event name type out with a blinking caret, then the cover slides off to the left
const typewriter: Scene = async ({ layer, content, scale }, { A, el, wait, reveal, stopped }) => {
  const cover = el(`<div class="fill" style="background:var(--p)"></div>`)
  layer.append(cover)
  const box = el(`<div class="fill" style="padding:28px;display:flex;flex-direction:column;justify-content:center;color:var(--on)">
     <div class="l1" style="font:500 12px ui-monospace,Menlo,monospace;letter-spacing:.06em;opacity:.65;text-transform:uppercase"></div>
     <div style="font:600 40px/1.05 var(--f-display);letter-spacing:-.03em;margin-top:10px;overflow-wrap:anywhere"><span class="l2"></span><span class="caret" style="display:inline-block;width:3px;height:36px;background:var(--a);vertical-align:-4px;margin-left:3px"></span></div></div>`)
  layer.append(box)
  box.querySelector('.caret')!.animate?.([{ opacity: 1 }, { opacity: 0 }], { duration: Math.max(1, 450 * scale), iterations: Infinity, direction: 'alternate' })
  // Typed into text nodes, so host text needs no escaping here
  const type = async (node: Element, text: string, ms: number) => {
    for (const char of text) {
      if (stopped())
        return
      node.textContent += char
      await wait(ms)
    }
  }
  const details = [content.dateLong ?? content.dateNumeric, content.venue].filter(Boolean).join(' · ')
  if (details)
    await type(box.querySelector('.l1')!, `> ${details}`, 22)
  await type(box.querySelector('.l2')!, content.title, Math.min(55, 900 / Math.max(1, content.title.length)))
  await wait(300)
  reveal()
  await Promise.all([
    A(cover, [{ transform: 'none' }, { transform: 'translateX(-100%)' }], { duration: 750, easing: EASE }),
    A(box, [{ transform: 'none', opacity: 1 }, { transform: 'translateX(-40%)', opacity: 0 }], { duration: 600, easing: EASE }),
  ])
}

// The card stack's titles for an event without a program: parts of the day that suit the kind of event
const sampleCardTitles: Record<EventKind, string[]> = {
  any: ['Welcome', 'Main event', 'Celebration'],
  wedding: ['Ceremony', 'Cocktails', 'Reception'],
  party: ['Welcome', 'Games', 'Cake & candles'],
  business: ['Keynotes', 'Workshops', 'Networking'],
  memorial: ['Gathering', 'Tributes', 'Fellowship'],
}

// Card stack: a card per program item stacks up, fans out, and flies off; the kind's samples without a program (never
// mixed with real items). The first three come in one by one, any more quickly after them; however many there are,
// the stack and the fan stay the size of three cards.
const stackCards: Scene = async ({ layer, content }, { A, el, wait, reveal, size }) => {
  const cover = el(`<div class="fill" style="background:var(--bgS)"></div>`)
  layer.append(cover)
  const titles = content.programTitles.length ? content.programTitles : sampleCardTitles[content.kind]
  const count = titles.length
  const backgrounds = ['var(--p)', 'var(--a)', 'color-mix(in oklab,var(--p),#fff 12%)']
  // Each card's place from the middle (-1, 0, 1 for three; -0.5, 0.5 for two; 0 for one), scaled so more cards share
  // the width of three
  const spread = count > 3 ? 2 / (count - 1) : 1
  const offset = (i: number) => (i - (count - 1) / 2) * spread
  const lift = Math.min(8, 16 / Math.max(1, count - 1))
  const stacked = (i: number) => `translateY(${-i * lift}px) rotate(${offset(i) * 4}deg)`
  const fanned = (i: number) => `translate(${offset(i) * 90}px,-10px) rotate(${offset(i) * 12}deg)`
  // Each card waits below the screen, where its fly-in starts, so the stack builds up from empty
  const below = `translateY(${Math.round(size().height / 2 + 160)}px) rotate(10deg)`
  const cards = titles.map((title, i) => el(`<div style="position:absolute;left:50%;top:50%;width:200px;height:260px;margin:-130px 0 0 -100px;transform:${below};border-radius:16px;background:${backgrounds[i % backgrounds.length]};color:var(--on);padding:18px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 14px 30px -12px rgba(0,0,0,.4)">
     <span style="font:600 11px var(--f-body);letter-spacing:.2em;text-transform:uppercase;opacity:.75">${String(i + 1).padStart(2, '0')}</span><span style="font:600 ${title.length > 14 ? 22 : 26}px/1.1 var(--f-display);letter-spacing:-.02em;overflow-wrap:anywhere">${esc(title)}</span></div>`))
  cards.forEach(card => layer.append(card))
  // The first three one by one; the rest quickly, overlapping, all within about a second
  for (let i = 0; i < Math.min(3, count); i++)
    await A(cards[i]!, [{ transform: below }, { transform: stacked(i) }], { duration: 450, easing: EASE })
  const rest = cards.slice(3)
  const step = rest.length ? Math.min(150, 900 / rest.length) : 0
  await Promise.all(rest.map((card, j) => A(card, [{ transform: below }, { transform: stacked(j + 3) }], { duration: 250, delay: j * step, easing: EASE })))
  // Fewer than three cards hold a little longer, so the intro lasts as long as with three
  await wait(250 + 450 * Math.max(0, 3 - count))
  await Promise.all(cards.map((card, i) => A(card, [{ transform: stacked(i) }, { transform: fanned(i) }], { duration: 450, easing: EASE })))
  reveal()
  const leave = Math.min(60, 180 / Math.max(1, count - 1))
  await Promise.all([
    ...cards.map((card, i) => A(card, [{ transform: fanned(i) }, { transform: `translate(${offset(i) * 400}px,-700px) rotate(${offset(i) * 40}deg)` }], { duration: 650, delay: i * leave, easing: 'cubic-bezier(.5,0,.75,0)' })),
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: 200 }),
  ])
}

// Decoder: the event name scrambles through random characters and locks into place, then wipes away
const scramble: Scene = async ({ layer, content }, { A, el, wait, tween, reveal }) => {
  const cover = el(`<div class="fill" style="background:var(--p)"></div>`)
  layer.append(cover)
  const target = titleLines(content.title.toUpperCase())
  const t = el(`<div class="center"><div style="color:var(--on);font:600 ${fitSize(target, 50, 9)}px/1.02 ui-monospace,Menlo,var(--f-display);letter-spacing:-.02em;padding:0 20px">${target.map(() => `<div class="ln"></div>`).join('')}</div></div>`)
  layer.append(t)
  const lines = [...t.querySelectorAll('.ln')]
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*'
  await tween(1200, (k) => {
    lines.forEach((line, li) => {
      const text = [...target[li]!]
      const fixed = Math.floor(k * text.length * 1.1 - li * 1.5)
      line.innerHTML = k < 1
        ? text.map((char, ci) => ci < fixed ? esc(char) : `<span style="color:var(--a)">${esc(chars[Math.floor(Math.random() * chars.length)])}</span>`).join('')
        : esc(target[li])
    })
  })
  await wait(300)
  reveal()
  await Promise.all([
    A(cover, [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 0 100%)' }], { duration: 750, easing: EASE }),
    A(t, [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 0 100%)' }], { duration: 750, easing: EASE }),
  ])
}

// Zoom through the ring: the camera zooms through the hole in a ring and comes out on the site
const zoomThrough: Scene = async ({ layer, content }, { A, el, wait, tween, reveal, size }) => {
  const cover = el(`<div class="fill" style="background:var(--p)"></div>`)
  layer.append(cover)
  const logo = el(`<div class="center"><div style="text-align:center;color:var(--on);padding:0 24px"><div class="ring" style="width:84px;height:84px;margin:0 auto;border-radius:50%;border:16px solid var(--a)"></div><div class="nm" style="font:600 16px var(--f-display);margin-top:12px;letter-spacing:.02em">${esc(content.title)}</div></div></div>`)
  layer.append(logo)
  await A(logo.firstElementChild!, [{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'none' }], { duration: 500 })
  await wait(350)
  reveal()
  // The ring, the name and the cover zoom as one around the ring's hole, so the name grows past the camera with the ring
  // and the cover's hole (cut once, the size of the ring's) never drifts from it
  const ring = logo.querySelector<HTMLElement>('.ring')!.getBoundingClientRect()
  const box = layer.getBoundingClientRect()
  const { width, height } = size()
  const x = ring.width ? ring.left + ring.width / 2 - box.left : width / 2
  const y = ring.height ? ring.top + ring.height / 2 - box.top : height / 2
  setMask(cover, `radial-gradient(circle at ${x}px ${y}px, transparent 26px, #000 26.5px)`)
  for (const part of [cover, logo])
    part.style.transformOrigin = `${x}px ${y}px`
  const far = Math.hypot(width, height)
  await tween(900, (k) => {
    const e = k * k * k
    cover.style.transform = logo.style.transform = `scale(${1 + e * (far / 26)})`
    logo.style.opacity = String(1 - e)
  })
}

// Lanyard badge: an event badge swings down on its lanyard, settles, then lifts away with the cover
const badge: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const cover = el(`<div class="fill" style="background:var(--bgS)"></div>`)
  layer.append(cover)
  const details = dateAndVenue(content.dateLong ?? content.dateNumeric, content.venue)
  const b = el(`<div style="position:absolute;left:50%;top:-10px;width:180px;margin-left:-90px;transform-origin:50% 0">
     <div style="width:22px;height:150px;margin:0 auto;background:repeating-linear-gradient(0deg,var(--a) 0 10px,color-mix(in oklab,var(--a),#000 15%) 10px 20px)"></div>
     <div style="width:30px;height:14px;margin:-2px auto 0;border-radius:3px;background:linear-gradient(90deg,#888,#eee,#888)"></div>
     <div style="margin-top:4px;height:230px;border-radius:14px;background:#fff;box-shadow:0 16px 30px rgba(0,0,0,.18);overflow:hidden;display:flex;flex-direction:column">
       <div style="min-height:70px;background:linear-gradient(135deg,var(--p),var(--a));color:var(--on);padding:14px;font:600 11px var(--f-body);letter-spacing:.2em;text-transform:uppercase;overflow-wrap:anywhere">${esc(content.title)}</div>
       <div style="padding:16px 14px;color:var(--txt)"><div style="font:600 24px/1.05 var(--f-display);letter-spacing:-.02em">Guest</div>${details ? `<div style="font:500 11px var(--f-body);opacity:.6;margin-top:6px">${details}</div>` : ''}</div>
       <div style="margin:auto 14px 14px;height:24px;flex:none;background:repeating-linear-gradient(90deg,var(--txt) 0 2px,transparent 2px 4px,var(--txt) 4px 5px,transparent 5px 8px)"></div></div></div>`)
  layer.append(b)
  await A(b, [{ transform: 'translateY(-110%) rotate(0)' }, { transform: 'translateY(0) rotate(8deg)', offset: 0.55 }, { transform: 'rotate(-5deg)', offset: 0.75 }, { transform: 'rotate(2deg)', offset: 0.9 }, { transform: 'rotate(0)' }], { duration: 1200, easing: 'ease-out' })
  await wait(300)
  reveal()
  await Promise.all([
    A(b, [{ transform: 'none' }, { transform: 'translateY(-120%)' }], { duration: 650, easing: 'cubic-bezier(.6,0,.4,1)' }),
    A(cover, [{ transform: 'none' }, { transform: 'translateY(-100%)' }], { duration: 800, delay: 120, easing: EASE }),
  ])
}

// Blueprint grid: a grid draws itself and a frame forms around the event name, like a technical drawing
const blueprint: Scene = async ({ layer, content }, { A, el, wait, reveal, size }) => {
  const cover = el(`<div class="fill" style="background:var(--p)"></div>`)
  layer.append(cover)
  // Drawn in the screen's own pixels, so the cells stay square and the text sits in the box on every screen: a 6 × 4
  // cell box in the middle, on the grid's lines, with cells 45px on a phone and a little larger on bigger screens
  const { width, height } = size()
  const cell = 45 * Math.min(2, Math.max(1, Math.min(width / 360, height / 640)))
  const scale = cell / 45
  const box = { x: (width - 6 * cell) / 2, y: (height - 4 * cell) / 2, width: 6 * cell, height: 4 * cell }
  // Every cell's line across the screen, through the box's edge at `edge`
  const linesThrough = (edge: number, end: number) => {
    const first = edge - Math.floor(edge / cell) * cell
    return Array.from({ length: Math.floor((end - first) / cell) + 1 }, (_, i) => first + i * cell)
  }
  const columns = linesThrough(box.x, width)
  const rows = linesThrough(box.y, height)
  const grid = el(`<svg class="fill" width="100%" height="100%" viewBox="0 0 ${width} ${height}" stroke="color-mix(in oklab,var(--a),#fff 30%)" stroke-width=".8">
     ${columns.map(x => `<line x1="${x}" y1="0" x2="${x}" y2="${height}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" opacity=".35"/>`).join('')}
     ${rows.map(y => `<line x1="0" y1="${y}" x2="${width}" y2="${y}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" opacity=".35"/>`).join('')}
     <rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" fill="none" stroke-width="1.6" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" class="bx"/></svg>`)
  layer.append(grid)
  const lines = titleLines(content.title, 2)
  const label = content.dateNumeric ? `FIG. 01 — ${esc(content.dateNumeric)}` : 'FIG. 01'
  const t = el(`<div style="position:absolute;left:${box.x}px;top:${box.y}px;width:${box.width}px;height:${box.height}px;display:flex;flex-direction:column;justify-content:center;padding:0 ${18 * scale}px;color:var(--on);opacity:0">
     <div style="font:500 ${10 * scale}px ui-monospace,Menlo,monospace;letter-spacing:.1em;opacity:.7">${label}</div><div style="font:600 ${fitSize(lines, 34, 10) * scale}px/1 var(--f-display);letter-spacing:-.03em;margin-top:${8 * scale}px">${lines.map(esc).join('<br>')}</div></div>`)
  layer.append(t)
  // The lines start one after another, over about the same time however many the screen needs
  const stagger = Math.min(25, 575 / (columns.length + rows.length))
  await Promise.all([...grid.querySelectorAll('line')].map((line, i) => A(line, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 600, delay: i * stagger, easing: 'ease-in-out' })))
  await A(grid.querySelector('.bx')!, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 600, easing: 'ease-in-out' })
  await A(t, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 400 })
  await wait(300)
  reveal()
  await Promise.all([
    A(cover, [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 100% 0 0)' }], { duration: 750, easing: EASE }),
    A(grid, [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 100% 0 0)' }], { duration: 750, easing: EASE }),
    A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }),
  ])
}

// Spotlight: a stage spotlight searches the dark, lands on the title, then widens to light the whole page
const spotlight: Scene = async ({ layer, content }, { el, wait, tween, reveal, size }) => {
  const cover = el(`<div class="fill" style="background:#07090E"></div>`)
  layer.append(cover)
  const lines = titleLines(content.title, 2)
  const t = el(`<div class="center"><div style="text-align:center;color:#fff;padding:0 24px"><div style="font:600 10px var(--f-body);letter-spacing:.3em;text-transform:uppercase;opacity:.7">${esc(content.eyebrow || 'Keynote')}</div><div style="font:600 ${fitSize(lines, 40, 10)}px/1 var(--f-display);letter-spacing:-.03em;margin-top:6px">${lines.map(esc).join('<br>')}</div></div></div>`)
  layer.append(t)
  const dark = el(`<div class="fill" style="background:#07090E"></div>`)
  layer.append(dark)
  await tween(1500, (k) => {
    const e = 0.5 - 0.5 * Math.cos(k * Math.PI)
    const x = (0.15 + 0.7 * Math.sin(e * Math.PI * 1.2) * 0.6 + e * 0.2) * 100
    const y = 30 + e * 20
    const radius = 70 + e * 20
    setMask(dark, `radial-gradient(${radius}px ${radius * 1.2}px at ${k < 1 ? x : 50}% ${y}%, transparent 60%, #000 100%)`)
  })
  setMask(dark, 'radial-gradient(90px 108px at 50% 50%, transparent 60%, #000 100%)')
  await wait(400)
  reveal()
  const { height } = size()
  await tween(800, (k) => {
    const e = k * k * k
    const radius = 90 + e * height * 1.4
    const mask = `radial-gradient(${radius}px ${radius * 1.2}px at 50% 50%, transparent 60%, #000 100%)`
    setMask(dark, mask)
    setMask(cover, mask)
    t.style.opacity = String(1 - e)
  })
}

// Aurora: soft gradient lights drift and blend while the title rises line by line
const aurora: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const cover = el(`<div class="fill" style="background:var(--p);overflow:hidden"></div>`)
  layer.append(cover)
  const lights: [string, number, number][] = [
    ['var(--a)', -20, 10],
    ['var(--a2)', 40, 40],
    ['color-mix(in oklab,var(--a),var(--a2))', -10, 60],
    ['color-mix(in oklab,var(--a),#fff 30%)', 50, -5],
  ]
  const blobs = lights.map(([colour, x, y]) => {
    const blob = el(`<div style="position:absolute;left:${x}%;top:${y}%;width:80%;height:50%;border-radius:50%;background:${colour};filter:blur(50px);opacity:.75;mix-blend-mode:screen"></div>`)
    cover.append(blob)
    return blob
  })
  blobs.forEach((blob, i) => A(blob, [{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${(i % 2 ? -1 : 1) * 70}px,${(i < 2 ? 1 : -1) * 60}px) scale(1.3)` }], { duration: 2400, easing: 'ease-in-out' }))
  const lines = titleLines(content.title)
  const t = el(`<div class="center"><div style="color:var(--on);font:600 ${fitSize(lines, 44, 10)}px/1 var(--f-display);letter-spacing:-.03em;text-align:center;padding:0 24px">${lines.map(line => `<div style="overflow:hidden"><div class="ln">${esc(line)}</div></div>`).join('')}</div></div>`)
  layer.append(t)
  const rows = [...t.querySelectorAll('.ln')]
  await Promise.all(rows.map((row, i) => A(row, [{ transform: 'translateY(110%)' }, { transform: 'none' }], { duration: 700, delay: 300 + i * 110, easing: OUT })))
  await wait(450)
  reveal()
  // The title fades with the lights, as one, slowly and evenly (an out easing would drop most of it at once)
  await Promise.all([cover, t].map(part => A(part, [{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(12px)' }], { duration: 1400, easing: 'cubic-bezier(.45,0,.55,1)' })))
}

// By the numbers: the programme's numbers count up (days, sessions, speakers), then the cover lifts
const stats: Scene = async ({ layer, content }, { A, el, wait, tween, reveal }) => {
  const cover = el(`<div class="fill" style="background:var(--p)"></div>`)
  layer.append(cover)
  const numbers = content.stats.length ? content.stats.slice(0, 3) : [{ value: 1, label: 'day' }]
  const g = el(`<div class="fill" style="display:flex;flex-direction:column;justify-content:center;padding:0 28px;gap:18px;color:var(--on)">
     <div style="font:600 10px var(--f-body);letter-spacing:.3em;text-transform:uppercase;opacity:.6">${esc(content.title)}</div>
     ${numbers.map(stat => `<div class="row" style="display:flex;align-items:baseline;gap:12px;border-top:1px solid color-mix(in oklab,var(--on),transparent 82%);padding-top:10px;opacity:0"><span class="v" style="font:600 56px/1 var(--f-display);letter-spacing:-.04em;font-variant-numeric:tabular-nums;min-width:4.2ch">0</span><span style="font:500 15px var(--f-body);opacity:.7">${esc(stat.label)}</span></div>`).join('')}</div>`)
  layer.append(g)
  const rows = [...g.querySelectorAll('.row')]
  await Promise.all(rows.map(async (row, i) => {
    await A(row, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 450, delay: i * 160 })
    const value = row.querySelector('.v')!
    const to = numbers[i]!.value
    await tween(900, (k) => {
      value.textContent = Math.round(to * (1 - (1 - k) ** 3)).toLocaleString('en-US')
    })
  }))
  await wait(350)
  reveal()
  await Promise.all([
    A(cover, [{ transform: 'none' }, { transform: 'translateY(-100%) skewY(-4deg)' }], { duration: 800, easing: EASE }),
    A(g, [{ transform: 'none' }, { transform: 'translateY(-100%)' }], { duration: 800, easing: EASE }),
  ])
}

// Ribbon cutting: scissors cut a ribbon stretched between gold posts, the ends fall away, and "Now open" appears
const ribbonCut: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const cover = el(`<div class="fill" style="background:var(--bgS)"></div>`)
  layer.append(cover)
  // The posts are a fixed brass gold; the ribbon is satin in the accent; the scissors' handles are the primary
  const GOLD = 'background:linear-gradient(90deg,#7A5A1E,#F4E2A6,#9C7A3A)'
  const post = (side: 'left' | 'right') => el(`<div style="position:absolute;${side}:8%;top:34%;width:16px;height:46%"><div style="width:22px;height:22px;margin-left:-3px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#FFF3C8,#B48A3C 60%,#6E5220)"></div><div style="width:8px;height:100%;margin:0 auto;${GOLD}"></div><div style="width:46px;height:8px;margin-left:-15px;border-radius:4px;${GOLD}"></div></div>`)
  const posts = [post('left'), post('right')]
  layer.append(...posts)
  const SATIN = 'background:linear-gradient(180deg,color-mix(in oklab,var(--a),#000 25%),color-mix(in oklab,var(--a),#fff 35%) 35%,var(--a) 60%,color-mix(in oklab,var(--a),#000 30%));box-shadow:0 3px 6px rgba(0,0,0,.18)'
  const ribbonLeft = el(`<div style="position:absolute;left:calc(8% + 8px);right:50%;top:calc(34% + 14px);height:16px;${SATIN};transform-origin:0 50%"></div>`)
  const ribbonRight = el(`<div style="position:absolute;left:50%;right:calc(8% + 8px);top:calc(34% + 14px);height:16px;${SATIN};transform-origin:100% 50%"></div>`)
  layer.append(ribbonLeft, ribbonRight)
  const scissors = el(`<div style="position:absolute;left:50%;top:calc(34% - 40px);width:80px;margin-left:-40px;opacity:0"><svg viewBox="0 0 80 100" style="width:100%;overflow:visible">
     <g class="b1" style="transform-origin:40px 56px"><path d="M40 56 36 4Q40 0 44 4Z" fill="#C9D1DC" stroke="#8C96A5"/><circle cx="26" cy="78" r="12" fill="none" stroke="var(--p)" stroke-width="6"/><path d="M40 56 30 68" stroke="var(--p)" stroke-width="6"/></g>
     <g class="b2" style="transform-origin:40px 56px"><path d="M40 56 44 4Q40 0 36 4Z" fill="#E3E8EF" stroke="#8C96A5"/><circle cx="54" cy="78" r="12" fill="none" stroke="var(--p)" stroke-width="6"/><path d="M40 56 50 68" stroke="var(--p)" stroke-width="6"/></g></svg></div>`)
  layer.append(scissors)
  const lines = titleLines(content.title)
  const t = el(`<div style="position:absolute;left:0;right:0;top:58%;padding:0 24px;text-align:center;color:var(--txt);opacity:0"><div style="font:600 10px var(--f-body);letter-spacing:.3em;text-transform:uppercase;opacity:.6">${esc(content.eyebrow || 'Now open')}</div><div style="font:600 ${fitSize(lines, 36, 12)}px/1 var(--f-display);letter-spacing:-.03em;margin-top:6px">${lines.map(esc).join('<br>')}</div></div>`)
  layer.append(t)
  await A(scissors, [{ opacity: 0, transform: 'translateY(-80px) rotate(-20deg)' }, { opacity: 1, transform: 'none' }], { duration: 600 })
  // Snip: the blades close
  await Promise.all([
    A(scissors.querySelector('.b1')!, [{ transform: 'rotate(-22deg)' }, { transform: 'rotate(0)' }], { duration: 260, easing: 'ease-in' }),
    A(scissors.querySelector('.b2')!, [{ transform: 'rotate(22deg)' }, { transform: 'rotate(0)' }], { duration: 260, easing: 'ease-in' }),
  ])
  // The ends fall, swinging round the posts
  A(ribbonLeft, [{ transform: 'none' }, { transform: 'rotate(70deg) scaleX(.6)' }], { duration: 700, easing: 'cubic-bezier(.3,0,.5,1)' })
  A(ribbonRight, [{ transform: 'none' }, { transform: 'rotate(-70deg) scaleX(.6)' }], { duration: 700, easing: 'cubic-bezier(.3,0,.5,1)' })
  A(scissors, [{ opacity: 1 }, { opacity: 0, transform: 'translateY(-40px)' }], { duration: 400 })
  await A(t, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 200 })
  await wait(350)
  reveal()
  await Promise.all([...layer.children].map(node => A(node, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 })))
}

// A departure board row is 12 characters
const BOARD_COLUMNS = 12

// Up to `rows` board rows from the words of `text`, uppercased: words share a row while they fit, a longer word is cut
function boardRows(text: string, rows: number): string[] {
  const out: string[] = []
  for (const word of text.toUpperCase().split(/\s+/).filter(Boolean)) {
    const last = out.at(-1)
    if (last !== undefined && last.length + 1 + word.length <= BOARD_COLUMNS)
      out[out.length - 1] = `${last} ${word}`
    else
      out.push(word.slice(0, BOARD_COLUMNS))
  }
  return out.slice(0, rows)
}

// The date as a board shows it: "FEB 14 2027" (from "Sunday, February 14, 2027"), else the numeric date without spaces
function boardDate(content: { dateLong?: string, dateNumeric?: string }): string | undefined {
  const [, monthDay, year] = content.dateLong?.split(', ') ?? []
  const [month, day] = monthDay?.split(' ') ?? []
  if (month && day && year)
    return `${month.slice(0, 3)} ${day} ${year}`.toUpperCase()
  return content.dateNumeric?.replace(/\s+/g, '')
}

// Departure board: split-flap tiles flip through letters and settle on the event name, its date and venue
const splitFlap: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  // The board is a fixed black; its tiles are the theme's primary, the name in the text on it and the date and venue in
  // the accent (as it reads on the primary)
  const cover = el(`<div class="fill" style="background:#0E1015"></div>`)
  layer.append(cover)
  const rows = [
    ...boardRows(content.title, 2),
    boardDate(content)?.slice(0, BOARD_COLUMNS),
    content.venue?.toUpperCase().slice(0, BOARD_COLUMNS),
  ].filter((row): row is string => !!row)
  // Every row has exactly 12 tiles and never wraps
  const board = el(`<div class="center"><div style="display:flex;flex-direction:column;gap:6px">${rows.map((row, r) => `<div data-board-row style="display:flex;flex-wrap:nowrap;gap:3px;justify-content:center">${[...row.padEnd(BOARD_COLUMNS, ' ')].map(char => `<span class="tl" data-c="${esc(char)}" style="position:relative;flex:none;width:24px;height:34px;border-radius:3px;background:linear-gradient(180deg,color-mix(in oklab,var(--p),#fff 6%) 49%,#0A0B0F 50%,color-mix(in oklab,var(--p),#000 12%) 51%);color:${r < 2 ? 'var(--on)' : 'var(--a-on-p)'};font:600 22px/34px ui-monospace,Menlo,monospace;text-align:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)"> </span>`).join('')}</div>`).join('')}</div></div>`)
  layer.append(board)
  const tiles = [...board.querySelectorAll<HTMLElement>('.tl')]
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  // Each tile flips through random letters, then settles; lower rows flip longer
  await Promise.all(tiles.map(async (tile, i) => {
    const target = tile.dataset.c ?? ' '
    if (target === ' ')
      return
    const flips = 4 + (i % 7) + Math.floor(i / BOARD_COLUMNS) * 2
    for (let k = 0; k < flips; k++) {
      tile.textContent = letters[Math.floor(Math.random() * letters.length)]!
      A(tile, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(.4)' }, { transform: 'scaleY(1)' }], { duration: 70, easing: 'linear' })
      await wait(70)
    }
    tile.textContent = target
  }))
  await wait(500)
  reveal()
  await Promise.all([
    A(cover, [{ transform: 'none' }, { transform: 'translateY(-100%)' }], { duration: 800, easing: EASE }),
    A(board, [{ transform: 'none' }, { transform: 'translateY(-100%)' }], { duration: 800, easing: EASE }),
  ])
}

// Globe: a dotted globe turns with pulsing city points, then the camera dives in
const globe: Scene = async ({ layer, content }, { A, el, reveal, size, tween }) => {
  const cover = el(`<div class="fill" style="background:radial-gradient(70% 50% at 50% 42%,color-mix(in oklab,var(--p),var(--a) 25%),var(--p))"></div>`)
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
  // 520 dots on a Fibonacci sphere, and three city points pulsing in the accent
  const dots = Array.from({ length: 520 }, (_, i) => {
    const y = 1 - (i / 519) * 2
    const radius = Math.sqrt(1 - y * y)
    return [Math.cos(i * 2.39996) * radius, y, Math.sin(i * 2.39996) * radius] as const
  })
  const cities = [[0.25, 0.3], [1.9, 0.05], [2.4, -0.2]] as const
  const accent = getComputedStyle(layer).getPropertyValue('--a').trim() || '#3B5BFD'
  const label = content.eyebrow || content.venue
  const t = el(`<div style="position:absolute;left:0;right:0;top:70%;padding:0 24px;text-align:center;color:var(--on);opacity:0">${label ? `<div style="font:600 10px var(--f-body);letter-spacing:.3em;text-transform:uppercase;opacity:.65">${esc(label)}</div>` : ''}<div style="font:600 ${fitSize([content.title], 34, 16)}px/1 var(--f-display);letter-spacing:-.03em;margin-top:6px">${esc(content.title)}</div></div>`)
  layer.append(t)
  A(t, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 700 })
  const base = Math.min(width, height) * 0.32
  const cx = width / 2
  const cy = height * 0.42
  // The globe at `ms` into the turn, `zoom` times its size, at `alpha`: orthographic, the near side only
  const draw = (ms: number, zoom: number, alpha: number) => {
    if (!g)
      return
    const turn = ms / 1000 * 0.9
    const R = base * zoom
    g.clearRect(0, 0, width, height)
    g.fillStyle = '#fff'
    for (const [x, y, z] of dots) {
      const X = x * Math.cos(turn) - z * Math.sin(turn)
      const Z = x * Math.sin(turn) + z * Math.cos(turn)
      if (Z < -0.1)
        continue
      g.globalAlpha = alpha * (0.25 + 0.75 * Math.max(0, Z))
      g.beginPath()
      g.arc(cx + X * R, cy - y * R, 1.3 * zoom, 0, 7)
      g.fill()
    }
    cities.forEach(([lon, lat], i) => {
      const x = Math.cos(lat) * Math.cos(lon + turn)
      const z = Math.cos(lat) * Math.sin(lon + turn)
      const y = Math.sin(lat)
      if (z < 0)
        return
      const pulse = (Math.sin(ms / 220 + i) + 1) / 2
      g.globalAlpha = alpha
      g.fillStyle = accent
      g.strokeStyle = accent
      g.beginPath()
      g.arc(cx + x * R, cy - y * R, 3.5 * zoom, 0, 7)
      g.fill()
      g.globalAlpha = alpha * (1 - pulse)
      g.beginPath()
      g.arc(cx + x * R, cy - y * R, (4 + pulse * 12) * zoom, 0, 7)
      g.stroke()
    })
    g.globalAlpha = 1
    g.fillStyle = '#fff'
  }
  await tween(2000, k => draw(k * 2000, 1, 1))
  reveal()
  A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 })
  // The camera dives in: the globe grows six times as it fades
  await tween(850, (k) => {
    const e = k * k * k
    cover.style.opacity = String(1 - k)
    draw(2000 + k * 850, 1 + e * 5, 1 - e)
  })
  canvas.remove()
}

// Keynote slide: a presentation slide moves from "Welcome" to the title slide, then expands into the page
const keynote: Scene = async ({ layer, content }, { A, el, wait, reveal, size }) => {
  // The darkened hall and the stage keep their own colours
  const cover = el(`<div class="fill" style="background:#0C0E14"></div>`)
  layer.append(cover)
  const lines = titleLines(content.title, 2)
  // The slide fits the screen whatever its shape: 84% of the width at 16:9, but no taller than half the height (so it
  // stays above the stage on a wide screen), its middle a little above the screen's; its text grows with it, from the
  // sizes on a phone's slide (about 300px wide)
  const { width, height } = size()
  const slideWidth = Math.min(width * 0.84, height * 0.5 * 16 / 9)
  const slideHeight = slideWidth * 9 / 16
  const k = slideWidth / 302
  const slide = el(`<div style="position:absolute;left:${(width - slideWidth) / 2}px;top:${Math.max(height * 0.08, height * 0.4 - slideHeight / 2)}px;width:${slideWidth}px;height:${slideHeight}px;border-radius:${6 * k}px;overflow:hidden;background:#fff;box-shadow:0 20px 40px rgba(0,0,0,.5)">
     <div class="s1" style="position:absolute;inset:0;display:grid;place-items:center;background:var(--bgS);color:var(--txt);font:600 ${24 * k}px var(--f-display);letter-spacing:-.02em">Welcome</div>
     <div class="s2" style="position:absolute;inset:0;padding:${14 * k}px ${16 * k}px;display:flex;flex-direction:column;justify-content:flex-end;background:linear-gradient(135deg,var(--p),var(--a));color:var(--on);transform:translateX(100%)">${content.dateLong ? `<div style="font:600 ${8 * k}px var(--f-body);letter-spacing:.24em;text-transform:uppercase;opacity:.7">${esc(content.dateLong)}</div>` : ''}<div style="font:600 ${fitSize(lines, 24, 12) * k}px/1 var(--f-display);letter-spacing:-.03em">${lines.map(esc).join('<br>')}</div></div></div>`)
  layer.append(slide)
  const stage = el(`<div style="position:absolute;left:0;right:0;bottom:0;height:22%;background:linear-gradient(180deg,#151821,#090A0E)"><div style="position:absolute;left:50%;top:14px;width:120px;height:6px;margin-left:-60px;border-radius:3px;background:var(--a);opacity:.6;filter:blur(3px)"></div></div>`)
  layer.append(stage)
  await A(slide, [{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'none' }], { duration: 600 })
  await wait(500)
  // Next slide
  await Promise.all([
    A(slide.querySelector('.s1')!, [{ transform: 'none' }, { transform: 'translateX(-100%)' }], { duration: 550, easing: EASE }),
    A(slide.querySelector('.s2')!, [{ transform: 'translateX(100%)' }, { transform: 'none' }], { duration: 550, easing: EASE }),
  ])
  await wait(500)
  reveal()
  // The slide grows to the page's width as it fades
  const box = slide.getBoundingClientRect()
  const area = layer.getBoundingClientRect()
  const grow = box.width ? area.width / box.width : 1
  await Promise.all([
    A(slide, [{ transform: 'none', opacity: 1 }, { transform: `translateY(${-(box.top - area.top)}px) scale(${grow})`, opacity: 0 }], { duration: 800, easing: EASE }),
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: 100 }),
    A(stage, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 }),
  ])
}

// Network: points appear and connect into a network around the event name
const network: Scene = async ({ layer, content }, { A, el, wait, reveal, size }) => {
  const cover = el(`<div class="fill" style="background:var(--p)"></div>`)
  layer.append(cover)
  const { width: W, height: H } = size()
  const R = rng(12)
  // 22 seeded points, joined when closer than a third of the width
  const nodes = Array.from({ length: 22 }, () => [R() * W, R() * H * 0.9 + H * 0.05] as const)
  const edges: [number, number][] = []
  nodes.forEach((a, i) => nodes.forEach((b, j) => {
    if (j > i && Math.hypot(a[0] - b[0], a[1] - b[1]) < W * 0.32)
      edges.push([i, j])
  }))
  const svg = el(`<svg class="fill" width="100%" height="100%" viewBox="0 0 ${W} ${H}">${edges.map(([i, j]) => `<line x1="${nodes[i]![0]}" y1="${nodes[i]![1]}" x2="${nodes[j]![0]}" y2="${nodes[j]![1]}" stroke="rgba(255,255,255,.28)" stroke-width="1" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`).join('')}${nodes.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 5 ? 3 : 5}" style="fill:${i % 5 ? '#fff' : 'var(--a)'};transform-box:fill-box;transform-origin:center" opacity="0"/>`).join('')}</svg>`)
  layer.append(svg)
  const lines = titleLines(content.title, 2)
  const t = el(`<div class="center"><div style="text-align:center;color:var(--on);background:color-mix(in oklab,var(--p),transparent 15%);padding:14px 18px;border-radius:12px;max-width:86%;opacity:0"><div style="font:600 10px var(--f-body);letter-spacing:.3em;text-transform:uppercase;opacity:.65">${esc(content.eyebrow || 'Connect · Learn · Lead')}</div><div style="font:600 ${fitSize(lines, 38, 11)}px/1 var(--f-display);letter-spacing:-.03em;margin-top:6px">${lines.map(esc).join('<br>')}</div></div></div>`)
  layer.append(t)
  svg.querySelectorAll('circle').forEach((dot, i) => A(dot, [{ opacity: 0, transform: 'scale(0)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: i * 35 }))
  await wait(400)
  await Promise.all([...svg.querySelectorAll('line')].map((line, i) => A(line, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 500, delay: i * 12, easing: 'ease-out' })))
  await A(t.firstElementChild!, [{ opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 600 })
  await wait(350)
  reveal()
  await Promise.all([
    A(cover, [{ clipPath: 'circle(150% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }], { duration: 800, easing: EASE }),
    A(svg, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(1.3)' }], { duration: 700 }),
    A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 }),
  ])
}

export const scenes: Record<string, Scene> = {
  'counter': counter,
  'split-title': splitTitle,
  'tiles': tiles,
  'kinetic': kinetic,
  'blinds': blinds,
  'line-expand': lineExpand,
  'typewriter': typewriter,
  'stack-cards': stackCards,
  'scramble': scramble,
  'zoom-through': zoomThrough,
  'badge': badge,
  'blueprint': blueprint,
  'spotlight': spotlight,
  'aurora': aurora,
  'stats': stats,
  'ribbon-cut': ribbonCut,
  'split-flap': splitFlap,
  'globe': globe,
  'keynote': keynote,
  'network': network,
}
