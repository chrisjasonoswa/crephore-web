<script setup lang="ts">
import type { Component } from 'vue'
import type { ProgramLayoutOptions } from '~/features/sections/program/program.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import { Balloon, Bird, Briefcase, Cake, Flame, Flower2, Gem, Heart, Leaf, Lightbulb, MapPin, Mic, PartyPopper, UserRound } from '@lucide/vue'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionScrollHint from '~/components/sections/SectionScrollHint.vue'
import { formatProgramTime, programDays, programSpeakers, showsTime } from '~/features/sections/program/program.helpers'
import { useDragScroll } from '~/features/sections/useDragScroll'
import ProgramHeading from './ProgramHeading.vue'
import ProgramVenues from './ProgramVenues.vue'

// Layout `horizontal` ("Horizontal timeline"): the items left to right along a line, each marked with a dot or an icon
// (`marker`), with the time, title, venue (map pin), speakers (person) and note under it. One row that scrolls sideways
// on every screen (swipe, or drag with the mouse); centred while it fits. Each day's first item carries its date above
// the line.
const props = defineProps<SectionLayoutProps<'program', ProgramLayoutOptions<'titleAlign' | 'showTime' | 'marker'>>>()
// Where the program's and the venues' eyebrow and heading sit (`titleAlign`)
const titleAlign = computed(() => props.options.titleAlign)

const timed = computed(() => showsTime(props.options))
const entries = computed(() => programDays(props.occasion.program.items)
  .flatMap(day => day.items.map(({ item }, i) => ({ item, dayLabel: i === 0 ? day.label : '' }))))

// The icon for each `marker` choice (see program.registry.ts); `dot` has none
const markerIcons: Record<string, Component> = {
  'heart': Heart,
  'flower': Flower2,
  'gem': Gem,
  'balloon': Balloon,
  'cake': Cake,
  'party-popper': PartyPopper,
  'mic': Mic,
  'lightbulb': Lightbulb,
  'briefcase': Briefcase,
  'flame': Flame,
  'leaf': Leaf,
  'bird': Bird,
}
const markerIcon = computed(() => markerIcons[props.options.marker])
const speakersOf = (speakers?: string) => programSpeakers(speakers).join(', ')

const row = useTemplateRef<HTMLOListElement>('row')
const { canScroll, thumb, isDragging, startDrag, drag, endDrag, ignoreClickAfterDrag } = useDragScroll(row, () => props.occasion.program.items.length)
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <ProgramHeading :content="content" :venue="occasion.program.venue" :styles="styles" :align="titleAlign" class="mx-auto max-w-6xl" />
    <ol
      v-if="occasion.program.items.length"
      ref="row"
      data-program-items
      class="mx-auto mt-10 flex max-w-6xl overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      :class="[isDragging ? 'cursor-grabbing select-none' : 'snap-x snap-mandatory', canScroll && !isDragging && 'cursor-grab']"
      @pointerdown="startDrag"
      @pointermove="drag"
      @pointerup="endDrag"
      @pointercancel="endDrag"
      @click.capture="ignoreClickAfterDrag"
      @dragstart.prevent
    >
      <!-- Auto margins centre the row while it fits, and don't hide any items once it overflows -->
      <li
        v-for="({ item, dayLabel }, i) in entries"
        :key="item.id"
        data-program-item
        class="relative w-52 shrink-0 snap-start pe-6 first:ms-auto last:me-auto @2xl:w-60"
      >
        <!-- Two lines' room, so a long day label wraps instead of running past the item -->
        <p v-if="dayLabel" data-program-day class="flex h-8 items-end text-[0.65rem] leading-tight font-semibold tracking-[0.2em] uppercase" :class="styles.eyebrow">
          {{ dayLabel }}
        </p>
        <span v-else aria-hidden="true" class="block h-8" />
        <!-- The line runs through the middle of the marker row (2rem down, 1rem into it) on to the next item's marker -->
        <span aria-hidden="true" class="absolute start-0 top-12 h-px bg-current/25" :class="i === entries.length - 1 ? 'end-6' : 'end-0'" />
        <div aria-hidden="true" class="flex h-8 items-center">
          <!-- An icon sits in a soft tint of the section's colour, which also hides the line behind it -->
          <span
            v-if="markerIcon"
            data-program-marker-icon
            class="relative flex size-8 items-center justify-center rounded-full"
            :class="styles.avatar"
          >
            <component :is="markerIcon" class="size-4" />
          </span>
          <span v-else data-program-marker-dot class="relative block size-3 rounded-full bg-current" :class="styles.accent" />
        </div>
        <p v-if="timed && item.startTime" data-program-time class="mt-3 text-sm font-semibold" :class="styles.eyebrow">
          {{ formatProgramTime(item.startTime) }}
        </p>
        <h3 class="font-(family-name:--site-font-heading) text-xl leading-snug" :class="[styles.brandText, timed && item.startTime ? 'mt-1' : 'mt-3']">
          {{ item.title }}
        </h3>
        <div v-if="item.venue || speakersOf(item.speakers)" class="mt-2 flex flex-col gap-1 text-sm">
          <p v-if="item.venue" data-program-venue class="flex items-start gap-2 font-medium">
            <MapPin aria-hidden="true" class="mt-0.5 size-4 shrink-0" :class="styles.accent" />
            <span><span class="sr-only">Venue: </span>{{ item.venue }}</span>
          </p>
          <p v-if="speakersOf(item.speakers)" data-program-speakers class="flex items-start gap-2">
            <UserRound aria-hidden="true" class="mt-0.5 size-4 shrink-0" :class="styles.accent" />
            <span><span class="sr-only">With: </span>{{ speakersOf(item.speakers) }}</span>
          </p>
        </div>
        <p v-if="item.description" data-program-description class="mt-2 text-xs" :class="styles.muted">
          {{ item.description }}
        </p>
      </li>
    </ol>
    <SectionScrollHint v-if="canScroll" :thumb="thumb" :styles="styles" class="mt-8" />
    <ProgramVenues :heading-align="titleAlign" :venues="occasion.program.venues ?? []" :content="content" :styles="styles" look="open" class="mx-auto mt-14 max-w-6xl" />
  </SectionFrame>
</template>
