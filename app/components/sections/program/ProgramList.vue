<script setup lang="ts">
import type { ProgramItem } from '~/features/sections/program/program.type'
import type { ProgramLayoutOptions } from '~/features/sections/program/program.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { formatProgramTime, programDays, showsTime } from '~/features/sections/program/program.helpers'
import ProgramDayDivider from './ProgramDayDivider.vue'
import ProgramHeading from './ProgramHeading.vue'
import ProgramSpeakers from './ProgramSpeakers.vue'
import ProgramVenues from './ProgramVenues.vue'

// Layout `list` ("Simple list"): one row per item with a thin line under it (none under a day's last item: the next
// day's divider or the venues' rule, as the timeline's, takes its place): the time, the title, and on the right
// the venue, speakers ("with …") and a small note, stacked in that order. They sit under the title on
// phones. When no item has any of them, the title moves to the right instead, across from the time.
const props = defineProps<SectionLayoutProps<'program', ProgramLayoutOptions<'titleAlign' | 'showTime'>>>()
// Where the program's and the venues' eyebrow and heading sit (`titleAlign`)
const titleAlign = computed(() => props.options.titleAlign)

const days = computed(() => programDays(props.occasion.program.items))
const timed = computed(() => showsTime(props.options))
const hasDetails = (item: ProgramItem) => !!(item.venue || item.speakers?.trim() || item.description)
// Nothing would sit on the right, so the titles do
const titlesOnRight = computed(() => !props.occasion.program.items.some(hasDetails))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <ProgramHeading :content="content" :venue="occasion.program.venue" :styles="styles" :align="titleAlign" class="mx-auto max-w-3xl" />
    <!-- Each day's date sits close to its items (just the first row's padding under it), with a wide gap before the next
         day, so the date reads as that day's heading -->
    <div v-if="occasion.program.items.length" class="mx-auto mt-10 flex max-w-3xl flex-col gap-6 @2xl:gap-8">
      <div v-for="day in days" :key="day.date">
        <ProgramDayDivider :label="day.label" :styles="styles" />
        <ol data-program-items>
          <li
            v-for="({ item }, i) in day.items"
            :key="item.id"
            data-program-item
            class="flex items-baseline gap-4 py-4 @2xl:gap-8"
            :class="i < day.items.length - 1 && 'border-b border-current/15'"
          >
            <p v-if="timed" data-program-time class="w-20 shrink-0 text-sm font-semibold @2xl:w-24" :class="styles.eyebrow">
              {{ formatProgramTime(item.startTime) }}
            </p>
            <div class="flex min-w-0 flex-1 flex-col gap-1 @2xl:flex-row @2xl:items-baseline @2xl:justify-between @2xl:gap-6">
              <h3
                class="font-(family-name:--site-font-heading) text-lg leading-snug @2xl:text-xl"
                :class="[styles.brandText, titlesOnRight && 'ms-auto text-end']"
              >
                {{ item.title }}
              </h3>
              <div
                v-if="hasDetails(item)"
                data-program-details
                class="flex flex-col gap-1 @2xl:max-w-xs @2xl:shrink-0 @2xl:items-end @2xl:text-end"
              >
                <!-- The section's text colour, not the softer one, so the venue reads clearly above the note -->
                <p v-if="item.venue" data-program-venue class="text-sm">
                  {{ item.venue }}
                </p>
                <ProgramSpeakers :speakers="item.speakers" :styles="styles" class="@2xl:justify-end" />
                <p v-if="item.description" data-program-description class="text-xs" :class="styles.muted">
                  {{ item.description }}
                </p>
              </div>
            </div>
          </li>
        </ol>
      </div>
    </div>
    <!-- As the timeline's: the rule in the day dividers' label colour, 88px under the last item (its 1rem padding plus
         mt-18, the timeline's 2rem plus mt-14) -->
    <ProgramVenues :heading-align="titleAlign" :venues="occasion.program.venues ?? []" :content="content" :styles="styles" look="rows" rule="label" class="mx-auto mt-18 max-w-3xl" />
  </SectionFrame>
</template>
