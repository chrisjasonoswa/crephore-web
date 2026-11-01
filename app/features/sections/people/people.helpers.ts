import type { PersonItem } from './people.type'

// What each people layout shows, so the editor only offers the fields the layout uses.

// Names only (`entourage`) or text only (`credits`)
export const peopleLayoutShowsPhotos = (layoutKey: string) => !['entourage', 'credits'].includes(layoutKey)

// Only the layouts with room for it
export const peopleLayoutShowsBio = (layoutKey: string) => ['cards', 'spotlight'].includes(layoutKey)

// Enough for a full entourage with sponsors; more would make the page very long
export const peopleMaxItems = 60

export function blankPerson(): PersonItem {
  return { id: crypto.randomUUID(), name: '' }
}

/** People next to each other with the same role, as one group under that role (the `entourage` layout). */
export function groupPeopleByRole(people: PersonItem[]): { role?: string, people: PersonItem[] }[] {
  const groups: { role?: string, people: PersonItem[] }[] = []
  for (const person of people) {
    const role = person.role?.trim() || undefined
    const last = groups.at(-1)
    if (last && last.role === role)
      last.people.push(person)
    else
      groups.push({ role, people: [person] })
  }
  return groups
}

// Photo shapes the layouts offer (`photoShape`), as size-free classes
export const personPhotoShapes = {
  circle: 'aspect-square rounded-full',
  arch: 'aspect-3/4 rounded-t-full',
  square: 'aspect-square rounded-(--site-radius)',
  // Tall, with the site's corners
  rounded: 'aspect-3/4 rounded-(--site-radius)',
} as const

/*
 * Item widths for a wrapping row that shows `n` a row and centres a row that isn't full (a grid would leave a gap on
 * one side). Written out so Tailwind finds them: phones show two (one for cards), wider screens three, and the
 * layout's `columns` option from 768px. For `gap-x-6` (1.5rem) between items.
 */
export const peopleRowWidths: Record<string, string> = {
  1: '@3xl:w-full',
  2: '@3xl:w-[calc((100%-1.5rem)/2)]',
  3: '@3xl:w-[calc((100%-3rem)/3)]',
  4: '@3xl:w-[calc((100%-4.5rem)/4)]',
  5: '@3xl:w-[calc((100%-6rem)/5)]',
}
