import type { Section } from './section.type'
import { getSectionLayout } from './section.registry'

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

/**
 * The section without the photos it doesn't show: the background photo unless the background is Photo, and layout
 * photos past what the layout has room for (`layoutPhotoCount`). Applied when saving only: while editing, the draft
 * keeps them, so switching back to the photo background or a roomier layout shows them again without uploading anew.
 * Photos that belong to items (an about chapter's, a person's) are content and stay.
 */
export function withoutUnusedPhotos<S extends Section>(section: S): S {
  const content: Record<string, unknown> = { ...section.content }
  if (section.background !== 'photo')
    delete content.backgroundPhoto
  if ('layoutPhotos' in section.content) {
    const room = getSectionLayout(section.type, section.layout)?.layoutPhotoCount ?? 0
    const photos = section.content.layoutPhotos.slice(0, room)
    while (photos.length && !photos.at(-1))
      photos.pop()
    content.layoutPhotos = photos
  }
  return { ...section, content: content as unknown as S['content'] }
}
