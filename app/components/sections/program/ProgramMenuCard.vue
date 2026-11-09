<script setup lang="ts">
import type { ProgramLayoutOptions } from '~/features/sections/program/program.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SiteDivider from '~/components/site-graphics/dividers/SiteDivider.vue'
import { getSiteDivider } from '~/components/site-graphics/dividers/site-dividers'
import { backgroundStyles } from '~/features/sections/section.background'
import { formatProgramTime, programDays, showsTime } from '~/features/sections/program/program.helpers'
import ProgramDayDivider from './ProgramDayDivider.vue'
import ProgramHeading from './ProgramHeading.vue'
import ProgramSpeakers from './ProgramSpeakers.vue'
import ProgramVenues from './ProgramVenues.vue'

// Layout `menu-card`: framed like a wedding dinner menu, a light card with a double border, centred titles in the
// heading font with the venue, the speakers ("with …") and an italic note under each, and an `ornament` between items:
// one of the decorative dividers (site-graphics/dividers), or none. The card has its own surface, so the
// background photo needs no overlay. Paper on a colour, so it starts on secondary.
const props = defineProps<SectionLayoutProps<'program', ProgramLayoutOptions<'titleAlign' | 'showTime' | 'ornament'>>>()
// Where the program's and the venues' eyebrow and heading sit (`titleAlign`)
const titleAlign = computed(() => props.options.titleAlign)

const days = computed(() => programDays(props.occasion.program.items))
const timed = computed(() => showsTime(props.options))
// The card is always light, whatever the background
const cardStyles = backgroundStyles.light
</script>

<template>
  <SectionFrame :background="background" :image-url="content.backgroundPhoto" overlay="none" class="px-(--site-edge) py-14 @2xl:py-20">
    <div data-program-card class="mx-auto max-w-xl rounded-(--site-radius) p-3 shadow-xl @2xl:p-4" :class="cardStyles.root">
      <div class="rounded-(--site-radius) border-4 border-double border-current/25 px-6 py-12 text-center @2xl:px-12 @2xl:py-14">
        <ProgramHeading :content="content" :venue="occasion.program.venue" :styles="cardStyles" :align="titleAlign" />
        <div v-if="occasion.program.items.length" class="mt-10 flex flex-col gap-10">
          <div v-for="day in days" :key="day.date">
            <ProgramDayDivider :label="day.label" :styles="cardStyles" class="mb-10" />
            <ol data-program-items class="flex flex-col items-center">
              <li v-for="({ item }, i) in day.items" :key="item.id" data-program-item class="flex flex-col items-center">
                <template v-if="i > 0">
                  <SiteDivider
                    v-if="getSiteDivider(options.ornament)"
                    data-program-ornament
                    :name="options.ornament"
                    class="my-6 h-6 w-30"
                    :class="cardStyles.accent"
                  />
                  <span v-else aria-hidden="true" class="h-8" />
                </template>
                <p
                  v-if="timed && item.startTime"
                  data-program-time
                  class="text-[0.7rem] font-semibold tracking-[0.3em] uppercase"
                  :class="cardStyles.eyebrow"
                >
                  {{ formatProgramTime(item.startTime) }}
                </p>
                <h3
                  class="font-(family-name:--site-font-heading) text-2xl leading-snug text-balance"
                  :class="[cardStyles.brandText, timed && item.startTime && 'mt-1.5']"
                >
                  {{ item.title }}
                </h3>
                <!-- Quiet and plain under the title, so the card stays simple: no icons -->
                <p v-if="item.venue" data-program-venue class="mt-1 text-sm">
                  {{ item.venue }}
                </p>
                <ProgramSpeakers :speakers="item.speakers" :styles="cardStyles" class="mt-1 justify-center" />
                <p
                  v-if="item.description"
                  data-program-description
                  class="mt-1.5 max-w-xs text-xs italic"
                  :class="cardStyles.muted"
                >
                  {{ item.description }}
                </p>
              </li>
            </ol>
          </div>
        </div>
        <ProgramVenues :heading-align="titleAlign" :venues="occasion.program.venues ?? []" :content="content" :styles="cardStyles" look="plain" class="mt-12 border-t border-current/15 pt-10" />
      </div>
    </div>
  </SectionFrame>
</template>
