<script setup lang="ts">
import type { HeroLayoutOptions } from '~/features/sections/hero/hero.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SectionScrollHint from '~/components/sections/SectionScrollHint.vue'
import { useDragScroll } from '~/features/sections/useDragScroll'
import { useScrollPin } from '~/features/sections/useScrollPin'
import SectionPhoto from '../SectionPhoto.vue'
import HeroText from './HeroText.vue'

// Layout `filmstrip`: the names with a row of five photos like a film strip, below or above them
// (`photoPosition`); the strip scrolls sideways on phones and tablets, edge to edge. `textAlign` sets left or centred
// text, across the other sections' content column (`--site-edge`).
const props = defineProps<SectionLayoutProps<'hero', HeroLayoutOptions<'photoPosition' | 'textAlign'>>>()

const FRAMES = 5
// Missing photos show placeholders, so the strip always has five frames
const frames = computed(() => Array.from({ length: FRAMES }, (_, i) => props.content.layoutPhotos[i]))
const align = computed(() => (props.options.textAlign === 'start' ? 'start' : 'center'))
// Above the names, or between the details and the button
const stripSlot = computed(() => (props.options.photoPosition === 'above' ? 'before-heading' : 'before-cta'))
// Scrolling down slides the strip right while it scrolls sideways (phones and tablets)
const pinned = useTemplateRef<HTMLElement>('pinned')
const row = useTemplateRef<HTMLElement>('row')
const { canScroll, thumb, isDragging, startDrag, drag, endDrag, ignoreClickAfterDrag } = useDragScroll(row, FRAMES)
const { space } = useScrollPin(pinned, row)
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto">
    <!-- A screen tall with the names and strip in its middle, pinned while scrolling down slides the strip (where it
         scrolls, useScrollPin). The screen's height and centring are here, not on the section, so the room the strip
         slides through below doesn't push the content up. -->
    <div ref="pinned" class="flex min-h-[max(var(--site-screen-height),36rem)] w-full flex-col justify-center py-14 @2xl:py-20">
      <HeroText :content="content" :occasion="occasion" :styles="styles" :align="align" size="large" class="w-full px-(--site-edge)">
        <template #[stripSlot]>
          <div
            ref="row"
            data-filmstrip
            class="-mx-(--site-edge) flex w-[calc(100%+2*var(--site-edge))] scroll-px-(--site-edge) gap-3 overflow-x-auto px-(--site-edge) [scrollbar-width:none] @3xl:mx-0 @3xl:grid @3xl:w-full @3xl:grid-cols-5 @3xl:overflow-visible @3xl:px-0 [&::-webkit-scrollbar]:hidden"
            :class="[isDragging ? 'cursor-grabbing select-none' : 'snap-x snap-mandatory', canScroll && !isDragging && 'cursor-grab', options.photoPosition === 'above' && !canScroll && 'mb-8']"
            @pointerdown="startDrag"
            @pointermove="drag"
            @pointerup="endDrag"
            @pointercancel="endDrag"
            @click.capture="ignoreClickAfterDrag"
            @dragstart.prevent
          >
            <SectionPhoto
              v-for="(src, i) in frames"
              :key="i"
              :src="src"
              :variant="i"
              class="aspect-4/5 w-36 shrink-0 snap-start rounded-(--site-radius) @3xl:w-full"
            />
          </div>
          <!-- Where the strip scrolls: the same indicator as the other sideways rows -->
          <SectionScrollHint v-if="canScroll" :thumb="thumb" :styles="styles" class="mt-4" :class="options.photoPosition === 'above' && 'mb-8'" />
        </template>
      </HeroText>
    </div>
    <!-- The room the row slides through while the content above is pinned -->
    <div v-if="space" aria-hidden="true" data-scroll-pin-space :style="space" />
  </SectionFrame>
</template>
