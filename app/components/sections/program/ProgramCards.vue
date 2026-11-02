<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import { MapPin, UserRound } from '@lucide/vue'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import { formatProgramTimeRange, programDays, programSpeakers, showsTime } from '~/features/sections/program/program.helpers'
import ProgramHeading from './ProgramHeading.vue'

// Layout `cards`: each item on a light card (time, title, note, then at the bottom the venue behind a map pin and the
// speakers behind a person icon), `columns` a row from 768px (one on phones, two in between). Each day's cards sit in a
// soft outlined panel with the date in plain text centred in its top line (a fieldset's legend, so the line breaks
// around it on any background, photos too), not the shared ruled divider.
const props = defineProps<SectionLayoutProps<'program'>>()

const days = computed(() => programDays(props.content.items, props.occasion))
const timed = computed(() => showsTime(props.options))
const columnClasses: Record<string, string> = { 2: '@3xl:grid-cols-2', 3: '@3xl:grid-cols-3' }
// The cards are always light, whatever the background
const cardStyles = backgroundStyles.light
const speakersOf = (speakers?: string) => programSpeakers(speakers).join(', ')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <ProgramHeading :content="content" :styles="styles" />
    <div v-if="content.items.length" class="mx-auto mt-10 flex max-w-5xl flex-col gap-8">
      <fieldset v-for="day in days" :key="day.date" data-program-day-panel class="min-w-0 rounded-(--site-radius) border border-current/15 px-4 pt-4 pb-4 @2xl:px-6 @2xl:pt-5 @2xl:pb-6">
        <legend class="mx-auto px-3">
          <h3 data-program-day class="text-xs font-semibold tracking-[0.2em] uppercase" :class="styles.eyebrow">
            {{ day.label }}
          </h3>
        </legend>
        <ol data-program-items class="grid gap-5 @2xl:grid-cols-2" :class="columnClasses[options.columns!]">
          <li
            v-for="{ item } in day.items"
            :key="item.id"
            data-program-item
            class="flex flex-col rounded-(--site-radius) p-6 shadow-md"
            :class="cardStyles.root"
          >
            <p
              v-if="timed && item.startTime"
              data-program-time
              class="text-[0.7rem] font-semibold tracking-[0.2em] uppercase"
              :class="cardStyles.eyebrow"
            >
              {{ formatProgramTimeRange(item) }}
            </p>
            <h3
              class="font-(family-name:--site-font-heading) text-2xl leading-snug"
              :class="[cardStyles.brandText, timed && item.startTime && 'mt-2']"
            >
              {{ item.title }}
            </h3>
            <p v-if="item.description" data-program-description class="mt-2 text-sm" :class="cardStyles.muted">
              {{ item.description }}
            </p>
            <div v-if="item.venue || speakersOf(item.speakers)" class="mt-auto flex flex-col gap-1.5 pt-4 text-sm">
              <p v-if="item.venue" data-program-venue class="flex items-start gap-2 font-medium">
                <MapPin aria-hidden="true" class="mt-0.5 size-4 shrink-0" :class="cardStyles.eyebrow" />
                <span><span class="sr-only">Venue: </span>{{ item.venue }}</span>
              </p>
              <p v-if="speakersOf(item.speakers)" data-program-speakers class="flex items-start gap-2">
                <UserRound aria-hidden="true" class="mt-0.5 size-4 shrink-0" :class="cardStyles.eyebrow" />
                <span><span class="sr-only">With: </span>{{ speakersOf(item.speakers) }}</span>
              </p>
            </div>
          </li>
        </ol>
      </fieldset>
    </div>
  </SectionFrame>
</template>
