import type { AboutLayoutOptionKey } from './about.options'
import type { AboutField } from './about.type'
import type { LayoutOptionPick } from '../section.options'
import type { SectionTypeDefinition } from '../section.registry.type'
import { layout, onColour, onPaper } from '../section.layout'
import { pickLayoutOptions } from '../section.options'
import { aboutLayoutOptionCatalogue } from './about.options'
import { aboutFields } from './about.type'

// Story layouts show the story and their photos; timelines add the chapters (at least one) with the story as their intro
const storyFields: AboutField[] = ['eyebrow', 'heading', 'body']
const timelineFields: AboutField[] = [...storyFields, 'timeline', 'timeline.photo']
const onTimeline = { fields: timelineFields, required: ['timeline'], labels: { body: 'Intro (optional)' } }

// A layout's options, picked by key from the about section's catalogue (about.options.ts) and the shared
// one, with the layout's overrides where it differs
const options = (...picks: LayoutOptionPick<AboutLayoutOptionKey>[]) => pickLayoutOptions(aboutLayoutOptionCatalogue, picks)

// The about section type and its layouts, in picker order (see section.registry.ts).
export const aboutSection: SectionTypeDefinition<'about'> = {
  type: 'about',
  name: 'About',
  description: 'Your story: how it started, who the celebrant is, or the moments that led here, with photos or as a timeline.',
  contentVersion: 1,
  defaultContent: {
    eyebrow: 'Our story',
    heading: 'How we met',
    body: 'We met in 2019 at a friend\'s birthday in Quezon City. Carlo spilled coffee on Bea\'s notes, and offered to rewrite them over dinner.\n\nFive years, two cities and one very patient barkada later, we\'re ready to say yes to forever.',
    timeline: [
      { eyebrow: '2019 · How we met', heading: 'Spilled coffee', body: 'Carlo knocked his coffee onto Bea\'s notes, then offered to rewrite them over dinner.' },
      { eyebrow: '2021 · Long distance', heading: 'Two cities, one love', body: 'Work took Bea to Cebu. Weekend flights kept us close.' },
      { eyebrow: '2025 · The proposal', heading: 'Yes, in Batangas', body: 'On the beach of our first trip, Carlo finally asked.' },
    ],
    layoutPhotos: [],
  },
  // Story layouts (the body with up to three photos) first, then timeline layouts (the chapters). Every layout uses
  // the same fields; only what it shows and the arrangement change.
  fields: aboutFields,
  fieldNames: { body: 'story', timeline: ['chapter', 'chapters'] },
  layouts: [
    layout({
      key: 'split',
      name: 'Split',
      description: 'Photos fill one side edge to edge, the story on the other.',
      layoutPhotoCount: 3,
      fields: storyFields,
      backgrounds: onColour,
      options: options('photoSide'),
    }, () => import('~/components/sections/about/AboutSplit.vue')),
    layout({
      key: 'photo-row',
      name: 'Photo row',
      description: 'The story with its photos in a row, above or below it; the heading and story stacked or side by side.',
      layoutPhotoCount: 3,
      fields: storyFields,
      backgrounds: onColour,
      options: options(['photoPosition', { label: 'Photos' }], 'textAlign', 'textLayout'),
    }, () => import('~/components/sections/about/AboutPhotoRow.vue')),
    layout({
      key: 'mosaic',
      name: 'Mosaic',
      description: 'The story beside an inset photo grid: one tall photo and two small ones.',
      layoutPhotoCount: 3,
      fields: storyFields,
      backgrounds: onColour,
      options: options(['photoSide', { default: 'right' }]),
    }, () => import('~/components/sections/about/AboutMosaic.vue')),
    layout({
      key: 'divider',
      name: 'Divider',
      description: 'A photo and the story split by a thin line, with a round photo sitting on the line.',
      layoutPhotoCount: 2,
      fields: storyFields,
      backgrounds: onColour,
      options: options('photoSide'),
    }, () => import('~/components/sections/about/AboutDivider.vue')),
    layout({
      key: 'portrait',
      name: 'Portrait',
      description: 'A framed portrait above the story, extra photos as small circles. For a celebrant or a tribute.',
      layoutPhotoCount: 3,
      fields: storyFields,
      backgrounds: onColour,
      options: options('frame', 'textAlign'),
    }, () => import('~/components/sections/about/AboutPortrait.vue')),
    layout({
      key: 'scrapbook',
      name: 'Scrapbook',
      description: 'Tilted instant photos beside the story on a sheet of paper. Warm and personal.',
      layoutPhotoCount: 3,
      fields: storyFields,
      backgrounds: onPaper,
      options: options('photoSide'),
    }, () => import('~/components/sections/about/AboutScrapbook.vue')),
    layout({
      key: 'magazine',
      name: 'Long read',
      description: 'Like a magazine: a drop cap, the first photo inside the story, the rest in a row below. Best for longer stories.',
      layoutPhotoCount: 3,
      fields: storyFields,
      backgrounds: onColour,
      options: options(['photoSide', { default: 'right' }]),
    }, () => import('~/components/sections/about/AboutMagazine.vue')),
    layout({
      key: 'timeline-zigzag',
      name: 'Timeline: zigzag',
      description: 'The chapters alternate sides, each with its photo across from it, along a centre line or without one.',
      layoutPhotoCount: 0,
      ...onTimeline,
      backgrounds: onColour,
      options: options('firstPhotoSide', 'line'),
    }, () => import('~/components/sections/about/AboutTimelineZigzag.vue')),
    layout({
      key: 'timeline-list',
      name: 'Timeline: list',
      description: 'One column of chapters down a line, a photo beside each.',
      layoutPhotoCount: 0,
      ...onTimeline,
      backgrounds: onColour,
      options: options(['photoSide', { default: 'right' }]),
    }, () => import('~/components/sections/about/AboutTimelineList.vue')),
    layout({
      key: 'timeline-cards',
      name: 'Timeline: cards',
      description: 'The chapters as cards in one row along a line; guests swipe through them, or use the arrows.',
      layoutPhotoCount: 0,
      ...onTimeline,
      backgrounds: onColour,
      options: options('textAlign'),
    }, () => import('~/components/sections/about/AboutTimelineCards.vue')),
    layout({
      key: 'timeline-polaroids',
      name: 'Timeline: polaroids',
      description: 'Instant photos pinned along a string, each chapter as its caption.',
      layoutPhotoCount: 0,
      ...onTimeline,
      backgrounds: onPaper,
      options: options('textAlign'),
    }, () => import('~/components/sections/about/AboutTimelinePolaroids.vue')),
    layout({
      key: 'timeline-compact',
      name: 'Timeline: compact',
      description: 'Text-only chapters down a thin line, no photos. Great for long timelines or tributes.',
      layoutPhotoCount: 0,
      ...onTimeline,
      fields: timelineFields.filter(field => field !== 'timeline.photo'),
      backgrounds: onColour,
      options: options(['textAlign', { default: 'start' }]),
    }, () => import('~/components/sections/about/AboutTimelineCompact.vue')),
  ],
}
