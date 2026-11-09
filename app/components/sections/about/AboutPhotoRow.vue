<script setup lang="ts">
import type { AboutLayoutOptions } from '~/features/sections/about/about.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import AboutBody from './AboutBody.vue'
import AboutHeading from './AboutHeading.vue'
import AboutText from './AboutText.vue'

// Layout `photo-row`: the story with three photos in a row below or above it (`photoPosition`). The heading and story
// are stacked (`textAlign`) or side by side, heading on the left (`textLayout`).
const props = defineProps<SectionLayoutProps<'about', AboutLayoutOptions<'photoPosition' | 'textAlign' | 'textLayout'>>>()

const photosAbove = computed(() => props.options.photoPosition === 'above')
const isSideBySide = computed(() => props.options.textLayout === 'side')
const align = computed(() => props.options.textAlign)
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <div data-about-stack class="mx-auto flex gap-10 @3xl:gap-14" :class="photosAbove ? 'flex-col-reverse' : 'flex-col'">
      <div v-if="isSideBySide" data-about-text class="grid gap-6 @3xl:grid-cols-2 @3xl:gap-16">
        <AboutHeading :content="content" :styles="styles" align="start" size="large" />
        <AboutBody :content="content" align="start" class="@3xl:pt-8" />
      </div>
      <AboutText v-else :content="content" :styles="styles" :align="align" class="w-full" :class="align === 'center' && 'mx-auto max-w-3xl'" />

      <div data-about-photos class="grid grid-cols-3 gap-2 @2xl:gap-4">
        <SectionPhoto
          v-for="index in 3"
          :key="index"
          data-about-photo
          :src="content.layoutPhotos[index - 1]"
          :variant="index - 1"
          class="aspect-4/3 w-full rounded-(--site-radius)"
        />
      </div>
    </div>
  </SectionFrame>
</template>
