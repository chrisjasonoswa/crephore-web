<script setup lang="ts">
import type { ProgramContent, SectionProgram } from '~/features/sections/program/program.type'
import CAlert from '~/components/custom/c-alert/CAlert.vue'
import { formatProgramDate, formatProgramTimeRange } from '~/features/sections/program/program.helpers'
import WebsiteTextField from './WebsiteTextField.vue'

// The program section's text: a small label (eyebrow) and the heading, then the venues block's own small label and
// heading (at the bottom of the layout). The venue and items are the event's program, shown as plain
// text with a link to the Program tab, where they're edited; never saved with the section.
defineProps<{
  program: SectionProgram
}>()

const content = defineModel<ProgramContent>('content', { required: true })

const route = useRoute()
const programTab = computed(() => ({ query: { ...route.query, tab: 'program' } }))

// Optional fields are removed when emptied, so the layout leaves them out
type TextKey = 'eyebrow' | 'heading' | 'venuesEyebrow' | 'venuesHeading'
function set(key: TextKey, value: string | number) {
  const text = String(value)
  const required = key === 'heading' || key === 'venuesHeading'
  content.value = { ...content.value, [key]: required ? text : text || undefined }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <WebsiteTextField :model-value="content.eyebrow ?? ''" label="Small label" placeholder="e.g. The day" @update:model-value="set('eyebrow', $event)" />
    <WebsiteTextField :model-value="content.heading" label="Heading" placeholder="e.g. Program" @update:model-value="set('heading', $event)" />

    <fieldset data-venues-text class="flex flex-col gap-4 rounded-lg border p-4">
      <legend class="px-1 text-sm font-medium">
        Venues
      </legend>
      <p class="-mt-2 text-xs text-muted-foreground">
        Above the venues' address, notes, photo and map, at the bottom of the section.
      </p>
      <WebsiteTextField :model-value="content.venuesEyebrow ?? ''" label="Small label (optional)" placeholder="e.g. Find us" @update:model-value="set('venuesEyebrow', $event)" />
      <WebsiteTextField :model-value="content.venuesHeading" label="Heading" placeholder="e.g. Getting there" @update:model-value="set('venuesHeading', $event)" />
    </fieldset>

    <div class="flex flex-col gap-4" data-event-fields>
      <!-- Role note, so screen readers don't announce it like an error -->
      <CAlert v-if="program.items.length" type="info" role="note">
        Venue and schedule are from the event's program. Each schedule has a title, date and time. You can also add venue, speaker/host/lead, and a note. Each venue's address, notes, photo and map show at the bottom, from the Venues tab. <NuxtLink :to="programTab" class="font-medium underline underline-offset-2">Click here to Edit program</NuxtLink>
      </CAlert>
      <CAlert v-else type="warning" role="note">
        No schedule yet, so this section stays hidden on your website. <NuxtLink :to="programTab" class="font-medium underline underline-offset-2">Add the program</NuxtLink>
      </CAlert>

      <dl v-if="program.items.length" class="flex flex-col gap-4">
        <div v-if="program.venue" class="flex flex-col gap-1.5">
          <dt class="text-sm font-medium">
            Venue
          </dt>
          <dd class="ps-3 text-sm">
            {{ program.venue }}
          </dd>
        </div>
        <div class="flex flex-col gap-1.5">
          <dt class="text-sm font-medium">
            Schedule
          </dt>
          <dd class="ps-3">
            <ol class="flex flex-col gap-1.5 text-sm" aria-label="Program items">
              <li v-for="item in program.items" :key="item.id" data-program-summary-item>
                <span class="text-muted-foreground">{{ [formatProgramDate(item.date), formatProgramTimeRange(item)].filter(Boolean).join(' · ') }}</span>
                <span class="block">{{ item.title }}</span>
              </li>
            </ol>
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
