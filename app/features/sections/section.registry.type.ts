import type { Component } from 'vue'
import type { SectionLayoutOption } from './section.options'
import type { SectionBackground, SectionContentMap, SectionType } from './section.type'

export interface SectionLayoutDefinition {
  // Stored on the section (`Section.layout`); never rename once used.
  key: string
  name: string
  // What it looks like and when to use it (shown in pickers)
  description: string
  // One component per layout, named after the key (`overlay-card` → HeroOverlayCard.vue).
  // Loaded on demand so event pages only download the layouts they use.
  component: Component
  // The backgrounds it supports; the first is the default for new sections. Pickers always show them in the same
  // order (`inPickerOrder`), whatever the default.
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
