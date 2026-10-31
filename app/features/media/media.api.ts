import type { Media } from './media.type'
import type { ApiResponse } from '~/types/api'
import { post } from '~/lib/axios'

export const MediaApiRoutes = {
  media: (eventId: number) => `/events/${eventId}/media`,
}

/* APIs */
// A photo for the event's website, sent as multipart/form-data in `file`
export const uploadPhoto = (eventId: number, file: File) => {
  const form = new FormData()
  form.append('file', file)
  return post<ApiResponse<Media>>(MediaApiRoutes.media(eventId), form)
}
