<script setup lang="ts">
import type { PersonItem } from '~/features/sections/people/people.type'
import type { BackgroundStyles } from '~/features/sections/section.background'
import { personInitials } from '~/features/sections/people/people.helpers'

// A person's photo, or their initials when they have none ("BS"), so every person is recognisable while the host
// collects photos. Layouts pass the shape and size classes. The initials use the section background's `avatar` colours
// (a soft tint of the section's colour), so they switch with the section; their size follows the photo's width.
const props = defineProps<{
  person: PersonItem
  // The section's styles (also on a white card or print inside it)
  styles: BackgroundStyles
}>()

const initials = computed(() => personInitials(props.person.name))
</script>

<template>
  <img v-if="person.photo" :src="person.photo" alt="" class="object-cover">
  <div
    v-else
    aria-hidden="true"
    data-photo-placeholder
    data-person-initials
    class="@container flex items-center justify-center"
    :class="styles.avatar"
  >
    <span class="font-(family-name:--site-font-heading) text-[34cqw] leading-none">{{ initials }}</span>
  </div>
</template>
