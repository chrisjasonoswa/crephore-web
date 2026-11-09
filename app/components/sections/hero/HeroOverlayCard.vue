<script setup lang="ts">
import type { HeroLayoutOptions } from '~/features/sections/hero/hero.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import { positionClasses } from '~/features/sections/section.options'
import HeroText from './HeroText.vue'

// Layout `overlay-card` ("Floating card"): the details sit in a solid light card at `cardPosition`, so the text is
// readable on any photo (no overlay) or colour. The card's place lines up with the other sections' content
// (`--site-edge`), so a card on the left or right shares their edge.
const props = defineProps<SectionLayoutProps<'hero', HeroLayoutOptions<'cardPosition'>>>()

const place = computed(() => positionClasses(props.options.cardPosition))
// The card is always light, whatever the photo
const cardStyles = backgroundStyles.light
</script>

<template>
  <SectionFrame
    :background="background"
    :image-url="content.backgroundPhoto"
    overlay="none"
    class="flex min-h-[max(var(--site-screen-height),36rem)] flex-col"
  >
    <div class="flex w-full flex-1 flex-col px-(--site-edge) py-10 @2xl:py-16" :class="[place.justify, place.items]">
      <div data-hero-card class="w-full max-w-md rounded-(--site-radius) p-7 shadow-xl @2xl:p-10" :class="cardStyles.root">
        <HeroText :content="content" :occasion="occasion" :styles="cardStyles" :align="place.align === 'end' ? 'start' : place.align" size="medium" />
      </div>
    </div>
  </SectionFrame>
</template>
