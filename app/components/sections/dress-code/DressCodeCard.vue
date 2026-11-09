<script setup lang="ts">
import type { DressCodeAlignedOptions } from '~/features/sections/dress-code/dress-code.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SiteDivider from '~/components/site-graphics/dividers/SiteDivider.vue'
import { attireOf, avoidSentence } from '~/features/sections/dress-code/dress-code.helpers'
import { backgroundStyles } from '~/features/sections/section.background'
import { alignClasses, justifyClasses } from '~/features/sections/section.options'
import DressCodeDescription from './DressCodeDescription.vue'

// Layout `card`: a light card centred like an insert in the invitation, with a thin double frame inset in it. In it,
// centred, left or right (`textAlign`): the titles (the eyebrow and heading, a small flourish in the accent colour, the
// attire), the description, a row of small swatch dots (names for screen readers) and "Kindly avoid white and ivory."
// (when there are colours to avoid). The card has its own
// surface, so the background photo needs no overlay. Paper on a colour, so it starts on secondary.
const props = defineProps<SectionLayoutProps<'dress-code', DressCodeAlignedOptions>>()

// The card is always light, whatever the background
const cardStyles = backgroundStyles.light
const attire = computed(() => attireOf(props.content))
const avoid = computed(() => avoidSentence(props.content.avoidColours))
</script>

<template>
  <SectionFrame :background="background" :image-url="content.backgroundPhoto" overlay="none" class="px-(--site-edge) py-14 @2xl:py-20">
    <div data-dress-card class="mx-auto max-w-xl rounded-(--site-radius) p-3 shadow-xl @2xl:p-4" :class="cardStyles.root">
      <div class="flex flex-col rounded-(--site-radius) border-4 border-double border-current/25 px-6 py-12 @2xl:px-12 @2xl:py-14" :class="alignClasses[options.textAlign]">
        <!-- The titles: the eyebrow, heading, flourish and attire -->
        <div data-dress-titles class="flex w-full flex-col" :class="alignClasses[options.textAlign]">
          <p v-if="content.eyebrow" class="text-[0.7rem] font-semibold tracking-[0.25em] uppercase @2xl:text-xs" :class="cardStyles.eyebrow">
            {{ content.eyebrow }}
          </p>
          <h2
            v-if="content.heading"
            class="font-(family-name:--site-font-heading) text-3xl leading-tight text-balance @2xl:text-4xl"
            :class="[cardStyles.brandText, content.eyebrow && 'mt-3']"
          >
            {{ content.heading }}
          </h2>
          <SiteDivider
            v-if="content.eyebrow || content.heading"
            data-dress-ornament
            name="flourish"
            class="mt-5 h-5 w-25"
            :class="cardStyles.accent"
          />
          <p v-if="attire" data-dress-attire class="mt-5 font-(family-name:--site-font-heading) text-xl leading-snug @2xl:text-2xl">
            {{ attire }}
          </p>
        </div>
        <DressCodeDescription :description="content.description" :styles="cardStyles" :align="options.textAlign" class="mt-4 max-w-md" />
        <ul v-if="content.colours.length" data-dress-swatches class="mt-8 flex w-full flex-wrap gap-3" :class="justifyClasses[options.textAlign]">
          <li
            v-for="colour in content.colours"
            :key="colour.id"
            data-dress-colour
            :data-colour-name="colour.name"
            :title="colour.name"
            class="size-5 rounded-full border border-current/15"
            :style="{ backgroundColor: colour.hex }"
          >
            <span class="sr-only">{{ colour.name }}</span>
          </li>
        </ul>
        <p v-if="avoid" data-dress-avoid class="mt-6 text-sm italic" :class="cardStyles.muted">
          {{ avoid }}
        </p>
      </div>
    </div>
  </SectionFrame>
</template>
