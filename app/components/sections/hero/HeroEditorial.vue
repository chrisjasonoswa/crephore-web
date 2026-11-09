<script setup lang="ts">
import type { HeroLayoutOptions } from '~/features/sections/hero/hero.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '../SectionPhoto.vue'
import HeroText from './HeroText.vue'

// Layout `editorial`: a huge headline with the details and button on one row, and a wide photo
// below or above it (`photoPosition`), like a magazine cover. `textAlign` sets left or centred text. It spans the other
// sections' content column (`--site-edge`). The photo is 4:3 on phones, 16:7 from 672px but never taller than the
// screen leaves beside the headline (its height less 26rem, at least 14rem), so the hero fits the screen.
const props = defineProps<SectionLayoutProps<'hero', HeroLayoutOptions<'photoPosition' | 'textAlign'>>>()

const align = computed(() => (props.options.textAlign === 'center' ? 'center' : 'start'))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="flex min-h-[max(var(--site-screen-height),36rem)] flex-col justify-center px-(--site-edge) py-14 @2xl:py-20">
    <div data-hero-editorial class="flex w-full flex-col gap-8 @2xl:gap-10" :class="options.photoPosition === 'above' && 'flex-col-reverse'">
      <HeroText :content="content" :occasion="occasion" :styles="styles" :align="align" size="display" :inline-cta="align === 'start'" />
      <SectionPhoto :src="content.layoutPhotos[0]" data-hero-editorial-photo class="aspect-4/3 w-full rounded-(--site-radius) @2xl:aspect-[16/7] @2xl:max-h-[max(14rem,calc(var(--site-screen-height)_-_26rem))]" />
    </div>
  </SectionFrame>
</template>
