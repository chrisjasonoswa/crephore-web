<script setup lang="ts">
import CToast from '~/components/custom/c-toast/CToast.vue'

useHead({
  htmlAttrs: { lang: 'en' },
  titleTemplate: title => (title ? `${title} · Crephore` : 'Crephore'),
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <CToast rich-colors close-button />
</template>
