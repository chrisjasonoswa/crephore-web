<script setup lang="ts">
import type { ProgramLayoutOptions } from '~/features/sections/program/program.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { formatProgramTime, programDays, programSpeakers, romanNumeral, showsTime } from '~/features/sections/program/program.helpers'
import ProgramDayDivider from './ProgramDayDivider.vue'
import ProgramHeading from './ProgramHeading.vue'
import ProgramVenues from './ProgramVenues.vue'

// Layout `printed` ("Printed programme"): centred like a printed wedding programme. Each part has its `numbering`
// (none, I, II or 1, 2) above the time in small capitals (bold only without a number), the title in the heading font,
// then where it is (the venue, plain), who leads it (the speakers, in italics) and the note; a `divider` (line, dot or
// none) between parts. A line in the day labels' colour, midway, sets the program apart from its venues.
const props = defineProps<SectionLayoutProps<'program', ProgramLayoutOptions<'showTime' | 'numbering' | 'divider'>>>()

const days = computed(() => programDays(props.occasion.program.items))
const timed = computed(() => showsTime(props.options))
const numbered = computed(() => props.options.numbering === 'roman' || props.options.numbering === 'numbers')

// Numbered through the whole program, across days
function numberOf(index: number): string {
  if (props.options.numbering === 'roman')
    return romanNumeral(index + 1)
  return props.options.numbering === 'numbers' ? String(index + 1) : ''
}
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-16 @2xl:px-10 @2xl:py-24">
    <ProgramHeading :content="content" :venue="occasion.program.venue" :styles="styles" />
    <div v-if="occasion.program.items.length" class="mx-auto mt-12 flex max-w-md flex-col gap-10">
      <div v-for="day in days" :key="day.date">
        <ProgramDayDivider :label="day.label" :styles="styles" class="mb-10" />
        <ol data-program-items class="flex flex-col items-center text-center">
          <li v-for="({ item, index }, i) in day.items" :key="item.id" data-program-item class="flex flex-col items-center">
            <template v-if="i > 0">
              <span v-if="options.divider === 'line'" data-program-divider aria-hidden="true" class="my-6 h-px w-12 bg-current/30" />
              <span v-else-if="options.divider === 'dot'" data-program-divider aria-hidden="true" class="my-6 size-1.5 rounded-full bg-current/40" />
              <span v-else aria-hidden="true" class="h-8" />
            </template>
            <!-- In the heading font, not spaced out: "III" must not read as "I I I" -->
            <p v-if="numbered" data-program-number class="font-(family-name:--site-font-heading) text-base" :class="styles.eyebrow">
              {{ numberOf(index) }}
            </p>
            <p
              v-if="timed && item.startTime"
              data-program-time
              class="text-xs tracking-[0.3em] uppercase"
              :class="[styles.eyebrow, numbered ? 'mt-1 font-normal' : 'font-semibold']"
            >
              {{ formatProgramTime(item.startTime) }}
            </p>
            <h3
              class="font-(family-name:--site-font-heading) text-2xl leading-snug text-balance @2xl:text-3xl"
              :class="[styles.brandText, (numbered || (timed && item.startTime)) && 'mt-2']"
            >
              {{ item.title }}
            </h3>
            <p v-if="item.venue" data-program-venue class="mt-1.5 text-sm">
              {{ item.venue }}
            </p>
            <p v-if="programSpeakers(item.speakers).length" data-program-speakers class="mt-1 text-sm italic">
              {{ programSpeakers(item.speakers).join(', ') }}
            </p>
            <p v-if="item.description" data-program-description class="mt-1.5 text-xs" :class="styles.muted">
              {{ item.description }}
            </p>
          </li>
        </ol>
      </div>
    </div>
    <div
      v-if="occasion.program.items.length && occasion.program.venues?.length"
      data-venues-rule
      aria-hidden="true"
      class="mx-auto mt-12 h-px max-w-md bg-current/30"
      :class="styles.eyebrow"
    />
    <ProgramVenues :venues="occasion.program.venues ?? []" :content="content" :styles="styles" look="plain" class="mx-auto mt-12 max-w-md" />
  </SectionFrame>
</template>
