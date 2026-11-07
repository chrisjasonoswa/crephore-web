import type { CreateEventRequest, Event, UpdateEventRequest } from '~/features/events/event.type'
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

// The end is optional: empty, or a valid date
const optionalDateTime = (label: string) => z
  .string()
  .refine(value => !value || !Number.isNaN(new Date(value).getTime()), `${label} is not a valid date.`)

const endsAfterStart = (value: { startsAt: string, endsAt: string }) =>
  !value.startsAt || !value.endsAt || new Date(value.endsAt) >= new Date(value.startsAt)

// Only a memorial's dates count (other types send none); "yyyy-mm-dd" strings compare in date order
const diedAfterBorn = (value: { type: string, bornOn: string, diedOn: string }) =>
  value.type !== 'Memorial' || !value.bornOn || !value.diedOn || value.diedOn >= value.bornOn

export const eventFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(150, 'Name must be 150 characters or fewer.'),
  type: z.enum(eventTypes, { errorMap: () => ({ message: 'Type is required.' }) }),
  startsAt: dateTime('Start'),
  endsAt: optionalDateTime('End'),
  timezone: z.string().min(1, 'Timezone is required.'),
  // A memorial's dates of birth and passing ("1948-02-14"), each optional (empty)
  bornOn: z.string(),
  diedOn: z.string(),
  subdomain: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Website address is required.')
    // pipe: only check the format once the field is filled in (one error at a time)
    .pipe(z.string().regex(SUBDOMAIN_PATTERN, 'Use 3–63 lowercase letters, numbers and hyphens (not at the start or end).')),
  eventGroupId: z.number().nullable(),
})
  .refine(endsAfterStart, { path: ['endsAt'], message: 'End must be after the start.' })
  .refine(diedAfterBorn, { path: ['diedOn'], message: 'Date of passing must not be before the date of birth.' })

export type EventFormValues = z.infer<typeof eventFormSchema>

export const eventFormInitialValues: EventFormValues = {
  name: '',
  // The most common occasion; the host can change it.
  type: 'Wedding',
  startsAt: '',
  endsAt: '',
  // The host's own timezone; they change it when the venue is elsewhere
  timezone: browserTimeZone(),
  bornOn: '',
  diedOn: '',
  subdomain: '',
  eventGroupId: null,
}

// Edit form: times back to wall-clock values in the event's timezone
export const mapEventToFormValues = (event: Event): EventFormValues => ({
  name: event.name,
  type: event.type,
  startsAt: toWallClock(event.startsAt, event.timezone),
  endsAt: event.endsAt ? toWallClock(event.endsAt, event.timezone) : '',
  timezone: event.timezone,
  bornOn: event.bornOn ?? '',
  diedOn: event.diedOn ?? '',
  subdomain: event.subdomain,
  eventGroupId: event.eventGroup?.id ?? null,
})

// Saving the event's fields (update); create adds the group
export const mapFormValuesToUpdateEventRequest = (values: EventFormValues): UpdateEventRequest => ({
  name: values.name.trim(),
  type: values.type,
  startsAt: values.startsAt,
  endsAt: values.endsAt || null,
  timezone: values.timezone,
  // Only memorials keep them
  bornOn: values.type === 'Memorial' ? values.bornOn || null : null,
  diedOn: values.type === 'Memorial' ? values.diedOn || null : null,
  subdomain: values.subdomain.trim().toLowerCase(),
})

// A new event, in the group picked in the groups panel (if any)
export const mapFormValuesToEventRequest = (values: EventFormValues): CreateEventRequest => ({
  ...mapFormValuesToUpdateEventRequest(values),
  eventGroupId: values.eventGroupId,
})
