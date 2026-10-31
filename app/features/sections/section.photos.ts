import type { CountdownContent, HeroContent } from './section.content.type'
import type { Section } from './section.type'

// Reading and setting a section's photos without knowing its type. Every type keeps the background photo
// (`backgroundPhoto`) apart from the photos inside its layout (`layoutPhotos` or `layoutPhoto`).

export function backgroundPhotoOf(section: Section): string | undefined {
  return section.content.backgroundPhoto
}

/** The section with a new background photo; empty removes it. */
export function withBackgroundPhoto<S extends Section>(section: S, url: string | undefined): S {
  return { ...section, content: { ...section.content, backgroundPhoto: url || undefined } }
}

/** The photos inside the layout, by slot (the hero's list, the countdown's single photo). */
export function layoutPhotosOf(section: Section): (string | undefined)[] {
  switch (section.type) {
    case 'hero':
      return (section.content as HeroContent).layoutPhotos
    case 'countdown':
      return [(section.content as CountdownContent).layoutPhoto]
  }
}

/** The section with the layout photo at `index` set; empty removes it (the layout shows a placeholder there). */
export function withLayoutPhoto<S extends Section>(section: S, index: number, url: string | undefined): S {
  switch (section.type) {
    case 'hero': {
      // Keeps the other slots in place; gaps stay empty strings so later photos keep their position
      const photos = [...(section.content as HeroContent).layoutPhotos]
      while (photos.length < index)
        photos.push('')
      photos[index] = url ?? ''
      while (photos.length && !photos.at(-1))
        photos.pop()
      return { ...section, content: { ...section.content, layoutPhotos: photos } }
    }
    case 'countdown':
      return { ...section, content: { ...section.content, layoutPhoto: url || undefined } }
    default:
      return section
  }
}
