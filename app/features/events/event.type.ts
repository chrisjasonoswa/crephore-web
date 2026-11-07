import type { ApiPaginatedRequest } from '~/types/api'

// Mirrors crephore-backend Features/Events (enum serialized as its name). In the order hosts pick from: similar types
// together, by kind of event (site-theme/eventKinds.ts), then Other.
export const eventTypes = [
  'Wedding',
  'Engagement',
  'Birthday',
  'Parties',
  'Conference',
  'Business',
  'CompanyEvents',
  'Memorial',
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
  type: EventType
  // Its main venue's name (the first in the Venues tab), "" without one; venues are edited there (event-venues)
  venueName: string
  startsAt: string
  // Null for an event without a set end
  endsAt: string | null
  // The venue's IANA timezone, e.g. "Asia/Manila". startsAt/endsAt are UTC;
  // always show them in this timezone with CDateTime.
  timezone: string
  // A memorial's dates of birth and passing ("1948-02-14"); null for other types
  bornOn: string | null
  diedOn: string | null
  subdomain: string
  createdAt: string
  // The current user's access and their own group (groups are personal)
  access: EventAccess[]
  eventGroup: EventGroupSummary | null
}

/* API Request Types */
export interface ListEventsRequest extends ApiPaginatedRequest {
  eventGroupId?: number
}


export interface CreateEventRequest {
  name: string
  type: EventType
  // Wall-clock times without an offset ("2027-06-12T15:00"), read in `timezone`; the end is optional
  startsAt: string
  endsAt: string | null
  timezone: string
  // A memorial's dates of birth and passing ("1948-02-14"); the API saves null for other types
  bornOn: string | null
  diedOn: string | null
  subdomain: string
  eventGroupId: number | null
}

// Same fields as create without the group: replaces them all and leaves the user's group as it is (events are
// grouped in the groups panel)
export type UpdateEventRequest = Omit<CreateEventRequest, 'eventGroupId'>
