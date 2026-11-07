import type { EventProgram, UpdateEventProgramRequest } from './event-program.type'
import type { ApiResponse } from '~/types/api'
import { get, put } from '~/lib/axios'

export const EventProgramApiRoutes = {
  // One program per event
  program: (eventId: number) => `/events/${eventId}/program`,
}

/* APIs */
// An event without items has an empty list
export const getEventProgram = (eventId: number) => {
  return get<ApiResponse<EventProgram>>(EventProgramApiRoutes.program(eventId))
}

export const updateEventProgram = (eventId: number, payload: UpdateEventProgramRequest) => {
  return put<ApiResponse<EventProgram>>(EventProgramApiRoutes.program(eventId), payload)
}
