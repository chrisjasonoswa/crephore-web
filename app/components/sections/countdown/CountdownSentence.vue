<script setup lang="ts">
import type { Align } from '~/features/sections/section.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { useCountdown } from '~/features/sections/countdown'
import { alignClasses } from '~/features/sections/section.options'
import CountdownButton from './CountdownButton.vue'

// Layout `sentence`: the countdown written as a line of text, like an invitation ("112 days, 6 hours and
// 45 minutes"), the title under it in italics ("until we say I do."). Aligned by `textAlign`.
const props = defineProps<SectionLayoutProps<'countdown'>>()

const { units } = useCountdown(() => props.occasion, () => props.content.showSeconds)
const align = computed(() => props.options.textAlign as Align)

// "112 days", "1 hour"; numbers as they are (no leading zero) in a sentence
const parts = computed(() => units.value.map(unit => ({
  key: unit.key,
  number: unit.value === null ? '--' : String(unit.value),
  word: (unit.value === 1 ? unit.singular : unit.label).toLowerCase(),
})))

// Commas between the parts, "and" before the last
const joiner = (index: number) => (index === 0 ? '' : index === parts.value.length - 1 ? ' and ' : ', ')
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto">
    <div class="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-16 @2xl:px-10 @2xl:py-28" :class="alignClasses[align]">
      <p
        v-if="content.eyebrow"
        class="text-[0.7rem] font-semibold tracking-[0.25em] uppercase @2xl:text-xs"
        :class="styles.eyebrow"
      >
        {{ content.eyebrow }}
      </p>

      <p role="timer" class="font-(family-name:--site-font-heading) text-2xl leading-snug text-balance @2xl:text-4xl">
        <template v-for="(part, index) in parts" :key="part.key">{{ joiner(index) }}<span :data-unit="part.key" class="whitespace-nowrap"><span class="text-5xl tabular-nums @2xl:text-7xl">{{ part.number }}</span>{{ ` ${part.word}` }}</span></template>
      </p>

      <h2
        v-if="content.title"
        class="font-(family-name:--site-font-heading) text-2xl italic text-balance @2xl:text-4xl"
        :class="styles.eyebrow"
      >
        {{ content.title }}
      </h2>

      <CountdownButton :cta="content.cta" :styles="styles" class="mt-2" />
    </div>
  </SectionFrame>
</template>
