import type { EventVenue, UpdateEventVenuesRequest } from './event-venue.type'
import type { ApiResponse } from '~/types/api'
import { get, put } from '~/lib/axios'

export const EventVenueApiRoutes = {
  // One list per event
  venues: (eventId: number) => `/events/${eventId}/venues`,
}

/* APIs */
// In order; the first is the main venue. An event without venues has an empty list.
export const getEventVenues = (eventId: number) => {
  return get<ApiResponse<EventVenue[]>>(EventVenueApiRoutes.venues(eventId))
}

export const updateEventVenues = (eventId: number, payload: UpdateEventVenuesRequest) => {
  return put<ApiResponse<EventVenue[]>>(EventVenueApiRoutes.venues(eventId), payload)
}
