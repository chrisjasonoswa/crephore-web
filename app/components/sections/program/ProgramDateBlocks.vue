<script setup lang="ts">
import type { Align } from '~/features/sections/section.options'
import type { ProgramLayoutOptions } from '~/features/sections/program/program.options'
import type { SectionBackground, SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import { formatProgramTime, joinProgramSpeakers, programBlockColours, programBlocks, programDateBadge, programDays, programMonthLabel, showsTime } from '~/features/sections/program/program.helpers'
import ProgramHeading from './ProgramHeading.vue'
import ProgramVenues from './ProgramVenues.vue'

// Layout `date-blocks`: the heading with the month in a badge beside it, then blocks of colour,
// alternating two colours that differ from the section's (`programBlockColours`), each holding one item or a whole day's
// items (`blockPer`) beside a huge day number with the weekday and month. Each item: the time, the title in bold capitals, the venue and "with"
// the speakers on a small line, then the note.
const props = defineProps<SectionLayoutProps<'program', ProgramLayoutOptions<'titleAlign' | 'showTime' | 'blockPer'>>>()
// Where the program's and the venues' eyebrow and heading sit (`titleAlign`)
const titleAlign = computed(() => props.options.titleAlign)
const headerClasses: Record<Align, string> = {
  start: 'items-start justify-between',
  center: 'flex-col items-center',
  end: 'flex-row-reverse items-start justify-between',
}

const days = computed(() => programDays(props.occasion.program.items))
const timed = computed(() => showsTime(props.options))
const perItem = computed(() => props.options.blockPer !== 'day')
const blocks = computed(() => programBlocks(days.value, perItem.value))
const month = computed(() => programMonthLabel(days.value.map(day => day.date)))
// The venue cards in the blocks' two colours, in turn
const venueCardStyles = (shown: SectionBackground) => programBlockColours(shown).map(colour => backgroundStyles[colour])
</script>

<template>
  <SectionFrame v-slot="{ styles, background: shown }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <div class="mx-auto max-w-4xl">
      <!-- The month badge beside the heading (left), under it (centre), or across from it (right) -->
      <div class="flex gap-4" :class="headerClasses[titleAlign]">
        <ProgramHeading :content="content" :venue="occasion.program.venue" :styles="styles" :align="titleAlign" />
        <p
          v-if="month && occasion.program.items.length"
          data-program-month
          class="mt-1 shrink-0 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap shadow-[3px_3px_0_0_currentColor] @2xl:px-4 @2xl:py-1.5 @2xl:text-sm"
          :class="backgroundStyles[programBlockColours(shown)[0]].root"
        >
          {{ month }}
        </p>
      </div>
      <ol v-if="occasion.program.items.length" data-program-items class="mt-8 flex flex-col gap-4 @2xl:mt-10 @2xl:gap-5">
        <li
          v-for="(block, blockIndex) in blocks"
          :key="block.key"
          data-program-block
          class="grid gap-x-8 gap-y-4 rounded-(--site-radius) p-5 @2xl:grid-cols-[11rem_1fr] @2xl:p-7"
          :class="backgroundStyles[programBlockColours(shown)[blockIndex % 2]!].root"
        >
          <div>
            <h3 v-if="block.firstOfDay" data-program-day class="sr-only">
              {{ block.label }}
            </h3>
            <p aria-hidden="true" data-program-date class="flex items-start gap-2 leading-none">
              <span class="font-(family-name:--site-font-heading) text-6xl font-bold @2xl:text-7xl">{{ programDateBadge(block.date).day }}</span>
              <span class="mt-1.5 flex flex-col gap-0.5 text-xs font-bold tracking-[0.1em] uppercase">
                <span>{{ programDateBadge(block.date).weekday }}</span>
                <span>{{ programDateBadge(block.date).month }}</span>
              </span>
            </p>
          </div>
          <ul class="flex flex-col gap-3 self-center">
            <li v-for="{ item } in block.items" :key="item.id" data-program-item class="flex gap-4">
              <p v-if="timed" data-program-time class="w-16 shrink-0 text-xs leading-5 font-bold">
                {{ formatProgramTime(item.startTime) }}
              </p>
              <div class="min-w-0">
                <h3 class="text-sm leading-5 font-bold tracking-[0.04em] uppercase">
                  {{ item.title }}
                </h3>
                <p v-if="item.venue || joinProgramSpeakers(item.speakers)" class="text-xs" :class="backgroundStyles[programBlockColours(shown)[blockIndex % 2]!].muted">
                  <span v-if="item.venue" data-program-venue>{{ item.venue }}</span>
                  <template v-if="item.venue && joinProgramSpeakers(item.speakers)">
                    ·
                  </template>
                  <span v-if="joinProgramSpeakers(item.speakers)" data-program-speakers>with {{ joinProgramSpeakers(item.speakers) }}</span>
                </p>
                <p
                  v-if="item.description"
                  data-program-description
                  class="mt-0.5 text-[0.7rem] italic"
                  :class="backgroundStyles[programBlockColours(shown)[blockIndex % 2]!].muted"
                >
                  {{ item.description }}
                </p>
              </div>
            </li>
          </ul>
        </li>
      </ol>
    </div>
    <ProgramVenues :heading-align="titleAlign" :card-styles="venueCardStyles(shown)" :venues="occasion.program.venues ?? []" :content="content" :styles="styles" look="cards" class="mx-auto mt-14 max-w-4xl" />
  </SectionFrame>
</template>
