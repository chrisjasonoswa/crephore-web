<script setup lang="ts">
import type { ProgramLayoutOptions } from '~/features/sections/program/program.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { formatProgramDate, programDays, showsTime } from '~/features/sections/program/program.helpers'
import ProgramAgendaRow from './ProgramAgendaRow.vue'
import ProgramHeading from './ProgramHeading.vue'
import ProgramVenues from './ProgramVenues.vue'

// Layout `agenda`: a tab per day (only when there is more than one), then a card per item with everything shown: date
// badge, time range, title, venue and speakers, and the note under a dashed rule. For conferences.
const props = defineProps<SectionLayoutProps<'program', ProgramLayoutOptions<'titleAlign' | 'showTime'>>>()
// Where the program's and the venues' eyebrow and heading sit (`titleAlign`)
const titleAlign = computed(() => props.options.titleAlign)

const days = computed(() => programDays(props.occasion.program.items))
const selected = ref(0)
// Removing a day in the editor can leave the selected tab past the end
const active = computed(() => days.value[Math.min(selected.value, days.value.length - 1)])
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <ProgramHeading :content="content" :venue="occasion.program.venue" :styles="styles" :align="titleAlign" class="mx-auto max-w-3xl" />
    <div v-if="active" class="mx-auto mt-10 max-w-3xl">
      <div v-if="days.length > 1" role="tablist" data-program-tabs class="mb-6 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          v-for="(day, i) in days"
          :key="day.date"
          type="button"
          role="tab"
          data-program-tab
          :aria-selected="day === active"
          class="shrink-0 rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.15em] whitespace-nowrap uppercase transition-colors"
          :class="day === active ? [styles.button, 'border-transparent'] : 'border-current/25 hover:bg-current/10'"
          @click="selected = i"
        >
          Day {{ i + 1 }} · {{ formatProgramDate(day.date) }}
        </button>
      </div>
      <ol data-program-items role="tabpanel" class="flex flex-col gap-3">
        <ProgramAgendaRow
          v-for="{ item } in active.items"
          :key="item.id"
          :item="item"
          :date="active.date"
          :styles="styles"
          :timed="showsTime(options)"
        />
      </ol>
    </div>
    <ProgramVenues :heading-align="titleAlign" :venues="occasion.program.venues ?? []" :content="content" :styles="styles" look="agenda" class="mx-auto mt-14 max-w-3xl" />
  </SectionFrame>
</template>
