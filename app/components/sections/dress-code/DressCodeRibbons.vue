<script setup lang="ts">
import type { DressCodeAlignedOptions } from '~/features/sections/dress-code/dress-code.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { textOnColour } from '~/features/sections/dress-code/dress-code.helpers'
import DressCodeAvoid from './DressCodeAvoid.vue'
import DressCodeDescription from './DressCodeDescription.vue'
import DressCodeHeading from './DressCodeHeading.vue'

// Layout `ribbons`: satin ribbons in each colour hang from the top edge of the section on one side (`colourSide`):
// tall strips of different lengths side by side, each with a V-notched end, a flat fill and the
// colour's name written up it near the tip. The eyebrow, heading, attire, description and "please avoid" sit on the
// other side, left-aligned and vertically centred. Phones: shorter ribbons across the top, the details below.
const props = defineProps<SectionLayoutProps<'dress-code', DressCodeAlignedOptions<'colourSide'>>>()

// Each ribbon's length in turn (phones, then side by side), so neighbours never end level
const lengths = [
  'h-40 @3xl:h-[26rem]',
  'h-32 @3xl:h-[21rem]',
  'h-44 @3xl:h-[30rem]',
  'h-36 @3xl:h-[23rem]',
]
// The V cut into the ribbon's end
const notch = 'polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 1.25rem), 0 100%)'

const onRight = computed(() => props.options.colourSide === 'right')
// The details sit on the other side, so the photo overlay covers them there (everywhere on phones)
const overlay = computed(() => (props.content.colours.length ? (onRight.value ? 'start' : 'end') : 'full'))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" :overlay="overlay" class="px-(--site-edge)">
    <div
      data-dress-ribbons
      :data-colour-side="options.colourSide"
      class="mx-auto flex flex-col @3xl:grid @3xl:gap-16"
      :class="content.colours.length > 0 && '@3xl:grid-cols-2'"
    >
      <ul
        v-if="content.colours.length"
        data-dress-ribbon-row
        class="flex items-start gap-2 @2xl:gap-3 @3xl:pb-16"
        :class="onRight ? 'justify-end @3xl:order-last' : 'justify-start'"
      >
        <li
          v-for="(colour, index) in content.colours"
          :key="colour.id"
          data-dress-colour
          :data-colour-name="colour.name"
          class="flex w-12 shrink-0 flex-col items-center justify-end pb-8 @2xl:w-14 @3xl:w-16 @3xl:pb-10"
          :class="lengths[index % lengths.length]"
          :style="{ backgroundColor: colour.hex, color: textOnColour(colour.hex), clipPath: notch }"
        >
          <span class="max-h-full overflow-clip text-[0.65rem] font-bold tracking-[0.25em] whitespace-nowrap uppercase [writing-mode:vertical-rl] rotate-180 @2xl:text-xs">
            {{ colour.name }}
          </span>
        </li>
      </ul>

      <div class="flex max-w-xl flex-col gap-6 py-12 @3xl:self-center @3xl:py-20">
        <DressCodeHeading :content="content" :styles="styles" :align="options.textAlign" class="w-full" />
        <DressCodeDescription :description="content.description" :styles="styles" :align="options.textAlign" />
        <DressCodeAvoid :colours="content.avoidColours" :styles="styles" :align="options.textAlign" class="w-full" />
      </div>
    </div>
  </SectionFrame>
</template>
