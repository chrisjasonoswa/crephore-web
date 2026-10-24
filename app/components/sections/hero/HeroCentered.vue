<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import HeroContentBlock from './HeroContentBlock.vue'
import HeroLayoutImage from './HeroLayoutImage.vue'

// Layout `centered`: text in the middle. The layout image goes above the text.
// The section background is a colour, or the background image on `photo`; the overlay is strongest where the text sits.
defineProps<SectionLayoutProps<'hero'>>()
</script>

<template>
  <SectionFrame
    v-slot="{ styles }"
    :background="background"
    :image-url="content.backgroundImageUrl"
    overlay="full"
    class="flex min-h-[36rem] flex-col justify-center @2xl:min-h-[44rem]"
  >
    <div class="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 py-16 @2xl:py-24">
      <HeroLayoutImage v-if="content.layoutImageUrl" :src="content.layoutImageUrl" class="max-w-md" />
      <HeroContentBlock :content="content" :styles="styles" align="center" />
    </div>
  </SectionFrame>
</template>
