<script setup lang="ts">
import type { HeroLayoutOptions } from '~/features/sections/hero/hero.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { positionClasses } from '~/features/sections/section.options'
import SectionPhoto from '../SectionPhoto.vue'
import HeroText from './HeroText.vue'

// Layout `split`: text on one half, the first layout photo on the other (`photoSide`), the text placed in its half
// at `textPosition`. On phones the photo goes on top.
const props = defineProps<SectionLayoutProps<'hero', HeroLayoutOptions<'photoSide' | 'textPosition'>>>()

const place = computed(() => positionClasses(props.options.textPosition))
const photoOnLeft = computed(() => props.options.photoSide === 'left')
</script>

<template>
  <!-- Stacked on phones, the photo takes the height the text leaves (at least 14rem), so the hero fills the screen -->
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="grid min-h-[max(var(--site-screen-height),36rem)] grid-rows-[minmax(0,1fr)_auto] @3xl:grid-cols-2 @3xl:grid-rows-none">
    <SectionPhoto
      :src="content.layoutPhotos[0]"
      class="size-full min-h-56 @3xl:row-start-1"
      :class="photoOnLeft ? '@3xl:col-start-1' : '@3xl:col-start-2'"
    />
    <div
      data-hero-text
      class="flex flex-col px-6 py-12 @2xl:px-12 @3xl:row-start-1 @3xl:py-20"
      :class="[place.justify, place.items, photoOnLeft ? '@3xl:col-start-2' : '@3xl:col-start-1']"
    >
      <HeroText :content="content" :occasion="occasion" :styles="styles" :align="place.align" size="large" class="max-w-md" />
    </div>
  </SectionFrame>
</template>
