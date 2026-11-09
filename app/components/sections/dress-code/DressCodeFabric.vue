<script setup lang="ts">
import type { DressCodeAlignedOptions } from '~/features/sections/dress-code/dress-code.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { alignClasses, justifyClasses } from '~/features/sections/section.options'
import DressCodeAvoid from './DressCodeAvoid.vue'
import DressCodeDescription from './DressCodeDescription.vue'
import DressCodeHeading from './DressCodeHeading.vue'

// Layout `fabric`: centred: the heading and attire, the description, then the colours as pinned fabric squares, each in
// its colour with a faint woven crosshatch, a pinked (zigzag) top edge and a pin at the top, named under it
// (when it has one). Four in a row, two by two on phones. The "please avoid" row below.
defineProps<SectionLayoutProps<'dress-code', DressCodeAlignedOptions>>()

// The pinking shears' zigzag along the top edge: 16 teeth, 6px deep
const teeth = 16
const pinked = `polygon(${[
  ...Array.from({ length: teeth * 2 + 1 }, (_, i) => `${(i / (teeth * 2)) * 100}% ${i % 2 ? 0 : 6}px`),
  '100% 100%',
  '0 100%',
].join(', ')})`
// A faint weave over the colour: dark threads one way, light the other, so it shows on pale and dark cloth alike
const weave = [
  'repeating-linear-gradient(0deg, rgb(0 0 0 / 0.06) 0 1px, transparent 1px 3px)',
  'repeating-linear-gradient(90deg, rgb(255 255 255 / 0.08) 0 1px, transparent 1px 3px)',
].join(', ')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <div data-dress-fabric class="mx-auto flex max-w-4xl flex-col gap-10" :class="alignClasses[options.textAlign]">
      <div class="flex w-full flex-col gap-4">
        <DressCodeHeading :content="content" :styles="styles" :align="options.textAlign" />
        <DressCodeDescription :description="content.description" :styles="styles" :align="options.textAlign" class="max-w-xl" />
      </div>
      <ul v-if="content.colours.length" data-dress-swatches class="flex w-full flex-wrap gap-6" :class="justifyClasses[options.textAlign]">
        <li
          v-for="colour in content.colours"
          :key="colour.id"
          data-dress-colour
          :data-colour-name="colour.name"
          class="flex w-[calc(50%-0.75rem)] max-w-44 flex-col items-center gap-3 @3xl:w-44"
        >
          <!-- The cloth (its shadow follows the pinked edge) and the pin through it -->
          <div aria-hidden="true" class="relative w-full drop-shadow-md">
            <div
              data-dress-fabric-square
              class="aspect-square w-full border border-current/15"
              :style="{ backgroundColor: colour.hex, backgroundImage: weave, clipPath: pinked }"
            />
            <span class="absolute top-3 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-current shadow-sm" :class="styles.accent" />
          </div>
          <span v-if="colour.name" class="text-sm font-medium">{{ colour.name }}</span>
        </li>
      </ul>
      <DressCodeAvoid :align="options.textAlign" :colours="content.avoidColours" :styles="styles" />
    </div>
  </SectionFrame>
</template>
