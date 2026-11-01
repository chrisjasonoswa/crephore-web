import type { Section } from './section.type'

// Reading and setting a section's photos without knowing its type. Every type keeps the background photo
// (`backgroundPhoto`) apart from the photos inside its layout (`layoutPhotos`, in order). Types whose photos belong
// to their items (the people section's people) have no layout photos.

export function backgroundPhotoOf(section: Section): string | undefined {
  return section.content.backgroundPhoto
}

/** The section with a new background photo; empty removes it. */
export function withBackgroundPhoto<S extends Section>(section: S, url: string | undefined): S {
  return { ...section, content: { ...section.content, backgroundPhoto: url || undefined } }
}

/** The photos inside the layout, by slot (empty strings for gaps); none for types without layout photos. */
export function layoutPhotosOf(section: Section): string[] {
  return 'layoutPhotos' in section.content ? section.content.layoutPhotos : []
}

/** The section with the layout photo at `index` set; empty removes it (the layout shows a placeholder there). */
export function withLayoutPhoto<S extends Section>(section: S, index: number, url: string | undefined): S {
  if (!('layoutPhotos' in section.content))
    return section
  // Keeps the other slots in place; gaps stay empty strings so later photos keep their position
  const photos = [...section.content.layoutPhotos]
  while (photos.length < index)
    photos.push('')
  photos[index] = url ?? ''
  while (photos.length && !photos.at(-1))
    photos.pop()
  return { ...section, content: { ...section.content, layoutPhotos: photos } }
}
