// Links in sections (e.g. the RSVP button) are what hosts saved, so only safe kinds become links: places on the page
// (#rsvp), web pages (http, https), email (mailto:) and phone (tel:). Anything else, e.g. `javascript:`, renders
// without a link.
const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']

export function safeHref(href: string | undefined): string | undefined {
  const value = href?.trim()
  if (!value)
    return undefined
  if (value.startsWith('#'))
    return value

  try {
    // Parsed like the browser does, so tricks such as "java\nscript:" are caught too
    return allowedProtocols.includes(new URL(value).protocol) ? value : undefined
  }
  catch {
    return undefined
  }
}
