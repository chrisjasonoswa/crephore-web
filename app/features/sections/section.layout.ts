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

// Every layout offers all four backgrounds; most start on a colour, with the background photo last
export const colours: SectionBackground[] = ['light', 'primary', 'secondary']
export const onColour: SectionBackground[] = [...colours, 'photo']
// Paper (a card, a postcard, an instant photo) stands out on a colour, so these start on the secondary
export const onPaper: SectionBackground[] = ['secondary', 'light', 'primary', 'photo']
