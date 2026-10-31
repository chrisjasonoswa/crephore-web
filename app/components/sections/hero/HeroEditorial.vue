<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '../SectionPhoto.vue'
import HeroText from './HeroText.vue'

// Layout `editorial`: a huge headline with the details and button on one row, and a wide photo
// below or above it (`photoPosition`), like a magazine cover. `textAlign` sets left or centred text.
const props = defineProps<SectionLayoutProps<'hero'>>()

const align = computed(() => (props.options.textAlign === 'center' ? 'center' : 'start'))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <div class="mx-auto flex max-w-6xl flex-col gap-8 @2xl:gap-10" :class="options.photoPosition === 'above' && 'flex-col-reverse'">
      <HeroText :content="content" :styles="styles" :align="align" size="display" :inline-cta="align === 'start'" />
      <SectionPhoto :src="content.layoutPhotos[0]" class="aspect-4/3 w-full rounded-(--site-radius) @2xl:aspect-[21/8]" />
    </div>
  </SectionFrame>
</template>
