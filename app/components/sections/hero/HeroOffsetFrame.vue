<script setup lang="ts">
import type { SectionBackground, SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhotoCarousel from '../SectionPhotoCarousel.vue'
import HeroText from './HeroText.vue'

// Layout `offset-frame`: the names on one side; on the other a block of colour with the photo laid over it, offset
// down and towards the text like a layered print (`photoSide`). Up to five layout photos; more than one play as a
// slideshow. On phones the block and photo go on top. The button and the date and venue ("Date", "Location") sit
// under the names.
const props = defineProps<SectionLayoutProps<'hero'>>()

const PHOTOS = 5
const photos = computed(() => props.content.layoutPhotos.slice(0, PHOTOS))
const photoOnLeft = computed(() => props.options.photoSide === 'left')

// The block uses the background's button colour (the other brand colour), so it stands out on every background
const blockColours: Record<SectionBackground, string> = {
  light: 'bg-(--site-button-light)',
  primary: 'bg-(--site-button-primary)',
  accent: 'bg-(--site-button-accent)',
  photo: 'bg-(--site-button-photo)',
}
</script>

<template>
  <SectionFrame
    v-slot="{ styles, background: shown }"
    :background="background"
    :image-url="content.backgroundPhoto"
    :overlay="photoOnLeft ? 'end' : 'start'"
    class="grid @3xl:min-h-[44rem] @3xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
  >
    <div
      data-hero-photo
      class="relative px-6 pt-12 @2xl:px-12 @3xl:row-start-1 @3xl:p-0"
      :class="photoOnLeft ? '@3xl:col-start-1' : '@3xl:col-start-2'"
    >
      <div
        data-offset-block
        aria-hidden="true"
        class="absolute top-0 h-3/4 @3xl:h-full"
        :class="[blockColours[shown], photoOnLeft ? 'start-0 end-[40%] @3xl:end-[9%]' : 'start-[40%] end-0 @3xl:start-[9%]']"
      />
      <!-- The wrapper takes the spot (absolute insets stretch a div, but not an <img>, which would keep its own size);
           the photo, slideshow or placeholder fills it -->
      <div
        data-offset-photo
        class="relative aspect-4/5 w-full @3xl:absolute @3xl:top-[24%] @3xl:bottom-0 @3xl:aspect-auto @3xl:w-auto"
        :class="photoOnLeft ? '@3xl:start-[10%] @3xl:end-0' : '@3xl:start-0 @3xl:end-[10%]'"
      >
        <SectionPhotoCarousel :photos="photos" class="size-full" />
      </div>
    </div>

    <div
      data-hero-text
      class="flex flex-col justify-center px-6 py-12 @2xl:px-12 @3xl:row-start-1 @3xl:py-20 @3xl:ps-16"
      :class="photoOnLeft ? '@3xl:col-start-2' : '@3xl:col-start-1'"
    >
      <HeroText
        :content="content"
        :styles="styles"
        align="start"
        size="large"
        labelled-details
        :title-class="shown === 'light' ? 'text-(--site-primary-text)' : undefined"
        class="max-w-xl"
      />
    </div>
  </SectionFrame>
</template>
