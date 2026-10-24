<script setup lang="ts">
import SignUpForm from './_components/SignUpForm.vue'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Create your account' })
</script>

<template>
  <div>
    <h1 class="text-3xl font-semibold tracking-tight">
      Create your account
    </h1>
    <p class="mt-2 text-muted-foreground">
      Free to start. Set up your first event in minutes.
    </p>

    <SignUpForm />

    <p class="mt-8 text-center text-sm text-muted-foreground">
      Already have an account?
      <NuxtLink to="/sign-in" class="font-medium text-accent-foreground hover:underline">
        Sign in
      </NuxtLink>
    </p>
  </div>
</template>
