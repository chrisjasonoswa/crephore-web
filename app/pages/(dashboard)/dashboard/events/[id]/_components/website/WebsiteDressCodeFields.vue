<script setup lang="ts">
import type { DressCodeContent, DressCodeField, DressColour } from '~/features/sections/dress-code/dress-code.type'
import type { SectionLayoutDefinition } from '~/features/sections/section.registry.type'
import CAlert from '~/components/custom/c-alert/CAlert.vue'
import ColorInput from '~/components/site-editor/ColorInput.vue'
import { blankDressColour, dressColourMax } from '~/features/sections/dress-code/dress-code.helpers'
import { layoutFields } from '~/features/sections/section.fields'
import WebsiteListField from './WebsiteListField.vue'
import WebsiteTextareaField from './WebsiteTextareaField.vue'
import WebsiteTextField from './WebsiteTextField.vue'

// The dress code's text, the fields its layout shows (`layout.fields`): a small label (eyebrow), the heading, the attire
// motif (the host's own words, optional), the description, then the colours to
// wear (under a note of the limit) and to avoid (up to `dressColourMax` each, a name and a colour each, in
// `WebsiteListField`s). The inspiration photos are the layout's photo fields in the section settings.
const props = defineProps<{
  layout: SectionLayoutDefinition
}>()
const fields = computed(() => layoutFields<DressCodeField>(props.layout))

const content = defineModel<DressCodeContent>('content', { required: true })
const id = useId()

// Optional text is removed when emptied, so layouts leave it out; the heading stays (empty)
function set(key: 'eyebrow' | 'heading' | 'attire' | 'description', value: string) {
  content.value = { ...content.value, [key]: key === 'heading' ? value : value || undefined }
}

type ColourList = 'colours' | 'avoidColours'
const setList = (list: ColourList, colours: DressColour[]) => (content.value = { ...content.value, [list]: colours })
const setColour = (list: ColourList, index: number, key: 'name' | 'hex', value: string | undefined) =>
  setList(list, content.value[list].map((colour, i) => (i === index ? { ...colour, [key]: value ?? colour[key] } : colour)))
const colourLabel = (colour: DressColour, index: number) => colour.name || `colour ${index + 1}`
</script>

<template>
  <div class="flex flex-col gap-4">
    <WebsiteTextField v-if="fields.uses('eyebrow')" :model-value="content.eyebrow ?? ''" label="Small label" placeholder="e.g. What to wear" @update:model-value="set('eyebrow', $event)" />
    <WebsiteTextField v-if="fields.uses('heading')" :model-value="content.heading" label="Heading" placeholder="e.g. Dress code" @update:model-value="set('heading', $event)" />

    <WebsiteTextField
      v-if="fields.uses('attire')"
      data-attire
      :model-value="content.attire ?? ''"
      label="Attire motif (optional)"
      placeholder="e.g. Garden formal, Rustic boho, All white"
      @update:model-value="set('attire', $event)"
    />

    <WebsiteTextareaField
      v-if="fields.uses('description')"
      :model-value="content.description ?? ''"
      label="Description (optional)"
      :rows="3"
      placeholder="e.g. Light suits or barong for gentlemen; long dresses or Filipiniana for ladies."
      @update:model-value="set('description', $event)"
    />

    <template v-for="list in (['colours', 'avoidColours'] as const)" :key="list">
      <WebsiteListField
        v-if="fields.uses(list)"
        :data-dress-colours="list"
        :model-value="content[list]"
        :label="list === 'colours' ? 'Colours to wear' : 'Colours to avoid (optional)'"
        :add-label="list === 'colours' ? 'Add a colour' : 'Add a colour to avoid'"
        name="dress-colour"
        :max="dressColourMax"
        :create="() => blankDressColour(list === 'colours' ? '#B8974A' : '#FFFFFF')"
        :item-label="colourLabel"
        :key-of="colour => colour.id"
        @update:model-value="setList(list, $event)"
      >
        <template v-if="list === 'colours'" #description>
          <!-- Role note, so screen readers don't announce it like an error -->
          <CAlert type="info" size="sm" role="note" class="w-full" data-colour-limit>
            You can add up to {{ dressColourMax }} colours to wear.
          </CAlert>
        </template>
        <template #item="{ item: colour, index }">
          <div class="grid grid-cols-2 gap-2">
            <WebsiteTextField size="sm" :model-value="colour.name" label="Name" placeholder="e.g. Sage" @update:model-value="setColour(list, index, 'name', $event)" />
            <ColorInput :id="`${id}-${list}-${colour.id}`" size="sm" :model-value="colour.hex" label="Colour" @update:model-value="setColour(list, index, 'hex', $event)" />
          </div>
        </template>
      </WebsiteListField>
    </template>
  </div>
</template>
