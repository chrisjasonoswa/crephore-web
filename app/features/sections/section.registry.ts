import type { Component } from 'vue'
import type { SectionLayoutOption } from './section.options'
import type { Section, SectionBackground, SectionContentMap, SectionType } from './section.type'
import { defineAsyncComponent } from 'vue'
import { aboveBelowChoices, alignChoices, positionChoices, resolveLayoutOptions, sideChoices } from './section.options'

export interface SectionLayoutDefinition {
  // Stored on the section (`Section.layout`); never rename once used.
  key: string
  name: string
  // What it looks like and when to use it (shown in pickers)
  description: string
  // One component per layout, named after the key (`overlay-card` → HeroOverlayCard.vue).
  // Loaded on demand so event pages only download the layouts they use.
  component: Component
  // The backgrounds it supports, in picker order; the first is the default for new sections.
  // Every layout offers `photo` (the optional background photo, under an overlay so the text stays readable).
  // Photo-backed layouts only use `photo`; the others start on a colour.
  backgrounds: SectionBackground[]
  // Placement options (text position, photo side, …), stored in `Section.options`
  options: SectionLayoutOption[]
  // How many layout photos it shows (the editor offers that many photo fields); 0 for layouts without photos inside.
  // For a slideshow, the most it plays.
  layoutPhotoCount: number
}

export interface SectionTypeDefinition<T extends SectionType> {
  type: T
  name: string
  description: string
  // Saved with each section's content. Bump it when the content's fields change, and upgrade older content when
  // loading a saved website.
  contentVersion: number
  defaultContent: SectionContentMap[T]
  layouts: SectionLayoutDefinition[]
}

type LayoutLoader = () => Promise<{ default: Component }>

function layout(
  definition: Omit<SectionLayoutDefinition, 'component'>,
  load: LayoutLoader,
): SectionLayoutDefinition {
  return { ...definition, component: defineAsyncComponent(load) }
}

// Photo-backed layouts only use the background photo; the others start on a colour, with the background photo last
const onPhoto: SectionBackground[] = ['photo']
const colours: SectionBackground[] = ['light', 'primary', 'accent']
const onColour: SectionBackground[] = [...colours, 'photo']

/** Every section type and layout the builder offers. Register new layouts here. */
type SectionRegistry = { [T in SectionType]: SectionTypeDefinition<T> }

