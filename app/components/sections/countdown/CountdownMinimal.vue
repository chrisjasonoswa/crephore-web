<script setup lang="ts">
import type { CountdownLayoutOptions } from '~/features/sections/countdown/countdown.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { useCountdown } from '~/features/sections/countdown/countdown.helpers'
import { alignClasses } from '~/features/sections/section.options'
import CountdownButton from './CountdownButton.vue'
import CountdownDividedNumbers from './CountdownDividedNumbers.vue'
import CountdownHeading from './CountdownHeading.vue'

// Layout `minimal` ("Minimal numbers"): the heading over big serif numbers divided by thin lines; no boxes, no date.
// Aligned by `textAlign`.
const props = defineProps<SectionLayoutProps<'countdown', CountdownLayoutOptions<'textAlign'>>>()

const { units } = useCountdown(() => props.occasion, () => props.content.showSeconds)
const align = computed(() => props.options.textAlign)
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto">
    <div class="px-(--site-edge) mx-auto flex w-full flex-col gap-10 py-16 @2xl:py-28" :class="alignClasses[align]">
      <CountdownHeading :content="content" :occasion="occasion" :styles="styles" :align="align" />
      <CountdownDividedNumbers :units="units" :label-class="styles.muted" :align="align" />
      <CountdownButton :cta="content.cta" :styles="styles" />
    </div>
  </SectionFrame>
</template>
