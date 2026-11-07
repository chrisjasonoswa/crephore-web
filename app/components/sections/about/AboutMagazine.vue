<script setup lang="ts">
import type { AboutLayoutOptions } from '~/features/sections/about/about.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import AboutBody from './AboutBody.vue'
import AboutHeading from './AboutHeading.vue'

// Layout `magazine` ("Long read"): like a magazine page. The first photo floats to one side from the top of the story
// (`photoSide`): the eyebrow and heading sit beside it and the story (with a drop cap) wraps around and under it.
// The second and third photos follow in a row below.
const props = defineProps<SectionLayoutProps<'about', AboutLayoutOptions<'photoSide'>>>()

const photoOnLeft = computed(() => props.options.photoSide === 'left')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <div class="mx-auto flex max-w-4xl flex-col gap-8">
      <!-- The heading goes in the story's slot so the photo, floated first, sits beside all of it -->
      <AboutBody data-about-text :content="content" align="start" drop-cap>
        <SectionPhoto
          data-about-photo
          :src="content.layoutPhotos[0]"
          :variant="0"
          class="mb-3 aspect-4/3 w-2/5 rounded-(--site-radius) @2xl:mb-4 @2xl:w-72"
          :class="photoOnLeft ? 'float-left me-5 @2xl:me-8' : 'float-right ms-5 @2xl:ms-8'"
        />
        <AboutHeading :content="content" :styles="styles" align="start" class="mb-5 @2xl:mb-6" />
      </AboutBody>
      <div data-about-photos class="grid grid-cols-2 gap-3 @2xl:gap-4">
        <SectionPhoto data-about-photo :src="content.layoutPhotos[1]" :variant="1" class="aspect-16/9 w-full rounded-(--site-radius)" />
        <SectionPhoto data-about-photo :src="content.layoutPhotos[2]" :variant="2" class="aspect-16/9 w-full rounded-(--site-radius)" />
      </div>
    </div>
  </SectionFrame>
</template>
