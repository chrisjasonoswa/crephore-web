import { describe, expect, it } from 'vitest'
import {
  mapFormValuesToLoginRequest,
  signInFormInitialValues,
  signInFormSchema,
} from '~/pages/(auth)/sign-in/_components/sign-in.form.schema'

describe('signInFormSchema', () => {
  it('accepts a valid email and any non-empty password', () => {
    const result = signInFormSchema.safeParse({ email: 'chris@test.com', password: 'x' })

    expect(result.success).toBe(true)
  })

  it('requires both fields', () => {
    const result = signInFormSchema.safeParse(signInFormInitialValues)

    expect(result.success).toBe(false)
    expect(result.error?.issues.map(issue => issue.path[0])).toEqual(['email', 'password'])
  })

  it('rejects an invalid email', () => {
    const result = signInFormSchema.safeParse({ email: 'not-an-email', password: 'password123' })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]).toMatchObject({
      path: ['email'],
      message: 'Please enter a valid email address.',
    })
  })
})

describe('mapFormValuesToLoginRequest', () => {
  it('trims the email but not the password', () => {
    expect(mapFormValuesToLoginRequest({ email: '  chris@test.com ', password: ' secret ' })).toEqual({
      email: 'chris@test.com',
      password: ' secret ',
    })
  })
})
