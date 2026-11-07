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
  // The section's fields this layout shows (from its type's `fields`); the editor offers only these, and the rest of
  // the content is kept for layouts that show it. `required`: the ones it needs filled in. `labels`: a field's label in
  // this layout, when it reads differently here (the about story is the timelines' intro)
  fields: readonly string[]
  required?: readonly string[]
  labels?: Readonly<Record<string, string>>
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
  // Every field its layouts can use (`<type>Fields` in <type>.type.ts); `list.field` names a field of a list's items,
  // e.g. `timeline.photo`. Photos aren't fields: the background photo and `layoutPhotoCount` cover them.
  fields: readonly string[]
  // What the editor's notes call a field ("This layout needs at least one chapter."): a word for text, or one and many
  // for a list. Only the fields a layout can require or leave out need one.
  fieldNames?: Readonly<Record<string, string | readonly [string, string]>>
  layouts: SectionLayoutDefinition[]
}
