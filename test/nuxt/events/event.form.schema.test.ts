import { describe, expect, it } from 'vitest'
import {
  eventFormInitialValues,
  eventFormSchema,
  mapEventToFormValues,
  mapFormValuesToEventRequest,
  mapFormValuesToUpdateEventRequest,
} from '~/pages/(dashboard)/dashboard/events/_components/event.form.schema'

const validValues = {
  ...eventFormInitialValues,
  name: 'Ana & Marco',
  type: 'Wedding' as const,
  startsAt: '2027-06-12T15:00',
  endsAt: '2027-06-12T23:00',
  timezone: 'Asia/Manila',
  subdomain: 'ana-and-marco',
}

const issuePaths = (values: unknown) =>
  eventFormSchema.safeParse(values).error?.issues.map(issue => issue.path.join('.')) ?? []

describe('eventFormSchema', () => {
  it('accepts valid values', () => {
    expect(eventFormSchema.safeParse(validValues).success).toBe(true)
  })

  it('requires name, start and subdomain, not the end or a venue (venues have their own tab)', () => {
    expect(issuePaths(eventFormInitialValues)).toEqual(
      expect.arrayContaining(['name', 'startsAt', 'subdomain']),
    )
    expect(issuePaths(eventFormInitialValues).some(path => path.startsWith('venue'))).toBe(false)
    expect(issuePaths(eventFormInitialValues)).not.toContain('endsAt')
    expect(eventFormSchema.safeParse({ ...validValues, endsAt: '' }).success).toBe(true)
  })

  it('defaults the timezone to the browser\'s and requires one', () => {
    expect(eventFormInitialValues.timezone).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone)
    expect(issuePaths({ ...validValues, timezone: '' })).toEqual(['timezone'])
  })

  it('rejects an end before the start', () => {
    expect(issuePaths({ ...validValues, endsAt: '2027-06-12T10:00' })).toEqual(['endsAt'])
  })

  it('rejects a memorial\'s date of passing before its date of birth', () => {
    const memorial = { ...validValues, type: 'Memorial' as const, bornOn: '1938-05-01' }

    expect(issuePaths({ ...memorial, diedOn: '1938-04-30' })).toEqual(['diedOn'])
    expect(eventFormSchema.safeParse({ ...memorial, diedOn: '1938-05-01' }).success).toBe(true)
    // Either date alone, or none
    expect(eventFormSchema.safeParse({ ...memorial, bornOn: '', diedOn: '2026-10-03' }).success).toBe(true)
  })

  it('ignores the life dates of another type', () => {
    expect(eventFormSchema.safeParse({ ...validValues, bornOn: '2026-10-03', diedOn: '1938-05-01' }).success).toBe(true)
  })

  it('asks for a website address (the subdomain) in plain words', () => {
    const issue = eventFormSchema.safeParse({ ...validValues, subdomain: '' }).error?.issues[0]

    expect(issue).toMatchObject({ path: ['subdomain'], message: 'Website address is required.' })
  })

  it.each(['ab', '-ana', 'ana-', 'ana_marco', 'ana marco'])('rejects the subdomain "%s"', (subdomain) => {
    expect(issuePaths({ ...validValues, subdomain })).toEqual(['subdomain'])
  })

  it('accepts an uppercase subdomain (it is lowercased)', () => {
    expect(eventFormSchema.safeParse({ ...validValues, subdomain: 'Ana-And-Marco' }).success).toBe(true)
  })
})

describe('mapFormValuesToEventRequest', () => {
  it('trims text and sends wall-clock dates with the timezone, without a venue', () => {
    const request = mapFormValuesToEventRequest({
      ...validValues,
      name: '  Ana & Marco  ',
      subdomain: ' Ana-And-Marco ',
      eventGroupId: 3,
    })

    expect(request).toEqual({
      name: 'Ana & Marco',
      type: 'Wedding',
      // As entered; the API reads them in the timezone
      startsAt: '2027-06-12T15:00',
      endsAt: '2027-06-12T23:00',
      timezone: 'Asia/Manila',
      bornOn: null,
      diedOn: null,
      subdomain: 'ana-and-marco',
      eventGroupId: 3,
    })
  })

  it('sends a memorial\'s life dates, blanks as null, and none for other types', () => {
    const memorial = { ...validValues, type: 'Memorial' as const, bornOn: '1938-05-01', diedOn: '' }

    expect(mapFormValuesToEventRequest(memorial)).toMatchObject({ bornOn: '1938-05-01', diedOn: null })
    expect(mapFormValuesToEventRequest({ ...memorial, type: 'Wedding' })).toMatchObject({ bornOn: null, diedOn: null })
  })
})

describe('mapFormValuesToUpdateEventRequest', () => {
  it('sends the event\'s fields without the group (grouping is done in the groups panel), and no end as null', () => {
    const request = mapFormValuesToUpdateEventRequest({ ...validValues, endsAt: '', eventGroupId: 3 })

    expect(request).not.toHaveProperty('eventGroupId')
    expect(request).toMatchObject({ name: 'Ana & Marco', startsAt: '2027-06-12T15:00', endsAt: null })
  })
})

describe('mapEventToFormValues', () => {
  it('leaves the end empty for an event without one', () => {
    const values = mapEventToFormValues({
      id: 7,
      name: 'Ana & Marco',
      type: 'Wedding',
      venueName: 'Taal Vista',
      startsAt: '2027-06-12T07:00:00+00:00',
      endsAt: null,
      timezone: 'Asia/Manila',
      bornOn: null,
      diedOn: null,
      subdomain: 'ana-and-marco',
      createdAt: '2026-10-26T00:00:00+00:00',
      access: ['Owner'],
      eventGroup: null,
    })

    expect(values.endsAt).toBe('')
  })

  it('fills the edit form, with the times back in the event\'s timezone', () => {
    const values = mapEventToFormValues({
      id: 7,
      name: 'Ana & Marco',
      type: 'Wedding',
      venueName: 'Taal Vista',
      startsAt: '2027-06-12T07:00:00+00:00',
      endsAt: '2027-06-12T15:00:00+00:00',
      timezone: 'Asia/Manila',
      bornOn: '1938-05-01',
      diedOn: null,
      subdomain: 'ana-and-marco',
      createdAt: '2026-10-26T00:00:00+00:00',
      access: ['Owner'],
      eventGroup: { id: 3, name: 'Family' },
    })

    expect(values).toEqual({
      name: 'Ana & Marco',
      type: 'Wedding',
      // 07:00 UTC is 3:00 PM in Manila, whatever the browser's timezone
      startsAt: '2027-06-12T15:00',
      endsAt: '2027-06-12T23:00',
      timezone: 'Asia/Manila',
      // Dates as they are, a missing one empty
      bornOn: '1938-05-01',
      diedOn: '',
      subdomain: 'ana-and-marco',
      eventGroupId: 3,
    })
  })
})
