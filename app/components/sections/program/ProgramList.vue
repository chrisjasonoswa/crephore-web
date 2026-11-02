<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { formatProgramTime, programDays, showsTime } from '~/features/sections/program/program.helpers'
import ProgramDayDivider from './ProgramDayDivider.vue'
import ProgramHeading from './ProgramHeading.vue'
import ProgramSpeakers from './ProgramSpeakers.vue'

// Layout `list` ("Simple list"): one row per item with a thin line under it (none under a day's last item when another
// day follows: the day divider takes its place): the time, the title, and on the right
// the venue, speakers ("with …") and a small note, stacked in that order. They sit under the title on
// phones.
const props = defineProps<SectionLayoutProps<'program'>>()

const days = computed(() => programDays(props.content.items, props.occasion))
const timed = computed(() => showsTime(props.options))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <ProgramHeading :content="content" :styles="styles" />
    <!-- The gap plus the last row's padding match the space under the day divider, so the divider sits midway -->
    <div v-if="content.items.length" class="mx-auto mt-10 flex max-w-3xl flex-col gap-4">
      <div v-for="(day, dayIndex) in days" :key="day.date">
        <ProgramDayDivider :label="day.label" :styles="styles" class="mb-4" />
        <ol data-program-items>
          <li
            v-for="({ item }, i) in day.items"
            :key="item.id"
            data-program-item
            class="flex items-baseline gap-4 py-4 @2xl:gap-8"
            :class="(i < day.items.length - 1 || dayIndex === days.length - 1) && 'border-b border-current/15'"
          >
            <p v-if="timed" data-program-time class="w-20 shrink-0 text-sm font-semibold @2xl:w-24" :class="styles.eyebrow">
              {{ formatProgramTime(item.startTime) }}
            </p>
            <div class="flex min-w-0 flex-1 flex-col gap-1 @2xl:flex-row @2xl:items-baseline @2xl:justify-between @2xl:gap-6">
              <h3 class="font-(family-name:--site-font-heading) text-lg leading-snug @2xl:text-xl" :class="styles.brandText">
                {{ item.title }}
              </h3>
              <div
                v-if="item.venue || item.speakers?.trim() || item.description"
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
  </SectionFrame>
</template>
