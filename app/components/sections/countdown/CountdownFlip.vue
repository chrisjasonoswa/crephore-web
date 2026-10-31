<script setup lang="ts">
import type { Align } from '~/features/sections/section.options'
import type { SectionLayoutProps } from '~/features/sections/section.type'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { formatOccasionDate, useCountdown } from '~/features/sections/countdown'
import { alignClasses } from '~/features/sections/section.options'
import CountdownButton from './CountdownButton.vue'

// Layout `flip` ("Flip clock"): split-flap cards like an airport board, flipping on each tick (not with reduced
// motion). The eyebrow above; the title and date below. The cards use the background's button colours, so they
// stand out on any background. Aligned by `textAlign`.
const props = defineProps<SectionLayoutProps<'countdown'>>()

const { units } = useCountdown(() => props.occasion, () => props.content.showSeconds)
const align = computed(() => props.options.textAlign as Align)
const date = computed(() => formatOccasionDate(props.occasion))

const phoneColumns = computed(() => (units.value.length === 4 ? 'grid-cols-2' : 'grid-cols-3'))
const justify = { start: 'justify-start', center: 'justify-center', end: 'justify-end' }
const justifyWide = { start: '@2xl:justify-start', center: '@2xl:justify-center', end: '@2xl:justify-end' }
</script>

<template>
  <SectionFrame v-slot="{ styles }" :background="background" :image-url="content.backgroundPhoto">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16 @2xl:px-10 @2xl:py-24" :class="alignClasses[align]">
      <p
        v-if="content.eyebrow"
        class="text-[0.7rem] font-semibold tracking-[0.25em] uppercase @2xl:text-xs"
        :class="styles.eyebrow"
      >
        {{ content.eyebrow }}
      </p>

      <div role="timer" class="grid gap-x-3 gap-y-5 @2xl:flex @2xl:gap-4" :class="[phoneColumns, justifyWide[align]]">
        <div v-for="unit in units" :key="unit.key" :data-unit="unit.key" class="flex flex-col items-center">
          <div
            data-flip-card
            class="relative flex h-20 w-24 items-center justify-center overflow-hidden rounded-(--site-radius) shadow-sm [perspective:400px] @2xl:h-28 @2xl:w-32"
            :class="styles.button"
          >
            <Transition name="countdown-flip" mode="out-in">
              <span :key="unit.text" class="block font-(family-name:--site-font-heading) text-4xl leading-none tabular-nums @2xl:text-6xl">
                {{ unit.text }}
              </span>
            </Transition>
            <!-- The split between the two flaps -->
            <span aria-hidden="true" class="absolute inset-x-0 top-1/2 h-px bg-current/20" />
          </div>
          <span class="mt-2 text-[0.6rem] font-medium tracking-[0.2em] uppercase @2xl:text-[0.65rem]" :class="styles.muted">
            {{ unit.label }}
          </span>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm @2xl:text-base" :class="justify[align]">
        <h2 v-if="content.title" class="font-medium">
          {{ content.title }}
        </h2>
        <span v-if="content.title" aria-hidden="true" :class="styles.muted">·</span>
        <span data-countdown-date :class="styles.muted">{{ date }}</span>
      </div>

      <CountdownButton :cta="content.cta" :styles="styles" />
    </div>
  </SectionFrame>
</template>

<style scoped>
/* The new number flips down into place */
.countdown-flip-enter-active {
  animation: countdown-flip 0.35s ease-out;
  transform-origin: 50% 50%;
}

@keyframes countdown-flip {
  from {
    transform: rotateX(-90deg);
    opacity: 0.4;
  }
  to {
    transform: rotateX(0);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .countdown-flip-enter-active {
    animation: none;
  }
}
</style>
