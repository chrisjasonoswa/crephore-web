<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import { formatProgramTimeRange, joinProgramSpeakers, programDays, showsTime } from '~/features/sections/program/program.helpers'
import ProgramOverallVenue from './ProgramOverallVenue.vue'

// Layout `vertical` ("Vertical title"): the heading set huge in bold capitals, sideways down the left (read bottom to
// top), on phones too. On the right: the eyebrow and overall venue, the layout photo as a wide banner (`showPhoto`), then
// each day's date and rows under strong rules: the time range, and beside it the title, the venue, "By" the speakers
// and the note, smaller and softer down the line.
const props = defineProps<SectionLayoutProps<'program'>>()

const days = computed(() => programDays(props.content.items, props.occasion))
const timed = computed(() => showsTime(props.options))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <div class="mx-auto flex max-w-5xl gap-5 @2xl:gap-10">
      <h2
        v-if="content.heading"
        data-program-vertical-heading
        class="shrink-0 rotate-180 self-start font-(family-name:--site-font-heading) text-6xl leading-[0.85] font-bold uppercase [writing-mode:vertical-rl] @2xl:text-8xl @3xl:text-9xl"
        :class="styles.brandText"
      >
        {{ content.heading }}
      </h2>
      <div class="min-w-0 flex-1">
        <div v-if="content.eyebrow || content.venue" data-program-heading class="mb-6 flex flex-col gap-2">
          <p v-if="content.eyebrow" class="text-[0.7rem] font-semibold tracking-[0.25em] uppercase @2xl:text-xs" :class="styles.eyebrow">
            {{ content.eyebrow }}
          </p>
          <ProgramOverallVenue :venue="content.venue" :styles="styles" />
        </div>
        <SectionPhoto
          v-if="options.showPhoto !== 'hide'"
          data-program-photo
          :src="content.layoutPhotos?.[0]"
          class="aspect-[5/2] w-full rounded-(--site-radius)"
        />
        <div v-if="content.items.length" data-program-items class="mt-8 flex flex-col gap-8">
          <div v-for="day in days" :key="day.date">
            <h3 data-program-day class="text-[0.7rem] font-semibold tracking-[0.25em] uppercase" :class="styles.eyebrow">
              {{ day.label }}
            </h3>
            <ol class="mt-2">
              <li
                v-for="{ item } in day.items"
                :key="item.id"
                data-program-item
                class="grid gap-x-6 gap-y-1 border-b-2 border-current py-4 @2xl:grid-cols-[9rem_1fr]"
              >
                <p v-if="timed" data-program-time class="text-sm font-medium">
                  {{ formatProgramTimeRange(item) }}
                </p>
                <div class="min-w-0" :class="!timed && '@2xl:col-span-2'">
                  <h3 class="text-base leading-snug font-semibold @2xl:text-lg" :class="styles.brandText">
                    {{ item.title }}
                  </h3>
                  <p v-if="item.venue" data-program-venue class="mt-0.5 text-sm">
                    {{ item.venue }}
                  </p>
                  <p v-if="joinProgramSpeakers(item.speakers)" data-program-speakers class="mt-0.5 text-sm">
                    By {{ joinProgramSpeakers(item.speakers) }}
                  </p>
                  <p v-if="item.description" data-program-description class="mt-1 text-xs" :class="styles.muted">
                    {{ item.description }}
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </SectionFrame>
</template>
