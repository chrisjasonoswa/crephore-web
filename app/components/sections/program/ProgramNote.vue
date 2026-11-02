<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import { Paperclip } from '@lucide/vue'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import { formatProgramTime, joinProgramSpeakers, programDays, showsTime } from '~/features/sections/program/program.helpers'
import ProgramHeading from './ProgramHeading.vue'

// Layout `note` ("Pinned note"): the program on a sheet of paper pinned, clipped or just laid (`attachment`) on the
// section's background, slightly tilted from 768px. The eyebrow in the heading font's italic over a bold capitals
// heading; then rows (`rows`) under dashed rules, each day after its date, written in the heading font's italic with a
// highlighter stroke behind it (not the shared ruled divider):
//  - detailed: the time large, the title in small capitals under it; the venue, "with" the speakers and the note on the
//    right (under the title on phones)
//  - compact: the time, a dotted rule, the title in capitals, and the venue, speakers and note on one small line
// The paper has its own surface, so the background photo needs no overlay. Paper on a colour, so it starts on accent.
const props = defineProps<SectionLayoutProps<'program'>>()

const days = computed(() => programDays(props.content.items, props.occasion))
const timed = computed(() => showsTime(props.options))
const compact = computed(() => props.options.rows === 'compact')
// The paper is always light, whatever the background
const noteStyles = backgroundStyles.light

// The compact row's small line: whichever of the venue, the speakers and the note an item has
type Detail = { key: 'venue' | 'speakers' | 'description', text: string }
function detailsOf(item: { venue?: string, speakers?: string, description?: string }): Detail[] {
  const speakers = joinProgramSpeakers(item.speakers)
  return ([
    { key: 'venue', text: item.venue ?? '' },
    { key: 'speakers', text: speakers && `with ${speakers}` },
    { key: 'description', text: item.description ?? '' },
  ] satisfies Detail[]).filter(detail => detail.text)
}
</script>

<template>
  <SectionFrame v-slot="{ background: shown }" :background="background" :image-url="content.backgroundPhoto" overlay="none" class="px-6 py-16 @2xl:px-10 @2xl:py-24">
    <div data-program-note class="relative mx-auto max-w-2xl rounded-xs px-6 pt-12 pb-10 shadow-2xl @2xl:-rotate-1 @2xl:px-12 @2xl:pt-14" :class="noteStyles.root">
      <!-- The pin uses the background's button colour (the other brand colour), like the about polaroids' pins -->
      <span
        v-if="options.attachment === 'pin'"
        aria-hidden="true"
        data-program-pin
        class="absolute start-1/2 -top-2.5 size-6 -translate-x-1/2 rounded-full shadow-md ring-2 ring-white/50"
        :style="{ backgroundColor: `var(--site-button-${shown})` }"
      />
      <Paperclip
        v-else-if="options.attachment === 'clip'"
        aria-hidden="true"
        data-program-clip
        :stroke-width="1.5"
        class="absolute start-6 -top-5 size-12 -rotate-12 text-current/45"
      />
      <ProgramHeading :content="content" :styles="noteStyles" look="script" />
      <div v-if="content.items.length" data-program-items class="mt-8 flex flex-col gap-6">
        <div v-for="day in days" :key="day.date">
          <!-- The stroke is the accent, faded, across the lower half of the text, like a highlighter pen -->
          <h3
            data-program-day
            class="mb-1 w-fit bg-[linear-gradient(transparent_55%,color-mix(in_oklch,var(--site-accent)_45%,transparent)_55%)] px-1 font-(family-name:--site-font-heading) text-lg [font-style:var(--site-font-heading-italic)]"
            :class="noteStyles.brandText"
          >
            {{ day.label }}
          </h3>
          <ol v-if="!compact">
            <li
              v-for="{ item } in day.items"
              :key="item.id"
              data-program-item
              class="grid gap-x-8 gap-y-2 border-b border-dashed border-current/25 py-4 last:border-b-0 @2xl:grid-cols-[1fr_minmax(0,15rem)] @2xl:items-center"
            >
              <div>
                <p v-if="timed && item.startTime" data-program-time class="font-(family-name:--site-font-heading) text-2xl leading-none font-bold" :class="noteStyles.brandText">
                  {{ formatProgramTime(item.startTime) }}
                </p>
                <h3 class="text-xs font-bold tracking-[0.12em] uppercase" :class="timed && item.startTime && 'mt-1.5'">
                  {{ item.title }}
                </h3>
              </div>
              <div v-if="detailsOf(item).length" data-program-details class="flex flex-col gap-1 text-xs @2xl:text-end">
                <p v-if="item.venue" data-program-venue class="font-semibold tracking-[0.12em] uppercase" :class="noteStyles.eyebrow">
                  {{ item.venue }}
                </p>
                <p v-if="joinProgramSpeakers(item.speakers)" data-program-speakers>
                  <span class="font-(family-name:--site-font-heading) [font-style:var(--site-font-heading-italic)]" :class="noteStyles.muted">with</span>
                  {{ joinProgramSpeakers(item.speakers) }}
                </p>
                <p v-if="item.description" data-program-description :class="noteStyles.muted">
                  {{ item.description }}
                </p>
              </div>
            </li>
          </ol>
          <ol v-else>
            <li v-for="{ item } in day.items" :key="item.id" data-program-item class="flex gap-3 py-2">
              <p v-if="timed" data-program-time class="w-16 shrink-0 text-xs leading-5 font-bold @2xl:w-20" :class="noteStyles.brandText">
                {{ formatProgramTime(item.startTime) }}
              </p>
              <span v-if="timed" aria-hidden="true" class="border-s-2 border-dotted border-current/40" />
              <div class="min-w-0">
                <h3 class="text-xs leading-5 font-bold tracking-[0.12em] uppercase">
                  {{ item.title }}
                </h3>
                <p v-if="detailsOf(item).length" data-program-details class="text-xs" :class="noteStyles.muted">
                  <template v-for="(detail, i) in detailsOf(item)" :key="detail.key">
                    <template v-if="i > 0">
                      ·
                    </template>
                    <span v-bind="{ [`data-program-${detail.key}`]: '' }">{{ detail.text }}</span>
                  </template>
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </SectionFrame>
</template>
