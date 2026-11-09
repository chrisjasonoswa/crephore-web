<script setup lang="ts">
import type { DressCodeAlignedOptions } from '~/features/sections/dress-code/dress-code.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { alignClasses } from '~/features/sections/section.options'
import DressCodeAvoid from './DressCodeAvoid.vue'
import DressCodeDescription from './DressCodeDescription.vue'
import DressCodeHeading from './DressCodeHeading.vue'

// Layout `color-field`: the colours fill the whole section as equal vertical stripes, over the background photo too.
// The details sit on a card in front, left, centred or right across them (`cardAlign`), in the section's own
// background colours: the heading and attire, the description, the colour names in small spaced
// capitals ("Sage · Linen · Ochre · Taupe") and the "please avoid" row. Without colours the section's background shows
// around the card. The card has its own surface, so the photo needs no overlay.
const props = defineProps<SectionLayoutProps<'dress-code', DressCodeAlignedOptions<'cardAlign'>>>()

const colours = computed(() => props.content.colours)
// The card left, centred or right across the stripes (`cardAlign`)
const cardPlaces = { start: 'me-auto', center: 'mx-auto', end: 'ms-auto' } as const
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" overlay="none" class="px-(--site-edge) py-20 @2xl:py-28">
    <!-- The colour field, over the photo and under the card -->
    <div v-if="colours.length" aria-hidden="true" data-dress-field="stripes" class="absolute inset-0 flex">
      <span v-for="colour in colours" :key="colour.id" data-dress-stripe class="h-full flex-1" :style="{ backgroundColor: colour.hex }" />
    </div>

    <div
      data-dress-color-field
      class="relative flex max-w-lg flex-col gap-6 rounded-(--site-radius) px-6 py-10 shadow-xl @2xl:px-12 @2xl:py-14"
      :class="[styles.root, alignClasses[options.textAlign], cardPlaces[options.cardAlign]]"
    >
      <DressCodeHeading :content="content" :styles="styles" :align="options.textAlign" class="w-full" />
      <DressCodeDescription :description="content.description" :styles="styles" :align="options.textAlign" />
      <p v-if="colours.length" data-dress-swatches class="text-xs font-semibold tracking-[0.25em] uppercase" :class="styles.eyebrow">
        <template v-for="(colour, index) in colours" :key="colour.id">
          <span v-if="index" aria-hidden="true"> · </span>
          <span data-dress-colour :data-colour-name="colour.name">{{ colour.name }}</span>
        </template>
      </p>
      <DressCodeAvoid :colours="content.avoidColours" :styles="styles" :align="options.textAlign" />
    </div>
  </SectionFrame>
</template>
