import type { IntroContent, Scene, SceneKit } from './scene.kit'
import { EASE, esc, NOISE, OUT, PAPER, rng, sealSVG, sweepLight } from './scene.kit'

// Wedding scenes (site-motion.type.ts `sceneIntroKeys.wedding`), from the intros reference. The names are the hero's
// heading, seals and monograms its initials; paper, wax light, gold foil and brass keep their own colours.

// A font size that keeps `text` to about `chars` characters' width at `px`, so long names still fit
const fit = (px: number, text: string, chars = 14) =>
  Math.round(Math.max(px * 0.45, Math.min(px, px * chars / Math.max(1, text.length))))

// The two names of a couple's heading ("Bea & Carlo"), when it names two
function namesOf(title: string): [string, string] | undefined {
  const parts = title.split(/\s+(?:&|and)\s+/i).map(part => part.trim()).filter(Boolean)
  return parts.length === 2 ? [parts[0]!, parts[1]!] : undefined
}

// The small label above the names: the hero's eyebrow, or the scene's own phrase
const eyebrowOf = (content: IntroContent, fallback: string) => esc(content.eyebrow || fallback)

// Soft petal tints of the secondary colour
const PETAL = 'color-mix(in oklab,var(--a2),#fff 35%)'
const PETAL_DEEP = 'color-mix(in oklab,var(--a2),#fff 15%)'
const FOIL = 'background:linear-gradient(100deg,#8E6C30,#E9D29A 38%,#A9843F 58%,#F4E4B6 78%,#9C7A3A);-webkit-background-clip:text;background-clip:text;color:transparent'

