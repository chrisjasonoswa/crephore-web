<script setup lang="ts">
import type { AboutLayoutOptions } from '~/features/sections/about/about.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import AboutText from './AboutText.vue'

// Layout `mosaic`: the story beside an inset photo grid (`photoSide`): one tall photo and two small ones stacked
// next to it. On phones the photos go below the story.
const props = defineProps<SectionLayoutProps<'about', AboutLayoutOptions<'photoSide'>>>()

const photoOnLeft = computed(() => props.options.photoSide === 'left')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <div data-about-row class="mx-auto flex max-w-6xl flex-col gap-10 @3xl:items-center @3xl:gap-16" :class="photoOnLeft ? '@3xl:flex-row-reverse' : '@3xl:flex-row'">
      <AboutText :content="content" :styles="styles" align="start" class="@3xl:flex-1" />
      <div data-about-photos class="grid h-80 w-full grid-cols-2 grid-rows-2 gap-3 @2xl:h-96 @3xl:h-[28rem] @3xl:w-1/2">
        <SectionPhoto data-about-photo :src="content.layoutPhotos[0]" :variant="0" class="row-span-2 size-full rounded-(--site-radius)" />
        <SectionPhoto data-about-photo :src="content.layoutPhotos[1]" :variant="1" class="size-full rounded-(--site-radius)" />
        <SectionPhoto data-about-photo :src="content.layoutPhotos[2]" :variant="2" class="size-full rounded-(--site-radius)" />
      </div>
    </div>
  </SectionFrame>
</template>
