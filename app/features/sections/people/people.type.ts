// One person in the people section. A couple is one entry ("Mr. & Mrs. Jose Santos").
export interface PersonItem {
  // Stable key for drag-to-reorder and v-for (generated when added)
  id: string
  name: string
  // e.g. "Principal sponsors"; also the group heading in `entourage` (people next to each other with the same role
  // share it, so no group field is needed)
  role?: string
  // Ignored by `entourage` and `credits`; a missing photo shows a soft placeholder
  photo?: string
  // Optional; shown only by the layouts with room for it (`cards`, `spotlight`)
  bio?: string
}

// Every field a people layout can use (`people.role`, `.photo`, `.bio`: each person's)
export const peopleFields = ['eyebrow', 'heading', 'people', 'people.role', 'people.photo', 'people.bio'] as const
export type PeopleField = (typeof peopleFields)[number]

// Every people layout uses the same fields: who's who (the entourage, hosts, speakers, a committee…), in the host's
// order. Photos belong to the people, so the section has no layout photos.
export interface PeopleContent {
  // Small label, e.g. "The entourage"
  eyebrow?: string
  heading: string
  people: PersonItem[]
  // The photo behind the section on the `photo` background (any layout, under an overlay); without it the section
  // uses the primary colour. Never shown inside a layout.
  backgroundPhoto?: string
}
