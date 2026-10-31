<script setup lang="ts">
// One section photo, or a soft placeholder in the event's colours when there is none, so layouts keep their shape
// (photos are optional while a host builds the page). Layouts pass the shape and size classes.
const props = withDefaults(defineProps<{
  src?: string
  // Varies the placeholder tint between neighbouring photos
  variant?: number
}>(), {
  variant: 0,
})

const placeholders = [
  'from-(--site-accent)/70 to-(--site-primary)/25',
  'from-(--site-primary)/25 to-(--site-accent)/60',
  'from-(--site-accent)/45 to-(--site-bg)/40',
]
const placeholder = computed(() => placeholders[props.variant % placeholders.length])
</script>

<template>
  <img v-if="src" :src="src" alt="" class="object-cover">
  <div v-else aria-hidden="true" data-photo-placeholder class="bg-linear-to-b" :class="placeholder" />
</template>
