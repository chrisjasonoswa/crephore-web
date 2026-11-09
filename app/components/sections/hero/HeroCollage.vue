<script setup lang="ts">
import type { HeroLayoutOptions } from '~/features/sections/hero/hero.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '../SectionPhoto.vue'
import HeroText from './HeroText.vue'

// Layout `collage`: three photos (one tall, two stacked) around the names. From 1024px `textPosition` puts the
// text between the photos, or to their left or right; on phones and tablets the text comes first, the photos below it. It spans
// the other sections' content column (`--site-edge`), and from 1024px the photos are as tall as the screen allows (the
// screen's height less 14rem for the padding, between 26rem and 52rem).
const props = defineProps<SectionLayoutProps<'hero', HeroLayoutOptions<'textPosition'>>>()

// Desktop column order of [text, tall photo, stacked photos]. The collage offers only the middle row of the 3×3
// positions (`middleRowChoices`), so its text position is one of these three
const order = computed(() => ({
  center: { text: '@5xl:order-2', tall: '@5xl:order-1', stacked: '@5xl:order-3', columns: '@5xl:grid-cols-[1fr_1.3fr_1fr]' },
  left: { text: '@5xl:order-1', tall: '@5xl:order-2', stacked: '@5xl:order-3', columns: '@5xl:grid-cols-[1.3fr_1fr_1fr]' },
  right: { text: '@5xl:order-3', tall: '@5xl:order-1', stacked: '@5xl:order-2', columns: '@5xl:grid-cols-[1fr_1fr_1.3fr]' },
}[props.options.textPosition as 'center' | 'left' | 'right'] ?? { text: '', tall: '', stacked: '', columns: '' }))
const align = computed(() => (props.options.textPosition === 'center' ? 'center' : 'start'))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="flex min-h-[max(var(--site-screen-height),36rem)] flex-col justify-center px-(--site-edge) py-14 @2xl:py-20">
    <div data-hero-collage class="grid w-full items-center gap-8 @5xl:h-[clamp(26rem,calc(var(--site-screen-height)_-_14rem),52rem)] @5xl:gap-6" :class="order.columns">
      <div data-hero-text class="@5xl:px-4" :class="order.text">
        <HeroText :content="content" :occasion="occasion" :styles="styles" :align="align" size="medium" />
      </div>
      <!-- On phones and tablets the photos sit side by side under the text (from 672px as tall as the screen allows, the
           screen's height less 30rem for the text and padding, between 20rem and 36rem); from 1024px each becomes its
           own column -->
      <div data-hero-collage-photos class="grid grid-cols-2 gap-3 @2xl:h-[clamp(20rem,calc(var(--site-screen-height)_-_30rem),36rem)] @5xl:contents">
        <SectionPhoto :src="content.layoutPhotos[0]" :variant="0" class="h-full min-h-56 w-full rounded-(--site-radius) @5xl:min-h-0" :class="order.tall" />
        <div class="grid h-full grid-rows-2 gap-3 @5xl:gap-6" :class="order.stacked">
          <SectionPhoto :src="content.layoutPhotos[1]" :variant="1" class="h-full min-h-26 w-full rounded-(--site-radius)" />
          <SectionPhoto :src="content.layoutPhotos[2]" :variant="2" class="h-full min-h-26 w-full rounded-(--site-radius)" />
        </div>
      </div>
    </div>
  </SectionFrame>
</template>
