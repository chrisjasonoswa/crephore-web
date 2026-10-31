<script setup lang="ts">
import type { Position } from '~/features/sections/section.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { formatOccasionDate, useCountdown } from '~/features/sections/countdown'
import { alignClasses, overlayFor, positionClasses } from '~/features/sections/section.options'
import CountdownButton from './CountdownButton.vue'
import CountdownDividedNumbers from './CountdownDividedNumbers.vue'
import CountdownHeading from './CountdownHeading.vue'

// Layout `photo` ("Over a photo"): the background photo fills the section under a soft overlay, with the eyebrow, title,
// the date ("14 · 02 · 2027") and light numbers at `textPosition`. Primary colour without a photo.
const props = defineProps<SectionLayoutProps<'countdown'>>()

const { units } = useCountdown(() => props.occasion, () => props.content.showSeconds)
const position = computed(() => props.options.textPosition as Position)
const place = computed(() => positionClasses(position.value))
const date = computed(() => formatOccasionDate(props.occasion, 'numeric'))
</script>

<template>
  <SectionFrame
    v-slot="{ styles }"
    :background="background"
    :image-url="content.backgroundPhoto"
    :overlay="overlayFor(position)"
    class="flex min-h-[32rem] flex-col @2xl:min-h-[40rem]"
  >
    <div
      data-countdown-text
      class="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-16 @2xl:px-10 @2xl:py-24"
      :class="[place.justify, alignClasses[place.align]]"
    >
      <div class="flex flex-col gap-3" :class="place.items">
        <CountdownHeading :content="content" :styles="styles" :align="place.align" />
        <p data-countdown-date class="font-(family-name:--site-font-heading) text-2xl @2xl:text-4xl">
          {{ date }}
        </p>
      </div>
      <CountdownDividedNumbers :units="units" :label-class="styles.muted" :align="place.align" />
      <CountdownButton :cta="content.cta" :styles="styles" />
    </div>
  </SectionFrame>
</template>
