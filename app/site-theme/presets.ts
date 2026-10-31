export interface ColorPreset {
  name: string
  primaryColor: string
  accentColor: string
}

export const colorPresets: ColorPreset[] = [
  { name: 'Midnight & Rose', primaryColor: '#1E2A44', accentColor: '#E8A598' },
  { name: 'Sage & Cream', primaryColor: '#5E7A63', accentColor: '#E9DFC8' },
  { name: 'Navy & Gold', primaryColor: '#1F2F5C', accentColor: '#C9A54C' },
  { name: 'Blush & Rose', primaryColor: '#B4596A', accentColor: '#F6D6DB' },
  { name: 'Terracotta & Sand', primaryColor: '#A8553B', accentColor: '#E8D3B9' },
  { name: 'Black & Gold', primaryColor: '#1A1A1A', accentColor: '#C8A45A' },
]

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
