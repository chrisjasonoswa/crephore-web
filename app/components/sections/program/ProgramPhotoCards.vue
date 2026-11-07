<script setup lang="ts">
import type { ProgramLayoutOptions } from '~/features/sections/program/program.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import { Check } from '@lucide/vue'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import { formatProgramTime, joinProgramSpeakers, programBlocks, programDateBadge, programDays, showsTime } from '~/features/sections/program/program.helpers'
import ProgramHeading from './ProgramHeading.vue'
import ProgramVenues from './ProgramVenues.vue'

// Layout `photo-cards`: the section split into its colour and the layout photo (`photoSide`; the photo takes two fifths
// on phones, half from 768px; it stays in view, sticky, while a long list of cards scrolls past), a capitals heading on the colour, and light cards laid across the split. Each
// card has the day number and month, then the weekday and "Day N", then (`blockPer`) one item: the time, the title large
// in the heading font, the venue and "with" the speakers, and the note; or a whole day's items as ticked lines, the time
// and title, then the venue and speakers, then the note, smaller. Starts on primary.
const props = defineProps<SectionLayoutProps<'program', ProgramLayoutOptions<'showTime' | 'blockPer' | 'photoSide'>>>()

const days = computed(() => programDays(props.occasion.program.items))
const timed = computed(() => showsTime(props.options))
const perItem = computed(() => props.options.blockPer !== 'day')
const blocks = computed(() => programBlocks(days.value, perItem.value))
const photoLeft = computed(() => props.options.photoSide === 'left')
// The cards are always light, whatever the background
const cardStyles = backgroundStyles.light
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <!-- The photo's side of the section, full height; the photo sticks to the top of the screen inside it while the
         cards scroll past, one screen tall (or the section's height, when that's less) -->
    <div data-program-photo-column class="absolute inset-y-0 w-2/5 @2xl:w-1/2" :class="photoLeft ? 'start-0' : 'end-0'">
      <SectionPhoto data-program-photo :src="content.layoutPhotos?.[0]" class="sticky top-0 h-svh max-h-full w-full" />
    </div>
    <div class="relative mx-auto flex max-w-5xl flex-col" :class="photoLeft ? 'items-end' : 'items-start'">
      <!-- Kept on the colour, beside the photo -->
      <ProgramHeading :content="content" :venue="occasion.program.venue" :styles="styles" align="start" look="display" class="max-w-[55%] @2xl:max-w-[45%]" />
      <ol v-if="occasion.program.items.length" data-program-items class="mt-8 flex w-full flex-col gap-4 @2xl:mt-10 @2xl:w-3/4 @2xl:gap-5">
        <li
          v-for="block in blocks"
          :key="block.key"
          data-program-card
          class="flex gap-4 rounded-(--site-radius) p-4 shadow-xl @2xl:gap-6 @2xl:p-6"
          :class="cardStyles.root"
        >
          <div class="w-12 shrink-0 border-e border-current/15 pe-4 text-center @2xl:w-20 @2xl:pe-6">
            <h3 v-if="block.firstOfDay" data-program-day class="sr-only">
              {{ block.label }}
            </h3>
            <p aria-hidden="true" data-program-date class="flex flex-col leading-none">
              <span class="font-(family-name:--site-font-heading) text-4xl font-bold @2xl:text-5xl" :class="cardStyles.brandText">{{ programDateBadge(block.date).day }}</span>
              <span class="mt-2 text-[0.65rem] font-semibold tracking-[0.15em] uppercase" :class="cardStyles.muted">{{ programDateBadge(block.date).month }}</span>
            </p>
          </div>
          <div class="min-w-0 flex-1">
            <p aria-hidden="true" class="text-xs font-bold tracking-[0.12em] uppercase" :class="cardStyles.eyebrow">
              {{ programDateBadge(block.date).weekday }} · Day {{ block.dayNumber }}
            </p>
            <!-- One item: the time, the title larger in the heading font, then its details -->
            <div v-for="{ item } in perItem ? block.items : []" :key="item.id" data-program-item class="mt-1.5">
              <p v-if="timed && item.startTime" data-program-time class="text-sm font-bold">
                {{ formatProgramTime(item.startTime) }}
              </p>
              <h3 class="font-(family-name:--site-font-heading) text-xl leading-snug @2xl:text-2xl" :class="cardStyles.brandText">
                {{ item.title }}
              </h3>
              <p v-if="item.venue || joinProgramSpeakers(item.speakers)" class="mt-1 text-sm">
                <span v-if="item.venue" data-program-venue>{{ item.venue }}</span>
                <template v-if="item.venue && joinProgramSpeakers(item.speakers)">
                  ·
                </template>
                <span v-if="joinProgramSpeakers(item.speakers)" data-program-speakers>with {{ joinProgramSpeakers(item.speakers) }}</span>
              </p>
              <p v-if="item.description" data-program-description class="mt-1 text-xs" :class="cardStyles.muted">
                {{ item.description }}
              </p>
            </div>
            <!-- A whole day: its items as ticked lines -->
            <ul v-if="!perItem" class="mt-2 flex flex-col gap-2.5">
              <li v-for="{ item } in block.items" :key="item.id" data-program-item class="flex gap-2 text-sm">
                <Check aria-hidden="true" class="mt-0.5 size-4 shrink-0" :class="cardStyles.eyebrow" />
                <div class="min-w-0">
                  <div class="flex flex-wrap items-baseline gap-x-2">
                    <p v-if="timed && item.startTime" data-program-time class="font-bold whitespace-nowrap">
                      {{ formatProgramTime(item.startTime) }}
                    </p>
                    <h3 :class="cardStyles.brandText">
                      {{ item.title }}
                    </h3>
                  </div>
                  <p v-if="item.venue || joinProgramSpeakers(item.speakers)" class="text-xs">
                    <span v-if="item.venue" data-program-venue>{{ item.venue }}</span>
                    <template v-if="item.venue && joinProgramSpeakers(item.speakers)">
                      ·
                    </template>
                    <span v-if="joinProgramSpeakers(item.speakers)" data-program-speakers>with {{ joinProgramSpeakers(item.speakers) }}</span>
                  </p>
                  <p v-if="item.description" data-program-description class="mt-0.5 text-[0.7rem]" :class="cardStyles.muted">
                    {{ item.description }}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </li>
      </ol>
      <ProgramVenues heading-align="start" :venues="occasion.program.venues ?? []" :content="content" :styles="styles" look="cards" class="mt-12 w-full @2xl:w-3/4" />
    </div>
  </SectionFrame>
</template>
