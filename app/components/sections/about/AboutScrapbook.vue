<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import AboutText from './AboutText.vue'

// Layout `scrapbook`: three tilted instant photos, overlapping, beside the story on a light sheet of paper
// (`photoSide`). On phones the photos go on top. The note has its own solid surface, so the background photo needs no
// overlay; the white print borders are part of the look, not a theme colour.
const props = defineProps<SectionLayoutProps<'about'>>()

const photoOnLeft = computed(() => props.options.photoSide === 'left')
// The note is always light, whatever the background
const noteStyles = backgroundStyles.light

// Where each instant photo sits in the pile, and its tilt
const polaroids = [
  'top-0 start-0 -rotate-6',
  'top-8 end-0 rotate-3',
  'bottom-0 start-[20%] rotate-[-1deg]',
]
</script>

<template>
  <SectionFrame :background="background" :image-url="content.backgroundPhoto" overlay="none" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <div class="mx-auto flex max-w-6xl flex-col items-center gap-12 @3xl:gap-14" :class="photoOnLeft ? '@3xl:flex-row' : '@3xl:flex-row-reverse'">
      <div data-about-photos class="relative h-80 w-full max-w-sm shrink-0 @2xl:h-[24rem] @2xl:max-w-md @3xl:flex-1">
        <div
          v-for="(position, index) in polaroids"
          :key="index"
          data-about-polaroid
          class="absolute w-[58%] bg-white p-2.5 pb-8 shadow-xl"
          :class="position"
        >
          <SectionPhoto data-about-photo :src="content.layoutPhotos[index]" :variant="index" class="aspect-square w-full" />
        </div>
      </div>
      <div data-about-note class="w-full max-w-lg rounded-(--site-radius) p-7 shadow-xl @2xl:p-10" :class="noteStyles.root">
        <AboutText :content="content" :styles="noteStyles" align="start" />
      </div>
    </div>
  </SectionFrame>
</template>
