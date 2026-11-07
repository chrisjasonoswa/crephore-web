import type { IntroContent } from './scenes/scene.kit'
import type { Section, SectionOccasion } from '~/features/sections/section.type'
import type { EventKind } from '~/site-theme/eventKinds'
import { formatOccasionDate } from '~/features/sections/countdown/countdown.helpers'
import { formatLifeDates } from '~/features/sections/hero/hero.helpers'
import { resolveBackground } from '~/features/sections/section.background'
import { programDays, programSpeakers } from '~/features/sections/program/program.helpers'

// Two names joined by "&" or "and" ("Bea & Carlo", "ana and paolo")
const COUPLE = /\s+(?:&|and)\s+/i

/** "B & C" for two names, else the first letters of the title's first two words ("M", "NS"). */
export function introInitials(title: string): string {
  const names = title.split(COUPLE).map(name => name.trim()).filter(Boolean)
  if (names.length === 2)
    return names.map(name => name[0]!.toUpperCase()).join(' & ')
  return title.split(/\s+/).filter(word => /^\p{L}/u.test(word)).slice(0, 2).map(word => word[0]!.toUpperCase()).join('')
}

const plural = (value: number, one: string, many: string) => ({ value, label: value === 1 ? one : many })

/**
 * What the scene intros show: the event's name (the hero's heading) and venue, the hero's eyebrow, the event's date
 * (month first, as every intro writes it), the program's titles and numbers, a memorial's life dates (as its hero shows them), and the kind of event
 * (for sample text that suits it). Used by the published site, the editor's preview and the playground, so a scene
 * reads the same everywhere.
 */
export function introContentFor(sections: Section[], occasion: SectionOccasion | null | undefined, kind: EventKind): IntroContent {
  const heroSection = sections.find((section): section is Section<'hero'> => section.type === 'hero')
  const hero = heroSection?.content
  const hasProgram = sections.some(section => section.type === 'program')
  const title = occasion?.name.trim() ?? ''
  // The program's numbers only when the website shows it
  const items = hasProgram ? occasion?.program.items ?? [] : []

  // Month first: "02 · 14 · 2027", "Sunday, February 14, 2027"
  const [day, month, year] = occasion ? formatOccasionDate(occasion, 'numeric').split(' · ') : []
  const long = occasion
    ? new Intl.DateTimeFormat('en-US', { timeZone: occasion.timezone, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(occasion.startsAt))
    : undefined
  const speakers = new Set(items.flatMap(item => programSpeakers(item.speakers)))

  return {
    title,
    eyebrow: hero?.eyebrow?.trim() || undefined,
    initials: introInitials(title),
    firstName: title.split(/\s+/)[0]?.replace(/[^\p{L}\p{N}'’-]/gu, '') ?? '',
    dateLong: long,
    dateNumeric: day && month && year ? [month, day, year].join(' · ') : undefined,
    venue: occasion?.venue.trim() || undefined,
    programTitles: items.map(item => item.title.trim()).filter(Boolean),
    stats: [
      plural(programDays(items).length, 'day', 'days'),
      plural(items.length, 'session', 'sessions'),
      plural(speakers.size, 'speaker', 'speakers'),
    ].filter(stat => stat.value > 0),
    // A memorial's life dates as the hero shows them (its Life dates choice), once the event has both
    lifeDates: occasion && hero?.lifeDates ? formatLifeDates(occasion, hero.lifeDates) : undefined,
    kind,
    heroBackground: heroSection && resolveBackground(heroSection.background, heroSection.content.backgroundPhoto),
  }
}
