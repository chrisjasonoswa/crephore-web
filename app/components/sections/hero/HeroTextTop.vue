<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import HeroContentBlock from './HeroContentBlock.vue'
import HeroLayoutImage from './HeroLayoutImage.vue'

// Layout `text-top`: text at the top, centred. The layout image goes below the text.
// The section background is a colour, or the background image on `photo`; the overlay is strongest where the text sits.
defineProps<SectionLayoutProps<'hero'>>()
</script>

<template>
  <SectionFrame
    v-slot="{ styles }"
    :background="background"
    :image-url="content.backgroundImageUrl"
    overlay="top"
    class="flex min-h-[36rem] flex-col justify-start @2xl:min-h-[44rem]"
  >
    <div class="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 py-16 @2xl:py-24">
      <HeroContentBlock :content="content" :styles="styles" align="center" />
      <HeroLayoutImage v-if="content.layoutImageUrl" :src="content.layoutImageUrl" class="max-w-md" />
    </div>
  </SectionFrame>
</template>
