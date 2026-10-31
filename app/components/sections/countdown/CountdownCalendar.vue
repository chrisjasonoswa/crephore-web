<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { calendarMonth, calendarWeekdays, formatOccasionDate, useCountdown } from '~/features/sections/countdown'
import CountdownButton from './CountdownButton.vue'
import CountdownDividedNumbers from './CountdownDividedNumbers.vue'
import CountdownHeading from './CountdownHeading.vue'

// Layout `calendar`: a calendar page of the occasion's month with its day circled, beside (`calendarSide`) the
// eyebrow, title, date and a small countdown. On phones the calendar goes on top and everything is centred.
// The page is paper-like (the light background and text) on every background.
const props = defineProps<SectionLayoutProps<'countdown'>>()

const { units } = useCountdown(() => props.occasion, () => props.content.showSeconds)
const month = computed(() => calendarMonth(props.occasion))
const date = computed(() => formatOccasionDate(props.occasion))
const calendarOnRight = computed(() => props.options.calendarSide === 'right')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto">
    <div
      class="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-6 py-16 @2xl:px-10 @2xl:py-24 @3xl:flex-row @3xl:justify-center @3xl:gap-16"
      :class="calendarOnRight && '@3xl:flex-row-reverse'"
    >
      <div
        data-calendar
        class="w-full max-w-xs shrink-0 rounded-(--site-radius) border border-(--site-border) bg-(--site-bg) p-5 text-(--site-text) shadow-sm"
      >
        <p class="text-center font-(family-name:--site-font-heading) text-xl">
          {{ month.title }}
        </p>
        <div class="mt-4 grid grid-cols-7 gap-y-1 text-center text-xs tabular-nums">
          <span v-for="(weekday, index) in calendarWeekdays" :key="`w${index}`" aria-hidden="true" class="pb-1 text-[0.65rem] font-medium text-(--site-muted)">
            {{ weekday }}
          </span>
          <span v-for="blank in month.leadingBlanks" :key="`b${blank}`" aria-hidden="true" />
          <span
            v-for="day in month.daysInMonth"
            :key="day"
            class="mx-auto flex size-7 items-center justify-center rounded-full"
            :class="day === month.day && 'bg-(--site-button-light) font-semibold text-(--site-on-button-light)'"
            :aria-current="day === month.day ? 'date' : undefined"
          >
            {{ day }}
          </span>
        </div>
      </div>

      <div data-countdown-text class="flex flex-col items-center gap-5 text-center @3xl:items-start @3xl:text-start">
        <CountdownHeading :content="content" :styles="styles" size="medium" class="@3xl:items-start @3xl:text-start" />
        <p data-countdown-date class="text-sm @2xl:text-base" :class="styles.muted">
          {{ date }}
        </p>
        <CountdownDividedNumbers :units="units" :label-class="styles.muted" size="small" class="@3xl:justify-start" />
        <CountdownButton :cta="content.cta" :styles="styles" class="mt-1" />
      </div>
    </div>
  </SectionFrame>
</template>
