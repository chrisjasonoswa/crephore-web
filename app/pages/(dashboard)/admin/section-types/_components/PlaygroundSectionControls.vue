<script setup lang="ts">
import type { Section, SectionBackground } from '~/features/sections/section.type'
import { getSectionType } from '~/features/sections/section.registry'
import { sectionBackgroundLabels, sectionBackgrounds } from '~/features/sections/section.type'

// Settings of one section on the page: which layout, which background, and its photo.
const section = defineModel<Section>('section', { required: true })

const id = useId()
const definition = computed(() => getSectionType(section.value.type))
// Every layout supports every background, so switching layout keeps the chosen background.
const backgrounds = sectionBackgrounds

const layoutKey = computed({
  get: () => section.value.layout,
  set: key => (section.value = { ...section.value, layout: key }),
})

// Two-way binding for an optional URL field of the hero content (empty clears it).
function contentUrl(field: 'backgroundImageUrl' | 'layoutImageUrl') {
  return computed({
    get: () => section.value.content[field] ?? '',
    set: url => (section.value = { ...section.value, content: { ...section.value.content, [field]: url.trim() || undefined } }),
  })
}

const backgroundImageUrl = contentUrl('backgroundImageUrl')
const layoutImageUrl = contentUrl('layoutImageUrl')

// A single-select toggle group emits an empty value when the active item is clicked again; keep the current one.
function setBackground(next: unknown) {
  if (typeof next === 'string' && next)
    section.value = { ...section.value, background: next as SectionBackground }
}
</script>

<template>
  <div class="flex flex-col gap-4 rounded-lg border p-4">
    <p class="font-medium">
      {{ definition.name }}
    </p>

    <div class="flex flex-col gap-2">
      <Label :for="`${id}-layout`">Layout</Label>
      <Select v-model="layoutKey">
        <SelectTrigger :id="`${id}-layout`" class="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="layout in definition.layouts" :key="layout.key" :value="layout.key">
            {{ layout.name }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div class="flex flex-col gap-2">
      <Label>Background</Label>
      <ToggleGroup
        type="single"
        variant="outline"
        :model-value="section.background"
        class="grid w-full grid-cols-2"
        @update:model-value="setBackground"
      >
        <ToggleGroupItem v-for="option in backgrounds" :key="option" :value="option">
          {{ sectionBackgroundLabels[option] }}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>

    <div class="flex flex-col gap-2">
      <Label :for="`${id}-background-image`">Background image URL</Label>
      <Input
        :id="`${id}-background-image`"
        v-model="backgroundImageUrl"
        type="url"
        placeholder="https://… (shown on the Photo background)"
      />
    </div>

    <div class="flex flex-col gap-2">
      <Label :for="`${id}-layout-image`">Layout image URL</Label>
      <Input
        :id="`${id}-layout-image`"
        v-model="layoutImageUrl"
        type="url"
        placeholder="https://… (optional, beside or above the text)"
      />
    </div>
  </div>
</template>
