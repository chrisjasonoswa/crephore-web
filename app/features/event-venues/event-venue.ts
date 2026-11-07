import type { EventVenue, EventVenueDraft, UpdateEventVenuesRequest } from './event-venue.type'
import { venueMapEmbedUrl } from '~/features/sections/program/program.helpers'

// An event's venues between the API, the Venues tab and the add-venue dialog.

// The API's limits (EventVenuesService)
export const eventVenuesMax = 10
export const venueLimits = { name: 200, address: 300, mapsUrl: 500, notes: 1000 }

/** A new, empty venue to fill in. */
export const blankVenue = (): EventVenueDraft => ({
  key: crypto.randomUUID(),
  name: '',
  address: '',
  googleMapsUrl: '',
  appleMapsUrl: '',
  latitude: null,
  longitude: null,
  photoUrl: '',
  notes: '',
})

/** A saved venue as the Venues tab edits it, keyed by its saved id. */
export const venueFromApi = (venue: EventVenue): EventVenueDraft => ({
  key: `venue-${venue.id}`,
  savedId: venue.id,
  name: venue.name,
  address: venue.address ?? '',
  googleMapsUrl: venue.googleMapsUrl ?? '',
  appleMapsUrl: venue.appleMapsUrl ?? '',
  latitude: venue.latitude,
  longitude: venue.longitude,
  photoUrl: venue.photoUrl ?? '',
  notes: venue.notes ?? '',
})

// Optional text: trimmed, null when blank
const optional = (value: string) => value.trim() || null

/** The save request: every venue in order (saved ones by id), text trimmed, blank fields as null. */
export function mapVenuesToRequest(venues: EventVenueDraft[]): UpdateEventVenuesRequest {
  return {
    venues: venues.map(venue => ({
      id: venue.savedId ?? null,
      name: venue.name.trim(),
      address: optional(venue.address),
      googleMapsUrl: optional(venue.googleMapsUrl),
      appleMapsUrl: optional(venue.appleMapsUrl),
      latitude: venue.latitude,
      longitude: venue.longitude,
      photoUrl: optional(venue.photoUrl),
      notes: optional(venue.notes),
    })),
  }
}

/** Whether saving `a` would store the same venues as `b` (editor keys don't count). */
export function isSameVenues(a: EventVenueDraft[], b: EventVenueDraft[]): boolean {
  return JSON.stringify(mapVenuesToRequest(a)) === JSON.stringify(mapVenuesToRequest(b))
}

// The hosts the API accepts for each link (https, the host or one of its subdomains)
const linkOn = (url: string, hosts: string[]) => {
  try {
    const { protocol, hostname } = new URL(url)
    return protocol === 'https:' && hosts.some(host => hostname === host || hostname.endsWith(`.${host}`))
  }
  catch {
    return false
  }
}
export const isGoogleMapsUrl = (url: string) => linkOn(url, ['google.com', 'goo.gl'])
export const isAppleMapsUrl = (url: string) => linkOn(url, ['maps.apple.com', 'maps.apple', 'apple.co'])

/**
 * Why each venue can't be saved, keyed like the API's errors ("venues[1].name"): the same rules and messages, so the
 * Venues tab and the add-venue dialog show them beside the fields before sending. Empty when they can be saved.
 */
export function venueErrors(venues: EventVenueDraft[]): Record<string, string> {
  const errors: Record<string, string> = {}
  const tooLong = (key: string, value: string, max: number, label: string) => {
    if (value.trim().length > max)
      errors[key] = `${label} must be ${max} characters or fewer.`
  }
  venues.forEach((venue, index) => {
    const key = `venues[${index}]`
    if (!venue.name.trim())
      errors[`${key}.name`] = 'Name is required.'
    else
      tooLong(`${key}.name`, venue.name, venueLimits.name, 'Name')
    tooLong(`${key}.address`, venue.address, venueLimits.address, 'Address')
    if (venue.googleMapsUrl.trim() && !isGoogleMapsUrl(venue.googleMapsUrl.trim()))
      errors[`${key}.googleMapsUrl`] = 'Google Maps link must be a link from Google Maps.'
    else
      tooLong(`${key}.googleMapsUrl`, venue.googleMapsUrl, venueLimits.mapsUrl, 'Google Maps link')
    if (venue.appleMapsUrl.trim() && !isAppleMapsUrl(venue.appleMapsUrl.trim()))
      errors[`${key}.appleMapsUrl`] = 'Apple Maps link must be a link from Apple Maps.'
    else
      tooLong(`${key}.appleMapsUrl`, venue.appleMapsUrl, venueLimits.mapsUrl, 'Apple Maps link')
    tooLong(`${key}.notes`, venue.notes, venueLimits.notes, 'Notes')
  })
  return errors
}

/** The map link whose pin the venue uses: Google Maps' when it has one, else Apple Maps'. */
export function pinLinkOf(venue: Pick<EventVenueDraft, 'googleMapsUrl' | 'appleMapsUrl'>): string | null {
  const google = venue.googleMapsUrl.trim()
  const apple = venue.appleMapsUrl.trim()
  if (google && isGoogleMapsUrl(google))
    return google
  if (apple && isAppleMapsUrl(apple))
    return apple
  return null
}

/**
 * Google Maps at the pin, as the Venues tab's preview: the same embed guests see in the program sections
 * (`venueMapEmbedUrl`).
 */
export const mapPreviewUrl = venueMapEmbedUrl

