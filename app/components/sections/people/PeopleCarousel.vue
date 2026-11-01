<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import { personPhotoShapes } from '~/features/sections/people/people.helpers'
import { useDragScroll } from '~/features/sections/useDragScroll'
import PeopleHeading from './PeopleHeading.vue'
import PersonCaption from './PersonCaption.vue'

// Layout `carousel`: one row of tall portraits (`photoShape`) with names, that scrolls sideways on every screen: guests
// swipe (touch, trackpad) or drag it with the mouse. Fits a big group in little space; portraits that all fit stay
// centred.
const props = defineProps<SectionLayoutProps<'people'>>()

const shape = computed(() => personPhotoShapes[props.options.photoShape as keyof typeof personPhotoShapes])

const row = useTemplateRef<HTMLUListElement>('row')
const { canScroll, isDragging, startDrag, drag, endDrag, ignoreClickAfterDrag } = useDragScroll(row, () => props.content.people.length)
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <PeopleHeading :content="content" :styles="styles" />
    <ul
      v-if="content.people.length"
      ref="row"
      data-people
      class="mx-auto mt-10 flex max-w-6xl gap-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      :class="[isDragging ? 'cursor-grabbing select-none' : 'snap-x snap-mandatory', canScroll && !isDragging && 'cursor-grab']"
      @pointerdown="startDrag"
      @pointermove="drag"
      @pointerup="endDrag"
      @pointercancel="endDrag"
      @click.capture="ignoreClickAfterDrag"
      @dragstart.prevent
    >
      <!-- Auto margins centre the portraits while they all fit, and don't hide any once they overflow -->
      <li
        v-for="(person, index) in content.people"
        :key="person.id"
        data-person
        class="flex w-36 shrink-0 snap-start flex-col items-center gap-3 first:ms-auto last:me-auto @2xl:w-44"
      >
        <SectionPhoto data-person-photo :data-shape="options.photoShape" :src="person.photo" :variant="index" class="w-full" :class="shape" />
        <PersonCaption :person="person" :styles="styles" />
      </li>
    </ul>
  </SectionFrame>
</template>
