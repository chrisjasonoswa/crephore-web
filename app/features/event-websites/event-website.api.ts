import type { EventWebsite, UpdateEventWebsiteRequest } from './event-website.type'
import type { ApiResponse } from '~/types/api'
import { del, get, post, put } from '~/lib/axios'

export const EventWebsiteApiRoutes = {
  // One website per event
  website: (eventId: number) => `/events/${eventId}/website`,
  publish: (eventId: number) => `/events/${eventId}/website/publish`,
  unpublish: (eventId: number) => `/events/${eventId}/website/unpublish`,
}

/* APIs */
// `data` is null until the host saves a website
export const getEventWebsite = (eventId: number) => {
  return get<ApiResponse<EventWebsite | null>>(EventWebsiteApiRoutes.website(eventId))
}

export const updateEventWebsite = (eventId: number, payload: UpdateEventWebsiteRequest) => {
  return put<ApiResponse<EventWebsite>>(EventWebsiteApiRoutes.website(eventId), payload)
}

export const deleteEventWebsite = (eventId: number) => {
  return del<ApiResponse<null>>(EventWebsiteApiRoutes.website(eventId))
}

// Guests see the saved website as it is now, until it is published again or unpublished
export const publishEventWebsite = (eventId: number) => {
  return post<ApiResponse<EventWebsite>>(EventWebsiteApiRoutes.publish(eventId))
}

export const unpublishEventWebsite = (eventId: number) => {
  return post<ApiResponse<EventWebsite>>(EventWebsiteApiRoutes.unpublish(eventId))
}
