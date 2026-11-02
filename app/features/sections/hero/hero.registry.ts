import type { SectionTypeDefinition } from '../section.registry.type'
import { aboveBelowChoices, alignChoices, positionChoices, sideChoices } from '../section.options'
import { colours, layout, onColour } from '../section.layout'

// The hero section type and its layouts, in picker order (see section.registry.ts).
export const heroSection: SectionTypeDefinition<'hero'> = {
  type: 'hero',
  name: 'Hero',
  description: 'The opening of the page: names, date, place, photos and the RSVP button.',
  contentVersion: 1,
  defaultContent: {
    eyebrow: 'Together with their families',
    heading: 'Bea & Carlo',
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
      name: 'Floating card',
      description: 'The details in a solid card placed anywhere in the section, so the text is always readable. Best over busy or bright photos, or on a colour.',
      // On the background photo by default; the colours work too
      layoutPhotoCount: 0,
      backgrounds: ['photo', ...colours],
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
      description: 'Two tilted instant photos beside the names. Best for birthdays, debuts, kids\' parties, barkada events.',
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
}
