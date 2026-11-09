<script setup lang="ts">
import type { PeopleLayoutOptions } from '~/features/sections/people/people.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { personPhotoShapes } from '~/features/sections/people/people.helpers'
import { useDragScroll } from '~/features/sections/useDragScroll'
import { useScrollPin } from '~/features/sections/useScrollPin'
import PeopleHeading from './PeopleHeading.vue'
import PersonCaption from './PersonCaption.vue'
import PersonPhoto from './PersonPhoto.vue'

// Layout `carousel`: one row of tall portraits (`photoShape`) with names, that scrolls sideways on every screen: guests
// swipe (touch, trackpad) or drag it with the mouse. Fits a big group in little space; portraits that all fit stay
// centred.
const props = defineProps<SectionLayoutProps<'people', PeopleLayoutOptions<'photoShape'>>>()

const shape = computed(() => personPhotoShapes[props.options.photoShape])

const row = useTemplateRef<HTMLUListElement>('row')
const { canScroll, isDragging, startDrag, drag, endDrag, ignoreClickAfterDrag } = useDragScroll(row, () => props.content.people.length)
// Scrolling down slides the row right, once it's on screen
const pinned = useTemplateRef<HTMLElement>('pinned')
const { space } = useScrollPin(pinned, row)
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <!-- Pinned while scrolling down slides the row (useScrollPin) -->
    <div ref="pinned">
      <PeopleHeading :content="content" :styles="styles" />
      <ul
        v-if="content.people.length"
        ref="row"
        data-people
        class="mx-auto mt-10 flex gap-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
          v-for="person in content.people"
          :key="person.id"
          data-person
          class="flex w-36 shrink-0 snap-start flex-col items-center gap-3 first:ms-auto last:me-auto @2xl:w-44"
        >
          <PersonPhoto data-person-photo :data-shape="options.photoShape" :person="person" :styles="styles" class="w-full" :class="shape" />
          <PersonCaption :person="person" :styles="styles" />
        </li>
      </ul>
    </div>
    <!-- The room the row slides through while the content above is pinned -->
    <div v-if="space" aria-hidden="true" data-scroll-pin-space :style="space" />
  </SectionFrame>
</template>
