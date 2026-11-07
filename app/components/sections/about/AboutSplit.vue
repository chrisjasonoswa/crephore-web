<script setup lang="ts">
import type { AboutLayoutOptions } from '~/features/sections/about/about.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import AboutText from './AboutText.vue'

// Layout `split`: three photos fill one half edge to edge (`photoSide`), one wide on top and two below; the story on
// the other half. On phones the photos go on top.
const props = defineProps<SectionLayoutProps<'about', AboutLayoutOptions<'photoSide'>>>()

const photoOnLeft = computed(() => props.options.photoSide === 'left')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="grid @3xl:min-h-[36rem] @3xl:grid-cols-2">
    <div
      data-about-photos
      class="grid grid-cols-2 gap-1 @3xl:row-start-1 @3xl:grid-rows-[3fr_2fr]"
      :class="photoOnLeft ? '@3xl:col-start-1' : '@3xl:col-start-2'"
    >
      <SectionPhoto data-about-photo :src="content.layoutPhotos[0]" :variant="0" class="col-span-2 aspect-16/9 w-full @3xl:aspect-auto @3xl:h-full" />
      <SectionPhoto data-about-photo :src="content.layoutPhotos[1]" :variant="1" class="aspect-4/3 w-full @3xl:aspect-auto @3xl:h-full" />
      <SectionPhoto data-about-photo :src="content.layoutPhotos[2]" :variant="2" class="aspect-4/3 w-full @3xl:aspect-auto @3xl:h-full" />
    </div>
    <div
      data-about-column
      class="flex flex-col justify-center px-6 py-12 @2xl:px-12 @3xl:row-start-1 @3xl:py-20"
      :class="photoOnLeft ? '@3xl:col-start-2' : '@3xl:col-start-1'"
    >
      <AboutText :content="content" :styles="styles" align="start" class="max-w-lg" />
    </div>
  </SectionFrame>
</template>
