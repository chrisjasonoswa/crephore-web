<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { attireOf, joinColourNames } from '~/features/sections/dress-code/dress-code.helpers'
import DressCodeHanger from './DressCodeHanger.vue'

// Layout `pill` (compact): a small centred pill: a hanger, the attire in the heading font (when there is one), tiny
// swatches and, after a rule, what to avoid ("No white or ivory", when there are colours to avoid). Wraps on phones.
const props = defineProps<SectionLayoutProps<'dress-code'>>()

const attire = computed(() => attireOf(props.content))
const avoid = computed(() => joinColourNames(props.content.avoidColours, 'or'))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-8 @2xl:py-10">
    <div
      data-dress-pill
      class="mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-(--site-radius) border border-current/15 px-6 py-3 text-center @2xl:rounded-full"
    >
      <DressCodeHanger class="size-5 shrink-0" :class="styles.accent" />
      <span v-if="attire" data-dress-attire class="font-(family-name:--site-font-heading) text-lg @2xl:text-xl" :class="styles.brandText">{{ attire }}</span>
      <!-- A rule before the swatches only after the attire (the hanger needs none) -->
      <ul v-if="content.colours.length" data-dress-swatches class="flex items-center gap-2 border-current/15" :class="attire && '@2xl:border-s @2xl:ps-4'">
        <li
          v-for="colour in content.colours"
          :key="colour.id"
          data-dress-colour
          :data-colour-name="colour.name"
          :title="colour.name"
          class="size-3 rounded-full border border-current/15"
          :style="{ backgroundColor: colour.hex }"
        >
          <span class="sr-only">{{ colour.name }}</span>
        </li>
      </ul>
      <span v-if="avoid" data-dress-avoid class="text-sm first-letter:uppercase @2xl:border-s @2xl:border-current/15 @2xl:ps-4" :class="styles.muted">No {{ avoid }}</span>
    </div>
  </SectionFrame>
</template>
