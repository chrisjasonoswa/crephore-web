import type { DressCodeLayoutOptionKey } from './dress-code.options'
import type { DressCodeField } from './dress-code.type'
import type { LayoutOptionPick } from '../section.options'
import type { SectionBackground } from '../section.type'
import type { SectionTypeDefinition } from '../section.registry.type'
import { layout, onColour, onPaper } from '../section.layout'
import { alignWithEndChoices, pickLayoutOptions } from '../section.options'
import { countChoices, dressCodeLayoutOptionCatalogue } from './dress-code.options'
import { sampleDressCode } from './dress-code.helpers'
import { dressCodeFields } from './dress-code.type'

// A layout's options, picked by key from the dress code's catalogue (dress-code.options.ts) and the shared one, with
// the layout's overrides where it differs
const options = (...picks: LayoutOptionPick<DressCodeLayoutOptionKey>[]) => pickLayoutOptions(dressCodeLayoutOptionCatalogue, picks)

// Every full layout's first option: where its titles (the eyebrow, heading and attire) and the rest of its text (the
// description, the colours and "please avoid") sit, together: left, centred or right. Side-by-side layouts align them
// within their text column. `start`: the layout's look as designed (stacked layouts are centred, side-by-side ones left).
const aligned = (start: 'start' | 'center'): LayoutOptionPick<DressCodeLayoutOptionKey>[] => [
  ['textAlign', { label: 'Title and text', choices: [...alignWithEndChoices], default: start }],
]

// What each kind of layout shows; nothing is required (the attire motif is optional everywhere). The compact layouts
// are one-line reminders: no description or photos, the heading as their small label (the strip and note) or none (the
// pill).
const fieldsOf = (fields: DressCodeField[]) => ({ fields })
const fullFields = fieldsOf([...dressCodeFields])
const compactFields = fieldsOf(['heading', 'attire', 'colours'])
const pillFields = fieldsOf(['attire', 'colours', 'avoidColours'])
const noteFields = fieldsOf(['heading', 'attire', 'colours', 'avoidColours'])
// A bold block of colour by default
const onPrimary: SectionBackground[] = ['primary', 'secondary', 'light', 'photo']

