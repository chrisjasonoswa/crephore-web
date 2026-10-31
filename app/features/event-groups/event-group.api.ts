import type {
  CreateEventGroupRequest,
  EventGroup,
  ListEventGroupsRequest,
  UpdateEventGroupRequest,
} from './event-group.type'
import type { ApiPaginatedResponse, ApiResponse } from '~/types/api'
import { del, get, post, put } from '~/lib/axios'

export const EventGroupApiRoutes = {
  root: '/event-groups',
  events: (groupId: number) => `/event-groups/${groupId}/events`,
}

/* APIs */
export const listEventGroups = (params: ListEventGroupsRequest) => {
  return get<ApiPaginatedResponse<EventGroup>>(EventGroupApiRoutes.root, { params })
}

export const addEventGroup = (payload: CreateEventGroupRequest) => {
  return post<ApiResponse<EventGroup>>(EventGroupApiRoutes.root, payload)
}

export const updateEventGroup = (payload: UpdateEventGroupRequest) => {
  const { id, ...body } = payload
  return put<ApiResponse<EventGroup>>(`${EventGroupApiRoutes.root}/${id}`, body)
}

export const deleteEventGroup = (id: number) => {
  return del<ApiResponse<null>>(`${EventGroupApiRoutes.root}/${id}`)
}

// Adding moves the event out of any other group.
export const addEventToGroup = (groupId: number, eventId: number) => {
  return post<ApiResponse<EventGroup>>(`${EventGroupApiRoutes.events(groupId)}/${eventId}`)
}

export const removeEventFromGroup = (groupId: number, eventId: number) => {
  return del<ApiResponse<EventGroup>>(`${EventGroupApiRoutes.events(groupId)}/${eventId}`)
}
