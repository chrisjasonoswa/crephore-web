import { describe, expect, it } from 'vitest'

// Every layout's source except the hero's (it has its own padding), so the rule covers new layouts automatically
const layoutSources = Object.entries(import.meta.glob<string>('/app/components/sections/*/*.vue', {
  query: '?raw',
  import: 'default',
  eager: true,
})).filter(([path, source]) => !path.includes('/hero/') && source.includes('<SectionFrame'))

describe('the sections\' content frame', () => {
  it('finds the layouts', () => {
    expect(layoutSources.length).toBeGreaterThan(80)
  })

  // Sections line up with each other: their sides come from the shared frame (`--site-edge`, at most 1280px of content,
  // or `--site-gutter` inside a narrower column), never their own side padding or a 1024px / 1152px cap
  it.each(layoutSources)('pads its sides with the shared frame (%s)', (_, source) => {
    expect(source).toMatch(/px-\(--site-(edge|gutter)\)/)
    expect(source).not.toMatch(/max-w-(5xl|6xl)\b/)
    expect(source).not.toMatch(/<SectionFrame\b[^>]*class="[^"]*(?<![\w-])px-\d/)
  })
})
