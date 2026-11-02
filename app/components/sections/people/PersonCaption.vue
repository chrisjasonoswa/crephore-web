<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'
import type { PersonItem } from '~/features/sections/people/people.type'
import type { Align } from '~/features/sections/section.options'
import { alignClasses } from '~/features/sections/section.options'

// A person's name and role (in small capitals), and their bio when `showBio` is on. Not a layout: the people layouts
// share it. `roleFirst` puts the role above the name (the credits). The name and bio use the background's brand text
// colour and the role its brand label colour (e.g. primary and accent on light, accent and a soft primary on primary).
withDefaults(defineProps<{
  person: PersonItem
  styles: BackgroundStyles
  align?: Align
  size?: 'small' | 'medium' | 'large'
  roleFirst?: boolean
  showBio?: boolean
}>(), {
  align: 'center',
  size: 'small',
  roleFirst: false,
  showBio: false,
})

const nameSizes = {
  small: 'text-base @2xl:text-lg',
  medium: 'text-xl @2xl:text-2xl',
  large: 'text-2xl @2xl:text-3xl',
}
</script>

<template>
  <div data-person-caption class="flex flex-col" :class="alignClasses[align]">
    <p v-if="roleFirst && person.role" data-person-role class="mb-1 text-[0.65rem] font-semibold tracking-[0.18em] uppercase @2xl:text-[0.7rem]" :class="styles.eyebrow">
      {{ person.role }}
    </p>
    <p data-person-name class="font-(family-name:--site-font-heading) leading-snug text-balance" :class="[nameSizes[size], styles.brandText]">
      {{ person.name }}
    </p>
    <p v-if="!roleFirst && person.role" data-person-role class="mt-1 text-[0.65rem] font-semibold tracking-[0.18em] uppercase @2xl:text-[0.7rem]" :class="styles.eyebrow">
      {{ person.role }}
    </p>
    <p v-if="showBio && person.bio" data-person-bio class="mt-2 text-sm leading-relaxed text-pretty whitespace-pre-line" :class="styles.brandText">
      {{ person.bio }}
    </p>
  </div>
</template>