// Envelope: a lined envelope sealed in wax; the flap lifts, the card slides out and grows into the page
const envelope: Scene = async ({ layer, content }, kit) => {
  const { A, el, reveal, uid } = kit
  const desk = el(`<div class="fill" style="background:${NOISE(0.7, 0.1)},radial-gradient(85% 60% at 50% 42%,color-mix(in oklab,var(--bgS),#fff 45%),color-mix(in oklab,var(--bgS),#7d6c58 26%))"></div>`)
  layer.append(desk)
  const P = PAPER('#FFFEFB', '#EEE7DB')
  const LINER = `background:repeating-linear-gradient(45deg,transparent 0 9px,color-mix(in oklab,var(--a),transparent 40%) 9px 10px),repeating-linear-gradient(-45deg,transparent 0 9px,color-mix(in oklab,var(--a),transparent 40%) 9px 10px),linear-gradient(180deg,color-mix(in oklab,var(--p),#000 25%),var(--p));`
  const id = uid('ev')
  const env = el(`<div class="center"><div class="env" style="position:relative;width:min(84%,400px);aspect-ratio:1.5;margin-top:min(18%,72px);filter:drop-shadow(0 18px 22px rgba(60,40,20,.25)) drop-shadow(0 2px 3px rgba(60,40,20,.2))">
      <div style="position:absolute;inset:0;border-radius:3px;${LINER}"></div>
      <div class="flapB" style="position:absolute;left:0;right:0;bottom:100%;height:60%;transform-origin:50% 100%;transform:perspective(900px) rotateX(-90deg);clip-path:polygon(0 100%,100% 100%,52% 4%,50% 0,48% 4%);${LINER}"></div>
      <div class="card" style="position:absolute;left:5%;right:5%;top:5%;height:90%;border-radius:2px;${PAPER('#FFFFFF', '#F3EEE5')}box-shadow:0 1px 2px rgba(0,0,0,.18),inset 0 0 0 6px #fff,inset 0 0 0 7px color-mix(in oklab,var(--a),transparent 30%);display:grid;place-items:center;text-align:center">
        <div style="max-width:90%"><div style="font:600 7.5px var(--f-body);letter-spacing:.3em;text-transform:uppercase;color:var(--p);opacity:.75">${eyebrowOf(content, 'Together with their families')}</div>
        <div style="font-family:var(--f-script);font-size:${fit(38, content.title, 12)}px;line-height:1.15;${FOIL}">${esc(content.title)}</div>
        ${content.dateNumeric ? `<div style="font-family:var(--f-display);font-size:12px;letter-spacing:.18em;color:var(--p)">${esc(content.dateNumeric)}</div>` : ''}</div></div>
      <div style="position:absolute;inset:0;clip-path:polygon(0 0,50% 56%,100% 0,100% 100%,0 100%);border-radius:3px;${P}">
        <svg viewBox="0 0 300 200" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">
          <defs><linearGradient id="${id}L" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity=".07"/></linearGradient>
          <linearGradient id="${id}R" x1="1" x2="0"><stop offset="0" stop-color="#000" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient>
          <linearGradient id="${id}B" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity=".7"/></linearGradient>
          <filter id="${id}S" x="-10%" y="-20%" width="120%" height="140%"><feDropShadow dx="0" dy="-1.2" stdDeviation="1.6" flood-opacity=".16"/></filter></defs>
          <path d="M0 0 L142 106 Q150 112 142 118 L0 200Z" fill="url(#${id}L)"/>
          <path d="M300 0 L158 106 Q150 112 158 118 L300 200Z" fill="url(#${id}R)"/>
          <path d="M0 200 L140 108 Q150 101 160 108 L300 200Z" fill="url(#${id}B)" filter="url(#${id}S)"/></svg></div>
      <div class="flapF" style="position:absolute;left:0;right:0;top:0;height:60%;transform-origin:50% 0;filter:drop-shadow(0 2px 2px rgba(0,0,0,.16))">
        <div style="position:absolute;inset:0;clip-path:polygon(0 0,100% 0,52% 95%,50% 100%,48% 95%);border-radius:3px 3px 0 0;${PAPER('#FFFFFF', '#F0EADF', 175)}"></div>
        <div class="seal" style="position:absolute;left:50%;top:100%;width:78px;height:78px;margin:-46px 0 0 -39px">${sealSVG(kit, { motif: 'text', text: esc(content.initials), seed: 3 })}</div></div>
    </div></div>`)
  layer.append(env)
  const box = env.firstElementChild as HTMLElement
  const card = env.querySelector('.card')!
  const flapFront = env.querySelector<HTMLElement>('.flapF')!
  const flapBack = env.querySelector('.flapB')!
  await A(box, [{ transform: 'translateY(60px) rotate(-4deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 700, easing: OUT })
  await sweepLight(kit, env, 290, 700)
  await A(flapFront, [{ transform: 'perspective(900px) rotateX(0)' }, { transform: 'perspective(900px) rotateX(90deg)' }], { duration: 340, easing: 'cubic-bezier(.5,0,.9,.5)' })
  flapFront.style.visibility = 'hidden'
  await A(flapBack, [{ transform: 'perspective(900px) rotateX(-90deg)' }, { transform: 'perspective(900px) rotateX(0)' }], { duration: 420, easing: 'cubic-bezier(.1,.5,.5,1)' })
  await A(card, [{ transform: 'none' }, { transform: 'translateY(-62%)' }], { duration: 650, easing: EASE })
  reveal()
  await Promise.all([
    A(card, [{ transform: 'translateY(-62%) scale(1)', opacity: 1 }, { transform: 'translateY(-40%) scale(3.4)', opacity: 0 }], { duration: 750, easing: EASE }),
    ...[...box.children].filter(child => child !== card).map(child => A(child, [{ opacity: 1 }, { opacity: 0 }], { duration: 350 })),
    A(desk, [{ opacity: 1 }, { opacity: 0 }], { duration: 700 }),
  ])
}

// Signature: the names write themselves, stroke by stroke; a line draws beneath, then the cover lifts
const signature: Scene = async ({ layer, content }, { A, el, reveal }) => {
  const cover = el(`<div class="fill" style="background:var(--p)"></div>`)
  layer.append(cover)
  const s = el(`<div class="center"><svg viewBox="0 0 320 140" style="width:min(84%,520px);overflow:visible">
     <text x="160" y="80" text-anchor="middle" style="font-family:var(--f-script);font-size:${fit(62, content.title, 11)}px" fill="none" stroke="var(--a)" stroke-width="1.2" stroke-dasharray="900" stroke-dashoffset="900" class="t">${esc(content.title)}</text>
     <line x1="70" y1="108" x2="250" y2="108" stroke="var(--a)" stroke-width="1" stroke-dasharray="180" stroke-dashoffset="180" class="l"/></svg></div>`)
  layer.append(s)
  const text = s.querySelector('.t')!
  const line = s.querySelector('.l')!
  await A(text, [{ strokeDashoffset: 900 }, { strokeDashoffset: 0 }], { duration: 1300, easing: 'cubic-bezier(.45,0,.2,1)' })
  A(text, [{ fill: 'transparent' }, { fill: 'var(--a)' }], { duration: 400 })
  await A(line, [{ strokeDashoffset: 180 }, { strokeDashoffset: 0 }], { duration: 450 })
  reveal()
  await Promise.all([
    A(cover, [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 750, easing: EASE }),
    A(s, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-40px)', opacity: 0 }], { duration: 500, easing: EASE }),
  ])
}

// Veil & petals: petals drift through a soft veil while the names come into focus; the veil rises
const veil: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const v = el(`<div class="fill" style="background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(247,242,234,.9));backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)"></div>`)
  layer.append(v)
  const names = el(`<div class="center"><div style="text-align:center;color:var(--p);max-width:88%"><div style="font:600 10px var(--f-body);letter-spacing:.3em;text-transform:uppercase;color:var(--a-text)">${eyebrowOf(content, 'The wedding of')}</div><div style="font-family:var(--f-display);font-style:italic;font-size:${fit(44, content.title, 12)}px">${esc(content.title)}</div></div></div>`)
  layer.append(names)
  const petals: HTMLElement[] = []
  for (let i = 0; i < 14; i++) {
    const petal = el(`<div style="position:absolute;top:-20px;left:${Math.random() * 100}%;width:${10 + Math.random() * 8}px;height:${7 + Math.random() * 5}px;border-radius:60% 0 60% 0;background:${i % 3 ? PETAL : 'var(--a)'};opacity:.85"></div>`)
    layer.append(petal)
    petals.push(petal)
    A(petal, [{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${(Math.random() - 0.5) * 120}px, 720px) rotate(${360 + Math.random() * 360}deg)` }], { duration: 2200 + Math.random() * 800, delay: Math.random() * 600, easing: 'linear' })
  }
  await A(names.firstElementChild!, [{ filter: 'blur(14px)', letterSpacing: '.5em', opacity: 0 }, { filter: 'blur(0)', letterSpacing: '0', opacity: 1 }], { duration: 1200 })
  await wait(250)
  reveal()
  await Promise.all([
    A(v, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-100%)', opacity: 0.4 }], { duration: 900, easing: EASE }),
    A(names, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-80px)' }], { duration: 700, easing: EASE }),
  ])
  petals.forEach(petal => A(petal, [{ opacity: 0.85 }, { opacity: 0 }], { duration: 400 }))
  await wait(300)
}

// Wax seal: a seal with the initials presses into the paper, catches the light, cracks, and the paper parts
const waxSeal: Scene = async ({ layer, content }, kit) => {
  const { A, el, reveal } = kit
  // Paper in the site's light background, a little lighter at the top and deeper at the bottom
  const P = PAPER('color-mix(in oklab,var(--bgS),#fff 50%)', 'color-mix(in oklab,var(--bgS),#000 7%)', 170)
  const crackL = 'polygon(0 0,50% 0,47% 18%,53% 33%,46% 51%,52% 66%,47% 82%,51% 100%,0 100%)'
  const crackR = 'polygon(50% 0,100% 0,100% 100%,51% 100%,47% 82%,52% 66%,46% 51%,53% 33%,47% 18%)'
  const left = el(`<div class="fill" style="${P}clip-path:${crackL};box-shadow:inset -1px 0 0 rgba(0,0,0,.06)"></div>`)
  const right = el(`<div class="fill" style="${P}clip-path:${crackR}"></div>`)
  layer.append(left, right)
  const seal = sealSVG(kit, { motif: 'text', text: esc(content.initials), seed: 5 })
  const sealLeft = el(`<div style="position:absolute;left:calc(50% - 60px);top:calc(50% - 60px);width:120px;height:120px;clip-path:${crackL.replace('polygon(0 0', 'polygon(-20% -20%').replace('0 100%)', '-20% 120%)')}">${seal}</div>`)
  const sealRight = el(`<div style="position:absolute;left:calc(50% - 60px);top:calc(50% - 60px);width:120px;height:120px;clip-path:${crackR}">${seal}</div>`)
  layer.append(sealLeft, sealRight)
  const drop = [{ transform: 'scale(1.5)', opacity: 0 }, { transform: 'scale(.94)', opacity: 1, offset: 0.7 }, { transform: 'scale(1)', opacity: 1 }]
  await Promise.all([A(sealLeft, drop, { duration: 600, easing: 'ease-out' }), A(sealRight, drop, { duration: 600, easing: 'ease-out' })])
  await sweepLight(kit, layer, 290, 650)
  await Promise.all([
    A(sealLeft, [{ transform: 'none' }, { transform: 'translateX(-5px) rotate(-7deg)' }], { duration: 220 }),
    A(sealRight, [{ transform: 'none' }, { transform: 'translateX(5px) rotate(7deg)' }], { duration: 220 }),
  ])
  reveal()
  await Promise.all([
    A(left, [{ transform: 'none' }, { transform: 'translateX(-100%)' }], { duration: 850, easing: EASE }),
    A(right, [{ transform: 'none' }, { transform: 'translateX(100%)' }], { duration: 850, easing: EASE }),
    A(sealLeft, [{ transform: 'translateX(-5px) rotate(-7deg)' }, { transform: 'translateX(-260px) rotate(-30deg)' }], { duration: 850, easing: EASE }),
    A(sealRight, [{ transform: 'translateX(5px) rotate(7deg)' }, { transform: 'translateX(260px) rotate(30deg)' }], { duration: 850, easing: EASE }),
  ])
}

// A plain silver solitaire in SVG: a polished band and a small brilliant held by four claws (a material, so its own
// colours)
function ringSVG(kit: SceneKit): string {
  const g = kit.uid('rg')
  // Side view of the stone: the crown between the table (y 44) and the girdle (y 54), the pavilion down to the culet
  type P = [number, number]
  const [t0, t1, t2]: [P, P, P] = [[92, 44], [100, 44], [108, 44]]
  const [g0, g1, g2, g3, g4]: [P, P, P, P, P] = [[82, 54], [91, 54], [100, 54], [109, 54], [118, 54]]
  const culet: P = [100, 71]
  const tri: [P, P, P, string][] = [
    [g0, t0, g1, '#E8EEF5'],
    [t0, g1, t1, '#FFFFFF'],
    [g1, t1, g2, '#A3B0C2'],
    [g2, t1, g3, '#F7FAFF'],
    [t1, g3, t2, '#D5DEE9'],
    [g3, t2, g4, '#7E8CA2'],
    [g0, g1, culet, '#5F6F86'],
    [g1, g2, culet, '#F2F6FB'],
    [g2, g3, culet, '#8C9AAE'],
    [g3, g4, culet, '#DCE4EE'],
  ]
  const facets = tri.map(([a, b, c, f]) => `<path d="M${a}L${b}L${c}Z" fill="${f}"/>`).join('')
  return `<svg viewBox="0 0 200 240" style="width:100%;overflow:visible">
    <defs>
      <linearGradient id="${g}a" x1="0" y1="0" x2="1" y2=".35"><stop offset="0" stop-color="#6E737B"/><stop offset=".16" stop-color="#C9CED5"/><stop offset=".3" stop-color="#F4F6F9"/><stop offset=".44" stop-color="#A9AFB8"/><stop offset=".6" stop-color="#6B7078"/><stop offset=".76" stop-color="#D3D8DE"/><stop offset=".88" stop-color="#F2F4F7"/><stop offset="1" stop-color="#7D838C"/></linearGradient>
      <linearGradient id="${g}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7F9FB"/><stop offset=".5" stop-color="#B9BFC7"/><stop offset="1" stop-color="#7A8088"/></linearGradient>
      <radialGradient id="${g}s"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    </defs>
    <path d="M40 150a60 76 0 1 0 120 0a60 76 0 1 0-120 0ZM51 152a50 66 0 1 0 100 0a50 66 0 1 0-100 0Z" fill="url(#${g}a)" fill-rule="evenodd"/>
    <path d="M45 134C49 104 68 84 90 79" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>
    <path d="M155 162C153 194 136 216 112 222" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>
    <path d="M64 202C74 214 86 220 100 221" fill="none" stroke="#2A2E35" stroke-width="1.2" opacity=".3"/>
    ${facets}
    <path d="M82 54L92 44H108L118 54L100 71Z M82 54H118 M92 44 91 54 100 44 100 54 108 44 109 54 M91 54 100 71 109 54" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width=".5" stroke-linejoin="round"/>
    <path d="M89 78Q86 66 83 52M111 78Q114 66 117 52" fill="none" stroke="url(#${g}p)" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M96 79Q95 66 94 49M104 79Q105 66 106 49" fill="none" stroke="url(#${g}p)" stroke-width="2" stroke-linecap="round"/>
    <path d="M88 75Q100 82 112 75L110 80Q100 86 90 80Z" fill="url(#${g}a)"/>
    <g class="spk" style="transform-box:fill-box;transform-origin:center;opacity:0"><circle cx="108" cy="46" r="11" fill="url(#${g}s)"/><path d="M108 28 109.7 44.3 126 46 109.7 47.7 108 64 106.3 47.7 90 46 106.3 44.3Z" fill="#fff"/></g>
  </svg>`
}

// Ring box: an ivory velvet ring box opens to a silver solitaire; the diamond glints, then the scene fades
const ringBox: Scene = async ({ layer }, kit) => {
  const { A, el, wait, reveal } = kit
  const room = el(`<div class="fill" style="background:${NOISE(0.6, 0.06)},radial-gradient(70% 50% at 50% 45%,color-mix(in oklab,var(--bgS),#fff 60%),var(--bgS) 70%,color-mix(in oklab,var(--bgS),#000 8%))"></div>`)
  layer.append(room)
  // Velvet in the primary: lighter where the light catches it, darker underneath
  const V = (top = 'color-mix(in oklab,var(--p),#fff 14%)', mid = 'var(--p)', bot = 'color-mix(in oklab,var(--p),#000 25%)') => `background:${NOISE(1.4, 0.16, 90)},linear-gradient(180deg,${top},${mid} 55%,${bot});`
  const EDGE = 'inset 0 2px 2px rgba(255,255,255,.35),inset 0 -12px 18px rgba(0,0,0,.22),inset 12px 0 14px rgba(255,255,255,.14),inset -12px 0 16px rgba(0,0,0,.2)'
  const box = el(`<div class="center"><div class="bx" style="position:relative;width:220px;height:270px;margin-top:40px">
     <div style="position:absolute;left:-6px;right:-6px;bottom:-14px;height:30px;border-radius:50%;background:rgba(0,0,0,.3);filter:blur(12px)"></div>
     <div class="olid" style="position:absolute;left:8px;right:8px;bottom:112px;height:150px;transform-origin:50% 100%;opacity:0;border-radius:46px 46px 10px 10px;${V('color-mix(in oklab,var(--p),#fff 16%)', 'var(--p)', 'color-mix(in oklab,var(--p),#000 20%)')}box-shadow:${EDGE}">
       <div style="position:absolute;left:17px;right:17px;top:17px;bottom:4px;border-radius:32px 32px 4px 4px;${V('color-mix(in oklab,var(--p),#000 32%)', 'color-mix(in oklab,var(--p),#000 18%)', 'color-mix(in oklab,var(--p),#000 8%)')}box-shadow:inset 0 10px 18px rgba(0,0,0,.3),inset 0 2px 3px rgba(0,0,0,.25),inset 8px 0 12px rgba(0,0,0,.1),inset -8px 0 12px rgba(0,0,0,.1)"></div></div>
     <div style="position:absolute;left:12px;right:12px;bottom:106px;height:30px;border-radius:14px 14px 4px 4px;${V('color-mix(in oklab,var(--p),#000 10%)', 'color-mix(in oklab,var(--p),#000 22%)', 'color-mix(in oklab,var(--p),#000 35%)')}box-shadow:inset 0 2px 2px rgba(255,255,255,.2),inset 0 -6px 8px rgba(0,0,0,.3)"></div>
     <div style="position:absolute;left:14px;right:14px;bottom:103px;height:6px;background:linear-gradient(180deg,rgba(0,0,0,.45),rgba(0,0,0,.1));border-radius:3px;filter:blur(.6px)"></div>
     <div style="position:absolute;left:50%;bottom:64px;width:96px;margin-left:-48px;filter:drop-shadow(2px 5px 4px rgba(0,0,0,.3))">${ringSVG(kit)}</div>
     <div style="position:absolute;left:12px;right:12px;bottom:84px;height:26px;border-radius:14px 14px 4px 4px;${V('color-mix(in oklab,var(--p),#fff 10%)', 'var(--p)', 'color-mix(in oklab,var(--p),#000 18%)')}box-shadow:inset 0 2px 2px rgba(255,255,255,.3),inset 0 -5px 7px rgba(0,0,0,.2),0 -2px 4px rgba(0,0,0,.18)"></div>
     <div style="position:absolute;left:0;right:0;bottom:0;height:92px;border-radius:14px 14px 34px 34px;${V()}box-shadow:${EDGE},0 -1px 0 rgba(255,255,255,.3)"></div>
     <div class="clid" style="position:absolute;left:0;right:0;bottom:89px;height:98px;transform-origin:50% 0;border-radius:44px 44px 8px 8px;${V('color-mix(in oklab,var(--p),#fff 20%)', 'var(--p)', 'color-mix(in oklab,var(--p),#000 22%)')}box-shadow:${EDGE},0 3px 4px rgba(0,0,0,.25)">
       <div style="position:absolute;left:0;right:0;bottom:0;height:2px;background:rgba(0,0,0,.3)"></div></div>
  </div></div>`)
  layer.append(box)
  const bx = box.firstElementChild!
  const sparkle = box.querySelector('.spk')!
  const closedLid = box.querySelector<HTMLElement>('.clid')!
  const openLid = box.querySelector('.olid')!
  A(bx, [{ transform: 'scale(.82)' }, { transform: 'scale(.88)' }], { duration: 4200, easing: 'linear' })
  await A(box, [{ opacity: 0 }, { opacity: 1 }], { duration: 800, easing: 'ease-out' })
  await wait(400)
  A(closedLid, [{ transform: 'none' }, { transform: 'translateY(-4px)', offset: 0.2 }, { transform: 'translateY(-30px) scaleY(.08)', opacity: 0.6 }], { duration: 520, easing: 'cubic-bezier(.55,0,.75,.45)' })
    .then(() => { closedLid.style.visibility = 'hidden' })
  await A(openLid, [{ transform: 'scaleY(.25)', opacity: 0 }, { transform: 'scaleY(.6)', opacity: 1, offset: 0.25 }, { transform: 'scaleY(1.02)', offset: 0.85 }, { transform: 'none', opacity: 1 }], { duration: 760, delay: 260, easing: 'cubic-bezier(.2,.6,.3,1)' })
  await wait(250)
  await A(sparkle, [{ opacity: 0, transform: 'scale(.3)' }, { opacity: 0.85, transform: 'scale(.8) rotate(20deg)', offset: 0.5 }, { opacity: 0, transform: 'scale(.4) rotate(40deg)' }], { duration: 900, easing: 'ease-in-out' })
  await wait(200)
  reveal()
  await Promise.all([room, box].map(node => A(node, [{ opacity: 1 }, { opacity: 0 }], { duration: 900, easing: 'ease-in-out' })))
}

// Golden frame: a double frame draws itself, the names and date fade in, then the frame expands past the edges
const goldenFrame: Scene = async ({ layer, content }, { A, el, reveal }) => {
  const cover = el(`<div class="fill" style="background:var(--bgS)"></div>`)
  layer.append(cover)
  const couple = namesOf(content.title)
  const names = couple ? couple.map(name => esc(name)).join('<br>&amp;<br>') : esc(content.title)
  const size = couple ? fit(40, couple[0].length > couple[1].length ? couple[0] : couple[1], 8) : fit(40, content.title, 10)
  const f = el(`<div class="center"><div style="position:relative;width:min(70%,300px);aspect-ratio:3/4">
     <svg viewBox="0 0 300 400" class="fill" style="overflow:visible"><rect x="4" y="4" width="292" height="392" fill="none" stroke="var(--a)" stroke-width="1.5" stroke-dasharray="1370" stroke-dashoffset="1370" class="r1"/>
     <rect x="16" y="16" width="268" height="368" fill="none" stroke="var(--a)" stroke-width=".8" stroke-dasharray="1270" stroke-dashoffset="1270" class="r2"/></svg>
     <div class="txt center" style="opacity:0"><div style="text-align:center;color:var(--p);max-width:84%">${content.dateNumeric ? `<div style="font:600 9px var(--f-body);letter-spacing:.3em;text-transform:uppercase;color:var(--a-text)">${esc(content.dateNumeric)}</div>` : ''}<div style="font-family:var(--f-display);font-size:${size}px;font-style:italic;line-height:1.05">${names}</div></div></div></div></div>`)
  layer.append(f)
  A(f.querySelector('.r1')!, [{ strokeDashoffset: 1370 }, { strokeDashoffset: 0 }], { duration: 1100, easing: 'cubic-bezier(.45,0,.2,1)' })
  await A(f.querySelector('.r2')!, [{ strokeDashoffset: 1270 }, { strokeDashoffset: 0 }], { duration: 1100, delay: 150, easing: 'cubic-bezier(.45,0,.2,1)' })
  await A(f.querySelector('.txt')!, [{ opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 500 })
  reveal()
  await Promise.all([
    A(f.firstElementChild!, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(2.6)', opacity: 0 }], { duration: 850, easing: EASE }),
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: 150 }),
  ])
}

// Bloom: a flower blooms open in the centre, then the petals rush toward you and clear the screen
const bloom: Scene = async ({ layer }, { A, el, wait, reveal }) => {
  const cover = el(`<div class="fill" style="background:var(--bgS)"></div>`)
  layer.append(cover)
  const petals = Array.from({ length: 8 }, (_, i) => `<ellipse cx="100" cy="60" rx="22" ry="44" transform="rotate(${i * 45} 100 100)" style="fill:${i % 2 ? PETAL : PETAL_DEEP}"/>`).join('')
  const flower = el(`<div class="center"><svg viewBox="0 0 200 200" width="220" style="overflow:visible">${petals}<circle cx="100" cy="100" r="16" fill="var(--a)"/></svg></div>`)
  layer.append(flower)
  const svg = flower.firstElementChild!
  await A(svg, [{ transform: 'scale(0) rotate(-90deg)' }, { transform: 'scale(1) rotate(0)' }], { duration: 1000, easing: 'cubic-bezier(.34,1.3,.64,1)' })
  await wait(250)
  reveal()
  await Promise.all([
    A(svg, [{ transform: 'scale(1) rotate(0)', opacity: 1 }, { transform: 'scale(9) rotate(40deg)', opacity: 0 }], { duration: 900, easing: 'cubic-bezier(.7,0,.84,0)' }),
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 600, delay: 300 }),
  ])
}

// Meet in the middle: the two initials glide in from opposite sides, an ampersand appears between them, all lifts away
const meet: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const cover = el(`<div class="fill" style="background:var(--p)"></div>`)
  layer.append(cover)
  const [first = '', second = ''] = content.initials.split('&').map(part => part.trim())
  const size = fit(92, `${first}${second}`, 3)
  const g = el(`<div class="center"><div style="display:flex;align-items:center;gap:6px;color:var(--on);font-family:var(--f-display);font-size:${size}px;line-height:1">
     <span class="b">${esc(first)}</span>${second ? `<span class="amp" style="font-family:var(--f-script);font-size:${Math.round(size * 0.65)}px;color:var(--a);opacity:0">&amp;</span><span class="c">${esc(second)}</span>` : ''}</div></div>`)
  layer.append(g)
  const right = g.querySelector('.c')
  await Promise.all([
    A(g.querySelector('.b')!, [{ transform: second ? 'translateX(-180px)' : 'scale(.8)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 800, easing: EASE }),
    right ? A(right, [{ transform: 'translateX(180px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 800, easing: EASE }) : undefined,
  ])
  const amp = g.querySelector('.amp')
  if (amp)
    await A(amp, [{ opacity: 0, transform: 'scale(.5) rotate(-20deg)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.34,1.56,.64,1)' })
  await wait(300)
  reveal()
  await Promise.all([
    A(cover, [{ transform: 'none' }, { transform: 'translateY(-100%)' }], { duration: 850, easing: EASE }),
    A(g, [{ transform: 'none' }, { transform: 'translateY(-100%)' }], { duration: 850, easing: EASE }),
  ])
}

// Film light leak: a warm light leak sweeps across the date, like the first frame of a wedding film
const lightLeak: Scene = async ({ layer, content }, { A, el, reveal }) => {
  // A dark film frame in a deep shade of the primary; the leak glows in the accent, fading into the secondary
  const cover = el(`<div class="fill" style="background:color-mix(in oklab,var(--p),#000 55%)"></div>`)
  layer.append(cover)
  const line = content.dateNumeric
    ? `<div style="font-family:var(--f-display);font-size:46px;line-height:1.05">${esc(content.dateNumeric)}</div>`
    : `<div style="font-family:var(--f-display);font-size:${fit(46, content.title, 12)}px;line-height:1.05">${esc(content.title)}</div>`
  const t = el(`<div class="center"><div style="text-align:center;color:color-mix(in oklab,var(--a),#fff 82%);max-width:88%"><div style="font:600 10px var(--f-body);letter-spacing:.32em;text-transform:uppercase;opacity:.7">Save the date</div>${line}</div></div>`)
  layer.append(t)
  const leak = el(`<div class="fill" style="background:radial-gradient(40% 60% at 50% 50%,color-mix(in oklab,color-mix(in oklab,var(--a),#fff 25%) 90%,transparent),color-mix(in oklab,var(--a2) 55%,transparent) 45%,transparent 70%);mix-blend-mode:screen;filter:blur(10px)"></div>`)
  layer.append(leak)
  A(t.firstElementChild!, [{ opacity: 0, letterSpacing: '.2em' }, { opacity: 1, letterSpacing: '0' }], { duration: 900 })
  await A(leak, [{ transform: 'translateX(-90%) scale(1.2)', opacity: 0 }, { transform: 'translateX(0) scale(1.4)', opacity: 1, offset: 0.6 }, { transform: 'translateX(80%) scale(1.6)', opacity: 0.6 }], { duration: 1400, easing: 'ease-in-out' })
  reveal()
  await Promise.all([
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 700 }),
    A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 }),
    A(leak, [{ opacity: 0.6 }, { opacity: 0 }], { duration: 600 }),
  ])
}

// Open the book: a closed gatefold invitation. The cover's design (a double frame around the eyebrow, the names and the
// date) spans both covers, each showing its half, so it reads as one centred piece; then the covers swing open from the
// spine towards the guest (outwards, out of the page) and part it down the middle, all the way round until they lie
// flat beyond the screen's edges, out of view
const pages: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const couple = namesOf(content.title)
  // Sized by the longest line: a name of a couple on its own line, else the whole title
  const size = fit(44, (couple ?? [content.title]).reduce((longest, name) => (name.length > longest.length ? name : longest), ''), 9)
  const names = couple
    ? `${esc(couple[0])}<span style="display:block;font-size:.6em;line-height:1.3;color:var(--a)">&amp;</span>${esc(couple[1])}`
    : esc(content.title)
  const design = `<div class="fill" style="display:grid;place-items:center">
     <div style="position:absolute;inset:22px;border:1px solid color-mix(in oklab,var(--a) 70%,transparent)"></div>
     <div style="position:absolute;inset:28px;border:1px solid color-mix(in oklab,var(--a) 35%,transparent)"></div>
     <div style="text-align:center;color:var(--on);max-width:76%">
       <div style="font:600 9px var(--f-body);letter-spacing:.32em;text-transform:uppercase;opacity:.75">${eyebrowOf(content, 'Together with their families')}</div>
       <div style="font-family:var(--f-display);font-style:italic;font-size:${size}px;line-height:1.05;margin:14px 0;overflow-wrap:anywhere;text-wrap:balance">${names}</div>
       ${content.dateNumeric ? `<div style="font-family:var(--f-display);font-size:13px;letter-spacing:.2em;opacity:.85">${esc(content.dateNumeric)}</div>` : ''}
     </div></div>`
  // Each cover is half the page wide and shows its half of the full-width design; its back (seen once it swings past
  // upright) is plain cover, like a real booklet's
  const cover = (side: 'left' | 'right') => `<div class="pg" style="position:absolute;top:0;bottom:0;${side}:0;width:50%;overflow:hidden;background:var(--p);transform-origin:${side} center">
     <div style="position:absolute;top:0;bottom:0;${side}:0;width:200%;backface-visibility:hidden">${design}</div></div>`
  // No shadow or line down the spine: the closed covers read as one clean piece. The perspective is deeper than the
  // screen is wide, so a cover swinging towards the guest never reaches the eye (it would break apart there)
  const book = el(`<div class="fill" style="perspective:calc(100vw + 600px)">${cover('left')}${cover('right')}</div>`)
  layer.append(book)
  const [left, right] = book.querySelectorAll('.pg')
  await A(book, [{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 500 })
  await wait(700)
  reveal()
  await Promise.all([
    // Towards the guest and all the way open, flat beyond the screen's edges
    A(left!, [{ transform: 'rotateY(0)' }, { transform: 'rotateY(-180deg)' }], { duration: 1300, easing: EASE }),
    A(right!, [{ transform: 'rotateY(0)' }, { transform: 'rotateY(180deg)' }], { duration: 1300, easing: EASE }),
  ])
}

// Satin ribbon: paper in the site's light background, wrapped in a satin ribbon in the accent that ties into a bow
// under the names; light glides along the satin, the bow comes undone, and the ribbon slips away as the paper lifts
const ribbon: Scene = async ({ layer, content }, { A, el, wait, reveal, uid }) => {
  const tone = (towards: string, share: number) => `color-mix(in oklab,var(--a),${towards} ${share}%)`
  const cover = el(`<div class="fill" style="${PAPER('color-mix(in oklab,var(--bgS),#fff 50%)', 'color-mix(in oklab,var(--bgS),#000 7%)', 170)}"></div>`)
  layer.append(cover)

  // The names, centred in the paper above the ribbon
  const t = el(`<div style="position:absolute;left:0;right:0;top:0;height:calc(58% - 70px);display:grid;place-items:center;padding:0 24px">
     <div style="text-align:center;max-width:min(88%,520px)">
       <div style="font:600 9px var(--f-body);letter-spacing:.32em;text-transform:uppercase;color:var(--a-text)">${eyebrowOf(content, 'Together with their families')}</div>
       <div style="font-family:var(--f-display);font-size:${fit(42, content.title, 12)}px;line-height:1.1;margin:10px 0 8px;color:var(--p);text-wrap:balance">${esc(content.title)}</div>
       ${content.dateNumeric ? `<div style="font-family:var(--f-display);font-size:12px;letter-spacing:.24em;color:var(--txt);opacity:.7">${esc(content.dateNumeric)}</div>` : ''}
     </div></div>`)
  layer.append(t)

  // The band: a bright sheen line across the satin, darker edges, a faint weave and a soft shadow on the paper
  const SATIN = `background:repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 1px,transparent 1px 3px),linear-gradient(180deg,${tone('#000', 38)} 0%,${tone('#000', 12)} 9%,${tone('#fff', 18)} 24%,${tone('#fff', 55)} 33%,var(--a) 46%,${tone('#000', 10)} 62%,${tone('#fff', 22)} 80%,${tone('#000', 30)} 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.45),inset 0 -1px 0 rgba(0,0,0,.25),0 9px 14px -6px rgba(0,0,0,.35)`
  const band = (side: 'left' | 'right') => el(`<div style="position:absolute;top:calc(58% - 17px);height:34px;${side}:0;width:51%;transform-origin:${side} center;transform:scaleX(0);${SATIN}"></div>`)
  const bandLeft = band('left')
  const bandRight = band('right')
  layer.append(bandLeft, bandRight)

  // The bow: two loops (with the darker back of the ribbon inside them), a wrapped knot and V-cut tails
  const id = uid('rb')
  const stop = (offset: number, colour: string) => `<stop offset="${offset}" style="stop-color:${colour}"/>`
  const loop = `<path d="M120 72C100 44 66 22 40 30C18 37 16 64 36 80C58 96 96 86 120 76Z" fill="url(#${id}l)"/>
     <path d="M116 72C98 56 70 44 52 48C40 51 40 64 52 70C68 78 96 76 116 74Z" fill="url(#${id}b)"/>
     <path d="M120 74C96 66 70 58 50 59" fill="none" stroke="${tone('#000', 40)}" stroke-opacity=".35" stroke-width="1.2"/>
     <path d="M112 60C92 41 64 30 44 36" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2.4" stroke-linecap="round"/>`
  const bow = el(`<div style="position:absolute;left:calc(50% - 120px);top:calc(58% - 72px);width:240px;height:170px;opacity:0">
     <svg viewBox="0 0 240 170" style="width:100%;height:100%;overflow:visible;filter:drop-shadow(0 2px 2px rgba(0,0,0,.2)) drop-shadow(0 10px 12px rgba(0,0,0,.18))">
       <defs>
         <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1">${stop(0, tone('#fff', 42))}${stop(0.35, 'var(--a)')}${stop(0.58, tone('#000', 14))}${stop(0.8, tone('#fff', 20))}${stop(1, tone('#000', 32))}</linearGradient>
         <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1">${stop(0, tone('#000', 38))}${stop(1, tone('#000', 16))}</linearGradient>
         <linearGradient id="${id}t" x1="0" y1="0" x2="1" y2="0">${stop(0, tone('#000', 28))}${stop(0.45, tone('#fff', 32))}${stop(0.7, 'var(--a)')}${stop(1, tone('#000', 32))}</linearGradient>
         <linearGradient id="${id}k" x1="0" y1="0" x2="1" y2="0">${stop(0, tone('#000', 32))}${stop(0.3, 'var(--a)')}${stop(0.5, tone('#fff', 38))}${stop(0.75, 'var(--a)')}${stop(1, tone('#000', 36))}</linearGradient>
       </defs>
       <path d="M112 80C104 104 92 128 78 156L92 148L100 164C108 134 116 108 122 84Z" fill="url(#${id}t)"/>
       <path d="M128 80C138 102 152 124 170 150L156 147L152 163C142 136 132 110 120 86Z" fill="url(#${id}t)"/>
       <g>${loop}</g>
       <g transform="matrix(-1 0 0 .96 240 2.9)">${loop}</g>
       <rect x="106" y="58" width="28" height="30" rx="9" fill="url(#${id}k)"/>
       <path d="M113 61C117 69 117 78 113 86M127 61C123 69 123 78 127 86" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1"/>
     </svg></div>`)
  layer.append(bow)

  // Light gliding along the satin
  const sheen = el(`<div style="position:absolute;left:0;right:0;top:calc(58% - 17px);height:34px;overflow:hidden;mix-blend-mode:soft-light;pointer-events:none"><div style="position:absolute;top:0;bottom:0;width:28%;transform:translateX(-110%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent)"></div></div>`)
  layer.append(sheen)

  A(t, [{ opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 900 })
  await Promise.all([bandLeft, bandRight].map(side => A(side, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 700, delay: 150, easing: EASE })))
  await A(bow, [{ opacity: 0, transform: 'scale(.4) rotate(-10deg)' }, { opacity: 1, transform: 'scale(1.05) rotate(2deg)', offset: 0.7 }, { opacity: 1, transform: 'none' }], { duration: 600, easing: OUT })
  await A(sheen.firstElementChild!, [{ transform: 'translateX(-110%)' }, { transform: 'translateX(400%)' }], { duration: 900, easing: 'ease-in-out' })
  await wait(200)
  await A(bow, [{ opacity: 1, transform: 'none' }, { opacity: 1, transform: 'scale(1.06)', offset: 0.2 }, { opacity: 0, transform: 'translateY(26px) scale(.55) rotate(6deg)' }], { duration: 550, easing: 'ease-in' })
  reveal()
  await Promise.all([
    A(bandLeft, [{ transform: 'none' }, { transform: 'translate(-105%,6px) rotate(-3deg)' }], { duration: 750, easing: EASE }),
    A(bandRight, [{ transform: 'none' }, { transform: 'translate(105%,6px) rotate(3deg)' }], { duration: 750, easing: EASE }),
    A(sheen, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 }),
    A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }),
    A(cover, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-3%)' }], { duration: 800, delay: 150, easing: EASE }),
  ])
}

// Instant photo: an instant photo drops in and develops from dark to full colour, then grows into the page
const polaroid: Scene = async ({ layer, content }, { A, el, reveal }) => {
  // The table it lands on: the site's light background, a shade deeper so the white print stands out
  const cover = el(`<div class="fill" style="background:${NOISE(0.7, 0.1)},linear-gradient(170deg,color-mix(in oklab,var(--bgS),#000 5%),color-mix(in oklab,var(--bgS),#000 16%))"></div>`)
  layer.append(cover)
  const p = el(`<div class="center"><div class="pc" style="width:min(66%,300px);padding:10px 10px 44px;${PAPER('#FFFFFF', '#F1EEE8')}box-shadow:0 14px 26px rgba(0,0,0,.2),0 2px 3px rgba(0,0,0,.15);transform:rotate(-3deg)">
     <div class="im" style="aspect-ratio:1;background:radial-gradient(50% 40% at 60% 55%,rgba(255,230,190,.9),transparent 70%),linear-gradient(170deg,#E8DED0,#C7B49A 60%,#8F7A63)"></div>
     <div style="font-family:var(--f-script);font-size:${fit(26, content.title, 14)}px;color:var(--p);text-align:center;margin-top:8px;line-height:1.1">${esc(content.title)}</div></div></div>`)
  layer.append(p)
  const card = p.firstElementChild!
  const image = p.querySelector('.im')!
  await A(card, [{ transform: 'translateY(-120%) rotate(-12deg)' }, { transform: 'rotate(-3deg)' }], { duration: 650, easing: OUT })
  await A(image, [{ filter: 'brightness(.25) saturate(0) contrast(.6) sepia(.6) hue-rotate(60deg)' }, { filter: 'brightness(1.3) saturate(.4)', offset: 0.6 }, { filter: 'none' }], { duration: 1300, easing: 'ease-out' })
  reveal()
  await Promise.all([
    A(card, [{ transform: 'rotate(-3deg)' }, { transform: 'translateY(-30%) rotate(0) scale(3.2)', opacity: 0 }], { duration: 800, easing: EASE }),
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: 100 }),
  ])
}

