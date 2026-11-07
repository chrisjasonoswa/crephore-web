import { describe, expect, it } from 'vitest'
import { blankPerson, groupPeopleByRole, personInitials } from '~/features/sections/people/people.helpers'
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

  it('makes up to two initials from the first and last names, skipping titles', () => {
    expect(personInitials('Bea Santos')).toBe('BS')
    expect(personInitials('Ana Maria de la Cruz')).toBe('AC')
    expect(personInitials('Lucas')).toBe('L')
    expect(personInitials('Mr. & Mrs. Jose Santos')).toBe('JS')
    expect(personInitials('Atty. Luis Cruz')).toBe('LC')
    expect(personInitials('tita lorna')).toBe('TL')
    expect(personInitials('Ñoño Ábalos')).toBe('ÑÁ')
    expect(personInitials('')).toBe('')
    expect(personInitials('  &  ')).toBe('')
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
