<script setup lang="ts">
import type { ProgramLayoutOptions } from '~/features/sections/program/program.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { programDays, programMarker, showsTime } from '~/features/sections/program/program.helpers'
import ProgramDayDivider from './ProgramDayDivider.vue'
import ProgramHeading from './ProgramHeading.vue'
import ProgramSpeakers from './ProgramSpeakers.vue'
import ProgramVenues from './ProgramVenues.vue'

// Layout `poster`: a grid of big times (`columns` a row from 1024px, two from 768px), each with a rule, then the title
// in capitals, the venue, the speakers ("with …", no icons) and, quietest of all, the note. Bold on a colour, so it starts on primary. Without times (`showTime`) the items are
// numbered 01, 02, … instead.
const props = defineProps<SectionLayoutProps<'program', ProgramLayoutOptions<'titleAlign' | 'showTime' | 'columns'>>>()
// Where the program's and the venues' eyebrow and heading sit (`titleAlign`)
const titleAlign = computed(() => props.options.titleAlign)

const days = computed(() => programDays(props.occasion.program.items))
const timed = computed(() => showsTime(props.options))
const columnClasses: Record<string, string> = { 2: '', 3: '@3xl:grid-cols-3' }
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-16 @2xl:py-24">
    <ProgramHeading :content="content" :venue="occasion.program.venue" :styles="styles" :align="titleAlign" class="mx-auto" />
    <div v-if="occasion.program.items.length" class="mx-auto mt-12 flex flex-col gap-12">
      <div v-for="day in days" :key="day.date">
        <ProgramDayDivider :label="day.label" :styles="styles" class="mb-10" />
        <ol data-program-items class="grid gap-x-10 gap-y-12 @2xl:grid-cols-2" :class="columnClasses[options.columns]">
          <li v-for="{ item, index } in day.items" :key="item.id" data-program-item>
            <p data-program-marker class="font-(family-name:--site-font-heading) leading-none" :class="styles.brandText">
              <span class="text-6xl @2xl:text-7xl">{{ programMarker(item, index, timed).clock }}</span>
              <span v-if="programMarker(item, index, timed).period" class="ms-1.5 text-lg">{{ programMarker(item, index, timed).period }}</span>
            </p>
            <span aria-hidden="true" class="mt-5 block h-0.5 w-full bg-current/30" />
            <h3 class="mt-4 text-sm font-bold tracking-[0.2em] uppercase">
              {{ item.title }}
            </h3>
            <p v-if="item.venue" data-program-venue class="mt-2 text-sm font-medium">
              {{ item.venue }}
            </p>
            <ProgramSpeakers :speakers="item.speakers" :styles="styles" class="mt-1" />
            <!-- The least visible: smaller and in the softer colour -->
            <p v-if="item.description" data-program-description class="mt-1.5 text-xs" :class="styles.muted">
              {{ item.description }}
            </p>
          </li>
        </ol>
      </div>
    </div>
    <ProgramVenues :heading-align="titleAlign" :venues="occasion.program.venues ?? []" :content="content" :styles="styles" look="poster" class="mx-auto mt-20" />
  </SectionFrame>
</template>
