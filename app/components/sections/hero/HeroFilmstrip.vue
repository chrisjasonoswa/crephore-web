<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '../SectionPhoto.vue'
import HeroText from './HeroText.vue'

// Layout `filmstrip`: the names with a row of five photos like a film strip, below or above them
// (`photoPosition`); the strip scrolls sideways on phones. `textAlign` sets left or centred text.
const props = defineProps<SectionLayoutProps<'hero'>>()

const FRAMES = 5
// Missing photos show placeholders, so the strip always has five frames
const frames = computed(() => Array.from({ length: FRAMES }, (_, i) => props.content.layoutPhotos[i]))
const align = computed(() => (props.options.textAlign === 'start' ? 'start' : 'center'))
// Above the names, or between the details and the button
const stripSlot = computed(() => (props.options.photoPosition === 'above' ? 'before-title' : 'before-cta'))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="py-14 @2xl:py-20">
    <HeroText :content="content" :styles="styles" :align="align" size="large" class="mx-auto max-w-6xl px-6 @2xl:px-10">
      <template #[stripSlot]>
        <div
          data-filmstrip
          class="flex w-full snap-x gap-3 overflow-x-auto pb-2 @3xl:grid @3xl:grid-cols-5 @3xl:overflow-visible @3xl:pb-0"
          :class="options.photoPosition === 'above' ? 'mb-8' : ''"
        >
          <SectionPhoto
            v-for="(src, i) in frames"
            :key="i"
            :src="src"
            :variant="i"
            class="aspect-4/5 w-36 shrink-0 snap-start rounded-(--site-radius) @3xl:w-full"
          />
        </div>
      </template>
    </HeroText>
  </SectionFrame>
</template>
