import { z } from 'zod'
import type { SignupRequest } from '~/features/auth/auth.type'

// Mirrors crephore-backend SignupRequestDto validation.
export const signUpFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required.')
    .max(100, 'First name must be 100 characters or fewer.'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required.')
    .max(100, 'Last name must be 100 characters or fewer.'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    // pipe: only check the format once the field is filled in (one error at a time)
    .pipe(z.string().email('Please enter a valid email address.').max(256, 'Email must be 256 characters or fewer.')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(128, 'Password must be 128 characters or fewer.'),
})

export type SignUpFormValues = z.infer<typeof signUpFormSchema>

export const signUpFormInitialValues: SignUpFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
}

export const mapFormValuesToSignupRequest = (values: SignUpFormValues): SignupRequest => ({
  firstName: values.firstName.trim(),
  lastName: values.lastName.trim(),
  email: values.email.trim(),
  password: values.password,
})
