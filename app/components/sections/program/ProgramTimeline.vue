<script setup lang="ts">
import type { ProgramLayoutOptions } from '~/features/sections/program/program.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { formatProgramTime, programDays, showsTime } from '~/features/sections/program/program.helpers'
import ProgramDayDivider from './ProgramDayDivider.vue'
import ProgramHeading from './ProgramHeading.vue'
import ProgramSpeakers from './ProgramSpeakers.vue'
import ProgramVenues from './ProgramVenues.vue'

// Layout `timeline`: a vertical line with a dot per item; the times on one side (`timeColumn`), the title, venue,
// speakers ("with …") and note on the other. Without times (`showTime`) only the line and the details. `titleAlign`
// places the program's and the venues' eyebrow and heading left, centred or right.
const props = defineProps<SectionLayoutProps<'program', ProgramLayoutOptions<'titleAlign' | 'showTime' | 'timeColumn'>>>()

const days = computed(() => programDays(props.occasion.program.items))
const timed = computed(() => showsTime(props.options))
const timesOnRight = computed(() => props.options.timeColumn === 'right')
const titleAlign = computed(() => props.options.titleAlign)
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <ProgramHeading :content="content" :venue="occasion.program.venue" :styles="styles" :align="titleAlign" class="mx-auto max-w-2xl" />
    <div v-if="occasion.program.items.length" class="mx-auto mt-10 flex max-w-2xl flex-col gap-8">
      <div v-for="day in days" :key="day.date">
        <ProgramDayDivider :label="day.label" :styles="styles" class="mb-8" />
        <ol data-program-items>
          <li
            v-for="({ item }, i) in day.items"
            :key="item.id"
            data-program-item
            class="flex gap-4 @2xl:gap-6"
            :class="timesOnRight && 'flex-row-reverse'"
          >
            <p
              v-if="timed"
              data-program-time
              class="w-20 shrink-0 pt-0.5 text-sm @2xl:w-28"
              :class="timesOnRight ? 'text-start' : 'text-end'"
            >
              <span class="block font-semibold" :class="styles.eyebrow">{{ formatProgramTime(item.startTime) }}</span>
              <span v-if="item.endTime" class="block text-xs" :class="styles.muted">to {{ formatProgramTime(item.endTime) }}</span>
            </p>
            <!-- The line runs from this item's dot to the next one's -->
            <div aria-hidden="true" class="relative flex w-3 shrink-0 justify-center">
              <span v-if="i < day.items.length - 1" class="absolute top-3 -bottom-2 w-px bg-current/25" />
              <span class="relative mt-1.5 size-3 rounded-full bg-current" :class="styles.accent" />
            </div>
            <div class="min-w-0 flex-1 pb-8" :class="timesOnRight && timed && 'text-end'">
              <h3 class="font-(family-name:--site-font-heading) text-xl leading-snug @2xl:text-2xl" :class="styles.brandText">
                {{ item.title }}
              </h3>
              <p v-if="item.venue" data-program-venue class="mt-1 text-sm font-medium">
                {{ item.venue }}
              </p>
              <ProgramSpeakers :speakers="item.speakers" :styles="styles" class="mt-1" :class="timesOnRight && timed && 'justify-end'" />
              <p v-if="item.description" data-program-description class="mt-1 text-xs" :class="styles.muted">
                {{ item.description }}
              </p>
            </div>
          </li>
        </ol>
      </div>
    </div>
    <ProgramVenues :venues="occasion.program.venues ?? []" :content="content" :styles="styles" look="rows" rule="label" :heading-align="titleAlign" class="mx-auto mt-14 max-w-2xl" />
  </SectionFrame>
</template>
