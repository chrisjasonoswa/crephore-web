import { z } from 'zod'
import type { LoginRequest } from '~/features/auth/auth.type'

// No password rules on sign-in: they belong to sign-up, and the API decides what is valid.
export const signInFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    // pipe: only check the format once the field is filled in (one error at a time)
    .pipe(z.string().email('Please enter a valid email address.')),
  password: z
    .string()
    .min(1, 'Password is required.'),
})

export type SignInFormValues = z.infer<typeof signInFormSchema>

export const signInFormInitialValues: SignInFormValues = {
  email: '',
  password: '',
}

export const mapFormValuesToLoginRequest = (values: SignInFormValues): LoginRequest => ({
  email: values.email.trim(),
  password: values.password,
})
