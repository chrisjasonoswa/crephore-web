import { describe, expect, it } from 'vitest'

// Every section component's source, so the rule below covers new layouts automatically.
const sectionSources = import.meta.glob<string>('/app/components/sections/**/*.vue', {
  query: '?raw',
  import: 'default',
  eager: true,
})

// The opening tags of a component's template (they may span lines and hold quoted `>` in bindings)
const tagsOf = (source: string) => source.slice(source.indexOf('<template>')).match(/<[a-z][^<>]*?(?:"[^"]*"[^<>]*?)*>/gi) ?? []

describe('heading text in capitals', () => {
  // A script heading font in capitals can't be read, so heading-font text uses `--site-font-heading-case` (none for a
  // script), never `uppercase`
  it.each(Object.entries(sectionSources))('sets heading-font text in capitals only through the theme (%s)', (_, source) => {
    const offending = tagsOf(source).filter(tag => tag.includes('site-font-heading)') && /(?<![\w-])uppercase(?![\w-])/.test(tag))

    expect(offending).toEqual([])
  })
})
