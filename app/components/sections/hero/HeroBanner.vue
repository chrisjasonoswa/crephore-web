<script setup lang="ts">
import type { HeroLayoutOptions } from '~/features/sections/hero/hero.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '../SectionPhoto.vue'
import HeroText from './HeroText.vue'

// Layout `banner`: a wide strip of the first photo, edge to edge, above or below the names (`photoPosition`);
// `textAlign` sets left or centred text, within the other sections' content column (`--site-edge`). Works best with
// landscape photos.
const props = defineProps<SectionLayoutProps<'hero', HeroLayoutOptions<'photoPosition' | 'textAlign'>>>()

const align = computed(() => (props.options.textAlign === 'start' ? 'start' : 'center'))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="flex min-h-[max(var(--site-screen-height),36rem)] flex-col" :class="options.photoPosition === 'below' && 'flex-col-reverse'">
    <!-- Takes the height the text leaves, so the hero fills the screen and no more: the photo fills a box of that height
         (absolutely, so its own height, often taller than the screen, never stretches the hero) -->
    <div data-hero-banner-photo class="relative min-h-52 w-full flex-1 @2xl:min-h-80">
      <SectionPhoto :src="content.layoutPhotos[0]" class="absolute inset-0 size-full" />
    </div>
    <div data-hero-banner-text class="w-full px-(--site-edge) py-12 @2xl:py-16">
      <HeroText :content="content" :occasion="occasion" :styles="styles" :align="align" size="large" />
    </div>
  </SectionFrame>
</template>
