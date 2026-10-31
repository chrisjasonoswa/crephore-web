import type { CreateEventRequest, Event } from '~/features/events/event.type'
import { z } from 'zod'
import { eventTypes } from '~/features/events/event.type'
import { browserTimeZone, toWallClock } from '~/lib/date'

// Mirrors crephore-backend CreateEventRequestDto validation (also used to edit an event).
// Dates are wall-clock values ("2027-06-12T15:00") in the event's timezone; they are sent as they are,
// and the API converts them to UTC with that timezone.

export const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])$/

// pipe: only check the date once the field is filled in (one error at a time)
const dateTime = (label: string) => z
  .string()
  .min(1, `${label} is required.`)
  .pipe(z.string().refine(value => !Number.isNaN(new Date(value).getTime()), `${label} is not a valid date.`))

const endsAfterStart = (value: { startsAt: string, endsAt: string }) =>
  !value.startsAt || !value.endsAt || new Date(value.endsAt) >= new Date(value.startsAt)

// One timeline item, e.g. "Opening"
const timelineItem = z.string().trim().min(1, 'Item is required.').max(150, 'Item must be 150 characters or fewer.')

export const eventFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(150, 'Name must be 150 characters or fewer.'),
  description: z.string().max(2000, 'Description must be 2000 characters or fewer.'),
  type: z.enum(eventTypes, { errorMap: () => ({ message: 'Type is required.' }) }),
  venueName: z.string().trim().min(1, 'Venue name is required.').max(200, 'Venue name must be 200 characters or fewer.'),
  venueAddress: z.string().trim().min(1, 'Venue address is required.').max(500, 'Venue address must be 500 characters or fewer.'),
  startsAt: dateTime('Start'),
  endsAt: dateTime('End'),
  timezone: z.string().min(1, 'Timezone is required.'),
  subdomain: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Website address is required.')
    // pipe: only check the format once the field is filled in (one error at a time)
    .pipe(z.string().regex(SUBDOMAIN_PATTERN, 'Use 3–63 lowercase letters, numbers and hyphens (not at the start or end).')),
  eventGroupId: z.number().nullable(),
  timeline: z.array(timelineItem),
}).refine(endsAfterStart, { path: ['endsAt'], message: 'End must be after the start.' })

export type EventFormValues = z.infer<typeof eventFormSchema>

export const eventFormInitialValues: EventFormValues = {
  name: '',
  description: '',
  // The most common occasion; the host can change it.
  type: 'Wedding',
  venueName: '',
  venueAddress: '',
  startsAt: '',
  endsAt: '',
  // The host's own timezone; they change it when the venue is elsewhere
  timezone: browserTimeZone(),
  subdomain: '',
  eventGroupId: null,
  timeline: [],
}

// Edit form: times back to wall-clock values in the event's timezone
export const mapEventToFormValues = (event: Event): EventFormValues => ({
  name: event.name,
  description: event.description ?? '',
  type: event.type,
  venueName: event.venueName,
  venueAddress: event.venueAddress,
  startsAt: toWallClock(event.startsAt, event.timezone),
  endsAt: toWallClock(event.endsAt, event.timezone),
  timezone: event.timezone,
  subdomain: event.subdomain,
  eventGroupId: event.eventGroup?.id ?? null,
  timeline: [...event.timeline],
})

// Create and update send the same request
export const mapFormValuesToEventRequest = (values: EventFormValues): CreateEventRequest => ({
  name: values.name.trim(),
  description: values.description.trim() || null,
  type: values.type,
  venueName: values.venueName.trim(),
  venueAddress: values.venueAddress.trim(),
  // Always sent; filled once Google Places is integrated.
  venueLatitude: null,
  venueLongitude: null,
  venueGooglePlaceId: null,
  startsAt: values.startsAt,
  endsAt: values.endsAt,
  timezone: values.timezone,
  subdomain: values.subdomain.trim().toLowerCase(),
  eventGroupId: values.eventGroupId,
  timeline: values.timeline.map(item => item.trim()),
})
