import type { EventType } from '~/features/events/event.type'
import type { ApiPaginatedRequest } from '~/types/api'

// Mirrors crephore-backend Features/EventGroups.
export interface EventGroupEvent {
  id: number
  name: string
  type: EventType
  startsAt: string
  timezone: string
}

export interface EventGroup {
  id: number
  name: string
  eventCount: number
  createdAt: string
  events: EventGroupEvent[]
}

/* API Request Types */
export interface ListEventGroupsRequest extends ApiPaginatedRequest {}

export interface CreateEventGroupRequest {
  name: string
  // The group's events: listed ones are added (moved out of any other group), the rest removed.
  // Leave out to keep the current events.
  eventIds?: number[]
}

export interface UpdateEventGroupRequest extends CreateEventGroupRequest {
  id: number
}
