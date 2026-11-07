<script setup lang="ts">
import type { HeroLayoutOptions } from '~/features/sections/hero/hero.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '../SectionPhoto.vue'
import HeroText from './HeroText.vue'

// Layout `banner`: a wide strip of the first photo, edge to edge, above or below the names (`photoPosition`);
// `textAlign` sets left or centred text. Works best with landscape photos.
const props = defineProps<SectionLayoutProps<'hero', HeroLayoutOptions<'photoPosition' | 'textAlign'>>>()

const align = computed(() => (props.options.textAlign === 'start' ? 'start' : 'center'))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="flex min-h-[max(var(--site-screen-height),36rem)] flex-col" :class="options.photoPosition === 'below' && 'flex-col-reverse'">
    <!-- Takes the height the text leaves, so the hero fills the screen -->
    <SectionPhoto :src="content.layoutPhotos[0]" class="min-h-52 w-full flex-1 @2xl:min-h-80" />
    <div class="mx-auto w-full max-w-5xl px-6 py-12 @2xl:px-10 @2xl:py-16">
      <HeroText :content="content" :occasion="occasion" :styles="styles" :align="align" size="large" />
    </div>
  </SectionFrame>
</template>
