import { describe, expect, it } from 'vitest'
import {
  eventGroupFormInitialValues,
  eventGroupFormSchema,
  mapEventGroupToFormValues,
  mapFormValuesToEventGroupRequest,
} from '~/pages/(dashboard)/dashboard/events/_components/event-group.form.schema'

describe('eventGroupFormSchema', () => {
  it('accepts a name', () => {
    expect(eventGroupFormSchema.safeParse({ name: 'Birthdays', eventIds: [1, 2] }).success).toBe(true)
  })

  it('rejects a blank name', () => {
    const result = eventGroupFormSchema.safeParse({ ...eventGroupFormInitialValues, name: '   ' })

    expect(result.error?.issues[0]).toMatchObject({ path: ['name'], message: 'Name is required.' })
  })

  it('rejects a name over 100 characters', () => {
    expect(eventGroupFormSchema.safeParse({ name: 'a'.repeat(101), eventIds: [] }).success).toBe(false)
  })
})

describe('event group mappers', () => {
  it('maps a group to form values, with its events selected', () => {
    const event = { name: 'CJ 30th', type: 'Birthday' as const, startsAt: '2027-06-12T07:00:00Z', timezone: 'Asia/Manila' }
    expect(mapEventGroupToFormValues({
      id: 4,
      name: 'Birthdays',
      eventCount: 2,
      createdAt: '2026-10-24T00:00:00Z',
      events: [{ id: 7, ...event }, { id: 9, ...event }],
    })).toEqual({ id: 4, name: 'Birthdays', eventIds: [7, 9] })
  })

  it('sends the trimmed name and the selected events', () => {
    expect(mapFormValuesToEventGroupRequest({ id: 4, name: '  Birthdays  ', eventIds: [7] })).toEqual({ name: 'Birthdays', eventIds: [7] })
  })
})
