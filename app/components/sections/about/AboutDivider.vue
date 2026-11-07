<script setup lang="ts">
import type { AboutLayoutOptions } from '~/features/sections/about/about.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import AboutText from './AboutText.vue'

// Layout `divider`: a photo and the story split by a thin line (`photoSide`), with a second, round photo sitting on
// the line. On phones the photo goes on top and the round one overlaps its corner. The round photo's white ring is
// part of the look, not a theme colour.
const props = defineProps<SectionLayoutProps<'about', AboutLayoutOptions<'photoSide'>>>()

const photoOnLeft = computed(() => props.options.photoSide === 'left')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <div class="mx-auto grid max-w-6xl gap-12 @3xl:grid-cols-2 @3xl:gap-0">
      <div
        data-about-photo-column
        class="relative @3xl:row-start-1 @3xl:py-6"
        :class="photoOnLeft ? '@3xl:col-start-1 @3xl:pe-16' : '@3xl:col-start-2 @3xl:ps-16'"
      >
        <SectionPhoto data-about-photo :src="content.layoutPhotos[0]" :variant="0" class="aspect-4/5 w-full rounded-(--site-radius) @3xl:aspect-auto @3xl:h-[30rem]" />
        <!-- On the line between the columns from 768px wide -->
        <div
          data-about-round
          class="absolute end-4 -bottom-8 size-20 rounded-full bg-white p-1 shadow-lg @2xl:size-24 @3xl:top-1/2 @3xl:bottom-auto @3xl:-translate-y-1/2"
          :class="photoOnLeft ? '@3xl:end-0 @3xl:translate-x-1/2' : '@3xl:start-0 @3xl:end-auto @3xl:-translate-x-1/2'"
        >
          <SectionPhoto data-about-photo :src="content.layoutPhotos[1]" :variant="1" class="size-full rounded-full" />
        </div>
      </div>
      <div
        data-about-column
        class="flex flex-col justify-center border-current/20 @3xl:row-start-1"
        :class="photoOnLeft ? '@3xl:col-start-2 @3xl:border-s @3xl:ps-16' : '@3xl:col-start-1 @3xl:border-e @3xl:pe-16'"
      >
        <AboutText :content="content" :styles="styles" align="start" />
      </div>
    </div>
  </SectionFrame>
</template>
