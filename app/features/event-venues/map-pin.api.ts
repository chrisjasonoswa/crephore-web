// The pin in a Google Maps or Apple Maps link, from this app's own server route (server/api/map-pin.get.ts), which
// follows short links. Not the Crephore API, so it doesn't go through ~/lib/axios.
export interface MapPinResponse {
  lat: number
  lng: number
  exact: boolean
}

/** The link's pin, or null when it has none or can't be read. */
export async function getMapPin(url: string): Promise<MapPinResponse | null> {
  try {
    return await $fetch<MapPinResponse>('/api/map-pin', { query: { url } })
  }
  catch {
    return null
  }
}
