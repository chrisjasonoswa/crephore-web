import { describe, expect, it } from 'vitest'
import { groupedChoices, overlayFor, positionClasses, positionChoices, resolveLayoutOptions } from '~/features/sections/section.options'

describe('resolveLayoutOptions', () => {
  const options = [
    { key: 'photoSide', label: 'Photo side', choices: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }], default: 'right' },
    { key: 'textPosition', label: 'Text position', choices: positionChoices, default: 'center' },
  ]

  it('fills in defaults', () => {
    expect(resolveLayoutOptions(options, undefined)).toEqual({ photoSide: 'right', textPosition: 'center' })
  })

  it('keeps stored values the layout offers, and drops the rest', () => {
    expect(resolveLayoutOptions(options, { photoSide: 'left', textPosition: 'nowhere', other: 'x' }))
      .toEqual({ photoSide: 'left', textPosition: 'center' })
  })
})

describe('groupedChoices', () => {
  it('puts choices without a group first, then each group in the order it first appears', () => {
    const groups = groupedChoices([
      { value: 'a', label: 'A', group: 'One' },
      { value: 'none', label: 'None' },
      { value: 'b', label: 'B', group: 'Two' },
      { value: 'c', label: 'C', group: 'One' },
    ])

    expect(groups.map(group => [group.group, group.choices.map(choice => choice.value)])).toEqual([
      [undefined, ['none']],
      ['One', ['a', 'c']],
      ['Two', ['b']],
    ])
  })
})

describe('positionClasses', () => {
  it.each([
    ['top-left', 'justify-start', 'items-start', 'start'],
    ['top', 'justify-start', 'items-center', 'center'],
    ['right', 'justify-center', 'items-end', 'end'],
    ['center', 'justify-center', 'items-center', 'center'],
    ['bottom-right', 'justify-end', 'items-end', 'end'],
  ] as const)('places %s', (position, justify, items, align) => {
    expect(positionClasses(position)).toEqual({ justify, items, align })
  })
})

describe('overlayFor', () => {
  it.each([
    ['top-left', 'top'],
    ['bottom', 'bottom'],
    ['left', 'start'],
    ['right', 'end'],
    ['center', 'full'],
  ] as const)('covers text at %s with the %s overlay', (position, overlay) => {
    expect(overlayFor(position)).toBe(overlay)
  })
})
