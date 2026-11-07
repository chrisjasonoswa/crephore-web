import type { IntroContent } from '~/features/site-motion/scenes/scene.kit'
import type { SceneKind } from '~/features/site-motion/site-motion.type'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadScene, sceneCovers } from '~/features/site-motion/scenes'
import { createSceneKit, esc } from '~/features/site-motion/scenes/scene.kit'
import { introPresets } from '~/features/site-motion/presets'
import { pageIntros, sceneIntroKeys } from '~/features/site-motion/site-motion.type'

// Host text that would run script or add elements if a scene put it in HTML unescaped
const hostile = '<img src=x onerror="alert(1)"><b>Bea</b> & "Carlo"'
const fullContent: IntroContent = {
  title: hostile,
  eyebrow: hostile,
  initials: '<i>B</i> & C',
  firstName: '<u>Bea</u>',
  dateLong: hostile,
  dateNumeric: '02 · 14 · <s>2027</s>',
  venue: hostile,
  lifeDates: '1938 – <s>2026</s>',
  programTitles: [hostile, 'Workshops', 'Networking'],
  stats: [{ value: 2, label: 'days' }, { value: 40, label: 'sessions' }, { value: 12, label: 'speakers' }],
  kind: 'business',
}
// Only a title: no dates, life dates, venue or program
const sparseContent: IntroContent = { title: 'Ana', initials: 'A', firstName: 'Ana', programTitles: [], stats: [], kind: 'any' }

