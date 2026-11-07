// Mirrors crephore-backend Features/EventVenues. An event's venues in the host's order; the first is its main venue
// (the one the hero, the intros and the dashboard show).
export interface EventVenue {
  id: number
  name: string
  address: string | null
  // Links the host pastes from Google Maps and Apple Maps
  googleMapsUrl: string | null
  appleMapsUrl: string | null
  // The pin, read from those links (/api/map-pin) when they're entered; both or neither
  latitude: number | null
  longitude: number | null
  photoUrl: string | null
  // Directions, parking and the like, for guests
  notes: string | null
}

/* API Request Types */
// The whole list; saving replaces it. Venues with an id are updated, new ones (null) added, the rest deleted (their
// program items move to the new main venue).
export type UpdateEventVenueItem = Omit<EventVenue, 'id'> & { id: number | null }

export interface UpdateEventVenuesRequest {
  venues: UpdateEventVenueItem[]
}

/* Editor */
// A venue as the Venues tab edits it: text fields as strings ('' when empty), keyed for the list, plus its saved id
export interface EventVenueDraft {
  key: string
  savedId?: number
  name: string
  address: string
  googleMapsUrl: string
  appleMapsUrl: string
  latitude: number | null
  longitude: number | null
  photoUrl: string
  notes: string
}
