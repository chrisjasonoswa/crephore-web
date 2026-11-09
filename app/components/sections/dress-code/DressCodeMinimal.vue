<script setup lang="ts">
import type { DressCodeAlignedOptions } from '~/features/sections/dress-code/dress-code.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { joinColourNames } from '~/features/sections/dress-code/dress-code.helpers'
import { alignClasses } from '~/features/sections/section.options'
import DressCodeDescription from './DressCodeDescription.vue'
import DressCodeHeading from './DressCodeHeading.vue'

// Layout `minimal`: text, no swatches: the eyebrow, heading and attire, the description, then the colours written out,
// each after a small dot of it ("Colours ● Sage, ● Linen, …"), and, softer, what to avoid ("Please avoid white and
// ivory"). The
// title and text together left, centred or right (`textAlign`).
const props = defineProps<SectionLayoutProps<'dress-code', DressCodeAlignedOptions>>()

const colours = computed(() => props.content.colours.filter(colour => colour.name.trim()))
const avoid = computed(() => joinColourNames(props.content.avoidColours, 'and'))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <div data-dress-minimal class="mx-auto flex max-w-2xl flex-col gap-6" :class="alignClasses[options.textAlign]">
      <DressCodeHeading :content="content" :styles="styles" :align="options.textAlign" class="w-full" />
      <DressCodeDescription :description="content.description" :styles="styles" :align="options.textAlign" />
      <div v-if="colours.length || avoid" class="flex flex-col gap-2">
        <p v-if="colours.length" data-dress-colours class="text-sm @2xl:text-base">
          <span class="text-[0.7rem] font-semibold tracking-[0.25em] uppercase @2xl:text-xs" :class="styles.eyebrow">Colours</span>{{ ' ' }}
          <!-- Each name after a small dot of its colour, so guests see which colour it is -->
          <template v-for="(colour, index) in colours" :key="colour.id">
            <span data-dress-colour :data-colour-name="colour.name" class="ms-1 whitespace-nowrap">
              <span aria-hidden="true" data-dress-dot class="me-1.5 inline-block size-2.5 rounded-full border border-current/15 align-middle" :style="{ backgroundColor: colour.hex }" />{{ colour.name }}
            </span>
            <span v-if="index < colours.length - 1" :class="styles.muted">{{ ', ' }}</span>
          </template>
        </p>
        <p v-if="avoid" data-dress-avoid class="text-sm" :class="styles.muted">
          Please avoid {{ avoid }}
        </p>
      </div>
    </div>
  </SectionFrame>
</template>
