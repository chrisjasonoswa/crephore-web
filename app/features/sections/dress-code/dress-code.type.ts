// Every field a dress-code layout can use (the inspiration photos are `layoutPhotos`, counted by `layoutPhotoCount`)
export const dressCodeFields = ['eyebrow', 'heading', 'attire', 'description', 'colours', 'avoidColours'] as const
export type DressCodeField = (typeof dressCodeFields)[number]

// A colour guests are asked to wear (or avoid): its name as guests read it ("Sage") and its colour (`#RRGGBB`)
export interface DressColour {
  // Stable key for reordering
  id: string
  name: string
  hex: string
}

// What guests should wear: the attire motif in the host's own words ("Garden formal", "Rustic boho"), a description,
// the colours to wear and those to avoid, plus inspiration photos where the layout has room. The compact layouts are
// one-line reminders (no description or photos).
export interface DressCodeContent {
  // Small label, e.g. "What to wear"
  eyebrow?: string
  heading: string
  // The attire motif as guests read it; optional in every layout (each leaves it out without one). Before content
  // version 2 it was a preset's key, with the host's own words in `attireLabel` (section.upgrade.ts).
  attire?: string
  // e.g. "Light suits or barong for gentlemen; long dresses or Filipiniana for ladies."
  description?: string
  // Suggested colours, in order (up to `dressColourMax`)
  colours: DressColour[]
  // Colours to avoid, e.g. white and ivory at a wedding (up to `dressColourMax`)
  avoidColours: DressColour[]
  // The photo behind the section on the `photo` background (any layout, under an overlay); never shown inside one
  backgroundPhoto?: string
  // Inspiration photos inside the layout, in order (up to `inspirationPhotoMax`; a missing one shows a placeholder)
  layoutPhotos: string[]
}
