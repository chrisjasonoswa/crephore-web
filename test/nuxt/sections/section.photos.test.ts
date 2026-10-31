import { describe, expect, it } from 'vitest'
import { backgroundPhotoOf, layoutPhotosOf, withBackgroundPhoto, withLayoutPhoto } from '~/features/sections/section.photos'
import { createDefaultSection } from '~/features/sections/section.registry'

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

  it('sets the countdown\'s single layout photo', () => {
    const countdown = withLayoutPhoto(createDefaultSection('countdown'), 0, photo)

    expect(layoutPhotosOf(countdown)).toEqual([photo])
    expect(countdown.content).toMatchObject({ layoutPhoto: photo })
    expect(backgroundPhotoOf(countdown)).toBeUndefined()
    expect(layoutPhotosOf(withLayoutPhoto(countdown, 0, ''))).toEqual([undefined])
  })
})
