<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import CFormTextField from '~/components/custom/c-form/CFormTextField.vue'
import { login, signup } from '~/features/auth/auth.api'
import { useAuthStore } from '~/features/auth/auth.store'
import { getApiErrors } from '~/lib/axios'
import { applyServerErrors } from '~/lib/form'
import { cToast } from '~/lib/cToast'
import { mapFormValuesToSignupRequest, signUpFormInitialValues, signUpFormSchema } from './sign-up.form.schema'

const authStore = useAuthStore()

const { handleSubmit, isSubmitting, values, setFieldError } = useForm({
  validationSchema: toTypedSchema(signUpFormSchema),
  initialValues: signUpFormInitialValues,
})

const onSubmit = handleSubmit(async (formValues) => {
  const request = mapFormValuesToSignupRequest(formValues)

  try {
    await signup(request)
  }
  catch (error) {
    // e.g. { email: ["Email already exists."] }; the API's message is also shown as a toast.
    applyServerErrors({ values, setFieldError }, getApiErrors(error))
    return
  }

  try {
    // Signup does not start a session, so sign the new user in right away.
    const response = await login({ email: request.email, password: request.password })
    authStore.setAuth({ user: response.data.user })

    cToast({ title: 'Welcome to Crephore! Your account is ready.', type: 'success' })
    await navigateTo('/dashboard')
  }
  catch {
    // The account exists; let the user sign in manually.
    await navigateTo('/sign-in')
  }
})
</script>

<template>
  <form class="mt-8 flex flex-col gap-5" novalidate @submit="onSubmit">
    <div class="grid grid-cols-2 gap-3">
      <CFormTextField name="firstName" label="First name" autocomplete="given-name" />
      <CFormTextField name="lastName" label="Last name" autocomplete="family-name" />
    </div>

    <CFormTextField
      name="email"
      label="Email"
      type="email"
      autocomplete="email"
      placeholder="you@example.com"
    />

    <CFormTextField
      name="password"
      label="Password"
      type="password"
      autocomplete="new-password"
    >
      <template #description>
        At least 8 characters.
      </template>
    </CFormTextField>

    <Button type="submit" size="lg" class="mt-2 w-full font-semibold" :disabled="isSubmitting">
      {{ isSubmitting ? 'Creating account…' : 'Create account' }}
    </Button>
    <p class="text-center text-xs text-muted-foreground">
      By creating an account you agree to our
      <a href="#" class="underline underline-offset-2 hover:text-foreground">Terms</a>
      and
      <a href="#" class="underline underline-offset-2 hover:text-foreground">Privacy Policy</a>.
    </p>
  </form>
</template>
