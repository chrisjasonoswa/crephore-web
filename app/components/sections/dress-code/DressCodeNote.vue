<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { attireOf, avoidSentence } from '~/features/sections/dress-code/dress-code.helpers'

// Layout `note` (compact): two quiet centred lines: the heading as a small label, the attire with its colours named
// inline, each after a dot of its colour ("Garden formal in ● sage, ● linen, ● ochre or ● taupe"; without an attire
// "Wear ● sage, …"), then what to avoid ("Kindly avoid white and ivory.", when there are colours to avoid).
const props = defineProps<SectionLayoutProps<'dress-code'>>()

const attire = computed(() => attireOf(props.content))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-10 @2xl:py-14">
    <div data-dress-note class="mx-auto flex max-w-3xl flex-col items-center gap-2 text-center">
      <p v-if="content.heading" class="text-[0.7rem] font-semibold tracking-[0.25em] uppercase @2xl:text-xs" :class="styles.eyebrow">
        {{ content.heading }}
      </p>
      <!-- A row, everything centred on the line's middle: the smaller colour names sit level with the middle of the motif,
           not on its baseline (where they'd look dropped beside a tall heading font). Spaces stay in the text for screen
           readers; the gaps space the words. -->
      <p v-if="attire || content.colours.length" data-dress-line class="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
        <span v-if="attire" data-dress-attire class="font-(family-name:--site-font-heading) text-2xl leading-tight @2xl:text-3xl" :class="styles.brandText">{{ attire }}{{ ' ' }}</span>
        <template v-if="content.colours.length">
          <span class="text-lg">{{ attire ? 'in ' : 'Wear ' }}</span>
          <template v-for="(colour, index) in content.colours" :key="colour.id">
            <span data-dress-colour :data-colour-name="colour.name" class="inline-flex items-center gap-1.5 text-lg">
              <span aria-hidden="true" class="size-3 shrink-0 rounded-full border border-current/15" :style="{ backgroundColor: colour.hex }" />{{ colour.name.toLowerCase() }}{{ index < content.colours.length - 2 ? ',' : '' }}{{ ' ' }}
            </span>
            <span v-if="index === content.colours.length - 2" class="text-lg">{{ 'or ' }}</span>
          </template>
        </template>
      </p>
      <p v-if="avoidSentence(content.avoidColours)" data-dress-avoid class="text-sm" :class="styles.muted">
        {{ avoidSentence(content.avoidColours) }}
      </p>
    </div>
  </SectionFrame>
</template>
