<script setup lang="ts">
import type { AboutLayoutOptions } from '~/features/sections/about/about.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import AboutText from './AboutText.vue'

// Layout `portrait`: a portrait in a `frame` (arch, oval or circle) above the story (`textAlign`); the second and
// third photos as small circles below it, only when added. For a celebrant or a tribute. The circles' white ring is
// part of the look, not a theme colour.
const props = defineProps<SectionLayoutProps<'about', AboutLayoutOptions<'frame' | 'textAlign'>>>()

const align = computed(() => props.options.textAlign)
const frameClasses = computed(() => ({
  arch: 'aspect-3/4 rounded-t-full',
  oval: 'aspect-4/5 rounded-[50%]',
  circle: 'aspect-square rounded-full',
}[props.options.frame]))
const extras = computed(() => props.content.layoutPhotos.slice(1, 3).filter(Boolean))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <AboutText :content="content" :styles="styles" :align="align" class="mx-auto max-w-3xl">
      <template #before-heading>
        <SectionPhoto data-about-photo :data-frame="options.frame" :src="content.layoutPhotos[0]" class="w-36 @2xl:w-44" :class="frameClasses" />
      </template>
      <template v-if="extras.length" #after>
        <div data-about-extras class="flex gap-3">
          <SectionPhoto
            v-for="(photo, index) in extras"
            :key="index"
            data-about-photo
            :src="photo"
            class="size-12 rounded-full bg-white p-0.5 shadow-md @2xl:size-14"
          />
        </div>
      </template>
    </AboutText>
  </SectionFrame>
</template>
