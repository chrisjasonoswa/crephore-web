<script setup lang="ts">
import type { HeroLayoutOptions } from '~/features/sections/hero/hero.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { overlayFor, positionClasses } from '~/features/sections/section.options'
import HeroText from './HeroText.vue'

// Layout `fullscreen` ("Full"): the text fills the section at `textPosition`. On the photo background the
// background photo fills it under an overlay (primary without a photo, see SectionFrame); on light, primary or secondary it's
// just the colour. With the text off-centre, the photo also fades into a solid colour at the text's edge (`edge`).
const props = defineProps<SectionLayoutProps<'hero', HeroLayoutOptions<'textPosition'>>>()

const position = computed(() => props.options.textPosition)
const place = computed(() => positionClasses(position.value))
</script>

<template>
  <SectionFrame
    v-slot="{ styles }"
    :background="background"
    :image-url="content.backgroundPhoto"
    :overlay="overlayFor(position)"
    :edge="position !== 'center'"
    class="flex min-h-[max(var(--site-screen-height),36rem)] flex-col"
  >
    <!-- The full width, so text placed left or right sits near that edge, padded like every other section's content
         until their 1280px column is full, then a little more as the screen grows (`--site-hero-edge`) -->
    <div class="flex w-full flex-1 flex-col px-(--site-hero-edge) py-16 @2xl:py-24" :class="[place.justify, place.items]">
      <HeroText :content="content" :occasion="occasion" :styles="styles" :align="place.align" size="display" class="max-w-2xl" />
    </div>
  </SectionFrame>
</template>
