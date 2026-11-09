<script setup lang="ts">
import type { DressColour } from '~/features/sections/dress-code/dress-code.type'
import type { BackgroundStyles } from '~/features/sections/section.background'
import type { Align } from '~/features/sections/section.options'
import { justifyClasses } from '~/features/sections/section.options'

// The suggested colours as a row of swatches in the host's own colours (circles or squares), each with its name under
// it (when it has one). A thin ring keeps pale colours (linen, ivory) visible on a pale background.
// Nothing without colours. Not a layout.
withDefaults(defineProps<{
  colours: DressColour[]
  styles: BackgroundStyles
  shape?: 'circle' | 'square'
  size?: 'small' | 'medium' | 'large'
  align?: Align
}>(), {
  shape: 'circle',
  size: 'medium',
  align: 'center',
})

const sizes = { small: 'size-6', medium: 'size-10 @2xl:size-12', large: 'size-14 @2xl:size-20' }
</script>

<template>
  <ul v-if="colours.length" data-dress-swatches class="flex flex-wrap gap-4 @2xl:gap-6" :class="justifyClasses[align]">
    <li v-for="colour in colours" :key="colour.id" data-dress-colour :data-colour-name="colour.name" class="flex flex-col items-center gap-1.5">
      <span
        aria-hidden="true"
        class="block shrink-0 border border-current/15"
        :class="[sizes[size], shape === 'circle' ? 'rounded-full' : 'rounded-(--site-radius)']"
        :style="{ backgroundColor: colour.hex }"
      />
      <span v-if="colour.name" class="text-xs font-medium">{{ colour.name }}</span>
    </li>
  </ul>
</template>
