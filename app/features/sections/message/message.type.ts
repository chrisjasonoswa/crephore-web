// Every field a message layout can use
export const messageFields = ['eyebrow', 'heading', 'body', 'signature'] as const
export type MessageField = (typeof messageFields)[number]

// Every message layout uses the same fields: a short note from the hosts (a welcome, a thank you, …), read top to
// bottom as eyebrow, heading, body and signature, plus a photo.
export interface MessageContent {
  // Small label, e.g. "A note from us"
  eyebrow?: string
  heading?: string
  // The note itself; line breaks are kept
  body: string
  // Closes the note, e.g. "With love, Bea & Carlo"
  signature?: string
  // The photo behind the section on the `photo` background (any layout, under an overlay); without it the section
  // uses the primary colour. Never shown inside a layout.
  backgroundPhoto?: string
  // The photos inside the layout, in order, like the hero's (every layout shows the first); a missing photo shows a
  // soft placeholder (the centred letter leaves it out)
  layoutPhotos: string[]
}
