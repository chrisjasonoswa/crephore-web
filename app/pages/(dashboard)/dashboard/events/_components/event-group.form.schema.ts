import type { CreateEventGroupRequest, EventGroup } from '~/features/event-groups/event-group.type'
import { z } from 'zod'

// Mirrors crephore-backend Create/UpdateEventGroupRequestDto validation.
export const eventGroupFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().trim().min(1, 'Name is required.').max(100, 'Name must be 100 characters or fewer.'),
  // The events that belong to the group
  eventIds: z.array(z.number()),
})

export type EventGroupFormValues = z.infer<typeof eventGroupFormSchema>

export const eventGroupFormInitialValues: EventGroupFormValues = {
  id: undefined,
  name: '',
  eventIds: [],
}

export const mapEventGroupToFormValues = (group: EventGroup): EventGroupFormValues => ({
  id: group.id,
  name: group.name,
  eventIds: group.events.map(event => event.id),
})

export const mapFormValuesToEventGroupRequest = (values: EventGroupFormValues): CreateEventGroupRequest => ({
  name: values.name.trim(),
  eventIds: values.eventIds,
})
