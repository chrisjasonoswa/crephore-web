<script setup lang="ts">
import type { ProgramLayoutOptions } from '~/features/sections/program/program.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { programDays, programMarker, showsTime } from '~/features/sections/program/program.helpers'
import ProgramDayDivider from './ProgramDayDivider.vue'
import ProgramHeading from './ProgramHeading.vue'
import ProgramSpeakers from './ProgramSpeakers.vue'
import ProgramVenues from './ProgramVenues.vue'

// Layout `big-times`: each time set large in the heading font, the title, venue, speakers ("with …") and note beside it,
// centred on the time whatever their length, `columns` a row from 1024px. A line under each item except a day's last row. Without times (`showTime`) the items are
// numbered 01, 02, … instead.
const props = defineProps<SectionLayoutProps<'program', ProgramLayoutOptions<'titleAlign' | 'showTime' | 'columns'>>>()
// Where the program's and the venues' eyebrow and heading sit (`titleAlign`)
const titleAlign = computed(() => props.options.titleAlign)

const days = computed(() => programDays(props.occasion.program.items))
const timed = computed(() => showsTime(props.options))
const columnClasses: Record<string, string> = { 1: 'max-w-2xl', 2: '@3xl:grid-cols-2' }

// A line under every item but those in a day's last row: the last item, and in two columns (from 1024px) the one beside
// it when the row is full
function lineClasses(position: number, count: number): string {
  if (position === count - 1)
    return ''
  const besideLast = props.options.columns === '2' && count % 2 === 0 && position === count - 2
  return besideLast ? 'border-b border-current/15 pb-6 @3xl:border-b-0 @3xl:pb-0' : 'border-b border-current/15 pb-6'
}
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <ProgramHeading :content="content" :venue="occasion.program.venue" :styles="styles" :align="titleAlign" class="mx-auto" />
    <!-- The gap matches the space under the day divider, so the divider sits midway -->
    <div v-if="occasion.program.items.length" class="mx-auto mt-10 flex flex-col gap-8">
      <div v-for="day in days" :key="day.date">
        <ProgramDayDivider :label="day.label" :styles="styles" class="mb-8" />
        <ol data-program-items class="grid gap-x-12 gap-y-6" :class="columnClasses[options.columns]">
          <li
            v-for="({ item, index }, i) in day.items"
            :key="item.id"
            data-program-item
            class="flex items-center gap-5"
            :class="lineClasses(i, day.items.length)"
          >
            <p data-program-marker class="w-32 shrink-0 font-(family-name:--site-font-heading) leading-none @2xl:w-40" :class="styles.eyebrow">
              <span class="text-5xl @2xl:text-6xl">{{ programMarker(item, index, timed).clock }}</span>
              <span v-if="programMarker(item, index, timed).period" class="ms-1 text-base">{{ programMarker(item, index, timed).period }}</span>
            </p>
            <div data-program-text class="min-w-0 flex-1">
              <h3 class="font-(family-name:--site-font-heading) text-xl leading-snug @2xl:text-2xl" :class="styles.brandText">
                {{ item.title }}
              </h3>
              <p v-if="item.venue" data-program-venue class="mt-1 text-sm font-medium">
                {{ item.venue }}
              </p>
              <ProgramSpeakers :speakers="item.speakers" :styles="styles" class="mt-1" />
              <p v-if="item.description" data-program-description class="mt-1 text-xs" :class="styles.muted">
                {{ item.description }}
              </p>
            </div>
          </li>
        </ol>
      </div>
    </div>
    <ProgramVenues :heading-align="titleAlign" :venues="occasion.program.venues ?? []" :content="content" :styles="styles" look="rows" rule="label" class="mx-auto mt-14" />
  </SectionFrame>
</template>
