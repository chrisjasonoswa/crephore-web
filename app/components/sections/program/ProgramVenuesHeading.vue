<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'
import type { ProgramContent } from '~/features/sections/program/program.type'
import type { Align } from '~/features/sections/section.options'
import { alignClasses } from '~/features/sections/section.options'

// The program's venues block's own eyebrow and heading (`venuesEyebrow`, `venuesHeading`), each left out when empty;
// nothing at all without either. Not a layout: `ProgramVenues` places it, `align`ed, in the heading font at the usual
// heading size, like `ProgramHeading`.
withDefaults(defineProps<{
  content: Pick<ProgramContent, 'venuesEyebrow' | 'venuesHeading'>
  styles: BackgroundStyles
  align?: Align
}>(), {
  align: 'center',
})
</script>

<template>
  <div
    v-if="content.venuesEyebrow || content.venuesHeading"
    data-program-venues-heading
    class="flex flex-col"
    :class="alignClasses[align]"
  >
    <p
      v-if="content.venuesEyebrow"
      data-venues-eyebrow
      class="text-[0.7rem] font-semibold tracking-[0.25em] uppercase"
      :class="styles.eyebrow"
    >
      {{ content.venuesEyebrow }}
    </p>
    <h3
      v-if="content.venuesHeading"
      data-venues-heading
      class="font-(family-name:--site-font-heading) text-balance"
      :class="[
        styles.brandText,
        'text-3xl leading-tight @2xl:text-4xl',
        content.venuesEyebrow && 'mt-2',
      ]"
    >
      {{ content.venuesHeading }}
    </h3>
  </div>
</template>
