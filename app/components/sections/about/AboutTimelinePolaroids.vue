<script setup lang="ts">
import type { AboutLayoutOptions } from '~/features/sections/about/about.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionScrollHint from '~/components/sections/SectionScrollHint.vue'
import SectionPhoto from '~/components/sections/SectionPhoto.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import { useDragScroll } from '~/features/sections/useDragScroll'
import AboutChapter from './AboutChapter.vue'
import AboutText from './AboutText.vue'

// Layout `timeline-polaroids`: the heading and intro (`textAlign`), then each chapter as an instant photo pinned to one
// string, its eyebrow, heading and text (when it has any) as the caption. The row scrolls
// sideways on every screen: guests swipe (touch, trackpad) or drag it with the mouse. Prints that all fit stay centred.
// The white prints are part of the look, not a theme colour; their captions use the light text colours.
const props = defineProps<SectionLayoutProps<'about', AboutLayoutOptions<'textAlign'>>>()

const align = computed(() => props.options.textAlign)
// The captions sit on the white print, whatever the background
const captionStyles = backgroundStyles.light
// Tilted like prints pinned by hand; the gap between them (gap-12) leaves room for the tilted corners
const tilts = ['-rotate-5', 'rotate-4', '-rotate-3', 'rotate-5']

const row = useTemplateRef<HTMLOListElement>('row')
const { canScroll, thumb, isDragging, startDrag, drag, endDrag, ignoreClickAfterDrag } = useDragScroll(row, () => props.content.timeline.length)
</script>

<template>
  <SectionFrame v-slot="{ styles, background: shown }" :background="background" :image-url="content.backgroundPhoto" class="px-6 py-14 @2xl:px-10 @2xl:py-20">
    <AboutText :content="content" :styles="styles" :align="align" class="mx-auto max-w-6xl" :class="align === 'center' && 'max-w-2xl'" />
    <div v-if="content.timeline.length" class="relative mx-auto mt-10 max-w-6xl">
      <!-- One string across the whole row, behind the prints and past the first and last; it stays put while they scroll
           along it. It and the pins use the background's button colour (the other brand colour, e.g. the secondary on the
           primary), so they stand out on the background and on the white prints. -->
      <span aria-hidden="true" data-about-string class="absolute inset-x-0 top-5 h-0.5 rounded-full" :style="{ backgroundColor: `var(--site-button-${shown})` }" />
      <!-- Padding below and around leaves room for the tilted prints' corners and shadows, which a scrolling row clips -->
      <ol
        ref="row"
        data-about-timeline
        class="relative flex gap-12 overflow-x-auto px-4 pb-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        :class="[isDragging ? 'cursor-grabbing select-none' : 'snap-x snap-mandatory', canScroll && !isDragging && 'cursor-grab']"
        @pointerdown="startDrag"
        @pointermove="drag"
        @pointerup="endDrag"
        @pointercancel="endDrag"
        @click.capture="ignoreClickAfterDrag"
        @dragstart.prevent
      >
        <!-- Auto margins centre the prints while they all fit, and don't hide any once they overflow -->
        <li
          v-for="(item, index) in content.timeline"
          :key="index"
          data-about-chapter
          class="relative w-52 shrink-0 snap-center pt-5 first:ms-auto last:me-auto @2xl:w-60"
        >
          <figure data-about-polaroid class="bg-white p-3 pb-4 shadow-lg" :class="tilts[index % tilts.length]">
            <SectionPhoto data-chapter-photo :src="item.photo" :variant="index" class="aspect-square w-full" />
            <!-- The light text colour, so the heading isn't the background's (e.g. white on the primary colour) -->
            <figcaption class="mt-3 text-(--site-text)">
              <AboutChapter :item="item" :styles="captionStyles" align="center" />
            </figcaption>
          </figure>
          <!-- The pin sits on the print's top edge, half on the border -->
          <span
            aria-hidden="true"
            data-about-pin
            class="absolute start-1/2 top-3 size-4 -translate-x-1/2 rounded-full shadow-md ring-2 ring-white/60"
            :style="{ backgroundColor: `var(--site-button-${shown})` }"
          />
        </li>
      </ol>
      <!-- The row's bottom padding already spaces it from the prints -->
      <SectionScrollHint v-if="canScroll" :thumb="thumb" :styles="styles" />
    </div>
  </SectionFrame>
</template>
