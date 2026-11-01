<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import AboutChapter from './AboutChapter.vue'
import AboutText from './AboutText.vue'

// Layout `timeline-zigzag`: the heading and intro, then the chapters along a centre line, alternating sides: each
// chapter's photo on one side, its text on the other, swapping every chapter (`firstPhotoSide` for the first).
// On phones the line runs down the left with each photo above its text.
const props = defineProps<SectionLayoutProps<'about'>>()

const photoOnLeft = (index: number) => (index % 2 === 0) === (props.options.firstPhotoSide === 'left')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <AboutText :content="content" :styles="styles" align="center" class="mx-auto max-w-2xl" />
    <ol v-if="content.timeline.length" data-about-timeline class="relative mx-auto mt-12 flex max-w-5xl flex-col gap-10 @3xl:gap-14">
      <span aria-hidden="true" class="absolute inset-y-0 start-1.5 w-px bg-current/20 @3xl:start-1/2" />
      <li
        v-for="(item, index) in content.timeline"
        :key="index"
        data-about-chapter
        :data-photo-side="photoOnLeft(index) ? 'left' : 'right'"
        class="relative grid gap-4 ps-8 @3xl:grid-cols-2 @3xl:items-center @3xl:gap-16 @3xl:ps-0"
      >
        <span aria-hidden="true" class="absolute start-0 top-1 size-3 rounded-full bg-current @3xl:start-1/2 @3xl:top-1/2 @3xl:-translate-x-1/2 @3xl:-translate-y-1/2" />
        <SectionPhoto
          data-chapter-photo
          :src="item.photo"
          :variant="index"
          class="aspect-16/10 w-full rounded-(--site-radius) @3xl:row-start-1"
          :class="photoOnLeft(index) ? '@3xl:col-start-1' : '@3xl:col-start-2'"
        />
        <!-- Text on the left reads towards the line -->
        <AboutChapter
          :item="item"
          :styles="styles"
          class="@3xl:row-start-1"
          :class="photoOnLeft(index) ? '@3xl:col-start-2' : '@3xl:col-start-1 @3xl:items-end @3xl:text-end'"
        />
      </li>
    </ol>
  </SectionFrame>
</template>
