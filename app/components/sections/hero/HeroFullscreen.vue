<script setup lang="ts">
import type { Position } from '~/features/sections/section.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { overlayFor, positionClasses } from '~/features/sections/section.options'
import HeroText from './HeroText.vue'

// Layout `fullscreen` ("Full"): the text fills the section at `textPosition`. On the photo background the
// background photo fills it under an overlay (primary without a photo, see SectionFrame); on light, primary or accent it's
// just the colour.
const props = defineProps<SectionLayoutProps<'hero'>>()

const position = computed(() => props.options.textPosition as Position)
const place = computed(() => positionClasses(position.value))
</script>

<template>
  <SectionFrame
    v-slot="{ styles }"
    :background="background"
    :image-url="content.backgroundPhoto"
    :overlay="overlayFor(position)"
    class="flex min-h-[36rem] flex-col @2xl:min-h-[44rem]"
  >
    <div class="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-16 @2xl:px-10 @2xl:py-24" :class="[place.justify, place.items]">
      <HeroText :content="content" :styles="styles" :align="place.align" size="display" class="max-w-2xl" />
    </div>
  </SectionFrame>
</template>
