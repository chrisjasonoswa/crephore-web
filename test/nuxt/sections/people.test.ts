import { describe, expect, it } from 'vitest'
import { blankPerson, groupPeopleByRole, peopleLayoutShowsBio, peopleLayoutShowsPhotos } from '~/features/sections/people/people.helpers'
import { layoutPhotosOf, withLayoutPhoto } from '~/features/sections/section.photos'
import { createDefaultSection } from '~/features/sections/section.registry'

describe('people helpers', () => {
  it('groups people next to each other with the same role, trimming roles and keeping order', () => {
    const groups = groupPeopleByRole([
      { id: '1', name: 'A', role: 'Sponsors' },
      { id: '2', name: 'B', role: 'Sponsors ' },
      { id: '3', name: 'C' },
      { id: '4', name: 'D', role: '' },
      { id: '5', name: 'E', role: 'Sponsors' },
    ])

    expect(groups.map(group => [group.role, group.people.map(person => person.name)])).toEqual([
      ['Sponsors', ['A', 'B']],
      [undefined, ['C', 'D']],
      ['Sponsors', ['E']],
    ])
  })

  it('tells which layouts show photos and bios', () => {
    expect(['grid', 'entourage', 'credits', 'directory'].map(peopleLayoutShowsPhotos)).toEqual([true, false, false, true])
    expect(['cards', 'spotlight', 'grid'].map(peopleLayoutShowsBio)).toEqual([true, true, false])
  })

  it('gives each new person a unique id', () => {
    expect(blankPerson().id).not.toBe(blankPerson().id)
  })

  it('has no layout photos: the photos belong to the people', () => {
    const section = createDefaultSection('people')

    expect(layoutPhotosOf(section)).toEqual([])
    expect(withLayoutPhoto(section, 0, 'https://example.com/a.jpg')).toBe(section)
  })
})
