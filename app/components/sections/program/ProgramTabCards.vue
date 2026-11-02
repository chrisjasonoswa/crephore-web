<script setup lang="ts">
import type { SectionBackground, SectionLayoutProps } from '~/features/sections/section.type'
import { MapPin, Sparkles } from '@lucide/vue'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { backgroundStyles, resolveBackground } from '~/features/sections/section.background'
import { formatProgramTime, joinProgramSpeakers, programBlockColours, programBlocks, programDateBadge, programDays, programMonthLabel, showsTime } from '~/features/sections/program/program.helpers'
import ProgramOverallVenue from './ProgramOverallVenue.vue'

// Layout `tab-cards`: a notched header and a notched card per item, in a grid (`columns`).
//  - The header, in a colour that differs from the section's (`programBlockColours`): a raised tab with the eyebrow and,
//    in the notch beside it, the month in an outlined badge; below, the heading in large bold capitals, the overall
//    venue and a sparkle.
//  - Each card: the date in an outlined pill in the notch at its top left, the time on the raised tab beside it, then
//    the title in large bold capitals, a tag line (the speakers, then the note) and the venue behind a pin. The cards
//    cycle through the accent, the primary, a soft accent tint and a primary tint, each pill in a colour that stands
//    out on its card; on a primary or accent section, cards in that colour are left out of the cycle.
// Where a tab meets the body below it, a small rounded fillet (a radial gradient in the card's colour, `--card`) joins
// them. The outlines and their offset shadows use the page's text colour.
const props = defineProps<SectionLayoutProps<'program'>>()

const days = computed(() => programDays(props.content.items, props.occasion))
const blocks = computed(() => programBlocks(days.value, true))
const timed = computed(() => showsTime(props.options))
const month = computed(() => programMonthLabel(days.value.map(day => day.date), 'short'))

// The header's colour as a CSS colour, for its fillet
const colourOf: Record<SectionBackground, string> = {
  light: 'var(--site-bg)',
  primary: 'var(--site-primary)',
  accent: 'var(--site-accent)',
  photo: 'var(--site-primary)',
}

const cardColours = [
  { card: 'var(--site-accent)', text: 'var(--site-on-accent)', pin: 'var(--site-primary-on-accent)', pill: 'var(--site-primary-200)', pillText: 'var(--site-text)' },
  { card: 'var(--site-primary)', text: 'var(--site-on-primary)', pin: 'var(--site-accent-on-primary)', pill: 'var(--site-accent)', pillText: 'var(--site-on-accent)' },
  { card: 'var(--site-accent-100)', text: 'var(--site-text)', pin: 'var(--site-primary-text)', pill: 'var(--site-primary)', pillText: 'var(--site-on-primary)' },
  { card: 'var(--site-primary-200)', text: 'var(--site-text)', pin: 'var(--site-primary-text)', pill: 'var(--site-accent-100)', pillText: 'var(--site-text)' },
]
// Without the section's own colour, so no card blends into the background
const sectionColour: Partial<Record<SectionBackground, string>> = { primary: 'var(--site-primary)', accent: 'var(--site-accent)' }
const shownBackground = computed(() => resolveBackground(props.background, props.content.backgroundPhoto))
const palette = computed(() => cardColours.filter(colours => colours.card !== sectionColour[shownBackground.value]))
const coloursOf = (index: number) => palette.value[index % palette.value.length]!

const outlined = 'ring-2 ring-(--site-text) shadow-[4px_4px_0_0_var(--site-text)]'
// A concave corner joining a tab to the body below it: the corner of a small square left (or right) of the tab, outside
// a quarter circle, in the card's colour
const filletStart = 'bg-[radial-gradient(circle_at_0_0,transparent_1.75rem,var(--card)_calc(1.75rem+0.5px))]'
const filletEnd = 'bg-[radial-gradient(circle_at_100%_0,transparent_1.75rem,var(--card)_calc(1.75rem+0.5px))]'

// The tag line: the speakers, then the note
function tagsOf(item: { speakers?: string, description?: string }) {
  return [
    { key: 'speakers', text: joinProgramSpeakers(item.speakers) },
    { key: 'description', text: item.description ?? '' },
  ].filter(tag => tag.text)
}
</script>

