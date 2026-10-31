<script setup lang="ts">
import type { Align } from '~/features/sections/section.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { formatOccasionDate, useCountdown } from '~/features/sections/countdown'
import { alignClasses } from '~/features/sections/section.options'
import CountdownButton from './CountdownButton.vue'
import CountdownHeading from './CountdownHeading.vue'
import CountdownTiles from './CountdownTiles.vue'

// Layout `boxes`: eyebrow and title, one tile per unit, then the date. Aligned by `textAlign`.
const props = defineProps<SectionLayoutProps<'countdown'>>()

const { units } = useCountdown(() => props.occasion, () => props.content.showSeconds)
const align = computed(() => props.options.textAlign as Align)
const date = computed(() => formatOccasionDate(props.occasion))
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16 @2xl:px-10 @2xl:py-24" :class="alignClasses[align]">
      <CountdownHeading :content="content" :styles="styles" :align="align" />
      <CountdownTiles :units="units" :styles="styles" />
      <p data-countdown-date class="text-sm @2xl:text-base" :class="styles.muted">
        {{ date }}
      </p>
      <CountdownButton :cta="content.cta" :styles="styles" />
    </div>
  </SectionFrame>
</template>
