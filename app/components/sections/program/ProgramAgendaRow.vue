<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'
import type { ProgramItem } from '~/features/sections/program/program.type'
import { MapPin, UserRound } from '@lucide/vue'
import { formatProgramTimeRange, joinProgramSpeakers, programDateBadge } from '~/features/sections/program/program.helpers'

// One row of the agenda layout, everything shown (nothing collapses): the date badge, then the time range, the title,
// the venue (map pin) and speakers (person icon) on one line (stacked on phones), and the
// note under a dashed rule. Not a layout.
const props = defineProps<{
  item: ProgramItem
  date: string
  styles: BackgroundStyles
  timed: boolean
}>()

const badge = computed(() => programDateBadge(props.date))
// "Ana Lim", "Ana Lim & Paolo Tan", "Ana Lim, Paolo Tan & Rina Cruz"
const namesText = computed(() => joinProgramSpeakers(props.item.speakers))
const time = computed(() => props.timed ? formatProgramTimeRange(props.item) : '')
</script>

<template>
  <li data-program-item class="flex gap-4 rounded-(--site-radius) border border-current/15 p-4 @2xl:gap-8 @2xl:p-8">
    <span
      data-program-date
      class="flex size-12 shrink-0 flex-col items-center justify-center rounded-(--site-radius) leading-none @2xl:size-20"
      :class="styles.avatar"
    >
      <span class="font-(family-name:--site-font-heading) text-xl @2xl:text-3xl">{{ badge.day }}</span>
      <span class="mt-1 text-[0.6rem] font-semibold tracking-wider uppercase @2xl:mt-1.5 @2xl:text-xs">{{ badge.month }}</span>
    </span>

    <div class="min-w-0 flex-1">
      <p v-if="time" data-program-time class="text-xs font-semibold @2xl:text-sm" :class="styles.eyebrow">
        {{ time }}
      </p>
      <h3 class="font-(family-name:--site-font-heading) text-lg leading-snug @2xl:text-2xl" :class="styles.brandText">
        {{ item.title }}
      </h3>

      <div
        v-if="item.venue || namesText"
        class="mt-3 flex flex-col gap-2 text-sm @2xl:flex-row @2xl:flex-wrap @2xl:items-center @2xl:gap-x-8"
      >
        <p v-if="item.venue" data-program-venue class="flex items-center gap-2">
          <MapPin aria-hidden="true" class="size-4 shrink-0" :class="styles.accent" />
          <span><span class="sr-only">Venue: </span>{{ item.venue }}</span>
        </p>
        <p v-if="namesText" data-program-speakers class="flex items-center gap-2">
          <UserRound aria-hidden="true" class="size-4 shrink-0" :class="styles.accent" />
          <span><span class="sr-only">With: </span>{{ namesText }}</span>
        </p>
      </div>

      <p
        v-if="item.description"
        data-program-description
        class="mt-4 border-t border-dashed border-current/20 pt-4 text-xs"
        :class="styles.muted"
      >
        {{ item.description }}
      </p>
    </div>
  </li>
</template>
