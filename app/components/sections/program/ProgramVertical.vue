<script setup lang="ts">
import type { ProgramLayoutOptions } from '~/features/sections/program/program.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import { formatProgramTimeRange, joinProgramSpeakers, programDays, showsTime } from '~/features/sections/program/program.helpers'
import ProgramHeading from './ProgramHeading.vue'
import ProgramVenues from './ProgramVenues.vue'

// Layout `vertical` ("Vertical title"): the eyebrow, heading and overall venue across the top (`titleAlign`; the
// venues' heading follows), the layout photo as a wide banner (`showPhoto`), then each day's date and rows divided by
// thin rules (none after a day's last): the time range, and beside it the title, the venue, "By" the speakers and the
// note, smaller and softer down the line. (Its heading was once also set sideways down the left; saved sections with
// that read as the default.)
const props = defineProps<SectionLayoutProps<'program', ProgramLayoutOptions<'titleAlign' | 'showTime' | 'showPhoto'>>>()

const days = computed(() => programDays(props.occasion.program.items))
const timed = computed(() => showsTime(props.options))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <ProgramHeading :content="content" :venue="occasion.program.venue" :styles="styles" :align="options.titleAlign" class="mx-auto mb-8" />
    <div class="mx-auto">
      <SectionPhoto
        v-if="options.showPhoto !== 'hide'"
        data-program-photo
        :src="content.layoutPhotos?.[0]"
        class="aspect-[5/2] w-full rounded-(--site-radius)"
      />
      <div v-if="occasion.program.items.length" data-program-items class="mt-8 flex flex-col gap-8">
        <div v-for="day in days" :key="day.date">
          <h3 data-program-day class="text-[0.7rem] font-semibold tracking-[0.25em] uppercase" :class="styles.eyebrow">
            {{ day.label }}
          </h3>
          <ol class="mt-2">
            <li
              v-for="{ item } in day.items"
              :key="item.id"
              data-program-item
              class="grid gap-x-6 gap-y-1 border-b border-current/20 py-4 last:border-b-0 @2xl:grid-cols-[9rem_1fr]"
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
    <ProgramVenues :heading-align="options.titleAlign" :venues="occasion.program.venues ?? []" :content="content" :styles="styles" look="rows" class="mx-auto mt-14" />
  </SectionFrame>
</template>
