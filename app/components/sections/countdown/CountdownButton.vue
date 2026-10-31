<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'
import type { SectionCta } from '~/features/sections/section.content.type'
import { safeHref } from '~/features/sections/section.links'

// The countdown's optional button (e.g. "Save the date"), in the background's button colours.
defineProps<{
  cta?: SectionCta
  styles: BackgroundStyles
}>()
</script>

<template>
  <a
    v-if="cta"
    :href="safeHref(cta.href)"
    class="inline-flex h-11 shrink-0 items-center rounded-(--site-radius) px-7 text-xs font-semibold tracking-[0.15em] uppercase transition-opacity hover:opacity-90"
    :class="styles.button"
  >
    {{ cta.label }}
  </a>
</template>
