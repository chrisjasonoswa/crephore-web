<script setup lang="ts">
import type { CountdownLayoutOptions } from '~/features/sections/countdown/countdown.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import { useCountdown } from '~/features/sections/countdown/countdown.helpers'
import { backgroundColours, resolveBackground } from '~/features/sections/section.background'
import CountdownButton from './CountdownButton.vue'
import CountdownHeading from './CountdownHeading.vue'

// Layout `invitation`: like an invitation card. On one half the eyebrow, the heading large, the
// message (`body`), then under a thin rule the countdown in big heading-font numbers with small spaced labels, left
// aligned with no dividers, and the button. On the other half (`photoSide`) two layout photos: a tall one at the far
// side and a smaller one overlapping its lower corner on the text's side, framed in the section's own colour so it
// looks cut out of the page. On phones the photos go under the text. No date.
const props = defineProps<SectionLayoutProps<'countdown', CountdownLayoutOptions<'photoSide'>>>()

const { units } = useCountdown(() => props.occasion, () => props.content.showSeconds)
const photosOnLeft = computed(() => props.options.photoSide === 'left')
// The small photo's frame: the colour the section shows (on a photo background, its dark backdrop)
const frameColour = computed(() => backgroundColours[resolveBackground(props.background, props.content.backgroundPhoto)].background)
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-16 @2xl:py-24">
    <div class="mx-auto grid items-center gap-14 @3xl:grid-cols-2 @3xl:gap-12 @5xl:gap-20">
      <div data-countdown-text class="flex flex-col items-start @3xl:row-start-1" :class="photosOnLeft ? '@3xl:col-start-2' : '@3xl:col-start-1'">
        <CountdownHeading :content="content" :occasion="occasion" :styles="styles" align="start" size="display" />
        <p v-if="content.body" data-countdown-body class="mt-6 max-w-lg text-base leading-relaxed whitespace-pre-line @2xl:text-lg" :class="styles.muted">
          {{ content.body }}
        </p>

        <div class="mt-10 w-full max-w-lg border-t border-current/20 pt-8 @2xl:mt-12 @2xl:pt-10">
          <div role="timer" class="flex flex-wrap gap-x-8 gap-y-6 @2xl:gap-x-12">
            <div v-for="unit in units" :key="unit.key" :data-unit="unit.key" class="flex flex-col">
              <span class="font-(family-name:--site-font-heading) text-5xl leading-none tabular-nums @2xl:text-6xl">
                {{ unit.text }}
              </span>
              <span class="mt-3 text-[0.65rem] font-medium tracking-[0.25em] uppercase @2xl:text-xs" :class="styles.muted">
                {{ unit.label }}
              </span>
            </div>
          </div>
        </div>

        <CountdownButton :cta="content.cta" :styles="styles" class="mt-10" />
      </div>

      <!-- The tall photo at the far side; the small one over its lower corner, on the text's side -->
      <div data-countdown-photos class="relative @3xl:row-start-1" :class="photosOnLeft ? '@3xl:col-start-1' : '@3xl:col-start-2'">
        <SectionPhoto
          data-countdown-photo
          :src="content.layoutPhotos[0]"
          class="aspect-3/4 w-[76%] rounded-(--site-radius)"
          :class="photosOnLeft ? 'me-auto' : 'ms-auto'"
        />
        <div
          class="absolute bottom-[3%] w-[48%] rounded-(--site-radius) border-6 @2xl:border-8"
          :class="photosOnLeft ? 'end-0' : 'start-0'"
          :style="{ borderColor: frameColour, backgroundColor: frameColour }"
        >
          <SectionPhoto data-countdown-photo :src="content.layoutPhotos[1]" :variant="1" class="aspect-4/5 w-full rounded-[calc(var(--site-radius)/2)]" />
        </div>
      </div>
    </div>
  </SectionFrame>
</template>
