<script setup lang="ts">
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { attireOf } from '~/features/sections/dress-code/dress-code.helpers'

// Layout `strip` (compact): a one-line reminder straight on the section (no box around it): the heading as a label and
// the attire in spaced capitals ("Dress code · Garden formal"), then the colours as overlapping circles. No heading of
// its own, so it sits between sections or under the hero. Always centred; stacked on phones.
const props = defineProps<SectionLayoutProps<'dress-code'>>()

const label = computed(() => [props.content.heading, attireOf(props.content)].filter(Boolean).join(' · '))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto" class="px-(--site-edge) py-8 @2xl:py-10">
    <div
      data-dress-strip
      class="mx-auto flex flex-col items-center justify-center gap-4 text-center @2xl:flex-row @2xl:gap-8"
    >
      <p v-if="label" data-dress-attire class="text-xs font-semibold tracking-[0.25em] uppercase @2xl:text-sm" :class="styles.eyebrow">
        {{ label }}
      </p>
      <ul v-if="content.colours.length" data-dress-swatches class="flex -space-x-2" :aria-label="`Colours: ${content.colours.map(colour => colour.name).join(', ')}`">
        <li
          v-for="colour in content.colours"
          :key="colour.id"
          data-dress-colour
          :data-colour-name="colour.name"
          :title="colour.name"
          class="size-8 rounded-full border-2 border-(--site-bg) @2xl:size-10"
          :style="{ backgroundColor: colour.hex }"
        />
      </ul>
    </div>
  </SectionFrame>
</template>
