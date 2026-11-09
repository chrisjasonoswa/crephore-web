import type { SectionLayoutDefinition, SectionTypeDefinition } from './section.registry.type'
import type { SectionType } from './section.type'

// A section type has fields (its `fields`); each layout shows some of them (`fields`) and may need some filled in
// (`required`). The editor asks the layout what to offer; content a layout doesn't show is kept for layouts that do.

type LayoutFieldInfo = Pick<SectionLayoutDefinition, 'fields' | 'required' | 'labels'>

/**
 * What a layout does with its section's fields, for the editor. `F`: the type's field names (`AboutField`, …), so a
 * misspelt field is a type error: `layoutFields<AboutField>(layout).uses('timeline')`.
 */
export function layoutFields<F extends string>(layout: LayoutFieldInfo) {
  return {
    uses: (field: F) => layout.fields.includes(field),
    requires: (field: F) => !!layout.required?.includes(field),
    label: (field: F, fallback: string) => layout.labels?.[field] ?? fallback,
  }
}

// Filled in: a list with items, else text that isn't blank
const hasValue = (value: unknown) => (Array.isArray(value) ? value.length > 0 : !!String(value ?? '').trim())

/** The fields the layout requires that are still empty. */
export function missingFields(layout: LayoutFieldInfo, content: object): string[] {
  const values = content as Record<string, unknown>
  return (layout.required ?? []).filter(field => !hasValue(values[field]))
}

// "a message", "an attire motif"
const article = (name: string) => (/^[aeiou]/i.test(name) ? 'an' : 'a')

/**
 * The editor's notes for what a section's layout needs that's still empty ("This layout needs at least one chapter.",
 * "This layout needs a message."), naming fields by the type's `fieldNames`. (Content a layout doesn't show needs no
 * note: the editor only offers the fields the layout shows.)
 */
export function missingNotes(definition: Pick<SectionTypeDefinition<SectionType>, 'fieldNames'>, layout: LayoutFieldInfo, content: object): string[] {
  return missingFields(layout, content).map((field) => {
    const name = definition.fieldNames?.[field] ?? field
    return typeof name === 'string' ? `This layout needs ${article(name)} ${name}.` : `This layout needs at least one ${name[0]}.`
  })
}