<template>
  <SectionFrame v-slot="{ background: shown }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <div
      data-program-band
      class="mx-auto flex max-w-5xl flex-col"
      :style="{ '--card': colourOf[programBlockColours(shown)[1]] }"
    >
      <div class="flex items-stretch">
        <div class="relative min-w-0 flex-1 rounded-t-[1.75rem] px-6 pt-6 @2xl:px-10 @2xl:pt-8" :class="backgroundStyles[programBlockColours(shown)[1]].root">
          <p v-if="content.eyebrow" class="text-[0.7rem] font-semibold tracking-[0.25em] uppercase @2xl:text-xs" :class="backgroundStyles[programBlockColours(shown)[1]].eyebrow">
            {{ content.eyebrow }}
          </p>
          <span aria-hidden="true" class="absolute -end-7 bottom-0 size-7" :class="filletEnd" />
        </div>
        <div class="shrink-0 ps-3 pb-3">
          <p
            v-if="month && content.items.length"
            data-program-month
            class="rounded-full px-4 py-1 font-(family-name:--site-font-heading) text-lg leading-tight font-bold whitespace-nowrap uppercase @2xl:px-6 @2xl:text-3xl"
            :class="[outlined, backgroundStyles[programBlockColours(shown)[0]].root]"
          >
            {{ month }}
          </p>
          <span v-else aria-hidden="true" class="block h-8 w-6" />
        </div>
      </div>
      <div
        data-program-heading
        class="relative rounded-tr-[1.75rem] rounded-b-[1.75rem] px-6 pt-3 pb-8 @2xl:px-10 @2xl:pb-12"
        :class="backgroundStyles[programBlockColours(shown)[1]].root"
      >
        <h2 v-if="content.heading" class="max-w-[85%] font-(family-name:--site-font-heading) text-4xl leading-[0.95] font-bold text-balance uppercase @2xl:text-6xl">
          {{ content.heading }}
        </h2>
        <ProgramOverallVenue :venue="content.venue" :styles="backgroundStyles[programBlockColours(shown)[1]]" class="mt-4" />
        <Sparkles aria-hidden="true" class="absolute end-8 bottom-6 size-7 @2xl:end-14 @2xl:size-9" :class="backgroundStyles[programBlockColours(shown)[1]].brandText" />
      </div>
    </div>

    <ol
      v-if="content.items.length"
      data-program-items
      class="mx-auto mt-8 grid gap-6 @2xl:mt-10"
      :class="options.columns === '2' ? 'max-w-5xl @2xl:grid-cols-2' : 'max-w-2xl'"
    >
      <li
        v-for="(block, index) in blocks"
        :key="block.key"
        data-program-card
        class="flex flex-col"
        :style="{ '--card': coloursOf(index).card, 'color': coloursOf(index).text }"
      >
        <div class="flex items-stretch">
          <div class="shrink-0 pe-3 pb-3">
            <h3 v-if="block.firstOfDay" data-program-day class="sr-only">
              {{ block.label }}
            </h3>
            <p
              aria-hidden="true"
              data-program-date
              class="rounded-full px-4 py-0.5 font-(family-name:--site-font-heading) text-2xl leading-tight font-bold whitespace-nowrap uppercase @2xl:px-5 @2xl:text-3xl"
              :class="outlined"
              :style="{ backgroundColor: coloursOf(index).pill, color: coloursOf(index).pillText }"
            >
              {{ programDateBadge(block.date).day }} {{ programDateBadge(block.date).month }}
            </p>
          </div>
          <div data-program-tab class="relative flex min-w-0 flex-1 justify-end rounded-t-[1.75rem] bg-(--card) px-5 pt-3">
            <p v-if="timed && block.items[0]!.item.startTime" data-program-time class="text-xs font-semibold @2xl:text-sm">
              {{ formatProgramTime(block.items[0]!.item.startTime) }}
            </p>
            <span aria-hidden="true" class="absolute -start-7 bottom-0 size-7" :class="filletStart" />
          </div>
        </div>
        <div
          v-for="{ item } in block.items"
          :key="item.id"
          data-program-item
          class="flex-1 rounded-tl-[1.75rem] rounded-b-[1.75rem] bg-(--card) px-5 pt-4 pb-6 @2xl:px-7 @2xl:pb-7"
        >
          <h3 class="font-(family-name:--site-font-heading) text-2xl leading-tight font-bold uppercase @2xl:text-3xl">
            {{ item.title }}
          </h3>
          <p v-if="tagsOf(item).length" class="mt-2 text-sm font-medium">
            <template v-for="(tag, i) in tagsOf(item)" :key="tag.key">
              <template v-if="i > 0">
                ·
              </template>
              <span v-bind="{ [`data-program-${tag.key}`]: '' }">{{ tag.text }}</span>
            </template>
          </p>
          <p v-if="item.venue" data-program-venue class="mt-3 flex items-start gap-2 text-sm font-semibold tracking-[0.04em] uppercase">
            <MapPin aria-hidden="true" class="mt-0.5 size-4 shrink-0" :style="{ color: coloursOf(index).pin }" />
            <span><span class="sr-only">Venue: </span>{{ item.venue }}</span>
          </p>
        </div>
      </li>
    </ol>
  </SectionFrame>
</template>