export const sectionRegistry: SectionRegistry = {
  hero: {
    type: 'hero',
    name: 'Hero',
    description: 'The opening of the page: names, date, place, photos and the RSVP button.',
    contentVersion: 1,
    defaultContent: {
      eyebrow: 'Together with their families',
      title: 'Bea & Carlo',
      date: 'Saturday, 14 February 2027',
      venue: 'Manila Cathedral',
      layoutPhotos: [],
      cta: { label: 'RSVP', href: '#rsvp' },
    },
    // Every layout uses the same fields; only the arrangement changes.
    layouts: [
      layout({
        key: 'fullscreen',
        name: 'Full',
        description: 'The text fills the section, on the photo (with a soft dark overlay) or on a colour. Best for weddings, debuts, anything with a great photo.',
        // On the background photo by default; the colours show no photo
        layoutPhotoCount: 0,
        backgrounds: ['photo', ...colours],
        options: [{ key: 'textPosition', label: 'Text position', choices: positionChoices, default: 'center' }],
      }, () => import('~/components/sections/hero/HeroFullscreen.vue')),
      layout({
        key: 'split',
        name: 'Split',
        description: 'Text on one side, photo on the other. Best for debuts, birthdays, a clean modern look.',
        layoutPhotoCount: 1,
        backgrounds: onColour,
        options: [
          { key: 'photoSide', label: 'Photo side', choices: sideChoices, default: 'right' },
          { key: 'textPosition', label: 'Text position', choices: positionChoices, default: 'left' },
        ],
      }, () => import('~/components/sections/hero/HeroSplit.vue')),
      layout({
        key: 'arch',
        name: 'Arch frame',
        description: 'Photo inside an arch, names around it, date below. Best for weddings, christenings, anniversaries.',
        layoutPhotoCount: 1,
        backgrounds: onColour,
        options: [{
          key: 'namesPlacement',
          label: 'Names',
          choices: [
            { value: 'above', label: 'Above' },
            { value: 'below', label: 'Below' },
          ],
          default: 'above',
        }],
      }, () => import('~/components/sections/hero/HeroArch.vue')),
      layout({
        key: 'editorial',
        name: 'Editorial',
        description: 'Huge headline with a wide photo, like a magazine cover. Best for reunions, corporate events, milestone parties.',
        layoutPhotoCount: 1,
        backgrounds: onColour,
        options: [
          { key: 'photoPosition', label: 'Photo', choices: aboveBelowChoices, default: 'below' },
          { key: 'textAlign', label: 'Text', choices: alignChoices, default: 'start' },
        ],
      }, () => import('~/components/sections/hero/HeroEditorial.vue')),
      layout({
        key: 'overlay-card',
        name: 'Photo + card',
        description: 'Full photo with the details in a solid card, so the text is always readable. Best for busy or bright photos, outdoor events.',
        layoutPhotoCount: 0,
        backgrounds: onPhoto,
        options: [{ key: 'cardPosition', label: 'Card position', choices: positionChoices, default: 'bottom-left' }],
      }, () => import('~/components/sections/hero/HeroOverlayCard.vue')),
      layout({
        key: 'collage',
        name: 'Collage',
        description: 'Three photos arranged around the names; tells more of a story. Best for birthdays, reunions, pre-nup photos.',
        layoutPhotoCount: 3,
        backgrounds: onColour,
        options: [{
          key: 'textPosition',
          label: 'Text position',
          choices: [
            { value: 'center', label: 'Center' },
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
          ],
          default: 'center',
        }],
      }, () => import('~/components/sections/hero/HeroCollage.vue')),
      layout({
        key: 'banner',
        name: 'Banner',
        description: 'A wide photo strip with the names and details next to it. Best for any event; works with landscape photos.',
        layoutPhotoCount: 1,
        backgrounds: onColour,
        options: [
          { key: 'photoPosition', label: 'Photo', choices: aboveBelowChoices, default: 'above' },
          { key: 'textAlign', label: 'Text', choices: alignChoices, default: 'center' },
        ],
      }, () => import('~/components/sections/hero/HeroBanner.vue')),
      layout({
        key: 'filmstrip',
        name: 'Filmstrip',
        description: 'Names with a row of photos like a film strip; scrolls sideways on phones. Best for pre-nups, reunions, birthdays with lots of photos.',
        layoutPhotoCount: 5,
        backgrounds: onColour,
        options: [
          { key: 'photoPosition', label: 'Photos', choices: aboveBelowChoices, default: 'below' },
          { key: 'textAlign', label: 'Text', choices: alignChoices, default: 'center' },
        ],
      }, () => import('~/components/sections/hero/HeroFilmstrip.vue')),
      layout({
        key: 'polaroid',
        name: 'Polaroids',
        description: 'Two tilted instant photos beside the title. Best for birthdays, debuts, kids\' parties, barkada events.',
        layoutPhotoCount: 2,
        backgrounds: onColour,
        options: [{ key: 'photoSide', label: 'Photos side', choices: sideChoices, default: 'right' }],
      }, () => import('~/components/sections/hero/HeroPolaroid.vue')),
      layout({
        key: 'framed',
        name: 'Framed print',
        description: 'The photo in a wide mat border, like a printed invitation. Best for weddings, anniversaries, formal events.',
        layoutPhotoCount: 1,
        backgrounds: onColour,
        options: [
          { key: 'photoSide', label: 'Photo side', choices: sideChoices, default: 'left' },
          { key: 'textAlign', label: 'Text', choices: alignChoices, default: 'start' },
        ],
      }, () => import('~/components/sections/hero/HeroFramed.vue')),
      layout({
        key: 'offset-frame',
        name: 'Offset frame',
        description: 'The photo laid over a block of colour, like a layered print, with the names, button, date and location beside it. Add more than one photo and they play as a slideshow. Best for weddings, engagements, debuts.',
        layoutPhotoCount: 5,
        backgrounds: onColour,
        options: [{ key: 'photoSide', label: 'Photo side', choices: sideChoices, default: 'right' }],
      }, () => import('~/components/sections/hero/HeroOffsetFrame.vue')),
    ],
  },
  countdown: {
    type: 'countdown',
    name: 'Countdown',
    description: 'A live countdown to the event. The date comes from the event; no venue (that lives in the hero).',
    contentVersion: 1,
    defaultContent: {
      eyebrow: 'Counting down to',
      title: 'Bea & Carlo\'s wedding',
      showSeconds: true,
    },
    // Every layout uses the same fields; the target date always comes from the occasion.
    layouts: [
      layout({
        key: 'boxes',
        name: 'Boxes',
        description: 'Four tiles for days, hours, minutes and seconds. Clear and familiar.',
        layoutPhotoCount: 0,
        backgrounds: onColour,
        options: [{ key: 'textAlign', label: 'Text', choices: alignChoices, default: 'center' }],
      }, () => import('~/components/sections/countdown/CountdownBoxes.vue')),
      layout({
        key: 'minimal',
        name: 'Minimal numbers',
        description: 'Big serif numbers divided by thin lines. No boxes, very elegant.',
        layoutPhotoCount: 0,
        backgrounds: onColour,
        options: [{ key: 'textAlign', label: 'Text', choices: alignChoices, default: 'center' }],
      }, () => import('~/components/sections/countdown/CountdownMinimal.vue')),
      layout({
        key: 'photo',
        name: 'Over a photo',
        description: 'Full photo with a soft overlay and light numbers. Best with a striking photo of the couple or celebrant.',
        layoutPhotoCount: 0,
        backgrounds: onPhoto,
        options: [{ key: 'textPosition', label: 'Text position', choices: positionChoices, default: 'center' }],
      }, () => import('~/components/sections/countdown/CountdownPhoto.vue')),
      layout({
        key: 'split',
        name: 'Split',
        description: 'Photo on one side, the countdown on the other.',
        layoutPhotoCount: 1,
        backgrounds: onColour,
        options: [{ key: 'photoSide', label: 'Photo side', choices: sideChoices, default: 'left' }],
      }, () => import('~/components/sections/countdown/CountdownSplit.vue')),
      layout({
        key: 'rings',
        name: 'Progress rings',
        description: 'Each unit sits in a thin ring that empties as time passes.',
        layoutPhotoCount: 0,
        backgrounds: onColour,
        options: [{ key: 'textAlign', label: 'Text', choices: alignChoices, default: 'center' }],
      }, () => import('~/components/sections/countdown/CountdownRings.vue')),
      layout({
        key: 'flip',
        name: 'Flip clock',
        description: 'Split-flap cards like an airport board. Playful; flips on each tick. Best for birthdays and parties.',
        layoutPhotoCount: 0,
        backgrounds: onColour,
        options: [{ key: 'textAlign', label: 'Text', choices: alignChoices, default: 'center' }],
      }, () => import('~/components/sections/countdown/CountdownFlip.vue')),
      layout({
        key: 'sentence',
        name: 'Sentence',
        description: 'The countdown written as one line of text, like an invitation, with the title in italics.',
        layoutPhotoCount: 0,
        backgrounds: onColour,
        options: [{ key: 'textAlign', label: 'Text', choices: alignChoices, default: 'center' }],
      }, () => import('~/components/sections/countdown/CountdownSentence.vue')),
      layout({
        key: 'days-only',
        name: 'Days only',
        description: 'One huge number of days. Bold and simple; ignores "show seconds".',
        layoutPhotoCount: 0,
        backgrounds: onColour,
        options: [{ key: 'textAlign', label: 'Text', choices: alignChoices, default: 'center' }],
      }, () => import('~/components/sections/countdown/CountdownDaysOnly.vue')),
      layout({
        key: 'calendar',
        name: 'Calendar',
        description: 'A calendar page with the date circled, plus a small countdown. Great as a save-the-date.',
        layoutPhotoCount: 0,
        backgrounds: onColour,
        options: [{ key: 'calendarSide', label: 'Calendar side', choices: sideChoices, default: 'left' }],
      }, () => import('~/components/sections/countdown/CountdownCalendar.vue')),
      layout({
        key: 'strip',
        name: 'Slim strip',
        description: 'A thin band with the date and countdown inline. Fits between other sections.',
        // A band of colour by default, so it reads as a divider
        layoutPhotoCount: 0,
        backgrounds: ['primary', 'accent', 'light', 'photo'],
        options: [{ key: 'dateSide', label: 'Date side', choices: sideChoices, default: 'left' }],
      }, () => import('~/components/sections/countdown/CountdownStrip.vue')),
    ],
  },
}

export function getSectionType<T extends SectionType>(type: T): SectionTypeDefinition<T> {
  return sectionRegistry[type]
}

export function getSectionLayout(type: SectionType, layoutKey: string): SectionLayoutDefinition | undefined {
  return sectionRegistry[type]?.layouts.find(layout => layout.key === layoutKey)
}

/** A section with a different layout: its options reset to that layout's defaults, and the background kept if the layout supports it. */
export function changeSectionLayout<S extends Section>(section: S, layoutKey: string): S {
  const next = getSectionLayout(section.type, layoutKey)
  if (!next)
    return section

  return {
    ...section,
    layout: next.key,
    options: resolveLayoutOptions(next.options, undefined),
    background: next.backgrounds.includes(section.background) ? section.background : next.backgrounds[0]!,
  }
}

/** A new section of the given type: its first layout with that layout's defaults, and the default content. */
export function createDefaultSection<T extends SectionType>(type: T): Section<T> {
  const definition = getSectionType(type)
  const first = definition.layouts[0]!

  return {
    type,
    layout: first.key,
    options: resolveLayoutOptions(first.options, undefined),
    background: first.backgrounds[0]!,
    content: structuredClone(definition.defaultContent),
  }
}
