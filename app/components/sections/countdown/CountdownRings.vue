<script setup lang="ts">
import type { CountdownUnit } from '~/features/sections/countdown'
import type { Align } from '~/features/sections/section.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { useCountdown } from '~/features/sections/countdown'
import { alignClasses } from '~/features/sections/section.options'
import CountdownButton from './CountdownButton.vue'
import CountdownHeading from './CountdownHeading.vue'

// Layout `rings` ("Progress rings"): each unit in a thin ring that empties as time passes (days out of a year,
// hours out of a day, …). Two per row on phones. Aligned by `textAlign`.
const props = defineProps<SectionLayoutProps<'countdown'>>()

const { units } = useCountdown(() => props.occasion, () => props.content.showSeconds)
const align = computed(() => props.options.textAlign as Align)

const RADIUS = 46
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
// How much of the ring is still drawn (empty until the countdown starts)
const offset = (unit: CountdownUnit) => CIRCUMFERENCE * (1 - Math.min(1, (unit.value ?? 0) / unit.max))

const phoneColumns = computed(() => (units.value.length === 4 ? 'grid-cols-2' : 'grid-cols-3'))
const justify = { start: '@2xl:justify-start', center: '@2xl:justify-center', end: '@2xl:justify-end' }
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16 @2xl:px-10 @2xl:py-24" :class="alignClasses[align]">
      <CountdownHeading :content="content" :styles="styles" :align="align" />

      <div role="timer" class="grid gap-4 @2xl:flex @2xl:gap-6" :class="[phoneColumns, justify[align]]">
        <div v-for="unit in units" :key="unit.key" :data-unit="unit.key" class="relative mx-auto size-28 @2xl:mx-0 @2xl:size-36">
          <svg viewBox="0 0 100 100" class="size-full -rotate-90" aria-hidden="true">
            <circle cx="50" cy="50" :r="RADIUS" fill="none" stroke="currentColor" stroke-width="2" class="opacity-15" />
            <circle
              data-ring
              cx="50"
              cy="50"
              :r="RADIUS"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              :stroke-dasharray="CIRCUMFERENCE"
              :stroke-dashoffset="offset(unit)"
              class="transition-[stroke-dashoffset] duration-700"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="font-(family-name:--site-font-heading) text-3xl leading-none tabular-nums @2xl:text-4xl">
              {{ unit.text }}
            </span>
            <span class="mt-1.5 text-[0.55rem] font-medium tracking-[0.2em] uppercase @2xl:text-[0.6rem]" :class="styles.muted">
              {{ unit.label }}
            </span>
          </div>
        </div>
      </div>

      <CountdownButton :cta="content.cta" :styles="styles" />
    </div>
  </SectionFrame>
</template>
