// Reads the pin out of a Google Maps or Apple Maps link, short or full, following its redirects. No API keys needed.
// Used by server/api/map-pin.get.ts; kept apart so the parsing can be tested.

const ALLOWED_HOSTS = [
  // Google
  'maps.app.goo.gl',
  'goo.gl',
  'google.com',
  'maps.google.com',
  // Apple
  'maps.apple',
  'maps.apple.com',
  'apple.co',
]

export interface MapPin {
  lat: number
  lng: number
  // The place's own pin, not just where the map was looking
  exact: boolean
  zoom: number
  name: string | null
  provider: 'google' | 'apple'
}

/** Only https links on Google's and Apple's map hosts are opened, every redirect too. */
export function isMapLink(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url)
    return protocol === 'https:' && ALLOWED_HOSTS.some(host => hostname === host || hostname.endsWith(`.${host}`))
  }
  catch {
    return false
  }
}

const LATLNG = '(-?\\d+\\.\\d+),\\s*\\+?(-?\\d+\\.\\d+)'

function parseGoogle(url: string): MapPin | null {
  let decoded: string
  try {
    decoded = decodeURIComponent(url)
  }
  catch {
    decoded = url
  }
  const pin = decoded.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) // the place's pin
  const query = decoded.match(new RegExp(`[?&](?:q|query|ll)=${LATLNG}`)) // ?q=lat,lng
  const search = decoded.match(new RegExp(`/search/${LATLNG}`)) // /search/lat,+lng
  const view = decoded.match(/@(-?\d+\.\d+),(-?\d+\.\d+)(?:,(\d+(?:\.\d+)?)z)?/) // the map's centre (fallback)
  const name = decoded.match(/\/place\/([^/@]+)/)

  const found = pin || query || search || view
  if (!found)
    return null
  return {
    lat: +found[1]!,
    lng: +found[2]!,
    exact: Boolean(pin || query || search),
    zoom: view?.[3] ? Math.round(+view[3]) : 17,
    name: name?.[1] ? name[1].replace(/\+/g, ' ') : null,
    provider: 'google',
  }
}

function parseApple(url: string): MapPin | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  }
  catch {
    return null
  }
  const params = parsed.searchParams

  const toLatLng = (value: string | null) => {
    const match = value?.match(new RegExp(`^${LATLNG}$`))
    return match ? { lat: +match[1]!, lng: +match[2]! } : null
  }

  // The place's pin: newer links (?coordinate=) or older ones (?ll=); else the map's centre or search location
  const exact = toLatLng(params.get('coordinate')) || toLatLng(params.get('ll'))
  const approximate = toLatLng(params.get('center')) || toLatLng(params.get('sll'))

  const found = exact || approximate
  if (!found)
    return null
  return {
    ...found,
    exact: Boolean(exact),
    zoom: params.get('z') ? Math.round(+params.get('z')!) : 17,
    name: params.get('name') || params.get('q') || null,
    provider: 'apple',
  }
}

/** The pin in a map link itself, without opening it; null when it has none (e.g. a short link). */
export function parseMapPin(url: string): MapPin | null {
  return new URL(url).hostname.includes('apple') ? parseApple(url) : parseGoogle(url)
}

// Apple's short links only redirect for Apple's browser (others end at a page for other browsers), while Google's short
// links answer a browser with a page that redirects by script, and anything else with a plain redirect to the full
// link, which has the pin. So Apple's hosts get Safari's user agent and Google's a non-browser one.
const SAFARI = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15'
const userAgentFor = (url: string) => (new URL(url).hostname.includes('apple') ? SAFARI : 'curl/8.0')

/**
 * A page that answered instead of redirecting: the pin it shows (`!3d…!4d…`, `coordinate=…`), else where it sends the
 * browser (a meta refresh, a script setting `location`, or a Google Maps link in it).
 */
export function readMapPage(html: string, provider: MapPin['provider']): { pin: MapPin } | { location: string } | null {
  const inline = html.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) || html.match(/[?&]coordinate=(-?\d+\.\d+)(?:,|%2C)(-?\d+\.\d+)/)
  if (inline)
    return { pin: { lat: +inline[1]!, lng: +inline[2]!, exact: true, zoom: 17, name: null, provider } }
  const redirect = html.match(/<meta[^>]+http-equiv=["']?refresh["']?[^>]+url=([^"'>]+)/i)
    || html.match(/(?:window\.)?location(?:\.href)?\s*=\s*["']([^"']+)["']/)
    || html.match(/https:\/\/(?:www\.)?google\.com\/maps\/[^"'\s<>\\]+/)
  if (!redirect)
    return null
  return { location: (redirect[1] ?? redirect[0]).replace(/&amp;/g, '&').replace(/\\u0026/g, '&').replace(/\\\//g, '/') }
}

/**
 * The link's pin, following its redirects one hop at a time and checking every hop: short links (maps.app.goo.gl,
 * maps.apple/p/…) only carry it after a redirect, and Apple's end at a page for other browsers, past the hop that had
 * `?coordinate=`. A page that answers instead of redirecting is read for a pin or where it redirects (`readMapPage`).
 * Null when no hop has one. Logs each hop in development.
 */
export async function resolveMapPin(url: string): Promise<(MapPin & { resolvedUrl: string }) | null> {
  const debug = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test'
  let current = url
  let best = parseMapPin(current)

  for (let hop = 0; hop < 8 && !best?.exact; hop++) {
    const response = await fetch(current, {
      redirect: 'manual',
      headers: { 'user-agent': userAgentFor(current) },
    })
    let location = response.headers.get('location')
    if (debug)
      console.log(`[map-pin] hop ${hop}`, response.status, current, '→', location)

    // No redirect: the page may show the pin itself, or redirect by HTML or script
    if (!location && response.status === 200) {
      const page = readMapPage(await response.text(), new URL(current).hostname.includes('apple') ? 'apple' : 'google')
      if (page && 'pin' in page) {
        best = page.pin
        break
      }
      location = page?.location ?? null
      if (debug)
        console.log(`[map-pin] hop ${hop} (from the page) →`, location)
    }

    if (!location)
      break
    const next = new URL(location, current).href
    if (!isMapLink(next))
      break
    current = next

    const found = parseMapPin(current)
    if (found && (!best || found.exact))
      best = found
  }

  return best && { ...best, resolvedUrl: current }
}
