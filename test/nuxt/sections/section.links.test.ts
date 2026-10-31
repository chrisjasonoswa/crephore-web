import { describe, expect, it } from 'vitest'
import { safeHref } from '~/features/sections/section.links'

describe('safeHref', () => {
  it('keeps places on the page, web pages, email and phone links', () => {
    expect(safeHref('#rsvp')).toBe('#rsvp')
    expect(safeHref('https://maps.google.com/?q=Taal')).toBe('https://maps.google.com/?q=Taal')
    expect(safeHref('http://example.com')).toBe('http://example.com')
    expect(safeHref('mailto:ana@example.com')).toBe('mailto:ana@example.com')
    expect(safeHref(' tel:+639171234567 ')).toBe('tel:+639171234567')
  })

  it('drops script and other links, including disguised ones', () => {
    expect(safeHref('javascript:alert(1)')).toBeUndefined()
    expect(safeHref('JaVaScRiPt:alert(1)')).toBeUndefined()
    expect(safeHref('java\nscript:alert(1)')).toBeUndefined()
    expect(safeHref('data:text/html,<script>alert(1)</script>')).toBeUndefined()
    expect(safeHref('/rsvp')).toBeUndefined()
    expect(safeHref('')).toBeUndefined()
    expect(safeHref(undefined)).toBeUndefined()
  })
})
