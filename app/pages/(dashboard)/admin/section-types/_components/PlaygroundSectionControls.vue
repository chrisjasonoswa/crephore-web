<script setup lang="ts">
import type { AboutContent } from '~/features/sections/about/about.type'
import type { CountdownContent } from '~/features/sections/countdown/countdown.type'
import type { HeroContent } from '~/features/sections/hero/hero.type'
import type { MessageContent } from '~/features/sections/message/message.type'
import type { DressCodeContent } from '~/features/sections/dress-code/dress-code.type'
import type { PeopleContent } from '~/features/sections/people/people.type'
import type { ProgramContent, SectionProgram } from '~/features/sections/program/program.type'
import type { SectionLayoutOption } from '~/features/sections/section.options'
import type { Section, SectionBackground, SectionOccasion } from '~/features/sections/section.type'
import { groupedChoices, positions, resolveLayoutOptions } from '~/features/sections/section.options'
import { changeSectionLayout, getSectionLayout, getSectionType } from '~/features/sections/section.registry'
import { inPickerOrder, sectionBackgroundLabels } from '~/features/sections/section.type'
import PlaygroundCountdownContent from './PlaygroundCountdownContent.vue'
import PlaygroundHeroContent from './PlaygroundHeroContent.vue'
import PlaygroundAboutContent from './PlaygroundAboutContent.vue'
import PlaygroundMessageContent from './PlaygroundMessageContent.vue'
import PlaygroundDressCodeContent from './PlaygroundDressCodeContent.vue'
import PlaygroundPeopleContent from './PlaygroundPeopleContent.vue'
import PlaygroundProgramContent from './PlaygroundProgramContent.vue'

// Settings of one section on the page: layout, its placement options, background, and its content
// (per section type: the hero's background and layout photos; the countdown's seconds, button, background and layout photo;
// the message's signature, background and layout photo; the about section's photos, story length and chapters; the people section's count and photos; the program's items and days: the page's program, in its `occasion`, whose dates they follow).
defineProps<{
  occasion: SectionOccasion
}>()
const section = defineModel<Section>('section', { required: true })
// The page's program (the event's in a real site), which the program section's controls change
const program = defineModel<SectionProgram>('program', { required: true })

const id = useId()
const definition = computed(() => getSectionType(section.value.type))
const layout = computed(() => getSectionLayout(section.value.type, section.value.layout))
const options = computed(() => (layout.value ? resolveLayoutOptions(layout.value.options, section.value.options) : {}))

// Switching layout resets its options and keeps the background when the new layout supports it
const layoutKey = computed({
  get: () => section.value.layout,
  set: key => (section.value = changeSectionLayout(section.value, key)),
})

// A single-select toggle group emits an empty value when the active item is clicked again; keep the current one.
function setBackground(next: unknown) {
  if (typeof next === 'string' && next)
    section.value = { ...section.value, background: next as SectionBackground }
}

function setOption(key: string, next: unknown) {
  if (typeof next === 'string' && next)
    section.value = { ...section.value, options: { ...options.value, [key]: next } }
}

// The 3×3 position options get a grid picker; the rest a row of toggles
const isPositionOption = (option: SectionLayoutOption) =>
  option.choices.length === positions.length && option.choices.every(choice => (positions as readonly string[]).includes(choice.value))

// `Section` doesn't narrow its content by `type`, so each content editor gets it cast to its type
const heroContent = computed({
  get: () => section.value.content as HeroContent,
  set: content => (section.value = { ...section.value, content }),
})
const countdownContent = computed({
  get: () => section.value.content as CountdownContent,
  set: content => (section.value = { ...section.value, content }),
})
const programContent = computed({
  get: () => section.value.content as ProgramContent,
  set: content => (section.value = { ...section.value, content }),
})
const peopleContent = computed({
  get: () => section.value.content as PeopleContent,
  set: content => (section.value = { ...section.value, content }),
})
const aboutContent = computed({
  get: () => section.value.content as AboutContent,
  set: content => (section.value = { ...section.value, content }),
})
const messageContent = computed({
  get: () => section.value.content as MessageContent,
  set: content => (section.value = { ...section.value, content }),
})
const dressCodeContent = computed({
  get: () => section.value.content as DressCodeContent,
  set: content => (section.value = { ...section.value, content }),
})
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
          <SelectItem v-for="option in definition.layouts" :key="option.key" :value="option.key">
            {{ option.name }}
          </SelectItem>
        </SelectContent>
      </Select>
      <p v-if="layout" class="text-xs text-muted-foreground">
        {{ layout.description }}
      </p>
    </div>

    <!-- The layout's placement options -->
    <div v-for="option in layout?.options ?? []" :key="option.key" class="flex flex-col gap-2">
      <Label>{{ option.label }}</Label>
      <Select
        v-if="option.control === 'select'"
        :model-value="options[option.key]"
        @update:model-value="setOption(option.key, String($event))"
      >
        <SelectTrigger :aria-label="option.label" class="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <template v-for="(group, groupIndex) in groupedChoices(option.choices)" :key="group.group ?? ''">
            <SelectSeparator v-if="groupIndex > 0" />
            <SelectGroup>
              <SelectLabel v-if="group.group">
                {{ group.group }}
              </SelectLabel>
              <SelectItem v-for="choice in group.choices" :key="choice.value" :value="choice.value">
                {{ choice.label }}
              </SelectItem>
            </SelectGroup>
          </template>
        </SelectContent>
      </Select>
      <ToggleGroup
        v-else
        type="single"
        variant="outline"
        :model-value="options[option.key]"
        :class="isPositionOption(option) ? 'grid w-full grid-cols-3' : 'grid w-full auto-cols-fr grid-flow-col'"
        @update:model-value="setOption(option.key, $event)"
      >
        <ToggleGroupItem
          v-for="choice in option.choices"
          :key="choice.value"
          :value="choice.value"
          :aria-label="choice.label"
          class="text-xs"
        >
          {{ choice.label }}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>

    <div class="flex flex-col gap-2">
      <Label>Background</Label>
      <ToggleGroup
        v-if="(layout?.backgrounds.length ?? 0) > 1"
        type="single"
        variant="outline"
        :model-value="section.background"
        class="grid w-full auto-cols-fr grid-flow-col"
        @update:model-value="setBackground"
      >
        <ToggleGroupItem v-for="option in inPickerOrder(layout?.backgrounds ?? [])" :key="option" :value="option">
          {{ sectionBackgroundLabels[option] }}
        </ToggleGroupItem>
      </ToggleGroup>
      <p v-else class="text-xs text-muted-foreground">
        This layout sits on its photo (the primary colour until a photo is added).
      </p>
    </div>

    <PlaygroundHeroContent v-if="section.type === 'hero'" v-model:content="heroContent" />
    <PlaygroundCountdownContent v-else-if="section.type === 'countdown'" v-model:content="countdownContent" />
    <PlaygroundMessageContent v-else-if="section.type === 'message'" v-model:content="messageContent" />
    <PlaygroundAboutContent v-else-if="section.type === 'about'" v-model:content="aboutContent" />
    <PlaygroundPeopleContent v-else-if="section.type === 'people'" v-model:content="peopleContent" />
    <PlaygroundProgramContent v-else-if="section.type === 'program'" v-model:content="programContent" v-model:program="program" :occasion="occasion" />
    <PlaygroundDressCodeContent v-else-if="section.type === 'dress-code'" v-model:content="dressCodeContent" />
  </div>
</template>
