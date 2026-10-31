import type {
  CreateEventRequest,
  Event,
  ListEventsRequest,
  UpdateEventRequest,
} from './event.type'
import type { ApiPaginatedResponse, ApiResponse } from '~/types/api'
import { del, get, post, put } from '~/lib/axios'

export const EventApiRoutes = {
  root: '/events',
}

/* APIs */
export const listEvents = (params: ListEventsRequest) => {
  return get<ApiPaginatedResponse<Event>>(EventApiRoutes.root, { params })
}

export const getEvent = (id: number) => {
  return get<ApiResponse<Event>>(`${EventApiRoutes.root}/${id}`)
}

export const addEvent = (payload: CreateEventRequest) => {
  return post<ApiResponse<Event>>(EventApiRoutes.root, payload)
}

export const updateEvent = (id: number, payload: UpdateEventRequest) => {
  return put<ApiResponse<Event>>(`${EventApiRoutes.root}/${id}`, payload)
}

export const deleteEvent = (id: number) => {
  return del<ApiResponse<null>>(`${EventApiRoutes.root}/${id}`)
}

