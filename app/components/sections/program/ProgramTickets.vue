<script setup lang="ts">
import type { ProgramLayoutOptions } from '~/features/sections/program/program.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import { joinProgramSpeakers, programDays, programMarker, showsTime } from '~/features/sections/program/program.helpers'
import ProgramHeading from './ProgramHeading.vue'
import ProgramVenues from './ProgramVenues.vue'

// Layout `tickets`: each item as a light ticket, the time on a stub behind a perforated line with a notch cut at
// each end of it, and beside it the title, the venue (small spaced capitals), the speakers (a quiet "with …" line, so
// they don't compete with the venue's capitals) and the note; `columns` a row from 768px. Each day starts with its date
// on a tag with a dashed, perforated edge, not the shared ruled divider. Without times (`showTime`) the stubs number the items 01, 02, … Paper on
// a colour, so it starts on secondary.
const props = defineProps<SectionLayoutProps<'program', ProgramLayoutOptions<'titleAlign' | 'showTime' | 'columns'>>>()
// Where the program's and the venues' eyebrow and heading sit (`titleAlign`)
const titleAlign = computed(() => props.options.titleAlign)

const days = computed(() => programDays(props.occasion.program.items))
const timed = computed(() => showsTime(props.options))
// The tickets are always light, whatever the background
const ticketStyles = backgroundStyles.light

// The notches are cut out (a mask), so whatever is behind the ticket shows through them, photo included
const notches = 'radial-gradient(circle at 6rem 0, transparent 0.5rem, #000 calc(0.5rem + 0.5px)), radial-gradient(circle at 6rem 100%, transparent 0.5rem, #000 calc(0.5rem + 0.5px))'
const notchStyle = { maskImage: notches, WebkitMaskImage: notches, maskComposite: 'intersect', WebkitMaskComposite: 'source-in' }
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <ProgramHeading :content="content" :venue="occasion.program.venue" :styles="styles" :align="titleAlign" class="mx-auto" :class="options.columns === '1' ? 'max-w-2xl' : 'max-w-5xl'" />
    <div v-if="occasion.program.items.length" class="mx-auto mt-10 flex flex-col gap-10" :class="options.columns === '1' ? 'max-w-2xl' : 'max-w-5xl'">
      <div v-for="day in days" :key="day.date">
        <h3
          data-program-day
          class="mx-auto mb-6 w-fit rounded-(--site-radius) border-2 border-dashed border-current/50 px-5 py-1.5 text-xs font-bold tracking-[0.25em] uppercase"
          :class="styles.brandText"
        >
          {{ day.label }}
        </h3>
        <ol data-program-items class="grid gap-5" :class="options.columns === '2' && '@2xl:grid-cols-2'">
          <!-- The shadow goes on the wrapper: the ticket's mask would cut it off -->
          <li v-for="{ item, index } in day.items" :key="item.id" data-program-item class="drop-shadow-md">
            <div data-program-ticket class="flex h-full min-h-28 rounded-(--site-radius)" :class="ticketStyles.root" :style="notchStyle">
              <p
                data-program-marker
                class="flex w-24 shrink-0 flex-col items-center justify-center rounded-s-(--site-radius) border-e-2 border-dashed border-current/25 px-2 text-center leading-none"
                :class="ticketStyles.avatar"
              >
                <span class="font-(family-name:--site-font-heading) text-3xl">{{ programMarker(item, index, timed).clock }}</span>
                <span v-if="programMarker(item, index, timed).period" class="mt-1 text-[0.65rem] font-semibold tracking-[0.2em]">{{ programMarker(item, index, timed).period }}</span>
              </p>
              <div class="flex min-w-0 flex-1 flex-col justify-center px-5 py-4">
                <h3 class="font-(family-name:--site-font-heading) text-xl leading-snug" :class="ticketStyles.brandText">
                  {{ item.title }}
                </h3>
                <p v-if="item.venue" data-program-venue class="mt-1 text-sm font-semibold tracking-[0.15em] uppercase" :class="ticketStyles.eyebrow">
                  {{ item.venue }}
                </p>
                <p v-if="joinProgramSpeakers(item.speakers)" data-program-speakers class="mt-1.5 text-sm">
                  <span class="font-(family-name:--site-font-heading) [font-style:var(--site-font-heading-italic)]" :class="ticketStyles.muted">with</span>
                  {{ joinProgramSpeakers(item.speakers) }}
                </p>
                <p v-if="item.description" data-program-description class="mt-1.5 text-xs" :class="ticketStyles.muted">
                  {{ item.description }}
                </p>
              </div>
            </div>
          </li>
        </ol>
      </div>
    </div>
    <ProgramVenues :heading-align="titleAlign" :venues="occasion.program.venues ?? []" :content="content" :styles="styles" look="tickets" class="mx-auto mt-14 max-w-5xl" />
  </SectionFrame>
</template>