beforeEach(() => {
  // Animations end at once, frames come at once
  vi.spyOn(Element.prototype, 'animate').mockImplementation(() => ({ finished: Promise.resolve(), cancel: () => {} }) as unknown as Animation)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => setTimeout(() => callback(performance.now() + 1e7), 0))
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

async function run(kind: SceneKind, key: string, content: IntroContent) {
  const scene = await loadScene(kind, key as never)
  expect(scene, `${kind}/${key} is in its file`).toBeTypeOf('function')
  const layer = document.createElement('div')
  layer.className = 'intro-scene-layer'
  document.body.append(layer)
  const page = document.createElement('div')
  const ctx = { layer, content, page, scale: 0 }
  await scene!(ctx, createSceneKit(ctx))
  return layer
}

describe.each(Object.keys(sceneIntroKeys) as SceneKind[])('%s scenes', (kind) => {
  it.each([...sceneIntroKeys[kind]])('%s plays to the end, with host text escaped', async (key) => {
    const layer = await run(kind, key, fullContent)
    expect(layer.querySelector('img, b, i, u, s'), 'no element from host text').toBeNull()
    expect(layer.querySelector('[onerror]')).toBeNull()
    layer.remove()
  })

  it.each([...sceneIntroKeys[kind]])('%s plays with only a title, without "undefined" or empty lines', async (key) => {
    const layer = await run(kind, key, sparseContent)
    expect(layer.textContent).not.toMatch(/undefined|null|NaN/)
    layer.remove()
  })
})

// Plays a scene, counting how often it brings the page in; `skip` stops it right after it starts, like a tap
async function play(kind: SceneKind, key: string, content: IntroContent, skip = false) {
  const scene = await loadScene(kind, key as never)
  const layer = document.createElement('div')
  document.body.append(layer)
  const ctx = { layer, content, page: document.createElement('div'), scale: 0 }
  const kit = createSceneKit(ctx)
  const reveal = vi.spyOn(kit, 'reveal')
  const playing = scene!(ctx, kit)
  if (skip)
    kit.stop()
  await playing
  layer.remove()
  return { layer, reveals: reveal.mock.calls.length }
}

// Vellum never brings the page in: it shows through the sheet from the start
const showsThePageThroughout = ['vellum']

describe.each(Object.keys(sceneIntroKeys) as SceneKind[])('%s scenes reveal', (kind) => {
  it.each([...sceneIntroKeys[kind]])('%s brings the page in once', async (key) => {
    expect((await play(kind, key, fullContent)).reveals).toBe(showsThePageThroughout.includes(key) ? 0 : 1)
  })
})

describe('departure board', () => {
  it('cuts each row to 12 tiles that never wrap, from the name, date and venue', async () => {
    const layer = await run('business', 'split-flap', { ...sparseContent, title: 'Supercalifragilistic Leadership Summit', dateLong: 'Sunday, February 14, 2027', venue: 'SMX Convention Center' })
    const rows = [...layer.querySelectorAll<HTMLElement>('[data-board-row]')]
    layer.remove()

    expect(rows.map(row => row.querySelectorAll('.tl').length)).toEqual([12, 12, 12, 12])
    expect(rows.every(row => row.style.flexWrap === 'nowrap')).toBe(true)
    expect(rows.map(row => row.textContent!.trim())).toEqual(['SUPERCALIFRA', 'LEADERSHIP', 'FEB 14 2027', 'SMX CONVENTI'])
  })
})

describe('banderitas', () => {
  it('hangs 27 flags on three strings, over the small label (only when there is one) and the hero heading', async () => {
    const layer = await run('party', 'bunting', { ...sparseContent, title: 'Mika turns 7!', eyebrow: 'Let\'s celebrate' })
    const strings = [...layer.querySelectorAll('svg')].filter(svg => svg.parentElement?.querySelector('.fl'))
    expect(layer.querySelectorAll('.fl')).toHaveLength(27)
    expect(strings.map(svg => svg.parentElement!.querySelectorAll('.fl').length)).toEqual([9, 8, 10])
    expect(layer.textContent).toContain('Let\'s celebrate')
    expect(layer.textContent).toContain('Mika turns 7!')
    layer.remove()

    const plain = await run('party', 'bunting', { ...sparseContent, title: 'Mika turns 7!' })
    const text = [...plain.children].at(-1)!
    expect(text.children).toHaveLength(1)
    expect(text.textContent).toBe('Mika turns 7!')
    plain.remove()
  })
})

describe('any occasion', () => {
  const event = { ...sparseContent, title: 'Celebrate with us', dateLong: 'Saturday, March 20, 2027', dateNumeric: '03 · 20 · 2027', venue: 'The Glasshouse, Manila' }
  const play = async (key: string, content: Partial<IntroContent> = {}) => run('any', key, { ...event, ...content })

  it('shows the hero heading, never the small label, where a scene has one line of text', async () => {
    for (const key of ['calendar', 'pin-drop', 'assemble', 'color-bands', 'orbit', 'brush', 'stardust', 'window-light', 'date-roll', 'ribbon-tape', 'counter-scroll', 'film-strip']) {
      const layer = await play(key, { eyebrow: 'You\'re invited' })
      expect(layer.textContent!.toLowerCase(), key).toContain('celebrate')
      expect(layer.textContent!.toLowerCase(), key).not.toContain('you\'re invited')
      layer.remove()
    }
  })

  it('shows the small label over the heading where a scene has both, and the label (or heading) on the card\'s front', async () => {
    const accordion = await play('accordion', { eyebrow: 'You\'re invited' })
    expect(accordion.textContent).toContain('You\'re invited')
    expect(accordion.textContent).toContain('Celebrate with us')
    expect(accordion.textContent).not.toContain('The Glasshouse')
    accordion.remove()
    const front = (layer: HTMLElement) => layer.querySelector('.front')!.textContent
    const labelled = await play('card-flip', { eyebrow: 'You\'re invited' })
    expect(front(labelled)).toBe('You\'re invited')
    labelled.remove()
    const plain = await play('card-flip')
    expect(front(plain)).toBe('Celebrate with us')
    plain.remove()
  })

  it('stamps "Save the date" with the date, the heading and venue under it', async () => {
    const layer = await play('stamp', { eyebrow: 'You\'re invited' })
    expect(layer.querySelector('.st')!.textContent).toContain('Save the date')
    expect(layer.querySelector('.st')!.textContent).toContain('03 · 20 · 2027')
    expect(layer.textContent).toContain('Celebrate with us')
    expect(layer.textContent).toContain('The Glasshouse, Manila')
    expect(layer.textContent).not.toContain('You\'re invited')
    layer.remove()
  })

  it('starts each scene on its empty background: the pin, rings, stroke and rule hidden until their turn', async () => {
    const pin = await play('pin-drop')
    expect([...pin.querySelectorAll<HTMLElement>('div')].filter(node => node.querySelector('path[d^="M22 2"]')).every(node => node.style.opacity === '0')).toBe(true)
    pin.remove()
    const orbit = await play('orbit')
    expect([...orbit.querySelectorAll<HTMLElement>('div')].filter(node => node.style.borderRadius === '50%' && node.style.scale).every(node => node.style.scale === '0')).toBe(true)
    orbit.remove()
    const brush = await play('brush')
    expect(brush.querySelector<SVGElement>('svg')!.style.clipPath).toBe('inset(0 100% 0 0)')
    brush.remove()
    const counter = await play('counter-scroll')
    expect([...counter.querySelectorAll<HTMLElement>('div')].find(node => node.style.height === '1px')!.style.transform).toBe('scaleX(0)')
    counter.remove()
  })

  it('tears off the six days before the event\'s, then shows its day, from the event\'s date', async () => {
    const layer = await play('calendar')
    const pages = [...layer.querySelectorAll('.pg')].map(page => [...page.children].map(part => part.textContent).join(' '))
    layer.remove()
    expect(pages).toEqual(['14 Sunday', '15 Monday', '16 Tuesday', '17 Wednesday', '18 Thursday', '19 Friday', '20 Saturday'])
  })

  it('rolls the date month first, two digits each', async () => {
    const layer = await play('date-roll')
    const digits = [...layer.querySelectorAll<HTMLElement>('.rl')].map(roll => roll.dataset.d)
    layer.remove()
    expect(digits).toEqual(['0', '3', '2', '0', '2', '7'])
  })

  it('without a date, leaves out the calendar\'s pages and the rolled date', async () => {
    const calendar = await play('calendar', { dateLong: undefined })
    expect(calendar.querySelectorAll('.pg')).toHaveLength(0)
    calendar.remove()
    const roll = await play('date-roll', { dateNumeric: undefined })
    expect(roll.querySelectorAll('.rl')).toHaveLength(0)
    roll.remove()
  })

  it('cycles the heading\'s words, then the whole date, under the small label (left out without one)', async () => {
    const layer = await play('word-cycle', { eyebrow: 'You\'re invited' })
    expect([...layer.querySelectorAll('.in > div')].map(item => item.textContent)).toEqual(['Celebrate', 'with', 'us', 'Saturday, March 20, 2027'])
    expect(layer.textContent).toContain('You\'re invited')
    layer.remove()
    const plain = await play('word-cycle')
    expect(plain.textContent).not.toContain('Come and')
    expect(plain.querySelector('.in')!.parentElement!.previousElementSibling).toBeNull()
    plain.remove()
  })

  it('uses a solid pane where the browser can\'t blur what\'s behind', async () => {
    vi.stubGlobal('CSS', { supports: () => false })
    const glass = await play('frosted-glass')
    expect(glass.innerHTML).not.toContain('backdrop-filter')
    glass.remove()
    const focus = await play('focus-pull')
    expect(focus.innerHTML).not.toContain('backdrop-filter')
    focus.remove()
  })
})

describe('canvas scenes', () => {
  it.each([['business', 'globe'], ['memorial', 'after-rain']] as const)('%s/%s removes its canvas at the end, and when skipped', async (kind, key) => {
    expect((await play(kind, key, fullContent)).layer.querySelector('canvas')).toBeNull()
    expect((await play(kind, key, fullContent, true)).layer.querySelector('canvas')).toBeNull()
  })
})

describe('card stack', () => {
  const cardTitles = async (content: Partial<IntroContent>) => {
    const layer = await run('business', 'stack-cards', { ...sparseContent, ...content })
    const titles = [...layer.querySelectorAll('div > span:last-child')].map(span => span.textContent)
    layer.remove()
    return titles
  }

  it('has a card for each program item, never mixed with samples', async () => {
    expect(await cardTitles({ programTitles: ['Ceremony'], kind: 'wedding' })).toEqual(['Ceremony'])
    expect(await cardTitles({ programTitles: ['Ceremony', 'Cocktails', 'Dinner'] })).toEqual(['Ceremony', 'Cocktails', 'Dinner'])
    const long = Array.from({ length: 12 }, (_, i) => `Session ${i + 1}`)
    expect(await cardTitles({ programTitles: long })).toEqual(long)
  })

  it('numbers the cards 01, 02, … 12', async () => {
    const layer = await run('business', 'stack-cards', { ...sparseContent, programTitles: Array.from({ length: 12 }, (_, i) => `Session ${i + 1}`) })
    const numbers = [...layer.querySelectorAll('div > span:first-child')].map(span => span.textContent)
    layer.remove()
    expect([numbers[0], numbers[9], numbers[11]]).toEqual(['01', '10', '12'])
  })

  it('shows samples that suit the kind of event without a program', async () => {
    expect(await cardTitles({ kind: 'wedding' })).toEqual(['Ceremony', 'Cocktails', 'Reception'])
    expect(await cardTitles({ kind: 'party' })).toEqual(['Welcome', 'Games', 'Cake & candles'])
    expect(await cardTitles({ kind: 'business' })).toEqual(['Keynotes', 'Workshops', 'Networking'])
    expect(await cardTitles({ kind: 'memorial' })).toEqual(['Gathering', 'Tributes', 'Fellowship'])
    expect(await cardTitles({ kind: 'any' })).toEqual(['Welcome', 'Main event', 'Celebration'])
  })
})

describe('memorial life dates', () => {
  // The scenes that write the life dates under the name, as the hero shows them
  const withLifeDates = ['wreath-seal', 'candlelight', 'portrait', 'dates', 'lily', 'first-light', 'mist', 'verse', 'lanterns', 'feather', 'album', 'stars', 'ripple', 'butterfly']

  it.each(withLifeDates)('%s shows them in full or as years, and leaves them out without them', async (key) => {
    for (const lifeDates of ['1 May 1938 – 3 October 2026', '1938 – 2026']) {
      const layer = await run('memorial', key, { ...sparseContent, title: 'Lola Ising', lifeDates, kind: 'memorial' })
      expect(layer.textContent!.replace(/\s+/g, ' '), lifeDates).toContain(lifeDates.replace(' – ', key === 'dates' ? '' : ' – '))
      layer.remove()
    }
    const without = await run('memorial', key, { ...sparseContent, title: 'Lola Ising', kind: 'memorial' })
    expect(without.textContent).not.toMatch(/1938|2026/)
    without.remove()
  })
})

describe('scene registry', () => {
  it('has a cover, a duration and a picker card for every scene, twenty per kind', () => {
    for (const kind of Object.keys(sceneIntroKeys) as SceneKind[]) {
      expect(sceneIntroKeys[kind], kind).toHaveLength(20)
      for (const key of sceneIntroKeys[kind]) {
        expect(sceneCovers[key], key).toBeTruthy()
        expect(introPresets[key].duration, key).toBeGreaterThan(1500)
        expect(pageIntros.find(choice => choice.key === key), key).toMatchObject({ kind, mood: expect.any(String) })
      }
    }
  })

  it('escapes host text for HTML', () => {
    expect(esc('<b class="x">Bea & \'Carlo\'</b>')).toBe('&lt;b class=&quot;x&quot;&gt;Bea &amp; &#39;Carlo&#39;&lt;/b&gt;')
  })
})
