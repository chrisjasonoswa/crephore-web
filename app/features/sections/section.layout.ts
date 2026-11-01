import type { Component } from 'vue'
import type { SectionBackground } from './section.type'
import type { SectionLayoutDefinition } from './section.registry.type'
import { defineAsyncComponent } from 'vue'

// Shared by the section types' registry files: `layout()` defines one layout (its component loaded on demand), and the
// background lists most layouts use.

type LayoutLoader = () => Promise<{ default: Component }>

export function layout(
  definition: Omit<SectionLayoutDefinition, 'component'>,
  load: LayoutLoader,
): SectionLayoutDefinition {
  return { ...definition, component: defineAsyncComponent(load) }
}

// Photo-backed layouts only use the background photo; the others start on a colour, with the background photo last
export const onPhoto: SectionBackground[] = ['photo']
export const colours: SectionBackground[] = ['light', 'primary', 'accent']
export const onColour: SectionBackground[] = [...colours, 'photo']
// Paper (a card, a postcard, an instant photo) stands out on a colour, so these start on the accent
export const onPaper: SectionBackground[] = ['accent', 'light', 'primary', 'photo']
