<script setup lang="ts">
import type { AboutLayoutOptions } from '~/features/sections/about/about.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionScrollHint from '~/components/sections/SectionScrollHint.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import { useDragScroll } from '~/features/sections/useDragScroll'
import { useScrollPin } from '~/features/sections/useScrollPin'
import AboutChapter from './AboutChapter.vue'
import AboutText from './AboutText.vue'

// Layout `timeline-cards`: the heading and intro (`textAlign`), then the chapters as cards (photo, then text) in one
// row along a line, a dot over each. The row scrolls sideways on every screen: guests swipe (touch, trackpad) or drag
// it with the mouse. Cards that all fit stay centred.
const props = defineProps<SectionLayoutProps<'about', AboutLayoutOptions<'textAlign'>>>()

const align = computed(() => props.options.textAlign)

const row = useTemplateRef<HTMLOListElement>('row')
const { canScroll, thumb, isDragging, startDrag, drag, endDrag, ignoreClickAfterDrag } = useDragScroll(row, () => props.content.timeline.length)
// Scrolling down slides the row right, once it's on screen
const pinned = useTemplateRef<HTMLElement>('pinned')
const { space } = useScrollPin(pinned, row)
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <!-- Pinned while scrolling down slides the row (useScrollPin) -->
    <div ref="pinned">
      <AboutText :content="content" :styles="styles" :align="align" class="mx-auto" :class="align === 'center' && 'max-w-2xl'" />
      <ol
        v-if="content.timeline.length"
        ref="row"
        data-about-timeline
        class="mx-auto mt-12 flex gap-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        :class="[isDragging ? 'cursor-grabbing select-none' : 'snap-x snap-mandatory', canScroll && !isDragging && 'cursor-grab']"
        @pointerdown="startDrag"
        @pointermove="drag"
        @pointerup="endDrag"
        @pointercancel="endDrag"
        @click.capture="ignoreClickAfterDrag"
        @dragstart.prevent
      >
        <!-- Auto margins centre the cards while they all fit, and don't hide any once they overflow -->
        <li
          v-for="(item, index) in content.timeline"
          :key="index"
          data-about-chapter
          class="relative w-64 shrink-0 snap-start pt-8 first:ms-auto last:me-auto @2xl:w-72 @3xl:w-80"
        >
          <!-- The line runs on through the gap to the next card -->
          <span aria-hidden="true" class="absolute start-0 top-1.5 h-px bg-current/20" :class="index === content.timeline.length - 1 ? 'end-0' : '-end-5'" />
          <span aria-hidden="true" class="absolute start-0 top-0 size-3 rounded-full bg-current" :class="styles.accent" />
          <SectionPhoto data-chapter-photo :src="item.photo" :variant="index" class="aspect-4/3 w-full rounded-(--site-radius)" />
          <AboutChapter :item="item" :styles="styles" class="mt-4" />
        </li>
      </ol>
      <SectionScrollHint v-if="canScroll" :thumb="thumb" :styles="styles" class="mt-8" />
    </div>
    <!-- The room the row slides through while the content above is pinned -->
    <div v-if="space" aria-hidden="true" data-scroll-pin-space :style="space" />
  </SectionFrame>
</template>
