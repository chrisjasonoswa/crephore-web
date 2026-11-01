<script setup lang="ts">
import type { PeopleContent, PersonItem } from '~/features/sections/people/people.type'
import { GripVertical, Plus, Trash2 } from '@lucide/vue'
import { useDraggable } from 'vue-draggable-plus'
import { moveItem } from '~/features/event-websites/event-website'
import { blankPerson, peopleMaxItems } from '~/features/sections/people/people.helpers'
import WebsitePhotoField from './WebsitePhotoField.vue'

// The people section's text: a small label (eyebrow), the heading and the people, in order. Each person has a name and
// role, plus a photo and bio when the layout shows them (the entourage list and credits are text only; only some
// layouts have room for a bio). Drag a person's handle, or press Arrow Up/Down on it, to reorder.
const props = defineProps<{
  eventId: number
  showPhotos: boolean
  showBio: boolean
}>()

const content = defineModel<PeopleContent>('content', { required: true })

const id = useId()

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
const addPerson = () => setPeople([...content.value.people, blankPerson()])
const removePerson = (index: number) => setPeople(content.value.people.filter((_, i) => i !== index))
const move = (from: number, to: number) => setPeople(moveItem(content.value.people, from, to))
const canAdd = computed(() => content.value.people.length < peopleMaxItems)

// Drag with vue-draggable-plus: put Sortable's DOM move back and reorder the list (see WebsiteSectionList)
const list = useTemplateRef<HTMLElement>('list')
useDraggable(list, computed(() => content.value.people), {
  handle: '[data-person-handle]',
  animation: 150,
  ghostClass: 'opacity-40',
  customUpdate: ({ from, item, oldIndex, newIndex }) => {
    if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex)
      return
    item.remove()
    from.insertBefore(item, from.children[oldIndex] ?? null)
    move(oldIndex, newIndex)
  },
})

async function onHandleKeydown(event: KeyboardEvent, index: number) {
  const to = event.key === 'ArrowUp' ? index - 1 : event.key === 'ArrowDown' ? index + 1 : null
  if (to === null || to < 0 || to >= content.value.people.length)
    return
  event.preventDefault()
  move(index, to)
  await nextTick()
  list.value?.querySelectorAll<HTMLElement>('[data-person-handle]')[to]?.focus()
}

const label = (person: PersonItem, index: number) => person.name || `Person ${index + 1}`
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <Label :for="`${id}-eyebrow`">Small label</Label>
      <Input :id="`${id}-eyebrow`" :model-value="content.eyebrow ?? ''" placeholder="e.g. The entourage" @update:model-value="set('eyebrow', $event)" />
    </div>

    <div class="flex flex-col gap-2">
      <Label :for="`${id}-heading`">Heading</Label>
      <Input :id="`${id}-heading`" :model-value="content.heading" placeholder="e.g. Meet our people" @update:model-value="set('heading', $event)" />
    </div>

    <div data-people-fields class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h5 class="text-sm font-semibold">
          People
        </h5>
        <span class="text-xs text-muted-foreground">{{ content.people.length }} of {{ peopleMaxItems }}</span>
      </div>
      <p class="-mt-2 text-xs text-muted-foreground">
        A couple can be one person, e.g. "Mr. & Mrs. Jose Santos". People next to each other with the same role share its heading in the entourage list.
      </p>

      <ol ref="list" class="flex flex-col gap-2" aria-label="People">
        <li
          v-for="(person, index) in content.people"
          :key="person.id"
          data-person-item
          class="flex gap-1 rounded-lg border bg-background py-2 pr-2 pl-1"
        >
          <button
            type="button"
            data-person-handle
            :aria-label="`Move ${label(person, index)} (${index + 1} of ${content.people.length})`"
            title="Drag to reorder"
            class="flex h-8 w-6 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:cursor-grabbing"
            @keydown="onHandleKeydown($event, index)"
          >
            <GripVertical class="size-4" />
          </button>
          <div class="flex min-w-0 flex-1 flex-col gap-2">
            <div class="grid grid-cols-2 gap-2">
              <div class="flex flex-col gap-1">
                <Label :for="`${id}-${person.id}-name`" class="text-xs">Name</Label>
                <Input :id="`${id}-${person.id}-name`" :model-value="person.name" placeholder="e.g. Bea Santos" @update:model-value="setPerson(index, 'name', $event)" />
              </div>
              <div class="flex flex-col gap-1">
                <Label :for="`${id}-${person.id}-role`" class="text-xs">Role</Label>
                <Input :id="`${id}-${person.id}-role`" :model-value="person.role ?? ''" placeholder="e.g. Maid of honour" @update:model-value="setPerson(index, 'role', $event)" />
              </div>
            </div>
            <div v-if="showBio" class="flex flex-col gap-1">
              <Label :for="`${id}-${person.id}-bio`" class="text-xs">Bio (optional)</Label>
              <Textarea :id="`${id}-${person.id}-bio`" :model-value="person.bio ?? ''" rows="2" @update:model-value="setPerson(index, 'bio', $event)" />
            </div>
            <WebsitePhotoField
              v-if="showPhotos"
              :url="person.photo"
              :event-id="eventId"
              :label="`Photo of ${label(person, index)}`"
              @update:url="setPerson(index, 'photo', $event)"
            />
          </div>
          <Button type="button" variant="ghost" size="icon-sm" class="text-destructive hover:text-destructive" :aria-label="`Remove ${label(person, index)}`" @click="removePerson(index)">
            <Trash2 />
          </Button>
        </li>
      </ol>

      <Button type="button" variant="outline" class="w-full border-dashed" :disabled="!canAdd" @click="addPerson">
        <Plus />
        Add a person
      </Button>
    </div>
  </div>
</template>
