// Placement options a layout can offer (text position, photo side, …). Each layout declares its options in
// the registry; the chosen values are stored on the section (`Section.options`), so never rename a key or value.

export interface SectionLayoutOptionChoice {
  value: string
  label: string
  // The heading it's listed under in a dropdown (`control: 'select'`); choices without one come first, with no heading
  group?: string
}

export interface SectionLayoutOption {
  key: string
  label: string
  choices: SectionLayoutOptionChoice[]
  default: string
  // How editors offer it: cards side by side (the default, for a few choices) or a dropdown (for a long list)
  control?: 'cards' | 'select'
}

/** A dropdown's choices under their headings: those without a `group` first (no heading), then each group in order. */
export function groupedChoices(choices: SectionLayoutOptionChoice[]): { group?: string, choices: SectionLayoutOptionChoice[] }[] {
  const groups: { group?: string, choices: SectionLayoutOptionChoice[] }[] = []
  for (const choice of choices) {
    const existing = groups.find(group => group.group === choice.group)
    if (existing)
      existing.choices.push(choice)
    else
      groups.push({ group: choice.group, choices: [choice] })
  }
  return groups.sort((a, b) => Number(a.group !== undefined) - Number(b.group !== undefined))
}

// Nine positions on a 3×3 grid, in picker order (row by row)
export const positions = [
  'top-left', 'top', 'top-right',
  'left', 'center', 'right',
  'bottom-left', 'bottom', 'bottom-right',
] as const

export type Position = (typeof positions)[number]

export const positionLabels: Record<Position, string> = {
  'top-left': 'Top left',
  'top': 'Top',
  'top-right': 'Top right',
  'left': 'Left',
  'center': 'Center',
  'right': 'Right',
  'bottom-left': 'Bottom left',
  'bottom': 'Bottom',
  'bottom-right': 'Bottom right',
}

export const positionChoices: SectionLayoutOptionChoice[] = positions.map(value => ({ value, label: positionLabels[value] }))

export const sideChoices: SectionLayoutOptionChoice[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
]

export const alignChoices: SectionLayoutOptionChoice[] = [
  { value: 'start', label: 'Left' },
  { value: 'center', label: 'Center' },
]

// Classes for a flex column aligned by an `alignChoices` value (or `positionClasses().align`)
export const alignClasses = {
  start: 'items-start text-start',
  center: 'items-center text-center',
  end: 'items-end text-end',
} as const

export type Align = keyof typeof alignClasses

export const aboveBelowChoices: SectionLayoutOptionChoice[] = [
  { value: 'above', label: 'Above' },
  { value: 'below', label: 'Below' },
]

/** The layout's options with defaults filled in, keeping only stored values the layout still offers. */
export function resolveLayoutOptions(
  options: SectionLayoutOption[],
  stored: Record<string, string> | undefined,
): Record<string, string> {
  return Object.fromEntries(options.map((option) => {
    const value = stored?.[option.key]
    const valid = option.choices.some(choice => choice.value === value)
    return [option.key, valid ? value! : option.default]
  }))
}

// Classes that put a flex column's children at a position: vertical on the main axis,
// horizontal on the cross axis, plus the text alignment that goes with it.
export function positionClasses(position: Position) {
  const [vertical, horizontal] = position === 'center'
    ? ['center', 'center']
    : position.includes('-')
      ? position.split('-') as [string, string]
      : ['top', 'bottom'].includes(position) ? [position, 'center'] : ['center', position]

  return {
    justify: { top: 'justify-start', center: 'justify-center', bottom: 'justify-end' }[vertical]!,
    items: { left: 'items-start', center: 'items-center', right: 'items-end' }[horizontal]!,
    align: ({ left: 'start', center: 'center', right: 'end' } as const)[horizontal as 'left' | 'center' | 'right'],
  }
}

// The photo overlay that keeps text at `position` readable (see SectionFrame)
export function overlayFor(position: Position): 'full' | 'top' | 'bottom' | 'start' | 'end' {
  if (position.startsWith('top'))
    return 'top'
  if (position.startsWith('bottom'))
    return 'bottom'
  return position === 'left' ? 'start' : position === 'right' ? 'end' : 'full'
}
