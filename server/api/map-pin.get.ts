// GET /api/map-pin?url=<Google Maps or Apple Maps link, short or full>
// The link's pin (server/utils/map-pin.ts), for the Venues tab's map preview; the venue saves it with its links.
// Cached for a day per link.
export default defineCachedEventHandler(async (event) => {
  const { url } = getQuery(event)
  if (typeof url !== 'string' || !isMapLink(url))
    throw createError({ statusCode: 400, statusMessage: 'Provide a valid Google Maps or Apple Maps link' })

  const pin = await resolveMapPin(url)
  if (!pin)
    throw createError({ statusCode: 422, statusMessage: 'No coordinates found in that link' })
  return pin
}, {
  maxAge: 60 * 60 * 24,
  getKey: event => String(getQuery(event).url),
})