// The dress-code section type and its layouts, in picker order (see section.registry.ts): three compact, then the full
// layouts.
export const dressCodeSection: SectionTypeDefinition<'dress-code'> = {
  type: 'dress-code',
  name: 'Dress code',
  description: 'What guests should wear: the attire motif, a description, the colours to wear and to avoid, and inspiration photos.',
  // 2: the attire is the host's own words, not a preset (section.upgrade.ts)
  contentVersion: 2,
  defaultContent: {
    eyebrow: 'What to wear',
    heading: 'Dress code',
    ...structuredClone(sampleDressCode),
    layoutPhotos: [],
  },
  fields: dressCodeFields,
  fieldNames: { attire: 'attire motif', colours: ['colour', 'colours'] },
  layouts: [
    layout({
      key: 'strip',
      name: 'Strip',
      description: 'A one-line reminder: the label and attire with overlapping swatches. No heading; sits between sections or under the hero.',
      layoutPhotoCount: 0,
      ...compactFields,
      backgrounds: onColour,
      // No options: always centred
      options: [],
    }, () => import('~/components/sections/dress-code/DressCodeStrip.vue')),
    layout({
      key: 'pill',
      name: 'Pill',
      description: 'A small centred pill with a hanger icon, the attire, tiny swatches and what to avoid.',
      layoutPhotoCount: 0,
      ...pillFields,
      backgrounds: onColour,
      // No options: what to avoid shows whenever there are colours to avoid (remove them to leave it out)
      options: [],
    }, () => import('~/components/sections/dress-code/DressCodePill.vue')),
    layout({
      key: 'note',
      name: 'Note',
      description: 'Two quiet centred lines: the attire with its colours named inline, then what to avoid.',
      layoutPhotoCount: 0,
      ...noteFields,
      backgrounds: onColour,
      // No options: what to avoid shows whenever there are colours to avoid (remove them to leave it out)
      options: [],
    }, () => import('~/components/sections/dress-code/DressCodeNote.vue')),
    layout({
      key: 'palette',
      name: 'Palette',
      description: 'The attire and description, then the colours as large named swatches and a small "please avoid" row.',
      layoutPhotoCount: 0,
      ...fullFields,
      backgrounds: onColour,
      options: options(...aligned('center'), 'swatchShape'),
    }, () => import('~/components/sections/dress-code/DressCodePalette.vue')),
    layout({
      key: 'swatch-cards',
      name: 'Paint chips',
      description: 'Each colour as a paint-chip card with its name, like a colour sample book.',
      layoutPhotoCount: 0,
      ...fullFields,
      backgrounds: onColour,
      options: options(...aligned('center')),
    }, () => import('~/components/sections/dress-code/DressCodeSwatchCards.vue')),
    layout({
      key: 'split-photo',
      name: 'Split with photos',
      description: 'Inspiration photos on one side; the attire, description and colours on the other.',
      layoutPhotoCount: 4,
      ...fullFields,
      backgrounds: onColour,
      options: options(...aligned('start'), 'photoSide', ['photoCount', { choices: countChoices('1', '2', '3', '4') }]),
    }, () => import('~/components/sections/dress-code/DressCodeSplitPhoto.vue')),
    layout({
      key: 'moodboard',
      name: 'Moodboard',
      description: 'A collage of inspiration photos with the colours pinned on top.',
      layoutPhotoCount: 6,
      ...fullFields,
      backgrounds: onColour,
      options: options(...aligned('center'), ['columns', { choices: countChoices('3', '4') }]),
    }, () => import('~/components/sections/dress-code/DressCodeMoodboard.vue')),
    layout({
      key: 'card',
      name: 'Invitation card',
      description: 'A framed card, centred like an insert in the invitation, with an ornament and swatch dots.',
      layoutPhotoCount: 0,
      ...fullFields,
      backgrounds: onPaper,
      options: options(...aligned('center')),
    }, () => import('~/components/sections/dress-code/DressCodeCard.vue')),
    layout({
      key: 'fabric',
      name: 'Fabric swatches',
      description: 'The colours as pinned fabric squares with a woven texture and pinked edges.',
      layoutPhotoCount: 0,
      ...fullFields,
      backgrounds: onColour,
      options: options(...aligned('center')),
    }, () => import('~/components/sections/dress-code/DressCodeFabric.vue')),
    layout({
      key: 'do-dont',
      name: 'Wear & avoid',
      description: 'Two columns: the colours to wear with ticks, the colours to avoid with crosses.',
      layoutPhotoCount: 0,
      ...fullFields,
      backgrounds: onColour,
      options: options(...aligned('center'), 'swatchShape'),
    }, () => import('~/components/sections/dress-code/DressCodeDoDont.vue')),
    layout({
      key: 'color-field',
      name: 'Colour field',
      description: 'The colours fill the section as stripes; the details sit on a card in front, left, centred or right.',
      layoutPhotoCount: 0,
      ...fullFields,
      backgrounds: onColour,
      options: options(...aligned('center'), 'cardAlign'),
    }, () => import('~/components/sections/dress-code/DressCodeColorField.vue')),
    layout({
      key: 'fan',
      name: 'Colour fan',
      description: 'Paint chips fanned out like a designer\'s colour deck, beside the details.',
      layoutPhotoCount: 0,
      ...fullFields,
      backgrounds: onColour,
      options: options(...aligned('start'), 'colourSide'),
    }, () => import('~/components/sections/dress-code/DressCodeFan.vue')),
    layout({
      key: 'polaroids',
      name: 'Polaroids',
      description: 'Inspiration photos as tilted instant photos, then the colours as swatches.',
      layoutPhotoCount: 5,
      ...fullFields,
      backgrounds: onColour,
      options: options(...aligned('center'), ['photoCount', { choices: countChoices('3', '4', '5'), default: '4' }]),
    }, () => import('~/components/sections/dress-code/DressCodePolaroids.vue')),
    layout({
      key: 'editorial',
      name: 'Editorial',
      description: 'The attire set huge like a magazine headline, with the colours as a numbered list.',
      layoutPhotoCount: 0,
      ...fullFields,
      backgrounds: onColour,
      options: options(...aligned('start')),
    }, () => import('~/components/sections/dress-code/DressCodeEditorial.vue')),
    layout({
      key: 'hangers',
      // The key is from when it was a clothes rail (stored, so it stays)
      name: 'Silhouettes',
      description: 'Outfit silhouettes in a row, one in each suggested colour: an A-line gown, a tuxedo, a mermaid gown, a tuxedo and a ball gown.',
      layoutPhotoCount: 0,
      ...fullFields,
      backgrounds: onColour,
      options: options(...aligned('center')),
    }, () => import('~/components/sections/dress-code/DressCodeHangers.vue')),
    layout({
      key: 'tag',
      name: 'Hang tag',
      description: 'A clothing hang tag on a string with the attire, colours and what to avoid, beside the details.',
      layoutPhotoCount: 0,
      ...fullFields,
      backgrounds: onColour,
      options: options(...aligned('start'), ['colourSide', { label: 'Tag side' }]),
    }, () => import('~/components/sections/dress-code/DressCodeTag.vue')),
    layout({
      key: 'poster',
      name: 'Poster',
      description: 'Bold capital attire on the main colour with big colour blocks. For parties and launches.',
      layoutPhotoCount: 0,
      ...fullFields,
      backgrounds: onPrimary,
      options: options(...aligned('start'), ['columns', { choices: countChoices('4', '2'), default: '4' }]),
    }, () => import('~/components/sections/dress-code/DressCodePoster.vue')),
    layout({
      key: 'ribbons',
      name: 'Ribbons',
      description: 'Satin ribbons in each colour hang from the top of the section, labelled at the tips.',
      layoutPhotoCount: 0,
      ...fullFields,
      backgrounds: onColour,
      options: options(...aligned('start'), 'colourSide'),
    }, () => import('~/components/sections/dress-code/DressCodeRibbons.vue')),
    layout({
      key: 'minimal',
      name: 'Minimal',
      description: 'Text only, centred: the attire, the description and the colours written out.',
      layoutPhotoCount: 0,
      ...fullFields,
      backgrounds: onColour,
      options: options(...aligned('center')),
    }, () => import('~/components/sections/dress-code/DressCodeMinimal.vue')),
    layout({
      key: 'overlap',
      name: 'Overlapping circles',
      description: 'The colours as large overlapping circles, like a palette mood, beside the details.',
      layoutPhotoCount: 0,
      ...fullFields,
      backgrounds: onColour,
      options: options(...aligned('start'), ['colourSide', { label: 'Circles side' }]),
    }, () => import('~/components/sections/dress-code/DressCodeOverlap.vue')),
    layout({
      key: 'bento',
      name: 'Bento',
      description: 'The details above a tile grid of colour tiles and inspiration photos.',
      layoutPhotoCount: 2,
      ...fullFields,
      backgrounds: onColour,
      options: options(...aligned('center')),
    }, () => import('~/components/sections/dress-code/DressCodeBento.vue')),
    layout({
      key: 'split-colour',
      name: 'Colour split',
      description: 'Half the section filled with the first suggested colour and the attire; the other half has the details.',
      layoutPhotoCount: 0,
      ...fullFields,
      backgrounds: onColour,
      // The title (on the colour half) and the text (beside it) align separately
      options: options(
        ['titleAlign', { label: 'Title', default: 'start' }],
        ['textAlign', { choices: [...alignWithEndChoices], default: 'start' }],
        'colourSide',
      ),
    }, () => import('~/components/sections/dress-code/DressCodeSplitColour.vue')),
  ],
}
