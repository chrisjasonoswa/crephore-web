<script setup lang="ts">
import type { Position } from '~/features/sections/section.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { positionClasses } from '~/features/sections/section.options'
import SectionPhoto from '../SectionPhoto.vue'
import HeroText from './HeroText.vue'

// Layout `split`: text on one half, the first layout photo on the other (`photoSide`), the text placed in its half
// at `textPosition`. On phones the photo goes on top.
const props = defineProps<SectionLayoutProps<'hero'>>()

const place = computed(() => positionClasses(props.options.textPosition as Position))
const photoOnLeft = computed(() => props.options.photoSide === 'left')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="grid @3xl:min-h-[40rem] @3xl:grid-cols-2">
    <SectionPhoto
      :src="content.layoutPhotos[0]"
      class="aspect-4/3 w-full @3xl:row-start-1 @3xl:aspect-auto @3xl:h-full"
      :class="photoOnLeft ? '@3xl:col-start-1' : '@3xl:col-start-2'"
    />
    <div
      data-hero-text
      class="flex flex-col px-6 py-12 @2xl:px-12 @3xl:row-start-1 @3xl:py-20"
      :class="[place.justify, place.items, photoOnLeft ? '@3xl:col-start-2' : '@3xl:col-start-1']"
    >
      <HeroText :content="content" :styles="styles" :align="place.align" size="large" class="max-w-md" />
    </div>
  </SectionFrame>
</template>
