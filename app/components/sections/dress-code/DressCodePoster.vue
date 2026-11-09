<script setup lang="ts">
import type { DressCodeAlignedOptions } from '~/features/sections/dress-code/dress-code.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { attireOf, textOnColour } from '~/features/sections/dress-code/dress-code.helpers'
import { alignClasses } from '~/features/sections/section.options'
import DressCodeAvoid from './DressCodeAvoid.vue'
import DressCodeDescription from './DressCodeDescription.vue'

// Layout `poster`: bold and left-aligned, on the primary by default: the eyebrow and heading, the attire huge in bold
// capitals of the body font (so a script heading font never has to be set in capitals), the description, then the
// colours as big blocks filled with each colour, its name bottom-left in small spaced capitals (`columns`: 4 or 2 side
// by side from tablets, 2 on phones; five colours make the 4 a row of 5, and a lone last block in two columns spans
// both), and the "please avoid" row.
const props = defineProps<SectionLayoutProps<'dress-code', DressCodeAlignedOptions<'columns'>>>()

const count = computed(() => props.content.colours.length)
const wideColumns = computed(() => (count.value === 5 ? '@3xl:grid-cols-5' : '@3xl:grid-cols-4'))
// The last block of an odd count spans the row where there are two columns (phones, and `columns` 2)
function blockClasses(index: number) {
  const lone = count.value % 2 === 1 && index === count.value - 1
  if (props.options.columns === '2')
    return lone ? 'col-span-2 aspect-[2/1] @3xl:aspect-[4/1]' : 'aspect-square @3xl:aspect-[2/1]'
  return lone ? 'col-span-2 aspect-[2/1] @3xl:col-span-1 @3xl:aspect-[3/4]' : 'aspect-square @3xl:aspect-[3/4]'
}
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-16 @2xl:py-24">
    <div data-dress-poster class="mx-auto flex flex-col gap-10 @3xl:gap-14">
      <div class="flex flex-col gap-6">
        <div v-if="content.eyebrow || content.heading" class="flex flex-col" :class="alignClasses[options.textAlign]">
          <p v-if="content.eyebrow" class="text-[0.7rem] font-semibold tracking-[0.25em] uppercase @2xl:text-xs" :class="styles.eyebrow">
            {{ content.eyebrow }}
          </p>
          <h2
            v-if="content.heading"
            class="font-(family-name:--site-font-heading) text-3xl leading-tight text-balance @2xl:text-4xl"
            :class="[styles.brandText, content.eyebrow && 'mt-3']"
          >
            {{ content.heading }}
          </h2>
        </div>
        <p
          v-if="attireOf(content)"
          data-dress-attire
          class="text-5xl leading-[0.9] font-bold tracking-tight wrap-break-word uppercase text-balance @3xl:text-7xl"
          :class="alignClasses[options.textAlign]"
        >
          {{ attireOf(content) }}
        </p>
        <DressCodeDescription :description="content.description" :styles="styles" :align="options.textAlign" class="max-w-xl" />
      </div>

      <ul
        v-if="content.colours.length"
        data-dress-swatches
        class="grid grid-cols-2 gap-3 @2xl:gap-4"
        :class="options.columns === '2' ? '@3xl:grid-cols-2' : wideColumns"
      >
        <li
          v-for="(colour, index) in content.colours"
          :key="colour.id"
          data-dress-colour
          :data-colour-name="colour.name"
          class="flex items-end rounded-(--site-radius) border border-current/15 p-4 @2xl:p-5"
          :class="blockClasses(index)"
          :style="{ backgroundColor: colour.hex, color: textOnColour(colour.hex) }"
        >
          <span class="text-[0.7rem] font-bold tracking-[0.2em] uppercase @2xl:text-xs">{{ colour.name }}</span>
        </li>
      </ul>

      <DressCodeAvoid :colours="content.avoidColours" :styles="styles" :align="options.textAlign" />
    </div>
  </SectionFrame>
</template>
