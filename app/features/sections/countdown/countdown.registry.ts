import type { SectionTypeDefinition } from '../section.registry.type'
import { alignChoices, positionChoices, sideChoices } from '../section.options'
import { colours, layout, onColour } from '../section.layout'

// The countdown section type and its layouts, in picker order (see section.registry.ts).
export const countdownSection: SectionTypeDefinition<'countdown'> = {
  type: 'countdown',
  name: 'Countdown',
  description: 'A live countdown to the event. The date comes from the event; no venue (that lives in the hero).',
  contentVersion: 1,
  defaultContent: {
    eyebrow: 'Counting down to',
    heading: 'Bea & Carlo\'s wedding',
    showSeconds: true,
    layoutPhotos: [],
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
      name: 'Full',
      description: 'Big numbers and the date fill the section, placed anywhere in it. Striking over a photo of the couple or celebrant, or on a colour.',
      // On the background photo by default, like the hero's Full; the colours work too
      layoutPhotoCount: 0,
      backgrounds: ['photo', ...colours],
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
      description: 'The countdown written as one line of text, like an invitation, with the heading in italics.',
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
}
