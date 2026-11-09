<script setup lang="ts">
import type { DressCodeAlignedOptions } from '~/features/sections/dress-code/dress-code.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { attireOf } from '~/features/sections/dress-code/dress-code.helpers'
import { alignClasses, justifyClasses } from '~/features/sections/section.options'
import DressCodeAvoid from './DressCodeAvoid.vue'
import DressCodeDescription from './DressCodeDescription.vue'

// Layout `editorial`: like a magazine page: a small spaced label ("What to wear · Dress code", the heading being the
// h2), the attire set huge in the heading font, a thin rule, then the description beside the colours as a numbered
// list ("01 ● Sage", each row over a thin rule) with "please avoid" under it. Stacked on phones. The label, attire,
// description and "please avoid" sit left, centred or right together (`textAlign`); the list stays a list.
const props = defineProps<SectionLayoutProps<'dress-code', DressCodeAlignedOptions>>()

const attire = computed(() => attireOf(props.content))
const hasDescription = computed(() => !!props.content.description?.trim())
const hasList = computed(() => props.content.colours.length > 0 || props.content.avoidColours.length > 0)
const number = (index: number) => String(index + 1).padStart(2, '0')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-14 @2xl:py-20">
    <div data-dress-editorial class="mx-auto flex flex-col gap-8 @3xl:gap-10">
      <div data-dress-masthead class="flex flex-col gap-4 @2xl:gap-6" :class="alignClasses[options.textAlign]">
        <div
          v-if="content.eyebrow || content.heading"
          class="flex flex-wrap items-baseline gap-x-1 text-[0.7rem] font-medium tracking-[0.25em] uppercase @2xl:text-xs"
          :class="[styles.eyebrow, justifyClasses[options.textAlign]]"
        >
          <p v-if="content.eyebrow">
            {{ content.eyebrow }}
          </p>
          <span v-if="content.eyebrow && content.heading">{{ ' · ' }}</span>
          <h2 v-if="content.heading">
            {{ content.heading }}
          </h2>
        </div>
        <p
          v-if="attire"
          data-dress-attire
          class="font-(family-name:--site-font-heading) text-6xl leading-[0.95] text-balance break-words hyphens-auto @3xl:text-8xl"
          :class="styles.brandText"
        >
          {{ attire }}
        </p>
      </div>

      <template v-if="hasDescription || hasList">
        <div aria-hidden="true" class="h-px bg-current/20" />

        <div class="grid gap-10 @3xl:gap-16" :class="hasDescription && hasList && '@3xl:grid-cols-2'">
          <DressCodeDescription
            v-if="hasDescription"
            :description="content.description"
            :styles="styles"
            :align="options.textAlign"
            class="w-full @2xl:text-lg"
          />

          <div v-if="hasList" class="flex flex-col gap-6">
            <ol v-if="content.colours.length" data-dress-colours class="border-t border-current/15">
              <li
                v-for="(colour, index) in content.colours"
                :key="colour.id"
                data-dress-colour
                :data-colour-name="colour.name"
                class="flex items-center gap-4 border-b border-current/15 py-3 @2xl:py-4"
              >
                <span data-dress-number class="w-6 shrink-0 text-xs tracking-wider tabular-nums" :class="styles.eyebrow">{{ number(index) }}</span>
                <span aria-hidden="true" class="size-4 shrink-0 rounded-full border border-current/15 @2xl:size-5" :style="{ backgroundColor: colour.hex }" />
                <span class="font-(family-name:--site-font-heading) text-xl @2xl:text-2xl">{{ colour.name }}</span>
              </li>
            </ol>
            <DressCodeAvoid :colours="content.avoidColours" :styles="styles" :align="options.textAlign" />
          </div>
        </div>
      </template>
    </div>
  </SectionFrame>
</template>
