<script setup lang="ts">
import { cToast } from '~/lib/cToast'
import SignInForm from './_components/SignInForm.vue'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Sign in' })

const route = useRoute()

// Set by the API client when a request fails because the session ended.
onMounted(() => {
  if (route.query.reason === 'session-expired')
    cToast({ title: 'Your session has expired. Please sign in again.', type: 'info' })
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-semibold tracking-tight">
      Sign in
    </h1>
    <p class="mt-2 text-muted-foreground">
      Welcome back. Sign in to manage your events.
    </p>

    <SignInForm />

    <p class="mt-8 text-center text-sm text-muted-foreground">
      New to Crephore?
      <NuxtLink to="/sign-up" class="font-medium text-accent-foreground hover:underline">
        Create an account
      </NuxtLink>
    </p>
  </div>
</template>
