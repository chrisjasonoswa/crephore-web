<script setup lang="ts">
import type { DressCodeAlignedOptions } from '~/features/sections/dress-code/dress-code.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import { alignClasses, justifyClasses } from '~/features/sections/section.options'
import DressCodeAvoid from './DressCodeAvoid.vue'
import DressCodeDescription from './DressCodeDescription.vue'
import DressCodeHeading from './DressCodeHeading.vue'

// Layout `swatch-cards` ("Paint chips"): centred: the heading and attire, the description, then each colour as a
// paint-chip card from a colour sample book: a light card with a tall block of the colour on top and its name below
// (no colour code). Four in a row from 768px, or all five when there are five; two by two on phones; fewer chips stay
// centred. Then the "please avoid" row.
const props = defineProps<SectionLayoutProps<'dress-code', DressCodeAlignedOptions>>()

// The chips are light cards, whatever the background
const cardStyles = backgroundStyles.light
// From 768px a chip is a quarter of the row (three gaps of 1.5rem out), or a fifth with five colours (four gaps)
const wideWidth = computed(() => (props.content.colours.length >= 5 ? '@3xl:w-[calc((100%_-_6rem)/5)]' : '@3xl:w-[calc((100%_-_4.5rem)/4)]'))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <div class="mx-auto flex flex-col gap-10" :class="alignClasses[options.textAlign]">
      <div class="flex w-full flex-col gap-4">
        <DressCodeHeading :content="content" :styles="styles" :align="options.textAlign" />
        <DressCodeDescription :description="content.description" :styles="styles" :align="options.textAlign" class="max-w-xl" />
      </div>
      <!-- Two to a row on phones, four (or five) from 768px (widths take the gaps out: 1rem, then 1.5rem from @2xl) -->
      <ul v-if="content.colours.length" data-dress-chips class="flex w-full flex-wrap gap-4 @2xl:gap-6" :class="justifyClasses[options.textAlign]">
        <li
          v-for="colour in content.colours"
          :key="colour.id"
          data-dress-colour
          :data-colour-name="colour.name"
          class="flex w-[calc((100%_-_1rem)/2)] flex-col overflow-clip rounded-(--site-radius) text-start shadow-md @2xl:w-[calc((100%_-_1.5rem)/2)]"
          :class="[cardStyles.root, wideWidth]"
        >
          <!-- The colour, edged so pale ones (linen, ivory) still read on the white card -->
          <span aria-hidden="true" data-dress-chip class="block h-36 border-b border-current/15 @2xl:h-48" :style="{ backgroundColor: colour.hex }" />
          <div class="flex min-h-16 flex-col justify-center px-4 py-3">
            <p v-if="colour.name" class="text-sm font-semibold">
              {{ colour.name }}
            </p>
          </div>
        </li>
      </ul>
      <DressCodeAvoid :align="options.textAlign" :colours="content.avoidColours" :styles="styles" />
    </div>
  </SectionFrame>
</template>
