<script setup lang="ts">
import type { DressCodeAlignedOptions } from '~/features/sections/dress-code/dress-code.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import { Check, X } from '@lucide/vue'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import { alignClasses } from '~/features/sections/section.options'
import DressCodeDescription from './DressCodeDescription.vue'
import DressCodeHeading from './DressCodeHeading.vue'

// Layout `do-dont`: centred: the heading and attire, the description, then two light cards side by side (stacked on
// phones): "Please wear" with a tick, each suggested colour as a swatch and its name, and "Please avoid" with a cross,
// each colour to avoid struck through. Swatches are circles or squares (`swatchShape`). A card without colours is left
// out, and a single card sits centred.
const props = defineProps<SectionLayoutProps<'dress-code', DressCodeAlignedOptions<'swatchShape'>>>()

// The cards are always light, whatever the background
const cardStyles = backgroundStyles.light
const swatchClass = computed(() => (props.options.swatchShape === 'square' ? 'rounded-(--site-radius)' : 'rounded-full'))
const both = computed(() => props.content.colours.length > 0 && props.content.avoidColours.length > 0)
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <div data-dress-do-dont class="mx-auto flex max-w-4xl flex-col gap-10" :class="alignClasses[options.textAlign]">
      <div class="flex w-full flex-col gap-4">
        <DressCodeHeading :content="content" :styles="styles" :align="options.textAlign" />
        <DressCodeDescription :description="content.description" :styles="styles" :align="options.textAlign" class="max-w-xl" />
      </div>
      <div
        v-if="content.colours.length || content.avoidColours.length"
        data-dress-cards
        class="grid w-full gap-6 text-start"
        :class="both ? 'max-w-3xl @3xl:grid-cols-2' : 'max-w-md'"
      >
        <div v-if="content.colours.length" data-dress-wear class="rounded-(--site-radius) p-6 shadow-lg @2xl:p-8" :class="cardStyles.root">
          <p class="flex items-center gap-3">
            <span aria-hidden="true" class="flex size-7 shrink-0 items-center justify-center rounded-full border border-current" :class="cardStyles.accent">
              <Check class="size-4" />
            </span>
            <span class="text-xs font-semibold tracking-[0.2em] uppercase" :class="cardStyles.eyebrow">Please wear</span>
          </p>
          <ul class="mt-6 flex flex-col gap-4">
            <li v-for="colour in content.colours" :key="colour.id" data-dress-colour :data-colour-name="colour.name" class="flex items-center gap-4">
              <span aria-hidden="true" class="size-9 shrink-0 border border-current/15" :class="swatchClass" :style="{ backgroundColor: colour.hex }" />
              <span class="font-medium">{{ colour.name }}</span>
            </li>
          </ul>
        </div>
        <div v-if="content.avoidColours.length" data-dress-avoid class="rounded-(--site-radius) p-6 shadow-lg @2xl:p-8" :class="cardStyles.root">
          <p class="flex items-center gap-3">
            <span aria-hidden="true" class="flex size-7 shrink-0 items-center justify-center rounded-full border border-current" :class="cardStyles.accent">
              <X class="size-4" />
            </span>
            <span class="text-xs font-semibold tracking-[0.2em] uppercase" :class="cardStyles.eyebrow">Please avoid</span>
          </p>
          <ul class="mt-6 flex flex-col gap-4">
            <li v-for="colour in content.avoidColours" :key="colour.id" data-dress-avoid-colour class="flex items-center gap-4">
              <!-- The colour struck through -->
              <span aria-hidden="true" class="relative size-9 shrink-0 border border-current/15" :class="swatchClass" :style="{ backgroundColor: colour.hex }">
                <span class="absolute top-1/2 left-1/2 h-0.5 w-[130%] -translate-1/2 -rotate-45 bg-current" :class="cardStyles.accent" />
              </span>
              <span :class="cardStyles.muted">{{ colour.name }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </SectionFrame>
</template>