// The toast: two champagne flutes meet with a sparkle as "Cheers to" the names appears
const toast: Scene = async ({ layer, content, scale }, { A, el, wait, reveal, uid }) => {
  const cover = el(`<div class="fill" style="background:radial-gradient(70% 50% at 50% 50%,color-mix(in oklab,var(--p),var(--a) 18%),var(--p))"></div>`)
  layer.append(cover)
  const flute = (flip: 1 | -1) => {
    const id = uid('fl')
    return `<svg viewBox="0 0 60 200" style="width:60px;overflow:visible;transform:scaleX(${flip})"><defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".3" stop-color="#fff" stop-opacity=".12"/><stop offset=".8" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity=".6"/></linearGradient></defs>
     <path d="M14 4H46L42 96Q30 110 18 96Z" fill="url(#${id})" stroke="#fff" stroke-opacity=".6" stroke-width="1"/>
     <path d="M16 36H44L42 96Q30 108 18 96Z" style="fill:color-mix(in oklab,var(--a),#fff 30%)" opacity=".85"/>
     <path d="M30 104V180M12 186Q30 178 48 186" stroke="#fff" stroke-opacity=".7" stroke-width="2.4" fill="none" stroke-linecap="round"/>
     ${[0, 1, 2, 3, 4].map(i => `<circle class="bb" cx="${24 + i * 3}" cy="${88 - i * 4}" r="1.3" fill="#fff" opacity=".8"/>`).join('')}</svg>`
  }
  const cheers = `Cheers to ${content.title}`
  const g = el(`<div class="center"><div style="position:relative;width:220px;height:220px"><div class="l" style="position:absolute;left:30px;top:10px">${flute(1)}</div><div class="r" style="position:absolute;right:30px;top:10px">${flute(-1)}</div>
     <div class="sp" style="position:absolute;left:50%;top:6px;width:60px;height:60px;margin-left:-30px;opacity:0"><svg viewBox="-30 -30 60 60">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<line x1="0" y1="-10" x2="0" y2="-26" stroke="var(--a)" stroke-width="2" stroke-linecap="round" transform="rotate(${a})"/>`).join('')}</svg></div></div>
     <div style="position:absolute;left:0;right:0;bottom:22%;text-align:center;color:var(--on);font-family:var(--f-display);font-style:italic;font-size:${fit(30, cheers, 22)}px;padding:0 20px;opacity:0" class="tt">${esc(cheers)}</div></div>`)
  layer.append(g)
  const left = g.querySelector('.l')!
  const right = g.querySelector('.r')!
  // Bubbles rise in the glasses twice
  g.querySelectorAll('.bb').forEach((bubble, i) => bubble.animate?.([{ transform: 'translateY(0)', opacity: 0.8 }, { transform: 'translateY(-50px)', opacity: 0 }], { duration: 1200 * scale, delay: i * 180 * scale, iterations: 2 }))
  await Promise.all([
    A(left, [{ transform: 'translateX(-90px) rotate(-20deg)' }, { transform: 'rotate(14deg)' }], { duration: 650, easing: 'cubic-bezier(.3,0,.3,1)' }),
    A(right, [{ transform: 'translateX(90px) rotate(20deg)' }, { transform: 'rotate(-14deg)' }], { duration: 650, easing: 'cubic-bezier(.3,0,.3,1)' }),
  ])
  A(g.querySelector('.sp')!, [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1.1)' }, { opacity: 0, transform: 'scale(1.4)' }], { duration: 500 })
  await Promise.all([
    A(left, [{ transform: 'rotate(14deg)' }, { transform: 'rotate(8deg)' }], { duration: 200 }),
    A(right, [{ transform: 'rotate(-14deg)' }, { transform: 'rotate(-8deg)' }], { duration: 200 }),
  ])
  await A(g.querySelector('.tt')!, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 500 })
  await wait(350)
  reveal()
  await Promise.all([
    A(cover, [{ transform: 'none' }, { transform: 'translateY(-100%)' }], { duration: 850, easing: EASE }),
    A(g, [{ transform: 'none' }, { transform: 'translateY(-100%)' }], { duration: 850, easing: EASE }),
  ])
}

// Chapel doors: tall panelled doors with brass handles swing open into warm light
const doors: Scene = async ({ layer }, { A, el, wait, reveal }) => {
  const door = (side: 'left' | 'right') => el(`<div style="position:absolute;top:0;bottom:0;${side}:0;width:50%;transform-origin:${side} center;background:${NOISE(0.9, 0.12)},linear-gradient(${side === 'left' ? 90 : 270}deg,color-mix(in oklab,var(--p),#000 20%),var(--p) 60%,color-mix(in oklab,var(--p),#fff 8%));box-shadow:inset ${side === 'left' ? '-2px' : '2px'} 0 0 rgba(0,0,0,.4)">
     <div style="position:absolute;inset:7% 12% 52% 12%;border:1.5px solid color-mix(in oklab,var(--a),transparent 30%);border-radius:${side === 'left' ? '60px 6px 6px 6px' : '6px 60px 6px 6px'};box-shadow:inset 0 0 0 6px color-mix(in oklab,var(--p),#000 15%),inset 0 0 0 7px color-mix(in oklab,var(--a),transparent 60%)"></div>
     <div style="position:absolute;inset:52% 12% 7% 12%;border:1.5px solid color-mix(in oklab,var(--a),transparent 30%);border-radius:6px;box-shadow:inset 0 0 0 6px color-mix(in oklab,var(--p),#000 15%),inset 0 0 0 7px color-mix(in oklab,var(--a),transparent 60%)"></div>
     <div style="position:absolute;top:48%;${side === 'left' ? 'right' : 'left'}:10px;width:8px;height:34px;border-radius:4px;background:linear-gradient(90deg,#7A5A1E,#F4E2A6,#9C7A3A)"></div></div>`)
  const glow = el(`<div class="fill" style="background:radial-gradient(40% 60% at 50% 50%,#FFF6E4,color-mix(in oklab,var(--bgS),#fff 30%) 60%);opacity:0"></div>`)
  const left = door('left')
  const right = door('right')
  const wrap = el(`<div class="fill" style="perspective:900px"></div>`)
  wrap.append(left, right)
  layer.append(glow, wrap)
  await A(wrap, [{ transform: 'scale(1.06)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 600 })
  await wait(300)
  A(glow, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 })
  reveal()
  await Promise.all([
    A(left, [{ transform: 'rotateY(0)' }, { transform: 'rotateY(-6deg)', offset: 0.15 }, { transform: 'rotateY(-100deg)' }], { duration: 1300, easing: 'cubic-bezier(.5,0,.25,1)' }),
    A(right, [{ transform: 'rotateY(0)' }, { transform: 'rotateY(6deg)', offset: 0.15 }, { transform: 'rotateY(100deg)' }], { duration: 1300, easing: 'cubic-bezier(.5,0,.25,1)' }),
    A(wrap, [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }], { duration: 1300, easing: 'ease-in' }),
    A(glow, [{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: 800 }),
  ])
}

// A sprig of dried baby's breath as SVG (230 × 230): a fan of fine stems rising from where they're gathered at the bottom
// centre (115 × 215), in an olive brown tinted by the accent, the tiny flowers in tints of the secondary
function driedSprig(seed: number): string {
  const R = rng(seed)
  const base = { x: 115, y: 215 }
  const stems: string[] = []
  const flowers: [number, number, number][] = []
  const cluster = (x: number, y: number, count: number) => {
    for (let i = 0; i < count; i++)
      flowers.push([x + (R() - 0.5) * 14, y + (R() - 0.5) * 12, Math.floor(R() * 3)])
  }
  for (let i = 0; i < 9; i++) {
    const angle = (226 + i * 11 + (R() - 0.5) * 6) * Math.PI / 180
    // Longer in the middle, shorter at the sides
    const length = 175 - Math.abs(i - 4) * 12 + (R() - 0.5) * 24
    const tip = { x: base.x + Math.cos(angle) * length, y: base.y + Math.sin(angle) * length }
    const bend = (R() - 0.5) * 30
    const control = { x: (base.x + tip.x) / 2 - Math.sin(angle) * bend, y: (base.y + tip.y) / 2 + Math.cos(angle) * bend }
    stems.push(`M${base.x} ${base.y}Q${control.x.toFixed(1)} ${control.y.toFixed(1)} ${tip.x.toFixed(1)} ${tip.y.toFixed(1)}`)
    cluster(tip.x, tip.y, 4 + Math.floor(R() * 3))
    // Side branches, each ending in a few flowers
    for (const t of [0.5, 0.68, 0.84]) {
      if (R() < 0.3)
        continue
      const at = { x: (1 - t) ** 2 * base.x + 2 * (1 - t) * t * control.x + t ** 2 * tip.x, y: (1 - t) ** 2 * base.y + 2 * (1 - t) * t * control.y + t ** 2 * tip.y }
      const side = angle + (R() < 0.5 ? -1 : 1) * (0.4 + R() * 0.35)
      const reach = 16 + R() * 20
      const end = { x: at.x + Math.cos(side) * reach, y: at.y + Math.sin(side) * reach }
      stems.push(`M${at.x.toFixed(1)} ${at.y.toFixed(1)}L${end.x.toFixed(1)} ${end.y.toFixed(1)}`)
      cluster(end.x, end.y, 2 + Math.floor(R() * 3))
    }
  }
  // The cut ends below the tie
  for (let i = 0; i < 4; i++)
    stems.push(`M${base.x} ${base.y}l${(-6 + i * 4).toFixed(1)} ${(12 + R() * 6).toFixed(1)}`)
  const tints = ['color-mix(in oklab,var(--a2),#fff 62%)', 'color-mix(in oklab,var(--a2),#fff 30%)', 'color-mix(in oklab,var(--a2),#B9A58A 45%)']
  const flower = ([x, y]: [number, number, number]) => [0, 72, 144, 216, 288].map((a) => {
    const r = a * Math.PI / 180
    return `<circle cx="${(x + Math.cos(r) * 1.8).toFixed(1)}" cy="${(y + Math.sin(r) * 1.8).toFixed(1)}" r="1.5"/>`
  }).join('')
  return `<svg viewBox="0 0 230 230" style="width:100%;height:100%;overflow:visible;filter:drop-shadow(0 1px 1px rgba(0,0,0,.18))">
     <path d="${stems.join('')}" fill="none" stroke-linecap="round" style="stroke:color-mix(in oklab,var(--a),#6B5638 60%)" stroke-width="1.1"/>
     ${tints.map((tint, index) => `<g style="fill:${tint}">${flowers.filter(f => f[2] === index).map(flower).join('')}</g>`).join('')}
     <g style="fill:color-mix(in oklab,var(--a),#3A2A1A 50%)">${flowers.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r=".8"/>`).join('')}</g></svg>`
}

