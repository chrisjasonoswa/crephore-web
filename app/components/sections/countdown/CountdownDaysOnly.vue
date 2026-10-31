<script setup lang="ts">
import type { Align } from '~/features/sections/section.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { formatOccasionDate, useCountdown } from '~/features/sections/countdown'
import { alignClasses } from '~/features/sections/section.options'
import CountdownButton from './CountdownButton.vue'

// Layout `days-only` ("Days only"): one huge number of days ("112 days to go"), then the title and date.
// Bold and simple; ignores `showSeconds`. Aligned by `textAlign`.
const props = defineProps<SectionLayoutProps<'countdown'>>()

const { units } = useCountdown(() => props.occasion, false)
const days = computed(() => units.value[0]!)
const align = computed(() => props.options.textAlign as Align)
const date = computed(() => formatOccasionDate(props.occasion))

const justify = { start: 'justify-start', center: 'justify-center', end: 'justify-end' }
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-16 @2xl:px-10 @2xl:py-24" :class="alignClasses[align]">
      <p
        v-if="content.eyebrow"
        class="text-[0.7rem] font-semibold tracking-[0.25em] uppercase @2xl:text-xs"
        :class="styles.eyebrow"
      >
        {{ content.eyebrow }}
      </p>

      <p role="timer" data-unit="days" class="flex flex-col font-(family-name:--site-font-heading)" :class="alignClasses[align]">
        <span class="text-[7rem] leading-[0.85] font-semibold tracking-tight tabular-nums @2xl:text-[11rem]">{{ days.text }}</span>
        <span class="mt-3 text-2xl @2xl:text-3xl">{{ days.value === 1 ? 'day to go' : 'days to go' }}</span>
      </p>

      <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm @2xl:text-base" :class="[justify[align], styles.muted]">
        <h2 v-if="content.title">
          {{ content.title }}
        </h2>
        <span v-if="content.title" aria-hidden="true">·</span>
        <span data-countdown-date>{{ date }}</span>
      </div>

      <CountdownButton :cta="content.cta" :styles="styles" class="mt-2" />
    </div>
  </SectionFrame>
</template>
