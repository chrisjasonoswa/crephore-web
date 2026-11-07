import type { AboutTimelineItem } from './about.type'

// Enough for a full story; more would make the timeline layouts very long
export const aboutTimelineMaxItems = 12

export function blankTimelineItem(): AboutTimelineItem {
  return { eyebrow: '', heading: '', body: '' }
}
