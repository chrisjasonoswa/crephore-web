<script setup lang="ts">
import type { DressCodeAlignedOptions } from '~/features/sections/dress-code/dress-code.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { textOnColour } from '~/features/sections/dress-code/dress-code.helpers'
import DressCodeAvoid from './DressCodeAvoid.vue'
import DressCodeDescription from './DressCodeDescription.vue'
import DressCodeHeading from './DressCodeHeading.vue'

// Layout `fan`: the colours as paint chips fanned out like a designer's colour deck: tall chips turning on a shared
// rivet near their bottom ends, spread across 60°, each named along its top end in small spaced capitals. On one side
// (`colourSide`), with the heading, attire, description and "please avoid" row on the other, left-aligned. Phones: the
// fan (smaller) above the details. Without colours, only the details.
const props = defineProps<SectionLayoutProps<'dress-code', DressCodeAlignedOptions<'colourSide'>>>()

// The fan's spread: the first chip at -30°, the last at 30°, one chip upright
const spread = 60
const chips = computed(() => {
  const count = props.content.colours.length
  return props.content.colours.map((colour, index) => ({
    colour,
    angle: count > 1 ? -spread / 2 + (spread / (count - 1)) * index : 0,
  }))
})
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <div data-dress-fan-layout class="mx-auto grid items-center gap-10 @3xl:gap-16" :class="chips.length ? '@3xl:grid-cols-2' : ''">
      <!-- The deck: first in the page so it sits above the details on phones -->
      <div v-if="chips.length" data-dress-fan class="relative h-60 @3xl:h-96" :class="options.colourSide === 'right' && '@3xl:order-last'">
        <ul>
          <li
            v-for="{ colour, angle } in chips"
            :key="colour.id"
            data-dress-colour
            :data-colour-name="colour.name"
            class="absolute bottom-4 left-1/2 h-52 w-12 rounded-(--site-radius) border border-current/15 shadow-lg @3xl:h-80 @3xl:w-18"
            :style="{ backgroundColor: colour.hex, color: textOnColour(colour.hex), transform: `translateX(-50%) rotate(${angle}deg)`, transformOrigin: '50% 90%' }"
          >
            <span class="absolute top-3 left-1/2 -translate-x-1/2 text-[0.6rem] font-semibold tracking-[0.25em] whitespace-nowrap uppercase [writing-mode:vertical-rl] @3xl:top-4 @3xl:text-xs">
              {{ colour.name }}
            </span>
          </li>
        </ul>
        <!-- The rivet the chips turn on, 10% up from their bottom ends (their transform origin) -->
        <span
          aria-hidden="true"
          class="absolute bottom-[calc(1rem+1.3rem)] left-1/2 size-3 -translate-x-1/2 translate-y-1/2 rounded-full bg-current shadow-sm @3xl:bottom-[calc(1rem+2rem)] @3xl:size-4"
          :class="styles.accent"
        />
      </div>
      <div class="flex flex-col gap-6">
        <DressCodeHeading :content="content" :styles="styles" :align="options.textAlign" class="w-full" />
        <DressCodeDescription :description="content.description" :styles="styles" :align="options.textAlign" class="max-w-xl" />
        <DressCodeAvoid :colours="content.avoidColours" :styles="styles" :align="options.textAlign" class="w-full" />
      </div>
    </div>
  </SectionFrame>
</template>
