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

/** The section's filled-in fields (not a list's item fields) that the layout doesn't show: kept for layouts that do. */
export function hiddenFields(all: readonly string[], layout: LayoutFieldInfo, content: object): string[] {
  const values = content as Record<string, unknown>
  return all.filter(field => !field.includes('.') && !layout.fields.includes(field) && hasValue(values[field]))
}

/**
 * The editor's notes for a section in its layout: what the layout needs that's still empty ("This layout needs at least
 * one chapter."), and what's filled in but not shown ("This layout doesn't show your 3 chapters. They're kept for layouts
 * that do."). Fields are named by the type's `fieldNames`.
 */
export function fieldNotes(
  definition: Pick<SectionTypeDefinition<SectionType>, 'fields' | 'fieldNames'>,
  layout: LayoutFieldInfo,
  content: object,
): { missing: string[], hidden: string[] } {
  const values = content as Record<string, unknown>
  const nameOf = (field: string) => definition.fieldNames?.[field] ?? field
  return {
    missing: missingFields(layout, content).map((field) => {
      const name = nameOf(field)
      return typeof name === 'string' ? `This layout needs a ${name}.` : `This layout needs at least one ${name[0]}.`
    }),
    hidden: hiddenFields(definition.fields, layout, content).map((field) => {
      const name = nameOf(field)
      const value = values[field]
      if (typeof name === 'string' || !Array.isArray(value))
        return `This layout doesn't show your ${typeof name === 'string' ? name : name[0]}. It's kept for layouts that do.`
      return value.length === 1
        ? `This layout doesn't show your ${name[0]}. It's kept for layouts that do.`
        : `This layout doesn't show your ${value.length} ${name[1]}. They're kept for layouts that do.`
    }),
  }
}
