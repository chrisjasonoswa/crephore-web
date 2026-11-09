<script setup lang="ts">
import type { DressCodeAlignedOptions } from '~/features/sections/dress-code/dress-code.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import DressCodeAvoid from './DressCodeAvoid.vue'
import DressCodeDescription from './DressCodeDescription.vue'
import DressCodeHeading from './DressCodeHeading.vue'
import DressCodeSwatches from './DressCodeSwatches.vue'

// Layout `overlap`: the colours as large overlapping circles in a cluster, like a palette mood board, slightly see-through
// and multiplied so where they overlap they darken into each other (only into each other: the cluster is isolated from
// the section's colour). On the other side (`colourSide`, "Circles side") the eyebrow, heading, attire, description, a
// small named swatch row and "please avoid", left-aligned. Phones: smaller circles on top, the details below.
const props = defineProps<SectionLayoutProps<'dress-code', DressCodeAlignedOptions<'colourSide'>>>()

// Where each circle sits in the cluster (its top-left corner, % of the square), by how many colours there are: one in
// the middle, two side by side, three in a triangle, four in a loose 2×2, five as four round a fifth in the middle
const arrangements: Record<number, [number, number][]> = {
  1: [[21, 21]],
  2: [[6, 21], [36, 21]],
  3: [[6, 8], [36, 8], [21, 36]],
  4: [[6, 4], [38, 8], [2, 36], [36, 40]],
  5: [[4, 2], [40, 4], [21, 21], [2, 40], [38, 42]],
}
const circles = computed(() => {
  const colours = props.content.colours.slice(0, 5)
  const places = arrangements[colours.length] ?? []
  return colours.map((colour, index) => ({ colour, left: `${places[index]![0]}%`, top: `${places[index]![1]}%` }))
})
const onRight = computed(() => props.options.colourSide === 'right')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <div
      data-dress-overlap
      :data-colour-side="options.colourSide"
      class="mx-auto flex flex-col gap-10 @3xl:grid @3xl:items-center @3xl:gap-16"
      :class="circles.length > 0 && '@3xl:grid-cols-2'"
    >
      <div
        v-if="circles.length"
        data-dress-circles
        aria-hidden="true"
        class="relative isolate mx-auto aspect-square w-full max-w-64 @2xl:max-w-80 @3xl:max-w-md"
        :class="onRight && '@3xl:order-last'"
      >
        <span
          v-for="circle in circles"
          :key="circle.colour.id"
          data-dress-circle
          class="absolute block size-[58%] rounded-full border border-current/15 opacity-90 mix-blend-multiply"
          :style="{ backgroundColor: circle.colour.hex, left: circle.left, top: circle.top }"
        />
      </div>

      <div class="flex max-w-xl flex-col gap-6">
        <DressCodeHeading :content="content" :styles="styles" :align="options.textAlign" class="w-full" />
        <DressCodeDescription :description="content.description" :styles="styles" :align="options.textAlign" />
        <DressCodeSwatches :colours="content.colours" :styles="styles" size="small" :align="options.textAlign" class="w-full" />
        <DressCodeAvoid :colours="content.avoidColours" :styles="styles" :align="options.textAlign" class="w-full" />
      </div>
    </div>
  </SectionFrame>
</template>