// Vellum overlay: the names are printed on a sheet of frosted vellum laid over the page, which shows through it softly;
// the sheet's bottom edge lifts a little, then it peels up and over towards you, hinged at the top, uncovering the page
// sharp underneath
const vellum: Scene = async ({ layer, content }, kit) => {
  const { A, el, wait } = kit
  // Where the lifting sheet's shadow falls on the page
  const shade = el(`<div style="position:absolute;left:0;right:0;bottom:0;height:22%;opacity:0;background:linear-gradient(0deg,rgba(0,0,0,.1),transparent)"></div>`)
  layer.append(shade)
  const stage = el(`<div class="fill" style="perspective:1600px;perspective-origin:50% 0"></div>`)
  const v = el(`<div class="fill" style="transform-origin:50% 0;background:${NOISE(0.6, 0.08)},linear-gradient(180deg,rgba(255,255,255,.7),rgba(250,248,244,.58));backdrop-filter:blur(7px) saturate(.85);-webkit-backdrop-filter:blur(7px) saturate(.85);box-shadow:inset 0 -1px 0 rgba(255,255,255,.95),inset 0 0 0 1px rgba(255,255,255,.35),0 10px 24px rgba(0,0,0,.14);display:grid;place-items:center">
     <div class="vn" style="text-align:center;color:var(--p);width:100%"><div style="font:600 9px var(--f-body);letter-spacing:.32em;text-transform:uppercase;color:var(--a-text)">${eyebrowOf(content, 'Please join us')}</div><div style="font-family:var(--f-script);font-size:${fit(44, content.title, 12)}px;line-height:1.1">${esc(content.title)}</div>${content.dateNumeric ? `<div style="font-family:var(--f-display);font-size:13px;letter-spacing:.2em">${esc(content.dateNumeric)}</div>` : ''}</div></div>`)
  // Like a wrapped invitation: a sprig of dried flowers tied to the sheet with twine and held by a wax seal with the
  // initials, all in the theme's colours, centred under the names as one group. They're on the sheet, so they lift away
  // with it
  const group = el(`<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(90%,520px);display:flex;flex-direction:column;align-items:center"></div>`)
  const ornament = el(`<div style="position:relative;width:300px;height:300px;margin-top:-4px"></div>`)
  const sprig = el(`<div class="fill" style="transform-origin:50% 94%;opacity:0">${driedSprig(23)}</div>`)
  // Two strands across the whole sheet, through the tie
  const twine = el(`<div style="position:absolute;left:50%;top:280px;width:300vmax;height:5px;transform:translate(-50%,-50%) rotate(-4deg);border-top:1.4px solid rgba(255,255,255,.95);border-bottom:1.4px solid rgba(255,255,255,.95);filter:drop-shadow(0 1px .5px rgba(0,0,0,.14));opacity:0"></div>`)
  const seal = el(`<div style="position:absolute;left:50%;top:280px;width:84px;height:84px;margin:-42px 0 0 -42px;opacity:0">${sealSVG(kit, { motif: 'text', text: esc(content.initials.replace(/\s+/g, '')), seed: 4, color: 'color-mix(in oklab,var(--a),#000 22%)' })}</div>`)
  ornament.append(sprig, twine, seal)
  const names = v.querySelector('.vn')!
  names.replaceWith(group)
  group.append(names, ornament)
  // Light catching the sheet as it bends
  const glint = el(`<div class="fill" style="opacity:0;background:linear-gradient(180deg,transparent 40%,rgba(255,255,255,.55) 85%,rgba(255,255,255,.9));pointer-events:none"></div>`)
  v.append(glint)
  stage.append(v)
  layer.append(stage)
  A(names, [{ opacity: 0, filter: 'blur(5px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 900 })
  await Promise.all([
    A(twine, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200 }),
    A(sprig, [{ opacity: 0, transform: 'scale(.94) rotate(-2deg)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: 250 }),
  ])
  await A(seal, [{ opacity: 0, transform: 'scale(1.35)' }, { opacity: 1, transform: 'scale(.96)', offset: 0.7 }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'ease-out' })
  await sweepLight(kit, seal, 290, 500)
  await wait(250)
  // The bottom edge lifts a little towards you, casting a soft shadow on the page. The page stays as it is: it was
  // already showing through the vellum, so there's nothing to bring in
  await Promise.all([
    A(v, [{ transform: 'rotateX(0)' }, { transform: 'rotateX(8deg)' }], { duration: 420, easing: 'cubic-bezier(.3,0,.3,1)' }),
    A(shade, [{ opacity: 0 }, { opacity: 1 }], { duration: 420 }),
  ])
  // …then the sheet peels up and over towards you, hinged at the top, catching the light, and is gone
  await Promise.all([
    A(v, [{ transform: 'rotateX(8deg)', opacity: 1 }, { transform: 'rotateX(62deg) translateY(-3%)', opacity: 1, offset: 0.6 }, { transform: 'rotateX(92deg) translateY(-8%)', opacity: 0 }], { duration: 1100, easing: 'cubic-bezier(.55,0,.35,1)' }),
    A(glint, [{ opacity: 0 }, { opacity: 1, offset: 0.5 }, { opacity: 0.4 }], { duration: 1100 }),
    A(shade, [{ opacity: 1 }, { opacity: 0 }], { duration: 450 }),
  ])
}

// The site's light background as paper: its grain, a little deeper towards the bottom
const LIGHT_PAPER = `background:${NOISE(0.85, 0.14)},linear-gradient(170deg,var(--bgS),color-mix(in oklab,var(--bgS),#000 6%));`

// Foil press: a bronze hot-foil press comes down on thick paper, holds, and lifts, leaving the names debossed in gold
// foil that shimmers once
const foilPress: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const paper = el(`<div class="fill" style="${LIGHT_PAPER}"></div>`)
  layer.append(paper)
  // The foil is a fixed gold clipped to the text; the deboss is a white edge below and a dark one above. It's under the
  // press from the moment it touches, so the names are there when it lifts
  const t = el(`<div class="center"><div style="text-align:center;max-width:88%">
     <div class="nm" style="font-family:var(--f-script);font-size:${fit(56, content.title, 12)}px;line-height:1.1;background:linear-gradient(100deg,#8E6C30 0%,#E9D29A 20%,#A9843F 35%,#FFF3C8 50%,#A9843F 65%,#E9D29A 80%,#8E6C30 100%);background-size:300% 100%;background-position:100% 0;-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 1px 0 rgba(255,255,255,.95)) drop-shadow(0 -1px 0 rgba(90,70,30,.25));opacity:0">${esc(content.title)}</div>
     ${content.dateNumeric ? `<div class="dt" style="font-family:var(--f-display);font-size:14px;letter-spacing:.24em;color:var(--p);opacity:0;margin-top:4px">${esc(content.dateNumeric)}</div>` : ''}</div></div>`)
  layer.append(t)
  // The press's shadow on the sheet: wide and soft while it's high, tight and dark as it lands
  const shadow = el(`<div style="position:absolute;left:50%;top:50%;width:min(84%,460px);height:172px;transform:translate(-50%,-50%);border-radius:10px;background:rgba(55,40,20,.5);filter:blur(22px);opacity:0"></div>`)
  layer.append(shadow)
  // The press, seen from above: a brushed bronze block on a darker bronze die, bolted at the corners, with a heat light
  // on top. Natural metal colours, like the foil
  const bolt = (x: string, y: string) => `<span style="position:absolute;${x};${y};width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#F6E2BC,#B38749 55%,#5E4320);box-shadow:0 1px 1px rgba(40,25,10,.4),inset 0 0 0 1px rgba(60,40,15,.25)"><span style="position:absolute;left:3px;right:3px;top:6px;height:2px;border-radius:1px;background:rgba(55,35,12,.6);transform:rotate(${x.startsWith('left') ? 35 : -35}deg)"></span></span>`
  const press = el(`<div style="position:absolute;left:50%;top:50%;width:min(84%,460px);height:172px;transform:translate(-50%,-50%);opacity:0">
     <div style="position:absolute;inset:-7px;border-radius:12px;background:linear-gradient(135deg,#4E3413,#9C6E34 28%,#6B4A1E 52%,#B4884B 74%,#4F3514);box-shadow:0 2px 3px rgba(40,25,10,.35)"></div>
     <div style="position:absolute;inset:0;border-radius:8px;background:repeating-linear-gradient(90deg,rgba(255,236,200,.07) 0 1px,transparent 1px 3px),linear-gradient(180deg,#E2BE86,#BC9156 38%,#96693A 52%,#C99D62 78%,#A47843);box-shadow:inset 0 2px 0 rgba(255,232,190,.75),inset 0 -3px 0 rgba(60,35,10,.32),inset 2px 0 0 rgba(255,232,190,.35),inset -2px 0 0 rgba(60,35,10,.2)">
       ${bolt('left:10px', 'top:10px')}${bolt('right:10px', 'top:10px')}${bolt('left:10px', 'bottom:10px')}${bolt('right:10px', 'bottom:10px')}
       <span style="position:absolute;left:50%;bottom:16px;width:44%;height:3px;transform:translateX(-50%);border-radius:2px;background:rgba(70,45,15,.32);box-shadow:0 1px 0 rgba(255,232,190,.55)"></span>
       <span class="heat" style="position:absolute;right:34px;top:13px;width:8px;height:8px;border-radius:50%;background:#5A2B1E;box-shadow:inset 0 1px 1px rgba(0,0,0,.4)"></span></div></div>`)
  layer.append(press)
  const nm = t.querySelector<HTMLElement>('.nm')!
  const dt = t.querySelector('.dt')
  const heat = press.querySelector('.heat')!
  await wait(250)
  // Down: close to the eye and blurred-in at first, shrinking to the sheet faster and faster, a slight give on contact
  await Promise.all([
    A(press, [
      { opacity: 0, transform: 'translate(-50%,-50%) scale(1.4)' },
      { opacity: 1, transform: 'translate(-50%,-50%) scale(1.3)', offset: 0.2 },
      { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: 0.86, easing: 'cubic-bezier(.3,0,.4,1)' },
      { opacity: 1, transform: 'translate(-50%,-50%) scale(.985)', offset: 0.94 },
      { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' },
    ], { duration: 700, easing: 'cubic-bezier(.55,0,.9,.45)' }),
    A(shadow, [
      { opacity: 0, transform: 'translate(-50%,-38%) scale(1.25)', filter: 'blur(30px)' },
      { opacity: 0.85, transform: 'translate(-50%,-49%) scale(1.02)', filter: 'blur(6px)', offset: 0.86 },
      { opacity: 0.95, transform: 'translate(-50%,-50%) scale(1)', filter: 'blur(4px)' },
    ], { duration: 700, easing: 'cubic-bezier(.55,0,.9,.45)' }),
  ])
  // Pressed: the heat light comes on while it holds, and the foil goes onto the paper underneath
  nm.style.opacity = '1'
  await A(heat, [{ background: '#5A2B1E', boxShadow: 'inset 0 1px 1px rgba(0,0,0,.4)' }, { background: '#FF8A3D', boxShadow: '0 0 6px 2px rgba(255,138,61,.75),inset 0 0 2px #FFE0B8' }], { duration: 160, easing: 'ease-out' })
  await wait(320)
  A(heat, [{ background: '#FF8A3D' }, { background: '#5A2B1E', boxShadow: 'none' }], { duration: 300 })
  // Up: back towards the eye, its shadow spreading and fading, leaving the names debossed in gold
  A(nm, [{ transform: 'scale(1.02)' }, { transform: 'none' }], { duration: 300 })
  await Promise.all([
    A(press, [{ opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.25)', offset: 0.6 }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1.45)' }], { duration: 650, easing: 'cubic-bezier(.2,.6,.4,1)' }),
    A(shadow, [{ opacity: 0.95, transform: 'translate(-50%,-50%) scale(1)', filter: 'blur(4px)' }, { opacity: 0, transform: 'translate(-50%,-38%) scale(1.3)', filter: 'blur(30px)' }], { duration: 600, easing: 'ease-out' }),
  ])
  press.remove()
  shadow.remove()
  if (dt)
    A(dt, [{ opacity: 0 }, { opacity: 0.8 }], { duration: 600 })
  await A(nm, [{ backgroundPosition: '100% 0' }, { backgroundPosition: '0% 0' }], { duration: 1000, easing: 'ease-in-out' })
  reveal()
  await Promise.all([
    A(paper, [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 850, easing: EASE }),
    A(t, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-40px)' }], { duration: 600, easing: EASE }),
  ])
}

// Ink wash: drops of ink land on the paper and bloom into a soft watercolour wash behind the names
const inkWash: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const paper = el(`<div class="fill" style="${LIGHT_PAPER}"></div>`)
  layer.append(paper)
  // The ink: the accent and a light mix of the primary
  const inks: [string, number, number, number][] = [['var(--a)', 42, 44, 240], ['color-mix(in oklab,var(--p),#fff 55%)', 60, 52, 200], ['color-mix(in oklab,var(--a),#fff 40%)', 50, 38, 170]]
  const blobs = inks.map(([colour, x, y, s], i) => {
    const blob = el(`<div style="position:absolute;left:${x}%;top:${y}%;width:${s}px;height:${s * 0.82}px;margin:${-s * 0.41}px 0 0 ${-s / 2}px;border-radius:${[48, 62, 40][i]}% ${[52, 38, 60][i]}% ${[44, 58, 50][i]}% ${[56, 42, 50][i]}%;background:radial-gradient(circle at 45% 45%,${colour},color-mix(in oklab,${colour},transparent 55%) 60%,transparent 72%);mix-blend-mode:multiply;filter:blur(6px);opacity:.75;transform:scale(0)"></div>`)
    layer.append(blob)
    return blob
  })
  const t = el(`<div class="center"><div style="text-align:center;color:var(--p);opacity:0;max-width:88%"><div style="font:600 9px var(--f-body);letter-spacing:.3em;text-transform:uppercase;color:var(--a-text)">${eyebrowOf(content, 'Save the date')}</div><div style="font-family:var(--f-script);font-size:${fit(50, content.title, 12)}px;line-height:1.1">${esc(content.title)}</div></div></div>`)
  layer.append(t)
  for (const blob of blobs) {
    A(blob, [{ transform: 'scale(0)' }, { transform: 'scale(.12)', offset: 0.15 }, { transform: 'scale(1) rotate(8deg)' }], { duration: 1500, easing: 'cubic-bezier(.2,.7,.3,1)' })
    await wait(220)
  }
  await A(t.firstElementChild!, [{ opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 900 })
  await wait(350)
  reveal()
  await Promise.all([paper, t, ...blobs].map(node => A(node, [{ opacity: getComputedStyle(node).opacity, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(8px)' }], { duration: 900, easing: 'ease-in-out' })))
}

// Down the aisle: candles light one by one down an aisle toward the couple's names, then the camera walks forward
const aisle: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  // The candles and the warm room keep their own colours
  const room = el(`<div class="fill" style="background:radial-gradient(60% 40% at 50% 28%,#5A4636,#1E1814 75%)"></div>`)
  const runner = el(`<div class="fill" style="clip-path:polygon(45% 30%,55% 30%,88% 100%,12% 100%);${PAPER('#F6EFE3', '#D9CDB9', 180)}"></div>`)
  const wrap = el(`<div class="fill" style="transform-origin:50% 30%"></div>`)
  wrap.append(room, runner)
  layer.append(wrap)
  // Six rows of candle pairs along the aisle's perspective lines, the front row first
  const candles: [HTMLElement, number][] = []
  for (let row = 0; row < 6; row++) {
    const k = 1 - row / 6.2
    const y = 98 - row * 11.5
    const h = 34 * k + 6
    const w = 9 * k + 3
    for (const side of [-1, 1]) {
      const candle = el(`<div style="position:absolute;left:${50 + side * (9 + 34 * k)}%;top:${y}%;width:${w}px;height:${h}px;margin:${-h}px 0 0 ${-w / 2}px;border-radius:2px;background:linear-gradient(90deg,#B7AA96,#FFF8EC 45%,#CFC2AE)">
         <span class="fl" style="position:absolute;left:50%;top:${-h * 0.42}px;width:${w * 0.7}px;height:${h * 0.4}px;margin-left:${-w * 0.35}px;border-radius:50% 50% 50% 50%/62% 62% 38% 38%;background:radial-gradient(ellipse at 50% 78%,#fff 0 14%,#FFE6A6 30%,#FFAE45 58%,transparent 76%);opacity:0"></span>
         <span class="gl" style="position:absolute;left:50%;top:${-h * 0.3}px;width:${w * 8}px;height:${w * 8}px;margin:${-w * 4}px 0 0 ${-w * 4}px;border-radius:50%;background:radial-gradient(circle,rgba(255,190,110,.45),transparent 65%);opacity:0"></span></div>`)
      wrap.append(candle)
      candles.push([candle, row])
    }
  }
  const t = el(`<div style="position:absolute;left:0;right:0;top:12%;padding:0 24px;text-align:center;color:#F6E8D0;opacity:0"><div style="font:600 9px var(--f-body);letter-spacing:.3em;text-transform:uppercase;opacity:.7">${eyebrowOf(content, 'The wedding of')}</div><div style="font-family:var(--f-script);font-size:${fit(46, content.title, 12)}px">${esc(content.title)}</div></div>`)
  wrap.append(t)
  for (let row = 0; row < 6; row++) {
    candles.filter(([, r]) => r === row).forEach(([candle]) => {
      A(candle.querySelector('.fl')!, [{ opacity: 0, transform: 'scale(.3)' }, { opacity: 1, transform: 'none' }], { duration: 300 })
      A(candle.querySelector('.gl')!, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 })
    })
    await wait(140)
  }
  await A(t, [{ opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 700 })
  await wait(250)
  reveal()
  // The camera walks forward up the aisle
  await A(wrap, [{ transform: 'none', opacity: 1 }, { transform: 'scale(1.9)', opacity: 0 }], { duration: 1000, easing: 'cubic-bezier(.5,0,.7,1)' })
}

// Lace: two scalloped lace panels frame the names, then sway and part like curtains
const lace: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const TINT = 'color-mix(in oklab,var(--a),#fff 72%)'
  const cover = el(`<div class="fill" style="background:${TINT}"></div>`)
  layer.append(cover)
  // White lace: rings, dots and large loops on a faint white veil over the tint. The tint is in the panels themselves,
  // so they keep their colour as they part (the cover behind them fades)
  const LACE = `background:radial-gradient(circle,transparent 0 3.5px,rgba(255,255,255,.95) 4px 5.5px,transparent 6px) 0 0/18px 18px,radial-gradient(circle,rgba(255,255,255,.9) 0 1.8px,transparent 2.3px) 9px 9px/18px 18px,radial-gradient(circle,transparent 0 10px,rgba(255,255,255,.55) 10.5px 11.5px,transparent 12px) 0 0/36px 36px,color-mix(in oklab,${TINT},#fff 35%);`
  // The inner edge is scalloped by a mask repeated every 20px
  const panel = (side: 'left' | 'right') => {
    const mask = `radial-gradient(circle 9px at ${side === 'left' ? '100%' : '0'} 50%,#0000 96%,#000) 0 0/100% 20px`
    return el(`<div style="position:absolute;top:0;bottom:0;${side}:0;width:52%;${LACE}filter:drop-shadow(0 0 3px rgba(0,0,0,.08));-webkit-mask:${mask};mask:${mask}"></div>`)
  }
  const left = panel('left')
  const right = panel('right')
  layer.append(left, right)
  const t = el(`<div class="center"><div style="text-align:center;color:var(--p);background:rgba(255,255,255,.88);padding:18px 24px;border-radius:2px;box-shadow:0 6px 18px rgba(0,0,0,.08);max-width:84%"><div style="font:600 9px var(--f-body);letter-spacing:.3em;text-transform:uppercase;color:var(--a-text)">${eyebrowOf(content, 'Together with their families')}</div><div style="font-family:var(--f-script);font-size:${fit(42, content.title, 12)}px;line-height:1.1">${esc(content.title)}</div></div></div>`)
  layer.append(t)
  await A(t.firstElementChild!, [{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 800 })
  await wait(500)
  A(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 })
  reveal()
  await Promise.all([
    A(left, [{ transform: 'none' }, { transform: 'translateX(-12px) skewY(1deg)', offset: 0.15 }, { transform: 'translateX(-105%) skewY(-2deg)' }], { duration: 1200, easing: 'cubic-bezier(.5,0,.25,1)' }),
    A(right, [{ transform: 'none' }, { transform: 'translateX(12px) skewY(-1deg)', offset: 0.15 }, { transform: 'translateX(105%) skewY(2deg)' }], { duration: 1200, easing: 'cubic-bezier(.5,0,.25,1)' }),
    A(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 900, delay: 200 }),
  ])
}

// Folded letter: a tri-folded letter lands and unfolds panel by panel: families, names, then date and venue
const letter: Scene = async ({ layer, content }, { A, el, wait, reveal }) => {
  const desk = el(`<div class="fill" style="${LIGHT_PAPER}"></div>`)
  layer.append(desk)
  const sheetPaper = PAPER('#FFFFFF', '#F3EEE5', 180)
  const details = [content.dateLong, content.venue].filter(Boolean).map(esc).join(' · ')
  // Each fold opens in two steps: the folded flap shrinks to its crease, then the open panel grows from it
  const sheet = el(`<div class="center"><div class="sh" style="position:relative;width:74%;height:270px;filter:drop-shadow(0 14px 20px rgba(60,40,20,.2))">
     <div class="top" style="position:absolute;left:0;right:0;top:0;height:90px;${sheetPaper}transform-origin:50% 100%;display:grid;place-items:end center;padding:0 12px 10px;text-align:center;font:600 8px var(--f-body);letter-spacing:.3em;text-transform:uppercase;color:var(--a-text);transform:scaleY(0)">${eyebrowOf(content, 'Together with their families')}</div>
     <div style="position:absolute;left:0;right:0;top:90px;height:90px;${sheetPaper}display:grid;place-items:center;padding:0 12px;text-align:center;font-family:var(--f-script);font-size:${fit(40, content.title, 12)}px;line-height:1.05;color:var(--p)">${esc(content.title)}</div>
     <div class="bot" style="position:absolute;left:0;right:0;top:180px;height:90px;${sheetPaper}transform-origin:50% 0;display:grid;place-items:start center;padding:12px 12px 0;text-align:center;font-family:var(--f-display);font-size:13px;letter-spacing:.14em;color:var(--p);transform:scaleY(0)">${details}</div>
     <div class="fT" style="position:absolute;left:0;right:0;top:90px;height:90px;${PAPER('#F5F1EA', '#E6DFD3', 180)}transform-origin:50% 0;box-shadow:0 2px 3px rgba(0,0,0,.12)"></div>
     <div class="fB" style="position:absolute;left:0;right:0;top:90px;height:90px;${PAPER('#FAF7F1', '#ECE6DB', 0)}transform-origin:50% 100%;box-shadow:0 -1px 2px rgba(0,0,0,.08)"></div></div></div>`)
  layer.append(sheet)
  const sh = sheet.querySelector('.sh')!
  const part = (selector: string) => sheet.querySelector(selector)!
  await A(sh, [{ transform: 'translateY(40px) rotate(-3deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 650 })
  await wait(200)
  await A(part('.fB'), [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 300, easing: 'cubic-bezier(.5,0,.9,.5)' })
  part('.fB').remove()
  await A(part('.bot'), [{ transform: 'scaleY(0)', filter: 'brightness(.85)' }, { transform: 'scaleY(1)', filter: 'brightness(1)' }], { duration: 360 })
  await A(part('.fT'), [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 300, easing: 'cubic-bezier(.5,0,.9,.5)' })
  part('.fT').remove()
  await A(part('.top'), [{ transform: 'scaleY(0)', filter: 'brightness(.85)' }, { transform: 'scaleY(1)', filter: 'brightness(1)' }], { duration: 360 })
  await wait(550)
  reveal()
  await Promise.all([
    A(sh, [{ transform: 'none', opacity: 1 }, { transform: 'scale(2.6)', opacity: 0 }], { duration: 850, easing: EASE }),
    A(desk, [{ opacity: 1 }, { opacity: 0 }], { duration: 750, delay: 100 }),
  ])
}

export const scenes: Record<string, Scene> = {
  'envelope': envelope,
  'signature': signature,
  'veil': veil,
  'wax-seal': waxSeal,
  'ring-box': ringBox,
  'golden-frame': goldenFrame,
  'bloom': bloom,
  'meet': meet,
  'light-leak': lightLeak,
  'pages': pages,
  'ribbon': ribbon,
  'polaroid': polaroid,
  'toast': toast,
  'doors': doors,
  'vellum': vellum,
  'foil-press': foilPress,
  'ink-wash': inkWash,
  'aisle': aisle,
  'lace': lace,
  'letter': letter,
}
