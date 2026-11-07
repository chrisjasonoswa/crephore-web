import type { EventKind } from './eventKinds'

export interface ColorPreset {
  name: string
  kind: EventKind
  primaryColor: string
  // Unset: the theme makes one from the primary, or has no accent (see SiteTheme)
  secondaryColor?: string
  accentColor?: string
}

// Six per kind of event, in picker order: two with the primary only, two with a secondary, two with all three. Party
// palettes are the brightest and most playful, memorial ones the calmest. Secondary colours are section backgrounds,
// so they're mostly soft; accents are small highlights (buttons, icons), so they're the boldest.
export const colorPresets: ColorPreset[] = [
  { name: 'Navy', kind: 'any', primaryColor: '#1F2F5C' },
  { name: 'Forest', kind: 'any', primaryColor: '#2F5D50' },
  { name: 'Midnight & Rose', kind: 'any', primaryColor: '#1E2A44', secondaryColor: '#E8A598' },
  { name: 'Charcoal & Sand', kind: 'any', primaryColor: '#2B2B2B', secondaryColor: '#E8DCC8' },
  { name: 'Teal, Cream & Coral', kind: 'any', primaryColor: '#1F6E6C', secondaryColor: '#F3EBDD', accentColor: '#E8775B' },
  { name: 'Plum, Blush & Gold', kind: 'any', primaryColor: '#4A2545', secondaryColor: '#F2DCE0', accentColor: '#C9A54C' },

  { name: 'Sage', kind: 'wedding', primaryColor: '#5E7A63' },
  { name: 'Dusty Rose', kind: 'wedding', primaryColor: '#B4596A' },
  { name: 'Sage & Cream', kind: 'wedding', primaryColor: '#5E7A63', secondaryColor: '#E9DFC8' },
  { name: 'Terracotta & Sand', kind: 'wedding', primaryColor: '#A8553B', secondaryColor: '#E8D3B9' },
  { name: 'Rose, Blush & Gold', kind: 'wedding', primaryColor: '#B4596A', secondaryColor: '#F6D6DB', accentColor: '#C9A54C' },
  { name: 'Burgundy, Blush & Sage', kind: 'wedding', primaryColor: '#6B1F2E', secondaryColor: '#F2D7D5', accentColor: '#7F9C80' },

  { name: 'Hot Pink', kind: 'party', primaryColor: '#E6337A' },
  { name: 'Electric Purple', kind: 'party', primaryColor: '#6C2BD9' },
  { name: 'Tangerine & Sunshine', kind: 'party', primaryColor: '#F26B1D', secondaryColor: '#FFD23F' },
  { name: 'Cobalt & Bubblegum', kind: 'party', primaryColor: '#2346D8', secondaryColor: '#FF8FC7' },
  { name: 'Grape, Mint & Sunshine', kind: 'party', primaryColor: '#5B2A86', secondaryColor: '#A8F0D1', accentColor: '#FFC93C' },
  { name: 'Flamingo, Lemon & Teal', kind: 'party', primaryColor: '#F0428C', secondaryColor: '#FFF07A', accentColor: '#14B8A6' },

  { name: 'Ink Blue', kind: 'business', primaryColor: '#1D3557' },
  { name: 'Graphite', kind: 'business', primaryColor: '#2E3440' },
  { name: 'Slate & Sky', kind: 'business', primaryColor: '#334155', secondaryColor: '#DCE7F3' },
  { name: 'Navy & Gold', kind: 'business', primaryColor: '#1F2F5C', secondaryColor: '#C9A54C' },
  { name: 'Ink, Mist & Electric Blue', kind: 'business', primaryColor: '#0F172A', secondaryColor: '#E2E8F0', accentColor: '#2563EB' },
  { name: 'Evergreen, Stone & Amber', kind: 'business', primaryColor: '#134E4A', secondaryColor: '#E7E5E0', accentColor: '#F59E0B' },

  { name: 'Charcoal', kind: 'memorial', primaryColor: '#36393F' },
  { name: 'Dusk', kind: 'memorial', primaryColor: '#3E4C5E' },
  { name: 'Slate & Lavender', kind: 'memorial', primaryColor: '#4A5568', secondaryColor: '#E3DEEC' },
  { name: 'Olive & Linen', kind: 'memorial', primaryColor: '#556052', secondaryColor: '#ECE6DA' },
  { name: 'Midnight, Stone & Soft Gold', kind: 'memorial', primaryColor: '#22303F', secondaryColor: '#E8E4DC', accentColor: '#B89B5E' },
  { name: 'Sage, Linen & Lilac', kind: 'memorial', primaryColor: '#5F6F65', secondaryColor: '#EEE9E0', accentColor: '#9D8EBF' },
]

/** The colours a new website for this kind of event starts with: the kind's first preset with a secondary. */
export function defaultColorPreset(kind: EventKind): ColorPreset {
  return colorPresets.find(preset => preset.kind === kind && preset.secondaryColor && !preset.accentColor)!
}

export interface BackgroundPreset {
  name: string
  // null: the theme's default, plain white
  color: string | null
}

// Light page backgrounds. All are light enough to be used exactly as given (see lightBackground).
export const backgroundPresets: BackgroundPreset[] = [
  { name: 'White', color: null },
  { name: 'Ivory', color: '#FFFCF4' },
  { name: 'Cream', color: '#F7F1E7' },
  { name: 'Sand', color: '#F1E9DD' },
  { name: 'Blush', color: '#FBF1F0' },
  { name: 'Mist', color: '#F1F5F4' },
  { name: 'Stone', color: '#F2F1EE' },
]
