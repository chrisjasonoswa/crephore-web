import type { SectionContentMap, SectionType } from './section.type'
import { getSectionType } from './section.registry'

// Saved content is stored with the content version of its type at the time (`contentVersion`). When a type's fields
// change, its version goes up in the registry and a step here turns the previous version's content into the new one,
// so websites saved (and published) before still load. Steps run in order from the saved version to the current one.
export type UpgradeStep = (content: Record<string, unknown>) => Record<string, unknown>
export type UpgradeSteps = { [T in SectionType]?: Record<number, UpgradeStep> }

// The dress code's former attire presets, as guests read them (for the 1 → 2 step only; never add to it)
const attireWords: Record<string, string> = {
  'white-tie': 'White tie',
  'black-tie': 'Black tie',
  'black-tie-optional': 'Black tie optional',
  'formal': 'Formal',
  'garden-formal': 'Garden formal',
  'semi-formal': 'Semi-formal',
  'cocktail': 'Cocktail',
  'smart-casual': 'Smart casual',
  'casual': 'Casual',
  'beach': 'Beach',
  'filipiniana-barong': 'Filipiniana & barong',
  'themed': 'Themed',
}

// A step looks like
//   countdown: { 1: ({ title, ...content }) => ({ ...content, heading: title }) }   // 1 → 2: `title` became `heading`
const upgrades: UpgradeSteps = {
  // 1 → 2: the heading, date and venue come from the event, so the saved ones are dropped
  hero: { 1: ({ heading: _heading, date: _date, venue: _venue, ...content }) => content },
  // 1 → 2: the heading comes from the event, so the saved one is dropped
  countdown: { 1: ({ heading: _heading, ...content }) => content },
  program: {
    // 1 → 2: the program got layout photos (the vertical title's and photo cards' photo)
    1: content => ({ ...content, layoutPhotos: content.layoutPhotos ?? [] }),
    // 2 → 3: the venue and items come from the event's program, so the saved ones are dropped
    2: ({ venue: _venue, items: _items, ...content }) => content,
    // 3 → 4: the venues block got its own heading (and optional eyebrow and description)
    3: content => ({ ...content, venuesHeading: content.venuesHeading ?? 'Getting there' }),
  },
  // 1 → 2: the attire was a preset's key (or `custom` with the host's words in `attireLabel`); it's the host's own
  // words now, so a preset becomes the words guests saw
  'dress-code': {
    1: ({ attire, attireLabel, ...content }) => {
      const words = attire === 'custom' ? String(attireLabel ?? '').trim() : attireWords[String(attire)] ?? ''
      return { ...content, ...(words && { attire: words }) }
    },
  },
}

/** Saved content brought up to the type's current content version (`steps` only for tests). */
export function upgradeSectionContent<T extends SectionType>(
  type: T,
  content: SectionContentMap[T],
  version: number,
  steps: UpgradeSteps = upgrades,
): SectionContentMap[T] {
  let current = content as unknown as Record<string, unknown>
  for (let from = version; from < getSectionType(type).contentVersion; from++)
    current = steps[type]?.[from]?.(current) ?? current
  return current as unknown as SectionContentMap[T]
}
