<script setup lang="ts">
import type { DressCodeAlignedOptions } from '~/features/sections/dress-code/dress-code.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { attireOf, joinColourNames } from '~/features/sections/dress-code/dress-code.helpers'
import { backgroundStyles } from '~/features/sections/section.background'
import DressCodeDescription from './DressCodeDescription.vue'
import DressCodeHeading from './DressCodeHeading.vue'

// Layout `tag` ("Hang tag"): a clothing hang tag (light card stock whatever the background, its top corners cut, a
// punched hole with a string running up from it, hanging slightly askew) with "Dress code", the attire, the colours as
// dots with their names ("Sage · Linen · Ochre · Taupe") and what to avoid ("No white or ivory"); beside it the
// eyebrow, heading, attire and description, left-aligned. The tag is on the left or right (`colourSide`, "Tag side");
// on phones it hangs above the text, centred.
const props = defineProps<SectionLayoutProps<'dress-code', DressCodeAlignedOptions<'colourSide'>>>()

const paper = backgroundStyles.light
const attire = computed(() => attireOf(props.content))
const names = computed(() => props.content.colours.map(colour => colour.name.trim()).filter(Boolean).join(' · '))
const avoid = computed(() => joinColourNames(props.content.avoidColours, 'or'))
const onRight = computed(() => props.options.colourSide === 'right')

// Corners cut off the top, and the punched hole (its centre 1.75rem down) showing the section through it
const hole = 'radial-gradient(circle at 50% 1.75rem, transparent 0.4rem, black 0.45rem)'
const tagShape = {
  clipPath: 'polygon(24% 0, 76% 0, 100% 2.75rem, 100% 100%, 0 100%, 0 2.75rem)',
  maskImage: hole,
  WebkitMaskImage: hole,
}
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <div
      data-dress-tag-layout
      class="mx-auto grid items-center justify-items-center gap-10 @3xl:gap-16"
      :class="onRight ? '@3xl:grid-cols-[1fr_auto]' : '@3xl:grid-cols-[auto_1fr]'"
    >
      <!-- The tag on its string, turned a little about the string's top -->
      <div
        data-dress-tag
        class="relative origin-top pt-14"
        :class="onRight ? 'rotate-3 @3xl:order-last' : '-rotate-3'"
      >
        <span aria-hidden="true" class="absolute top-0 left-1/2 z-10 h-[5.25rem] w-px -translate-x-1/2 bg-current/50" />
        <div
          class="relative flex w-60 flex-col items-center gap-3 rounded-b-(--site-radius) px-6 pt-14 pb-8 text-center @2xl:w-64"
          :class="paper.root"
          :style="tagShape"
        >
          <!-- The hole's reinforcing ring -->
          <span aria-hidden="true" class="absolute top-[1.05rem] left-1/2 size-[1.4rem] -translate-x-1/2 rounded-full border-2 border-current/15" />
          <p class="text-[0.65rem] font-semibold tracking-[0.25em] uppercase" :class="paper.eyebrow">
            Dress code
          </p>
          <p v-if="attire" data-dress-attire class="font-(family-name:--site-font-heading) text-2xl leading-tight text-balance" :class="paper.brandText">
            {{ attire }}
          </p>
          <template v-if="content.colours.length">
            <ul aria-hidden="true" data-dress-swatches class="mt-1 flex flex-wrap justify-center gap-2">
              <li
                v-for="colour in content.colours"
                :key="colour.id"
                data-dress-colour
                :data-colour-name="colour.name"
                class="size-5 rounded-full border border-current/15"
                :style="{ backgroundColor: colour.hex }"
              />
            </ul>
            <p v-if="names" data-dress-colour-names class="text-sm">
              {{ names }}
            </p>
          </template>
          <p
            v-if="avoid"
            data-dress-avoid
            class="mt-1 w-full border-t border-dashed border-current/25 pt-3 text-xs first-letter:uppercase"
            :class="paper.muted"
          >
            No {{ avoid }}
          </p>
        </div>
      </div>

      <div class="flex w-full max-w-xl flex-col gap-4 text-start">
        <DressCodeHeading :content="content" :styles="styles" :align="options.textAlign" class="w-full" />
        <DressCodeDescription :description="content.description" :styles="styles" :align="options.textAlign" />
      </div>
    </div>
  </SectionFrame>
</template>
