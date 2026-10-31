import type { ApiPaginatedRequest } from '~/types/api'

// Mirrors crephore-backend Features/Events (enum serialized as its name).
export const eventTypes = [
  'Wedding',
  'Birthday',
  'Parties',
  'Business',
  'CompanyEvents',
  'Memorial',
  'Engagement',
  'Conference',
  'Other',
] as const

export type EventType = (typeof eventTypes)[number]

export const eventTypeLabels: Record<EventType, string> = {
  Wedding: 'Wedding',
  Birthday: 'Birthday',
  Parties: 'Parties',
  Business: 'Business',
  CompanyEvents: 'Company events',
  Memorial: 'Memorial',
  Engagement: 'Engagement',
  Conference: 'Conference',
  Other: 'Other',
}

// What the current user can do on an event. Each value grants one feature, except Owner, which grants everything.
export const eventAccesses = ['Owner'] as const

export type EventAccess = (typeof eventAccesses)[number]

export interface EventGroupSummary {
  id: number
  name: string
}

export interface Event {
  id: number
  name: string
  description: string | null
  type: EventType
  venueName: string
  venueAddress: string
  // Filled once Google Places is integrated; always null for now.
  venueLatitude: number | null
  venueLongitude: number | null
  venueGooglePlaceId: string | null
  startsAt: string
  endsAt: string
  // The venue's IANA timezone, e.g. "Asia/Manila". startsAt/endsAt are UTC;
  // always show them in this timezone with CDateTime.
  timezone: string
  subdomain: string
  createdAt: string
  // The current user's access and their own group (groups are personal)
  access: EventAccess[]
  eventGroup: EventGroupSummary | null
  // The program in order, e.g. ["Opening", "Dinner"]
  timeline: string[]
}

/* API Request Types */
export interface ListEventsRequest extends ApiPaginatedRequest {
  eventGroupId?: number
}


export interface CreateEventRequest {
  name: string
  description: string | null
  type: EventType
  venueName: string
  venueAddress: string
  // Always sent (null until Google Places is integrated).
  venueLatitude: number | null
  venueLongitude: number | null
  venueGooglePlaceId: string | null
  // Wall-clock times without an offset ("2027-06-12T15:00"), read in `timezone`
  startsAt: string
  endsAt: string
  timezone: string
  subdomain: string
  eventGroupId: number | null
  timeline: string[]
}

// Same fields as create; replaces them all, including the timeline and the user's group
export type UpdateEventRequest = CreateEventRequest
