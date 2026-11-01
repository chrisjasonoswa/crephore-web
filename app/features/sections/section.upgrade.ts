import type { SectionContentMap, SectionType } from './section.type'
import { getSectionType } from './section.registry'

// Saved content is stored with the content version of its type at the time (`contentVersion`). When a type's fields
// change, its version goes up in the registry and a step here turns the previous version's content into the new one,
// so websites saved (and published) before still load. Steps run in order from the saved version to the current one.
export type UpgradeStep = (content: Record<string, unknown>) => Record<string, unknown>
export type UpgradeSteps = { [T in SectionType]?: Record<number, UpgradeStep> }

// Every type is at version 1 (nothing was saved before the current fields), so there are no steps yet. A step looks like
//   countdown: { 1: ({ title, ...content }) => ({ ...content, heading: title }) }   // 1 → 2: `title` became `heading`
const upgrades: UpgradeSteps = {}

/** Saved content brought up to the type's current content version (`steps` only for tests). */
export function upgradeSectionContent<T extends SectionType>(
  type: T,
  content: SectionContentMap[T],
  version: number,
  steps: UpgradeSteps = upgrades,
): SectionContentMap[T] {
  let current = content as unknown as Record<string, unknown>
  for (let from = version; from < getSectionType(type).contentVersion; from++)
    current = steps[type]?.[from]?.(current) ?? current
  return current as unknown as SectionContentMap[T]
}
