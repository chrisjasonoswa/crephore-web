<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import CFormTextField from '~/components/custom/c-form/CFormTextField.vue'
import { login } from '~/features/auth/auth.api'
import { useAuthStore } from '~/features/auth/auth.store'
import { getApiErrors } from '~/lib/axios'
import { applyServerErrors } from '~/lib/form'
import { cToast } from '~/lib/cToast'
import { mapFormValuesToLoginRequest, signInFormInitialValues, signInFormSchema } from './sign-in.form.schema'

const authStore = useAuthStore()

const { handleSubmit, isSubmitting, values, setFieldError } = useForm({
  validationSchema: toTypedSchema(signInFormSchema),
  initialValues: signInFormInitialValues,
})

const onSubmit = handleSubmit(async (formValues) => {
  try {
    const response = await login(mapFormValuesToLoginRequest(formValues))

    // The login response already includes the user, so no extra /auth/me call is needed.
    authStore.setAuth({ user: response.data.user })

    cToast({ title: 'You have successfully signed in.', type: 'success' })
    await navigateTo('/dashboard')
  }
  catch (error) {
    // The API's message (e.g. "Invalid credentials") is shown as a toast by the API client.
    applyServerErrors({ values, setFieldError }, getApiErrors(error))
  }
})
</script>

<template>
  <form class="mt-8 flex flex-col gap-5" novalidate @submit="onSubmit">
    <CFormTextField
      name="email"
      label="Email"
      type="email"
      autocomplete="email"
      placeholder="you@example.com"
    />

    <div class="flex flex-col gap-2">
      <CFormTextField
        name="password"
        label="Password"
        type="password"
        autocomplete="current-password"
      />
      <!-- TODO: link to the password reset flow once it exists -->
      <a href="#" class="self-end text-sm font-medium text-accent-foreground hover:underline">Forgot password?</a>
    </div>

    <Button type="submit" size="lg" class="mt-2 w-full font-semibold" :disabled="isSubmitting">
      {{ isSubmitting ? 'Signing in…' : 'Sign in' }}
    </Button>
  </form>
</template>
