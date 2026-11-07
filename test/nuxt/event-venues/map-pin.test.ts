import { afterEach, describe, expect, it, vi } from 'vitest'
import { isMapLink, parseMapPin, readMapPage, resolveMapPin } from '~~/server/utils/map-pin'

const redirect = (location: string) => new Response(null, { status: 301, headers: { location } })

describe('map pin', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('opens only https links on Google\'s and Apple\'s map hosts', () => {
    expect(isMapLink('https://maps.app.goo.gl/abc')).toBe(true)
    expect(isMapLink('https://www.google.com/maps/place/x')).toBe(true)
    expect(isMapLink('https://maps.apple/p/abc')).toBe(true)
    expect(isMapLink('http://maps.google.com/?q=1,2')).toBe(false)
    expect(isMapLink('https://example.com/?q=1.0,2.0')).toBe(false)
    expect(isMapLink('not a link')).toBe(false)
  })

  it('reads a Google Maps place\'s own pin before the map\'s centre', () => {
    const pin = parseMapPin('https://www.google.com/maps/place/Manila+Cathedral/@14.5913,120.9733,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d14.591534!4d120.973601')

    expect(pin).toEqual({ lat: 14.591534, lng: 120.973601, exact: true, zoom: 17, name: 'Manila Cathedral', provider: 'google' })
  })

  it('falls back to the map\'s centre, not exact', () => {
    expect(parseMapPin('https://www.google.com/maps/@14.5,120.9,15z')).toMatchObject({ lat: 14.5, lng: 120.9, exact: false, zoom: 15 })
  })

  it('reads Apple Maps\' coordinate, older ll, or centre', () => {
    expect(parseMapPin('https://maps.apple.com/?coordinate=14.591534,120.973601&name=Manila%20Cathedral')).toMatchObject({ lat: 14.591534, lng: 120.973601, exact: true, name: 'Manila Cathedral', provider: 'apple' })
    expect(parseMapPin('https://maps.apple.com/?ll=14.5,120.9&q=Cathedral')).toMatchObject({ exact: true, name: 'Cathedral' })
    expect(parseMapPin('https://maps.apple.com/?center=14.5,120.9')).toMatchObject({ exact: false })
    expect(parseMapPin('https://maps.apple.com/?q=Cathedral')).toBeNull()
  })

  it('follows a short link\'s redirects until a hop has the pin', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(redirect('https://www.google.com/maps/place/Manila+Cathedral/data=!3d14.591534!4d120.973601'))
    vi.stubGlobal('fetch', fetch)

    const pin = await resolveMapPin('https://maps.app.goo.gl/abc')

    // Not as a browser: Google's short links answer browsers with a page that redirects by script
    expect(fetch).toHaveBeenCalledWith('https://maps.app.goo.gl/abc', expect.objectContaining({ redirect: 'manual', headers: { 'user-agent': 'curl/8.0' } }))
    expect(pin).toMatchObject({ lat: 14.591534, lng: 120.973601, exact: true, resolvedUrl: 'https://www.google.com/maps/place/Manila+Cathedral/data=!3d14.591534!4d120.973601' })
  })

  it('keeps an Apple short link\'s pin from a middle hop, and never follows a redirect off the map hosts', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(redirect('https://maps.apple.com/place?coordinate=14.5,120.9'))
      .mockResolvedValueOnce(redirect('https://maps.apple.com/unsupported')))
    expect(await resolveMapPin('https://maps.apple/p/abc')).toMatchObject({ lat: 14.5, lng: 120.9, exact: true })
    // As Safari: Apple's short links only redirect for Apple's browser
    expect(vi.mocked(fetch).mock.calls[0]![1]).toMatchObject({ headers: { 'user-agent': expect.stringContaining('Safari') } })

    const offHost = vi.fn().mockResolvedValueOnce(redirect('https://example.com/?q=1.0,2.0'))
    vi.stubGlobal('fetch', offHost)
    expect(await resolveMapPin('https://maps.app.goo.gl/xyz')).toBeNull()
    expect(offHost).toHaveBeenCalledTimes(1)
  })

  it('reads a page that answers instead of redirecting: its pin, else where it sends the browser', async () => {
    expect(readMapPage('<a href="https://www.google.com/maps/place/X/data=!3d10.32229!4d123.89819">', 'google')).toEqual({ pin: { lat: 10.32229, lng: 123.89819, exact: true, zoom: 17, name: null, provider: 'google' } })
    expect(readMapPage('<meta http-equiv="refresh" content="0; url=https://www.google.com/maps/place/X?a=1&amp;b=2">', 'google')).toEqual({ location: 'https://www.google.com/maps/place/X?a=1&b=2' })
    expect(readMapPage('<script>window.location.href = "https:\\/\\/maps.apple.com\\/place?coordinate=1.5,2.5"</script>', 'apple')).toEqual({ pin: expect.objectContaining({ lat: 1.5, lng: 2.5 }) })
    expect(readMapPage('<p>Nothing here</p>', 'google')).toBeNull()

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response('<script>location = "https://www.google.com/maps/place/Y/@10.3,123.8,17z"</script>', { status: 200 }))
      .mockResolvedValueOnce(redirect('https://www.google.com/maps/place/Y/data=!3d10.31!4d123.81')))
    expect(await resolveMapPin('https://maps.app.goo.gl/page')).toMatchObject({ lat: 10.31, lng: 123.81, exact: true })
  })
})
