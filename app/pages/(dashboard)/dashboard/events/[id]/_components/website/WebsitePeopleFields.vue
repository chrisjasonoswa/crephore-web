<script setup lang="ts">
import type { PeopleContent, PeopleField, PersonItem } from '~/features/sections/people/people.type'
import type { SectionLayoutDefinition } from '~/features/sections/section.registry.type'
import { blankPerson, peopleMaxItems } from '~/features/sections/people/people.helpers'
import { layoutFields } from '~/features/sections/section.fields'
import WebsiteListField from './WebsiteListField.vue'
import WebsitePhotoField from './WebsitePhotoField.vue'
import WebsiteTextareaField from './WebsiteTextareaField.vue'
import WebsiteTextField from './WebsiteTextField.vue'

// The people section's text, the fields its layout shows (`layout.fields`): a small label (eyebrow), the heading and
// the people, in order. Each person has a name, plus a role, photo and bio when the layout shows them (the entourage
// list and credits are text only; only some layouts have room for a bio), in a `WebsiteListField` (drag or Arrow
// Up/Down on a handle to reorder).
const props = defineProps<{
  eventId: number
  layout: SectionLayoutDefinition
}>()
const fields = computed(() => layoutFields<PeopleField>(props.layout))

const content = defineModel<PeopleContent>('content', { required: true })


// Optional fields are removed when emptied, so the layout leaves them out
function set(key: 'eyebrow' | 'heading', value: string | number) {
  const text = String(value)
  content.value = { ...content.value, [key]: key === 'heading' ? text : text || undefined }
}

const setPeople = (people: PersonItem[]) => (content.value = { ...content.value, people })
function setPerson(index: number, key: 'name' | 'role' | 'photo' | 'bio', value: string | number | undefined) {
  const text = value === undefined ? '' : String(value)
  setPeople(content.value.people.map((person, i) => (i === index ? { ...person, [key]: key === 'name' ? text : text || undefined } : person)))
}

const label = (person: PersonItem, index: number) => person.name || `Person ${index + 1}`
</script>

<template>
  <div class="flex flex-col gap-4">
    <WebsiteTextField v-if="fields.uses('eyebrow')" :model-value="content.eyebrow ?? ''" label="Small label" placeholder="e.g. The entourage" @update:model-value="set('eyebrow', $event)" />
    <WebsiteTextField v-if="fields.uses('heading')" :model-value="content.heading" label="Heading" placeholder="e.g. Meet our people" @update:model-value="set('heading', $event)" />

    <WebsiteListField
      v-if="fields.uses('people')"
      data-people-fields
      :required="fields.requires('people')"
      :model-value="content.people"
      label="People"
      add-label="Add a person"
      name="person"
      :max="peopleMaxItems"
      :create="blankPerson"
      :item-label="label"
      :key-of="person => person.id"
      @update:model-value="setPeople"
    >
      <template #description>
        <p class="-mt-2 text-xs text-muted-foreground">
          A couple can be one person, e.g. "Mr. & Mrs. Jose Santos". People next to each other with the same role share its heading in the entourage list.
        </p>
      </template>
      <template #item="{ item: person, index }">
        <div class="grid gap-2" :class="fields.uses('people.role') && 'grid-cols-2'">
          <WebsiteTextField size="sm" :model-value="person.name" label="Name" placeholder="e.g. Bea Santos" @update:model-value="setPerson(index, 'name', $event)" />
          <WebsiteTextField v-if="fields.uses('people.role')" size="sm" :model-value="person.role ?? ''" label="Role" placeholder="e.g. Maid of honour" @update:model-value="setPerson(index, 'role', $event)" />
        </div>
        <WebsiteTextareaField v-if="fields.uses('people.bio')" size="sm" :model-value="person.bio ?? ''" label="Bio (optional)" :rows="2" @update:model-value="setPerson(index, 'bio', $event)" />
        <WebsitePhotoField
          v-if="fields.uses('people.photo')"
          :url="person.photo"
          :event-id="eventId"
          :label="`Photo of ${label(person, index)}`"
          @update:url="setPerson(index, 'photo', $event)"
        />
      </template>
    </WebsiteListField>
  </div>
</template>
