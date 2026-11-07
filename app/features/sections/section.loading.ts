import type { InjectionKey } from 'vue'

// Whether a section's photos load right away (the page's first section, the one guests see first) or only as they
// scroll near it (`loading="lazy"`), so a page full of photos doesn't download them all up front. SectionRenderer
// provides it (`priority`); the photo components read it with `usePhotoLoading`.
export const sectionPriorityKey: InjectionKey<boolean> = Symbol('sectionPriority')

export const usePhotoLoading = () => (inject(sectionPriorityKey, false) ? 'eager' : 'lazy')
