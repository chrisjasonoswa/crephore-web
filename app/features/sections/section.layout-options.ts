import type { LayoutOptionCatalogue } from './section.options'
import { aboveBelowChoices, alignChoices, alignWithEndChoices, positionChoices, sideChoices } from './section.options'

// Layout options several section types share, each defined once with the same meaning everywhere. An option moves here
// when a second type needs it; until then it stays in its type's catalogue (`<type>SectionLayoutOptions`). A key is in
// only one catalogue. Layouts pick them by key (`pickLayoutOptions`), changing a default, label or choices as needed.
export const allSectionLayoutOptions = {
  // Where the eyebrow and heading sit, with what goes with them (the program's and venues' titles, the dress code's
  // attire): left, centred or right
  titleAlign: { label: 'Titles', choices: alignWithEndChoices, default: 'center' },
  // Text left or centred (the dress code's also right)
  textAlign: { label: 'Text', choices: alignChoices, default: 'center' },
  // Which side the photo (or photos, labelled "Photos side") is on
  photoSide: { label: 'Photo side', choices: sideChoices, default: 'left' },
  // The photo above or below the text ("Photos" with several)
  photoPosition: { label: 'Photo', choices: aboveBelowChoices, default: 'below' },
  // Where the text sits over the photo, on a 3×3 grid
  textPosition: { label: 'Text position', choices: positionChoices, default: 'center' },
} as const satisfies LayoutOptionCatalogue
