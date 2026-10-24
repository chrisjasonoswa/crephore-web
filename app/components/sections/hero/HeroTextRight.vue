<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import HeroContentBlock from './HeroContentBlock.vue'
import HeroLayoutImage from './HeroLayoutImage.vue'

// Layout `text-right`: text on the right. The layout image goes on the left.
// The section background is a colour, or the background image on `photo`; the overlay is strongest where the text sits.
defineProps<SectionLayoutProps<'hero'>>()
</script>

<template>
  <SectionFrame
    v-slot="{ styles }"
    :background="background"
    :image-url="content.backgroundImageUrl"
    overlay="end"
    class="flex min-h-[36rem] flex-col justify-center @2xl:min-h-[44rem]"
  >
    <div class="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-16 @2xl:py-24 @3xl:grid-cols-2 @3xl:gap-16">
      <div class="@3xl:col-start-2 @3xl:row-start-1">
        <HeroContentBlock :content="content" :styles="styles" align="start" compact />
      </div>
      <HeroLayoutImage
        v-if="content.layoutImageUrl"
        :src="content.layoutImageUrl"
        class="order-first @3xl:col-start-1 @3xl:row-start-1 @3xl:aspect-4/5"
      />
    </div>
  </SectionFrame>
</template>
