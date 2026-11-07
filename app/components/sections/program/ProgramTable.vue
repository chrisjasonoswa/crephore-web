<script setup lang="ts">
import type { ProgramLayoutOptions } from '~/features/sections/program/program.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { formatProgramTimeRange, programDays, showsTime } from '~/features/sections/program/program.helpers'
import ProgramHeading from './ProgramHeading.vue'
import ProgramVenues from './ProgramVenues.vue'

// Layout `table`: a table with a column each for the time, session (title and note), speaker and venue;
// the speaker and venue columns only when an item has speakers or a venue. Each day is its own table body under a row with the day. On
// phones each row stacks into a block.
const props = defineProps<SectionLayoutProps<'program', ProgramLayoutOptions<'titleAlign' | 'showTime'>>>()
// Where the program's and the venues' eyebrow and heading sit (`titleAlign`)
const titleAlign = computed(() => props.options.titleAlign)

const days = computed(() => programDays(props.occasion.program.items))
const timed = computed(() => showsTime(props.options))
const venues = computed(() => props.occasion.program.items.some(item => item.venue?.trim()))
const speakers = computed(() => props.occasion.program.items.some(item => item.speakers?.trim()))
const columnCount = computed(() => 1 + Number(timed.value) + Number(speakers.value) + Number(venues.value))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <ProgramHeading :content="content" :venue="occasion.program.venue" :styles="styles" :align="titleAlign" class="mx-auto max-w-5xl" />
    <table v-if="occasion.program.items.length" data-program-items class="mx-auto mt-10 block w-full max-w-5xl text-sm @2xl:table @2xl:border-collapse">
      <thead class="hidden text-start @2xl:table-header-group">
        <tr class="border-b-2 border-current/25 text-[0.7rem] tracking-[0.2em] uppercase" :class="styles.eyebrow">
          <th v-if="timed" scope="col" class="py-3 pe-6 text-start font-semibold">
            Time
          </th>
          <th scope="col" class="py-3 pe-6 text-start font-semibold">
            Session
          </th>
          <th v-if="speakers" scope="col" class="py-3 pe-6 text-start font-semibold">
            Speaker
          </th>
          <th v-if="venues" scope="col" class="py-3 text-start font-semibold">
            Venue
          </th>
        </tr>
      </thead>
      <tbody v-for="(day, dayIndex) in days" :key="day.date" class="block @2xl:table-row-group">
        <tr class="block @2xl:table-row">
          <th
            data-program-day
            scope="colgroup"
            :colspan="columnCount"
            class="block pb-2 text-start text-[0.7rem] font-semibold tracking-[0.25em] uppercase @2xl:table-cell"
            :class="[styles.eyebrow, dayIndex === 0 ? 'pt-6' : 'pt-8']"
          >
            {{ day.label }}
          </th>
        </tr>
        <tr
          v-for="{ item } in day.items"
          :key="item.id"
          data-program-item
          class="block border-b border-current/15 py-4 @2xl:table-row @2xl:py-0"
        >
          <td v-if="timed" data-program-time class="block font-semibold whitespace-nowrap @2xl:table-cell @2xl:py-4 @2xl:pe-6 @2xl:align-top" :class="styles.eyebrow">
            {{ formatProgramTimeRange(item) }}
          </td>
          <td class="block @2xl:table-cell @2xl:py-4 @2xl:pe-6 @2xl:align-top">
            <span class="block font-(family-name:--site-font-heading) text-lg leading-snug" :class="styles.brandText">{{ item.title }}</span>
            <span v-if="item.description" data-program-description class="mt-0.5 block text-xs" :class="styles.muted">{{ item.description }}</span>
          </td>
          <td v-if="speakers" data-program-speakers class="block @2xl:table-cell @2xl:py-4 @2xl:pe-6 @2xl:align-top" :class="!item.speakers && 'hidden'">
            {{ item.speakers }}
          </td>
          <td v-if="venues" data-program-venue class="block @2xl:table-cell @2xl:py-4 @2xl:align-top" :class="!item.venue && 'hidden'">
            {{ item.venue }}
          </td>
        </tr>
      </tbody>
    </table>
    <ProgramVenues :heading-align="titleAlign" :venues="occasion.program.venues ?? []" :content="content" :styles="styles" look="rows" rule="none" class="mx-auto mt-14 max-w-5xl" />
  </SectionFrame>
</template>
