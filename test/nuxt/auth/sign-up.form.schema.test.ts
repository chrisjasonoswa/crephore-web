import { describe, expect, it } from 'vitest'
import {
  mapFormValuesToSignupRequest,
  signUpFormInitialValues,
  signUpFormSchema,
} from '~/pages/(auth)/sign-up/_components/sign-up.form.schema'

const validValues = {
  firstName: 'Chris',
  lastName: 'Oswa',
  email: 'chris@test.com',
  password: 'password123',
}

describe('signUpFormSchema', () => {
  it('accepts valid values', () => {
    expect(signUpFormSchema.safeParse(validValues).success).toBe(true)
  })

  it('requires every field', () => {
    const result = signUpFormSchema.safeParse(signUpFormInitialValues)

    expect(result.success).toBe(false)
    expect(result.error?.issues.map(issue => issue.path[0])).toEqual(['firstName', 'lastName', 'email', 'password'])
  })

  it('rejects a blank name', () => {
    const result = signUpFormSchema.safeParse({ ...validValues, firstName: '   ' })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]).toMatchObject({
      path: ['firstName'],
      message: 'First name is required.',
    })
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = signUpFormSchema.safeParse({ ...validValues, password: 'short12' })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]).toMatchObject({
      path: ['password'],
      message: 'Password must be at least 8 characters.',
    })
  })
})

describe('mapFormValuesToSignupRequest', () => {
  it('trims text fields and sends the timezone', () => {
    const request = mapFormValuesToSignupRequest(
      { firstName: ' Chris ', lastName: ' Oswa ', email: ' chris@test.com ', password: 'password123' },
      'Asia/Manila',
    )

    expect(request).toEqual({
      firstName: 'Chris',
      lastName: 'Oswa',
      email: 'chris@test.com',
      password: 'password123',
      timezone: 'Asia/Manila',
    })
  })

  it('defaults the timezone to the browser timezone', () => {
    const request = mapFormValuesToSignupRequest(validValues)

    expect(request.timezone).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone)
  })
})
