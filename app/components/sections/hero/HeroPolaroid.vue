<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '../SectionPhoto.vue'
import HeroText from './HeroText.vue'

// Layout `polaroid`: two tilted instant photos beside the title (`photoSide`); on phones they sit above it.
// The white print borders are part of the look (like real instant photos), not a theme colour.
const props = defineProps<SectionLayoutProps<'hero'>>()

const photosOnLeft = computed(() => props.options.photoSide === 'left')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <div class="mx-auto grid max-w-6xl items-center gap-12 @3xl:grid-cols-2">
      <div data-hero-text class="@3xl:row-start-1" :class="photosOnLeft ? '@3xl:col-start-2' : '@3xl:col-start-1'">
        <HeroText :content="content" :styles="styles" align="start" size="large" />
      </div>
      <div
        data-polaroids
        class="relative order-first mx-auto h-72 w-full max-w-sm @2xl:h-96 @3xl:order-none @3xl:row-start-1 @3xl:max-w-md"
        :class="photosOnLeft ? '@3xl:col-start-1' : '@3xl:col-start-2'"
      >
        <div class="absolute top-0 left-0 w-3/5 -rotate-6 bg-white p-3 pb-10 shadow-xl">
          <SectionPhoto :src="content.layoutPhotos[0]" :variant="0" class="aspect-square w-full" />
        </div>
        <div class="absolute right-0 bottom-0 w-3/5 rotate-[5deg] bg-white p-3 pb-10 shadow-xl">
          <SectionPhoto :src="content.layoutPhotos[1]" :variant="1" class="aspect-square w-full" />
        </div>
      </div>
    </div>
  </SectionFrame>
</template>
