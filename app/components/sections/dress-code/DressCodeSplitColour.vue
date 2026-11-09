<script setup lang="ts">
import type { DressCodeAlignedOptions } from '~/features/sections/dress-code/dress-code.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { attireOf, textOnColour } from '~/features/sections/dress-code/dress-code.helpers'
import { alignClasses } from '~/features/sections/section.options'
import DressCodeAvoid from './DressCodeAvoid.vue'
import DressCodeDescription from './DressCodeDescription.vue'
import DressCodeSwatches from './DressCodeSwatches.vue'

// Layout `split-colour` ("Colour split"): half the section is filled with the first suggested colour (the primary
// without colours) and holds the heading as a small label and the attire, large in the heading font, in the text that
// reads on it. The other half (`colourSide` puts the colour half left or right) has the eyebrow as a small label, the
// description, the named swatches and "please avoid". The title (on the colour half, `titleAlign`) and the text
// (`textAlign`) align separately. Phones: the colour half on top, the details below.
const props = defineProps<SectionLayoutProps<'dress-code', DressCodeAlignedOptions<'colourSide' | 'titleAlign'>>>()

const first = computed(() => props.content.colours[0])
const colourStyle = computed(() => (first.value ? { backgroundColor: first.value.hex, color: textOnColour(first.value.hex) } : undefined))
const onRight = computed(() => props.options.colourSide === 'right')
</script>

<template>
  <!-- The colour half is its own surface: the photo overlay only needs to cover the details' half -->
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" :overlay="onRight ? 'start' : 'end'">
    <div data-dress-split-colour :data-colour-side="options.colourSide" class="grid @3xl:grid-cols-2">
      <div
        data-dress-colour-half
        class="flex flex-col justify-center gap-4 px-(--site-edge) py-16 @3xl:py-20"
        :class="[first ? '' : 'bg-(--site-primary) text-(--site-on-primary)', onRight ? '@3xl:order-last @3xl:ps-(--site-gutter)' : '@3xl:pe-(--site-gutter)', alignClasses[options.titleAlign]]"
        :style="colourStyle"
      >
        <h2 v-if="content.heading" class="text-[0.7rem] font-medium tracking-[0.25em] uppercase @2xl:text-xs">
          {{ content.heading }}
        </h2>
        <p v-if="attireOf(content)" data-dress-attire class="font-(family-name:--site-font-heading) text-4xl leading-tight text-balance @2xl:text-5xl @3xl:text-6xl">
          {{ attireOf(content) }}
        </p>
      </div>

      <!-- Each half: the frame's edge on its outer side, the gutter on the side facing the other half -->
      <div data-dress-details class="flex flex-col justify-center gap-6 px-(--site-edge) py-14 @3xl:py-20" :class="onRight ? '@3xl:pe-(--site-gutter)' : '@3xl:ps-(--site-gutter)'">
        <p v-if="content.eyebrow" class="w-full text-[0.7rem] font-semibold tracking-[0.25em] uppercase @2xl:text-xs" :class="[styles.eyebrow, alignClasses[options.textAlign]]">
          {{ content.eyebrow }}
        </p>
        <DressCodeDescription :description="content.description" :styles="styles" :align="options.textAlign" />
        <DressCodeSwatches :colours="content.colours" :styles="styles" :align="options.textAlign" class="w-full" />
        <DressCodeAvoid :colours="content.avoidColours" :styles="styles" :align="options.textAlign" class="w-full" />
      </div>
    </div>
  </SectionFrame>
</template>
