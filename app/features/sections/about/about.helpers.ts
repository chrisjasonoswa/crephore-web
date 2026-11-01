import type { AboutTimelineItem } from './about.type'

// The about section's layouts come in two kinds: story layouts (the body and photos) and timeline layouts (the
// chapters), keyed `timeline-…`. The editor shows each kind's fields.

export const isAboutTimelineLayout = (layoutKey: string) => layoutKey.startsWith('timeline-')

// The compact timeline is text only
export const aboutTimelineShowsPhotos = (layoutKey: string) => layoutKey !== 'timeline-compact'

// Enough for a full story; more would make the timeline layouts very long
export const aboutTimelineMaxItems = 12

export function blankTimelineItem(): AboutTimelineItem {
  return { eyebrow: '', heading: '', body: '' }
}
