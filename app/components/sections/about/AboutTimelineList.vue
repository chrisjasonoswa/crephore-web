<script setup lang="ts">
import type { AboutLayoutOptions } from '~/features/sections/about/about.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import AboutChapter from './AboutChapter.vue'
import AboutText from './AboutText.vue'

// Layout `timeline-list`: the heading and intro, then one column of chapters down a line on the left, each with its
// photo beside it (`photoSide`). On phones the photo goes under its text.
const props = defineProps<SectionLayoutProps<'about', AboutLayoutOptions<'photoSide'>>>()

const photoOnLeft = computed(() => props.options.photoSide === 'left')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <AboutText :content="content" :styles="styles" align="start" class="mx-auto max-w-4xl" />
    <ol v-if="content.timeline.length" data-about-timeline class="relative mx-auto mt-12 flex max-w-4xl flex-col gap-10">
      <span aria-hidden="true" class="absolute inset-y-0 start-1.5 w-px bg-current/20" />
      <li
        v-for="(item, index) in content.timeline"
        :key="index"
        data-about-chapter
        class="relative grid gap-4 ps-8 @2xl:items-center @2xl:gap-8 @2xl:ps-10"
        :class="photoOnLeft ? '@2xl:grid-cols-[14rem_1fr]' : '@2xl:grid-cols-[1fr_14rem]'"
      >
        <span aria-hidden="true" class="absolute start-0 top-1 size-3 rounded-full bg-current" :class="styles.accent" />
        <AboutChapter :item="item" :styles="styles" class="@2xl:row-start-1" :class="photoOnLeft ? '@2xl:col-start-2' : '@2xl:col-start-1'" />
        <SectionPhoto
          data-chapter-photo
          :src="item.photo"
          :variant="index"
          class="aspect-16/10 w-full rounded-(--site-radius) @2xl:row-start-1"
          :class="photoOnLeft ? '@2xl:col-start-1' : '@2xl:col-start-2'"
        />
      </li>
    </ol>
  </SectionFrame>
</template>
