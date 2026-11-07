import { describe, expect, it } from 'vitest'
import { backgroundPhotoOf, layoutPhotosOf, withBackgroundPhoto, withLayoutPhoto, withoutUnusedPhotos } from '~/features/sections/section.photos'
import { changeSectionLayout, createDefaultSection } from '~/features/sections/section.registry'

const photo = 'https://example.com/photo.jpg'

describe('section photos', () => {
  it('sets and removes the background photo, apart from the layout photos', () => {
    const hero = withBackgroundPhoto(createDefaultSection('hero'), photo)

    expect(backgroundPhotoOf(hero)).toBe(photo)
    expect(layoutPhotosOf(hero)).toEqual([])
    expect(backgroundPhotoOf(withBackgroundPhoto(hero, ''))).toBeUndefined()
  })

  it('sets a hero layout photo by slot, keeping the others in place', () => {
    const hero = withLayoutPhoto(createDefaultSection('hero'), 2, photo)
    expect(layoutPhotosOf(hero)).toEqual(['', '', photo])

    const withFirst = withLayoutPhoto(hero, 0, 'https://example.com/first.jpg')
    expect(layoutPhotosOf(withFirst)).toEqual(['https://example.com/first.jpg', '', photo])

    // Removing the last one drops the empty slots after it
    expect(layoutPhotosOf(withLayoutPhoto(withFirst, 2, undefined))).toEqual(['https://example.com/first.jpg'])
    expect(backgroundPhotoOf(withFirst)).toBeUndefined()
  })

  it.each(['countdown', 'message'] as const)('keeps the %s\'s layout photos in the same list as the hero\'s', (type) => {
    const section = withLayoutPhoto(createDefaultSection(type), 0, photo)

    expect(layoutPhotosOf(section)).toEqual([photo])
    expect(section.content).toMatchObject({ layoutPhotos: [photo] })
    expect(backgroundPhotoOf(section)).toBeUndefined()
    expect(layoutPhotosOf(withLayoutPhoto(section, 0, ''))).toEqual([])
  })
})

describe('withoutUnusedPhotos', () => {
  const photos = ['https://example.com/1.jpg', 'https://example.com/2.jpg', 'https://example.com/3.jpg']

  it('drops the background photo unless the background is Photo', () => {
    const hero = withBackgroundPhoto(createDefaultSection('hero'), photo)

    expect(hero.background).toBe('photo')
    expect(backgroundPhotoOf(withoutUnusedPhotos(hero))).toBe(photo)
    for (const background of ['light', 'primary', 'secondary'] as const)
      expect(withoutUnusedPhotos({ ...hero, background }).content, background).not.toHaveProperty('backgroundPhoto')
  })

  it('keeps only the layout photos the layout has room for', () => {
    const collage = { ...changeSectionLayout(createDefaultSection('hero'), 'collage'), content: { ...createDefaultSection('hero').content, layoutPhotos: photos } }

    expect(layoutPhotosOf(withoutUnusedPhotos(collage))).toEqual(photos)
    expect(layoutPhotosOf(withoutUnusedPhotos({ ...collage, layout: 'split' }))).toEqual(photos.slice(0, 1))
    // Full has no layout photos
    expect(layoutPhotosOf(withoutUnusedPhotos({ ...collage, layout: 'fullscreen' }))).toEqual([])
  })

  it('drops empty slots left at the end after trimming', () => {
    const collage = { ...changeSectionLayout(createDefaultSection('hero'), 'collage'), content: { ...createDefaultSection('hero').content, layoutPhotos: [photos[0]!, '', photos[2]!] } }

    expect(layoutPhotosOf(withoutUnusedPhotos({ ...collage, layout: 'polaroid' }))).toEqual([photos[0]])
  })

  it('keeps photos that belong to items: chapters and people', () => {
    const about = createDefaultSection('about')
    const story = { ...about, content: { ...about.content, timeline: [{ heading: 'Spilled coffee', photo }] } }
    expect(withoutUnusedPhotos(story).content.timeline[0]!.photo).toBe(photo)

    const people = createDefaultSection('people')
    const entourage = { ...changeSectionLayout(people, 'entourage'), content: { ...people.content, people: [{ id: 'a', name: 'Bea', photo }] } }
    expect(withoutUnusedPhotos(entourage).content.people[0]!.photo).toBe(photo)
  })

  it('leaves the section it is given unchanged', () => {
    const hero = { ...withBackgroundPhoto(createDefaultSection('hero'), photo), background: 'light' as const }

    withoutUnusedPhotos(hero)
    expect(backgroundPhotoOf(hero)).toBe(photo)
  })
})
