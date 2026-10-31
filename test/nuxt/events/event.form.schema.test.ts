import { describe, expect, it } from 'vitest'
import {
  eventFormInitialValues,
  eventFormSchema,
  mapEventToFormValues,
  mapFormValuesToEventRequest,
} from '~/pages/(dashboard)/dashboard/events/_components/event.form.schema'

const validValues = {
  ...eventFormInitialValues,
  name: 'Ana & Marco',
  type: 'Wedding' as const,
  venueName: 'Taal Vista',
  venueAddress: 'Tagaytay',
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

  it('requires name, venue, dates and subdomain', () => {
    expect(issuePaths(eventFormInitialValues)).toEqual(
      expect.arrayContaining(['name', 'venueName', 'venueAddress', 'startsAt', 'endsAt', 'subdomain']),
    )
  })

  it('defaults the timezone to the browser\'s and requires one', () => {
    expect(eventFormInitialValues.timezone).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone)
    expect(issuePaths({ ...validValues, timezone: '' })).toEqual(['timezone'])
  })

  it('rejects an end before the start', () => {
    expect(issuePaths({ ...validValues, endsAt: '2027-06-12T10:00' })).toEqual(['endsAt'])
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

  it('validates each timeline item', () => {
    const paths = issuePaths({ ...validValues, timeline: ['Opening', ' ', 'a'.repeat(151)] })

    expect(paths).toEqual(['timeline.1', 'timeline.2'])
  })
})

describe('mapFormValuesToEventRequest', () => {
  it('trims text, sends wall-clock dates with the timezone and always sends the venue coordinates as null', () => {
    const request = mapFormValuesToEventRequest({
      ...validValues,
      name: '  Ana & Marco  ',
      description: '   ',
      subdomain: ' Ana-And-Marco ',
      eventGroupId: 3,
      timeline: [' Opening ', 'Dinner'],
    })

    expect(request).toEqual({
      name: 'Ana & Marco',
      description: null,
      type: 'Wedding',
      venueName: 'Taal Vista',
      venueAddress: 'Tagaytay',
      venueLatitude: null,
      venueLongitude: null,
      venueGooglePlaceId: null,
      // As entered; the API reads them in the timezone
      startsAt: '2027-06-12T15:00',
      endsAt: '2027-06-12T23:00',
      timezone: 'Asia/Manila',
      subdomain: 'ana-and-marco',
      eventGroupId: 3,
      timeline: ['Opening', 'Dinner'],
    })
  })
})

describe('mapEventToFormValues', () => {
  it('fills the edit form, with the times back in the event\'s timezone', () => {
    const values = mapEventToFormValues({
      id: 7,
      name: 'Ana & Marco',
      description: null,
      type: 'Wedding',
      venueName: 'Taal Vista',
      venueAddress: 'Tagaytay',
      venueLatitude: null,
      venueLongitude: null,
      venueGooglePlaceId: null,
      startsAt: '2027-06-12T07:00:00+00:00',
      endsAt: '2027-06-12T15:00:00+00:00',
      timezone: 'Asia/Manila',
      subdomain: 'ana-and-marco',
      createdAt: '2026-10-26T00:00:00+00:00',
      access: ['Owner'],
      eventGroup: { id: 3, name: 'Family' },
      timeline: ['Opening', 'Dinner'],
    })

    expect(values).toEqual({
      name: 'Ana & Marco',
      description: '',
      type: 'Wedding',
      venueName: 'Taal Vista',
      venueAddress: 'Tagaytay',
      // 07:00 UTC is 3:00 PM in Manila, whatever the browser's timezone
      startsAt: '2027-06-12T15:00',
      endsAt: '2027-06-12T23:00',
      timezone: 'Asia/Manila',
      subdomain: 'ana-and-marco',
      eventGroupId: 3,
      timeline: ['Opening', 'Dinner'],
    })
  })
})
