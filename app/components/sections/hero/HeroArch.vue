<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '../SectionPhoto.vue'
import HeroText from './HeroText.vue'

// Layout `arch`: the first photo in an arch, the date and venue below it. `namesPlacement` puts the names
// above or below the arch.
defineProps<SectionLayoutProps<'hero'>>()
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:py-20">
    <HeroText :content="content" :styles="styles" align="center" size="large" class="mx-auto max-w-5xl">
      <template v-if="options.namesPlacement === 'below'" #before-title>
        <SectionPhoto :src="content.layoutPhotos[0]" data-arch class="mb-8 aspect-3/4 w-44 rounded-t-full @2xl:w-56" />
      </template>
      <template v-else #after-title>
        <SectionPhoto :src="content.layoutPhotos[0]" data-arch class="mt-8 aspect-3/4 w-44 rounded-t-full @2xl:w-56" />
      </template>
    </HeroText>
  </SectionFrame>
</template>
