import type { MessageLayoutOptionKey } from './message.options'
import type { LayoutOptionPick } from '../section.options'
import type { SectionTypeDefinition } from '../section.registry.type'
import { layout, onColour, onPaper } from '../section.layout'
import { pickLayoutOptions } from '../section.options'
import { messageLayoutOptionCatalogue } from './message.options'
import { messageFields } from './message.type'

// A layout's options, picked by key from the message section's catalogue (message.options.ts) and the shared
// one, with the layout's overrides where it differs
const options = (...picks: LayoutOptionPick<MessageLayoutOptionKey>[]) => pickLayoutOptions(messageLayoutOptionCatalogue, picks)

// The message section type and its layouts, in picker order (see section.registry.ts).
export const messageSection: SectionTypeDefinition<'message'> = {
  type: 'message',
  name: 'Message',
  description: 'A short, signed note from the hosts to their guests, with one photo: a welcome, a thank you, …',
  contentVersion: 1,
  defaultContent: {
    eyebrow: 'A note from us',
    heading: 'Welcome, family & friends',
    body: 'We are so glad you\'re here. Over the years you have laughed with us, prayed for us and cheered us on. We can\'t imagine this day without you.',
    signature: 'With love, from us',
    layoutPhotos: [],
  },
  // Every layout uses the same fields and one photo; only the arrangement changes. None of them can be made from
  // another with a background or option.
  fields: messageFields,
  fieldNames: { body: 'message' },
  layouts: [
    layout({
      key: 'stacked',
      name: 'Photo on top',
      description: 'A wide photo strip across the top, the note below it. Simple; works with landscape photos.',
      layoutPhotoCount: 1,
      fields: messageFields,
      required: ['body'],
      backgrounds: onColour,
      options: options('textAlign'),
    }, () => import('~/components/sections/message/MessageStacked.vue')),
    layout({
      key: 'split',
      name: 'Split',
      description: 'The photo fills one half edge to edge, the note sits on the other.',
      layoutPhotoCount: 1,
      fields: messageFields,
      required: ['body'],
      backgrounds: onColour,
      options: options('photoSide'),
    }, () => import('~/components/sections/message/MessageSplit.vue')),
    layout({
      key: 'side-photo',
      name: 'Side photo',
      description: 'A smaller photo beside the note, in a plain, arch or framed print. Best for portraits.',
      layoutPhotoCount: 1,
      fields: messageFields,
      required: ['body'],
      backgrounds: onColour,
      options: options('frame', 'photoSide'),
    }, () => import('~/components/sections/message/MessageSidePhoto.vue')),
    layout({
      key: 'polaroid',
      name: 'Polaroid',
      description: 'A tilted instant photo next to the note. Warm, casual and personal.',
      layoutPhotoCount: 1,
      fields: messageFields,
      required: ['body'],
      backgrounds: onPaper,
      options: options('photoSide'),
    }, () => import('~/components/sections/message/MessagePolaroid.vue')),
    layout({
      key: 'portrait',
      name: 'Centred letter',
      description: 'The note centred like a letter, with a small round photo on top or beside the signature. Without a photo it\'s a plain letter.',
      layoutPhotoCount: 1,
      fields: messageFields,
      required: ['body'],
      backgrounds: onColour,
      options: options('photoPlacement'),
    }, () => import('~/components/sections/message/MessagePortrait.vue')),
    layout({
      key: 'card',
      name: 'Letter card',
      description: 'The note on a paper card, with the photo taped to its corner.',
      layoutPhotoCount: 1,
      fields: messageFields,
      required: ['body'],
      backgrounds: onPaper,
      options: options('photoCorner'),
    }, () => import('~/components/sections/message/MessageCard.vue')),
    layout({
      key: 'overlap',
      name: 'Overlap',
      description: 'A large photo with the note on a panel overlapping its edge, editorial style.',
      layoutPhotoCount: 1,
      fields: messageFields,
      required: ['body'],
      backgrounds: onColour,
      options: options('photoSide'),
    }, () => import('~/components/sections/message/MessageOverlap.vue')),
    layout({
      key: 'postcard',
      name: 'Postcard',
      description: 'A postcard: the photo on one side, the note on the other, with a divider and a stamp.',
      layoutPhotoCount: 1,
      fields: messageFields,
      required: ['body'],
      backgrounds: onPaper,
      options: options('photoSide'),
    }, () => import('~/components/sections/message/MessagePostcard.vue')),
    layout({
      key: 'editorial',
      name: 'Two column',
      description: 'A big heading on the left, the message and signature on the right, and a wide photo.',
      layoutPhotoCount: 1,
      fields: messageFields,
      required: ['body'],
      backgrounds: onColour,
      options: options('photoPosition'),
    }, () => import('~/components/sections/message/MessageEditorial.vue')),
    layout({
      key: 'inline',
      name: 'Magazine',
      description: 'The photo sits inside the message and the text wraps around it, with a drop cap.',
      layoutPhotoCount: 1,
      fields: messageFields,
      required: ['body'],
      backgrounds: onColour,
      options: options(['photoSide', { default: 'right' }]),
    }, () => import('~/components/sections/message/MessageInline.vue')),
    layout({
      key: 'photo-middle',
      name: 'Photo in the middle',
      description: 'The heading above, a landscape photo in the middle, the message and signature below.',
      layoutPhotoCount: 1,
      fields: messageFields,
      required: ['body'],
      backgrounds: onColour,
      options: options('textAlign'),
    }, () => import('~/components/sections/message/MessagePhotoMiddle.vue')),
  ],
}
