<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '../SectionPhoto.vue'
import HeroText from './HeroText.vue'

// Layout `collage`: three photos (one tall, two stacked) around the names. From 768px `textPosition` puts the
// text between the photos, or to their left or right; on phones the text comes first, the photos below it.
const props = defineProps<SectionLayoutProps<'hero'>>()

// Desktop column order of [text, tall photo, stacked photos]
const order = computed(() => ({
  center: { text: '@3xl:order-2', tall: '@3xl:order-1', stacked: '@3xl:order-3', columns: '@3xl:grid-cols-[1fr_1.3fr_1fr]' },
  left: { text: '@3xl:order-1', tall: '@3xl:order-2', stacked: '@3xl:order-3', columns: '@3xl:grid-cols-[1.3fr_1fr_1fr]' },
  right: { text: '@3xl:order-3', tall: '@3xl:order-1', stacked: '@3xl:order-2', columns: '@3xl:grid-cols-[1fr_1fr_1.3fr]' },
}[props.options.textPosition as 'center' | 'left' | 'right'] ?? { text: '', tall: '', stacked: '', columns: '' }))
const align = computed(() => (props.options.textPosition === 'center' ? 'center' : 'start'))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <div class="mx-auto grid max-w-6xl items-center gap-8 @3xl:min-h-[30rem] @3xl:gap-6" :class="order.columns">
      <div data-hero-text class="@3xl:px-4" :class="order.text">
        <HeroText :content="content" :styles="styles" :align="align" size="medium" />
      </div>
      <!-- On phones the photos sit side by side under the text; from 768px each becomes its own column -->
      <div class="grid grid-cols-2 gap-3 @3xl:contents">
        <SectionPhoto :src="content.layoutPhotos[0]" :variant="0" class="h-full min-h-56 w-full rounded-(--site-radius) @3xl:min-h-[30rem]" :class="order.tall" />
        <div class="grid gap-3 @3xl:h-full @3xl:gap-6" :class="order.stacked">
          <SectionPhoto :src="content.layoutPhotos[1]" :variant="1" class="h-full min-h-26 w-full rounded-(--site-radius)" />
          <SectionPhoto :src="content.layoutPhotos[2]" :variant="2" class="h-full min-h-26 w-full rounded-(--site-radius)" />
        </div>
      </div>
    </div>
  </SectionFrame>
</template>
