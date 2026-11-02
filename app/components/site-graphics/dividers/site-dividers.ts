// The decorative dividers sections put between items (the program's menu card, for now): a catalogue of small line
// drawings on a 120 × 24 canvas, drawn by `SiteDivider` in the text colour it sits in. Ten for any event, then five each
// for weddings and engagements, birthdays and parties, business and conferences, memorials and tributes.
// Keys are stored on saved sections (layout options), so never rename one.

export type SiteDividerKind = 'any' | 'wedding' | 'party' | 'business' | 'memorial'

// The heading each kind is listed under in pickers, in catalogue order
export const siteDividerKindLabels: Record<SiteDividerKind, string> = {
  any: 'Any event',
  wedding: 'Weddings & engagements',
  party: 'Birthdays & parties',
  business: 'Business & conferences',
  memorial: 'Memorials & tributes',
}

// One shape of a divider: filled, or drawn as a line (`opacity` softens a line, e.g. the thin rules either side)
export interface SiteDividerShape {
  d: string
  draw: 'fill' | 'stroke'
  opacity?: number
}

export interface SiteDivider {
  key: string
  label: string
  kind: SiteDividerKind
  shapes: SiteDividerShape[]
}

export const siteDividers: SiteDivider[] = [
  { key: 'flourish', label: 'Flourish', kind: 'any', shapes: [
    { draw: 'stroke', d: 'M16 12H42M78 12H104', opacity: 0.6 },
    { draw: 'fill', d: 'M60 6.5L65.5 12L60 17.5L54.5 12z' },
    { draw: 'fill', d: 'M48.5 12a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0z' },
    { draw: 'fill', d: 'M68.5 12a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0z' },
  ] },
  { key: 'dot', label: 'Dot', kind: 'any', shapes: [
    { draw: 'fill', d: 'M57 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0z' },
  ] },
  { key: 'line', label: 'Thin line', kind: 'any', shapes: [
    { draw: 'stroke', d: 'M30 12H90', opacity: 0.6 },
  ] },
  { key: 'double-line', label: 'Double line', kind: 'any', shapes: [
    { draw: 'stroke', d: 'M30 10H90M30 14H90', opacity: 0.6 },
  ] },
  { key: 'three-dots', label: 'Three dots', kind: 'any', shapes: [
    { draw: 'fill', d: 'M48 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z' },
    { draw: 'fill', d: 'M58 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z' },
    { draw: 'fill', d: 'M68 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z' },
  ] },
  { key: 'star', label: 'Star', kind: 'any', shapes: [
    { draw: 'stroke', d: 'M14 12H50M70 12H106', opacity: 0.6 },
    { draw: 'fill', d: 'M60 5Q61.4 10.6 67 12Q61.4 13.4 60 19Q58.6 13.4 53 12Q58.6 10.6 60 5z' },
  ] },
  { key: 'diamonds', label: 'Three diamonds', kind: 'any', shapes: [
    { draw: 'fill', d: 'M49 9L52 12L49 15L46 12z' },
    { draw: 'fill', d: 'M60 7.5L64.5 12L60 16.5L55.5 12z' },
    { draw: 'fill', d: 'M71 9L74 12L71 15L68 12z' },
  ] },
  { key: 'wave', label: 'Wave', kind: 'any', shapes: [
    { draw: 'stroke', d: 'M20 12Q25 6 30 12T40 12T50 12T60 12T70 12T80 12T90 12T100 12', opacity: 0.8 },
  ] },
  { key: 'ring', label: 'Ring and lines', kind: 'any', shapes: [
    { draw: 'stroke', d: 'M14 12H52M68 12H106', opacity: 0.6 },
    { draw: 'stroke', d: 'M55.5 12a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0z' },
  ] },
  { key: 'swirl', label: 'Swirl', kind: 'any', shapes: [
    { draw: 'stroke', d: 'M12 12H40M80 12H108', opacity: 0.6 },
    { draw: 'stroke', d: 'M60 12C56 5 46 5 44 11C43 15 49 17 51 13M60 12C64 5 74 5 76 11C77 15 71 17 69 13' },
    { draw: 'fill', d: 'M58.5 12a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0z' },
  ] },
  { key: 'heart', label: 'Heart', kind: 'wedding', shapes: [
    { draw: 'stroke', d: 'M14 12H49M71 12H106', opacity: 0.6 },
    { draw: 'fill', d: 'M60 17.5C51.6 12.1 53.4 4.9 60 9.1C66.6 4.9 68.4 12.1 60 17.5z' },
  ] },
  { key: 'two-hearts', label: 'Two hearts', kind: 'wedding', shapes: [
    { draw: 'stroke', d: 'M14 12H44M76 12H106', opacity: 0.6 },
    { draw: 'stroke', d: 'M55.5 16.5C48.5 12 50 6 55.5 9.5C61 6 62.5 12 55.5 16.5z' },
    { draw: 'stroke', d: 'M64.5 16.5C57.5 12 59 6 64.5 9.5C70 6 71.5 12 64.5 16.5z' },
  ] },
  { key: 'rings', label: 'Wedding rings', kind: 'wedding', shapes: [
    { draw: 'stroke', d: 'M14 12H45M75 12H106', opacity: 0.6 },
    { draw: 'stroke', d: 'M50 12a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0 -11 0z' },
    { draw: 'stroke', d: 'M59 12a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0 -11 0z' },
  ] },
  { key: 'vine', label: 'Vine', kind: 'wedding', shapes: [
    { draw: 'stroke', d: 'M18 12H102', opacity: 0.6 },
    { draw: 'fill', d: 'M24 12Q29.41 11.88 31.37 6.84Q25.97 6.96 24 12z' },
    { draw: 'fill', d: 'M36 12Q37.97 17.04 43.37 17.16Q41.41 12.12 36 12z' },
    { draw: 'fill', d: 'M48 12Q53.41 11.88 55.37 6.84Q49.97 6.96 48 12z' },
    { draw: 'fill', d: 'M60 12Q61.97 17.04 67.37 17.16Q65.41 12.12 60 12z' },
    { draw: 'fill', d: 'M72 12Q77.41 11.88 79.37 6.84Q73.97 6.96 72 12z' },
    { draw: 'fill', d: 'M84 12Q85.97 17.04 91.37 17.16Q89.41 12.12 84 12z' },
  ] },
  { key: 'bow', label: 'Bow', kind: 'wedding', shapes: [
    { draw: 'stroke', d: 'M14 12H45M75 12H106', opacity: 0.6 },
    { draw: 'stroke', d: 'M60 12C56 5 47 5 47 12S56 19 60 12ZM60 12C64 5 73 5 73 12S64 19 60 12Z' },
    { draw: 'fill', d: 'M58.2 12a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0z' },
  ] },
  { key: 'confetti', label: 'Confetti', kind: 'party', shapes: [
    { draw: 'fill', d: 'M22.7 9a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0z' },
    { draw: 'stroke', d: 'M33 15L37 11' },
    { draw: 'fill', d: 'M46 6L48 8L46 10L44 8z' },
    { draw: 'fill', d: 'M51.7 16a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0z' },
    { draw: 'stroke', d: 'M58 6L62 9' },
    { draw: 'fill', d: 'M67 13L69 15L67 17L65 15z' },
    { draw: 'fill', d: 'M72.7 8a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0z' },
    { draw: 'stroke', d: 'M82 16L86 12' },
    { draw: 'fill', d: 'M94 7L96 9L94 11L92 9z' },
    { draw: 'fill', d: 'M97.7 16a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0z' },
  ] },
  { key: 'balloons', label: 'Balloons', kind: 'party', shapes: [
    { draw: 'fill', d: 'M51 3C55 3 55.5 9 51 11C46.5 9 47 3 51 3z' },
    { draw: 'fill', d: 'M60 1C64 1 64.5 7 60 9C55.5 7 56 1 60 1z' },
    { draw: 'fill', d: 'M69 3C73 3 73.5 9 69 11C64.5 9 65 3 69 3z' },
    { draw: 'stroke', d: 'M51 11Q52.5 14 51 17', opacity: 0.7 },
    { draw: 'stroke', d: 'M60 9Q61.5 12 60 16', opacity: 0.7 },
    { draw: 'stroke', d: 'M69 11Q70.5 14 69 17', opacity: 0.7 },
  ] },
  { key: 'stars', label: 'Stars', kind: 'party', shapes: [
    { draw: 'fill', d: 'M48 9L49 11.62L51.8 11.76L49.62 13.53L50.35 16.24L48 14.7L45.65 16.24L46.38 13.53L44.2 11.76L47 11.62z' },
    { draw: 'fill', d: 'M60 5L61.47 8.98L65.71 9.15L62.38 11.77L63.53 15.85L60 13.5L56.47 15.85L57.62 11.77L54.29 9.15L58.53 8.98z' },
    { draw: 'fill', d: 'M72 9L73 11.62L75.8 11.76L73.62 13.53L74.35 16.24L72 14.7L69.65 16.24L70.38 13.53L68.2 11.76L71 11.62z' },
  ] },
  { key: 'bunting', label: 'Bunting', kind: 'party', shapes: [
    { draw: 'stroke', d: 'M18 6Q60 10 102 6', opacity: 0.6 },
    { draw: 'fill', d: 'M22 6.55L30 6.55L26 14.55z' },
    { draw: 'fill', d: 'M36 7.24L44 7.24L40 15.24z' },
    { draw: 'fill', d: 'M50 7.57L58 7.57L54 15.57z' },
    { draw: 'fill', d: 'M64 7.54L72 7.54L68 15.54z' },
    { draw: 'fill', d: 'M78 7.16L86 7.16L82 15.16z' },
    { draw: 'fill', d: 'M92 6.42L100 6.42L96 14.42z' },
  ] },
  { key: 'sparkles', label: 'Sparkles', kind: 'party', shapes: [
    { draw: 'fill', d: 'M49 10Q49.8 13.2 53 14Q49.8 14.8 49 18Q48.2 14.8 45 14Q48.2 13.2 49 10z' },
    { draw: 'fill', d: 'M60 4Q61.2 8.8 66 10Q61.2 11.2 60 16Q58.8 11.2 54 10Q58.8 8.8 60 4z' },
    { draw: 'fill', d: 'M71 10Q71.8 13.2 75 14Q71.8 14.8 71 18Q70.2 14.8 67 14Q70.2 13.2 71 10z' },
  ] },
  { key: 'bar', label: 'Bold bar', kind: 'business', shapes: [
    { draw: 'stroke', d: 'M20 12H46M74 12H100', opacity: 0.6 },
    { draw: 'fill', d: 'M48 10.5H72V13.5H48z' },
  ] },
  { key: 'dashes', label: 'Dashes', kind: 'business', shapes: [
    { draw: 'stroke', d: 'M24 12H30 M34 12H40 M44 12H50 M54 12H60 M64 12H70 M74 12H80 M84 12H90 M94 12H100', opacity: 0.8 },
  ] },
  { key: 'squares', label: 'Three squares', kind: 'business', shapes: [
    { draw: 'fill', d: 'M48 10H52V14H48z' },
    { draw: 'fill', d: 'M58 10H62V14H58z' },
    { draw: 'fill', d: 'M68 10H72V14H68z' },
  ] },
  { key: 'brackets', label: 'Brackets', kind: 'business', shapes: [
    { draw: 'stroke', d: 'M24 7V17M24 12H96M96 7V17', opacity: 0.7 },
  ] },
  { key: 'dot-line', label: 'Dotted ends', kind: 'business', shapes: [
    { draw: 'stroke', d: 'M24 12H96', opacity: 0.6 },
    { draw: 'fill', d: 'M22 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z' },
    { draw: 'fill', d: 'M57.5 12a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0z' },
    { draw: 'fill', d: 'M94 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z' },
  ] },
  { key: 'olive-branch', label: 'Olive branch', kind: 'memorial', shapes: [
    { draw: 'stroke', d: 'M22 12H98', opacity: 0.6 },
    { draw: 'fill', d: 'M32 12Q30.1 7.74 25.45 7.41Q27.35 11.67 32 12z' },
    { draw: 'fill', d: 'M40 12Q35.35 12.33 33.45 16.59Q38.1 16.26 40 12z' },
    { draw: 'fill', d: 'M48 12Q46.1 7.74 41.45 7.41Q43.35 11.67 48 12z' },
    { draw: 'fill', d: 'M72 12Q76.65 11.67 78.55 7.41Q73.9 7.74 72 12z' },
    { draw: 'fill', d: 'M80 12Q81.9 16.26 86.55 16.59Q84.65 12.33 80 12z' },
    { draw: 'fill', d: 'M88 12Q92.65 11.67 94.55 7.41Q89.9 7.74 88 12z' },
    { draw: 'fill', d: 'M58 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z' },
  ] },
  { key: 'candle', label: 'Candle', kind: 'memorial', shapes: [
    { draw: 'stroke', d: 'M14 12H50M70 12H106', opacity: 0.6 },
    { draw: 'stroke', d: 'M57 11H63V21H57z' },
    { draw: 'fill', d: 'M60 3Q63.5 7 60 9.5Q56.5 7 60 3z' },
  ] },
  { key: 'cross', label: 'Cross', kind: 'memorial', shapes: [
    { draw: 'stroke', d: 'M14 12H51M69 12H106', opacity: 0.6 },
    { draw: 'stroke', d: 'M60 4V20M55 9H65' },
  ] },
  { key: 'flower', label: 'Flower', kind: 'memorial', shapes: [
    { draw: 'stroke', d: 'M14 12H48M72 12H106', opacity: 0.6 },
    { draw: 'fill', d: 'M60 12Q62.6 8.25 60 4.5Q57.4 8.25 60 12z' },
    { draw: 'fill', d: 'M60 12Q64.37 13.31 67.13 9.68Q62.76 8.37 60 12z' },
    { draw: 'fill', d: 'M60 12Q60.1 16.56 64.41 18.07Q64.31 13.51 60 12z' },
    { draw: 'fill', d: 'M60 12Q55.69 13.51 55.59 18.07Q59.9 16.56 60 12z' },
    { draw: 'fill', d: 'M60 12Q57.24 8.37 52.87 9.68Q55.63 13.31 60 12z' },
  ] },
  { key: 'leaf', label: 'Leaf', kind: 'memorial', shapes: [
    { draw: 'stroke', d: 'M14 12H44M76 12H106', opacity: 0.6 },
    { draw: 'fill', d: 'M45 15Q60.68 17.05 74.45 9.28Q58.77 7.23 45 15z' },
    { draw: 'stroke', d: 'M45 15L58 12.5', opacity: 0.5 },
  ] },
]

/** A divider by key; undefined for `none` or a key that no longer exists. */
export const getSiteDivider = (key: string) => siteDividers.find(divider => divider.key === key)
