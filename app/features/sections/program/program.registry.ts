import type { ProgramLayoutOptionKey } from './program.options'
import type { LayoutOptionPick } from '../section.options'
import type { SectionBackground } from '../section.type'
import type { SectionTypeDefinition } from '../section.registry.type'
import { pickLayoutOptions } from '../section.options'
import { layout, onColour, onPaper } from '../section.layout'
import { columnChoices, programLayoutOptionCatalogue } from './program.options'
import { programFields } from './program.type'

// A layout's options, picked by key from the program's catalogue (program.options.ts) and the shared one, with the
// layout's overrides where it differs
const options = (...picks: LayoutOptionPick<ProgramLayoutOptionKey>[]) => pickLayoutOptions(programLayoutOptionCatalogue, picks)

// A bold block of colour by default
const onPrimary: SectionBackground[] = ['primary', 'secondary', 'light', 'photo']

// The program section type and its layouts, in picker order (see section.registry.ts).
export const programSection: SectionTypeDefinition<'program'> = {
  type: 'program',
  name: 'Program and venue',
  description: 'The order of events: what happens when and where, over one day or several, then how to get to each venue. The schedule and venues come from the event.',
  // 2: layout photos; 3: the venue and items come from the event; 4: the venues block's text (section.upgrade.ts)
  contentVersion: 4,
  defaultContent: {
    eyebrow: 'The day',
    heading: 'Program',
    venuesHeading: 'Getting there',
    layoutPhotos: [],
  },
  // Every layout uses the same fields; each day starts with its date (a divider, a tab, or a block or card per date in
  // the date-led layouts). Only the vertical title and photo cards have a layout photo.
  fields: programFields,
  layouts: [
    layout({
      key: 'timeline',
      name: 'Timeline',
      description: 'Times beside a line with a dot per item; the title, venue and note next to them.',
      layoutPhotoCount: 0,
      fields: programFields,
      backgrounds: onColour,
      options: options('titleAlign', 'showTime', 'timeColumn'),
    }, () => import('~/components/sections/program/ProgramTimeline.vue')),
    layout({
      key: 'list',
      name: 'Simple list',
      description: 'Time, title and venue in neat rows with dividers. Clean and compact.',
      layoutPhotoCount: 0,
      fields: programFields,
      backgrounds: onColour,
      options: options('titleAlign', 'showTime'),
    }, () => import('~/components/sections/program/ProgramList.vue')),
    layout({
      key: 'table',
      name: 'Table',
      description: 'A clean table: time, session, speaker and venue in columns; stacked rows on phones.',
      layoutPhotoCount: 0,
      fields: programFields,
      backgrounds: onColour,
      options: options(['titleAlign', { default: 'start' }], 'showTime'),
    }, () => import('~/components/sections/program/ProgramTable.vue')),
    layout({
      key: 'cards',
      name: 'Cards',
      description: 'Each item on its own card. Best for six items or fewer.',
      layoutPhotoCount: 0,
      fields: programFields,
      backgrounds: onColour,
      options: options('titleAlign', 'showTime', ['columns', { choices: columnChoices('2', '3'), default: '3' }]),
    }, () => import('~/components/sections/program/ProgramCards.vue')),
    layout({
      key: 'printed',
      name: 'Printed programme',
      description: 'Centred like a printed wedding programme: the time in small capitals, the title in the heading font, numbered parts if you like. For weddings, memorials and ceremonies.',
      layoutPhotoCount: 0,
      fields: programFields,
      backgrounds: onPaper,
      options: options('showTime', 'numbering', 'divider'),
    }, () => import('~/components/sections/program/ProgramPrinted.vue')),
    layout({
      key: 'big-times',
      name: 'Big times',
      description: 'Large serif times as the anchor, the details beside them. Bold and editorial.',
      layoutPhotoCount: 0,
      fields: programFields,
      backgrounds: onColour,
      options: options(['titleAlign', { default: 'start' }], 'showTime', ['columns', { choices: columnChoices('1', '2') }]),
    }, () => import('~/components/sections/program/ProgramBigTimes.vue')),
    layout({
      key: 'horizontal',
      name: 'Horizontal timeline',
      description: 'The items along a line, left to right, each marked with a dot or an icon that suits the event; guests swipe or drag through them.',
      layoutPhotoCount: 0,
      fields: programFields,
      backgrounds: onColour,
      options: options('titleAlign', 'showTime', 'marker'),
    }, () => import('~/components/sections/program/ProgramHorizontal.vue')),
    layout({
      key: 'poster',
      name: 'Poster',
      description: 'Big times in a grid, each with a title and a short note under a rule. Bold on a colour.',
      layoutPhotoCount: 0,
      fields: programFields,
      backgrounds: onPrimary,
      options: options(['titleAlign', { default: 'start' }], 'showTime', ['columns', { choices: columnChoices('2', '3') }]),
    }, () => import('~/components/sections/program/ProgramPoster.vue')),
    layout({
      key: 'agenda',
      name: 'Agenda',
      description: 'A tab per day, then rows with the date, time, speaker and title; tap a row for its note and venue. Best for conferences.',
      layoutPhotoCount: 0,
      fields: programFields,
      backgrounds: onColour,
      options: options(['titleAlign', { default: 'start' }], 'showTime'),
    }, () => import('~/components/sections/program/ProgramAgenda.vue')),
    layout({
      key: 'menu-card',
      name: 'Menu card',
      description: 'Framed like a wedding dinner menu: a double border, an ornament between items, centred titles.',
      layoutPhotoCount: 0,
      fields: programFields,
      backgrounds: onPaper,
      options: options('titleAlign', 'showTime', 'ornament'),
    }, () => import('~/components/sections/program/ProgramMenuCard.vue')),
    layout({
      key: 'tickets',
      name: 'Tickets',
      description: 'Each item as a ticket, the time on a perforated stub. Playful and fun.',
      layoutPhotoCount: 0,
      fields: programFields,
      backgrounds: onPaper,
      options: options('titleAlign', 'showTime', ['columns', { choices: columnChoices('1', '2') }]),
    }, () => import('~/components/sections/program/ProgramTickets.vue')),
    layout({
      key: 'note',
      name: 'Pinned note',
      description: 'The program on a sheet of paper pinned or clipped to the background, times and titles in rows under dashed rules. Friendly and handmade.',
      layoutPhotoCount: 0,
      fields: programFields,
      backgrounds: onPaper,
      options: options('titleAlign', 'showTime', 'attachment', 'rows'),
    }, () => import('~/components/sections/program/ProgramNote.vue')),
    layout({
      key: 'vertical',
      name: 'Vertical title',
      description: 'A wide photo on top, then rows of times, titles and speakers under strong rules. Bold and modern.',
      layoutPhotoCount: 1,
      fields: programFields,
      backgrounds: onColour,
      options: options(['titleAlign', { default: 'start' }], 'showTime', 'showPhoto'),
    }, () => import('~/components/sections/program/ProgramVertical.vue')),
    layout({
      key: 'date-blocks',
      name: 'Date blocks',
      description: 'Blocks of colour with a huge day number: one per item, or one per date with that day\'s items listed inside. Bold; good for weekends and festivals.',
      layoutPhotoCount: 0,
      fields: programFields,
      backgrounds: onColour,
      options: options(['titleAlign', { default: 'start' }], 'showTime', 'blockPer'),
    }, () => import('~/components/sections/program/ProgramDateBlocks.vue')),
    layout({
      key: 'photo-cards',
      name: 'Photo cards',
      description: 'Half colour, half photo, with cards across the split and a big day number: one per item, or one per date with its items as ticked lines.',
      layoutPhotoCount: 1,
      fields: programFields,
      backgrounds: onPrimary,
      options: options('showTime', ['blockPer', { label: 'Each card' }], ['photoSide', { default: 'right' }]),
    }, () => import('~/components/sections/program/ProgramPhotoCards.vue')),
  ],
}
