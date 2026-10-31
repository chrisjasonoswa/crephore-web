<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { formatOccasionDate, useCountdown } from '~/features/sections/countdown'
import CountdownButton from './CountdownButton.vue'

// Layout `strip` ("Slim strip"): a thin band with the date ("14 · 02 · 2027") and the countdown inline, to sit
// between other sections. The date on `dateSide`; stacked and centred on phones. The title is for screen readers.
const props = defineProps<SectionLayoutProps<'countdown'>>()

const { units } = useCountdown(() => props.occasion, () => props.content.showSeconds)
const date = computed(() => formatOccasionDate(props.occasion, 'numeric'))
const dateOnRight = computed(() => props.options.dateSide === 'right')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto">
    <div class="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-6 py-6 text-center @3xl:flex-row @3xl:justify-center @3xl:gap-8 @3xl:py-5">
      <h2 v-if="content.title" class="sr-only">
        {{ content.title }}
      </h2>

      <div data-countdown-date class="flex flex-col items-center" :class="dateOnRight ? '@3xl:order-3 @3xl:items-end @3xl:text-end' : '@3xl:order-1 @3xl:items-start @3xl:text-start'">
        <p v-if="content.eyebrow" class="text-[0.6rem] font-semibold tracking-[0.25em] uppercase" :class="styles.eyebrow">
          {{ content.eyebrow }}
        </p>
        <p class="font-(family-name:--site-font-heading) text-xl @2xl:text-2xl">
          {{ date }}
        </p>
      </div>

      <span aria-hidden="true" class="hidden h-10 w-px bg-current/25 @3xl:order-2 @3xl:block" />

      <div
        role="timer"
        class="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1"
        :class="dateOnRight ? '@3xl:order-1' : '@3xl:order-3'"
      >
        <template v-for="(unit, index) in units" :key="unit.key">
          <span v-if="index > 0" aria-hidden="true" :class="styles.muted">·</span>
          <span :data-unit="unit.key" class="whitespace-nowrap">
            <span class="font-(family-name:--site-font-heading) text-2xl tabular-nums @2xl:text-3xl">{{ unit.text }}</span>
            <span class="ml-1 text-[0.6rem] font-medium tracking-[0.2em] uppercase" :class="styles.muted">{{ unit.label }}</span>
          </span>
        </template>
      </div>

      <CountdownButton :cta="content.cta" :styles="styles" class="@3xl:order-4" />
    </div>
  </SectionFrame>
</template>
