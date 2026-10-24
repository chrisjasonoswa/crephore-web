<script setup lang="ts">
import type { HeroContent } from '~/features/sections/section.content.type'
import type { BackgroundStyles } from '~/features/sections/section.background'

// The hero's text (label, title, subtitle, date and place, button). Not a layout: every hero
// layout renders it, so they stay consistent.
const props = withDefaults(defineProps<{
  content: HeroContent
  styles: BackgroundStyles
  align?: 'center' | 'start'
  // Smaller title for layouts where the text only gets part of the width
  compact?: boolean
}>(), {
  align: 'center',
  compact: false,
})

const details = computed(() => [props.content.date, props.content.location].filter(Boolean))
</script>

<template>
  <div
    class="flex max-w-3xl flex-col"
    :class="align === 'center' ? 'mx-auto items-center text-center' : 'items-start text-start'"
  >
    <p
      v-if="content.eyebrow"
      class="text-xs font-semibold tracking-[0.25em] uppercase @2xl:text-sm"
      :class="styles.eyebrow"
    >
      {{ content.eyebrow }}
    </p>

    <h1
      class="mt-5 font-(family-name:--site-font-heading) text-5xl leading-[1.05] text-balance"
      :class="compact ? '@2xl:text-6xl' : '@2xl:text-7xl'"
    >
      {{ content.title }}
    </h1>

    <p v-if="content.subtitle" class="mt-6 max-w-xl text-lg text-balance @2xl:text-xl" :class="styles.muted">
      {{ content.subtitle }}
    </p>

    <p
      v-if="details.length"
      class="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-base font-medium @2xl:text-lg"
      :class="align === 'center' ? 'justify-center' : 'justify-start'"
    >
      <template v-for="(detail, i) in details" :key="detail">
        <span v-if="i > 0" aria-hidden="true" :class="styles.muted">·</span>
        <span>{{ detail }}</span>
      </template>
    </p>

    <a
      v-if="content.cta"
      :href="content.cta.href"
      class="mt-10 inline-flex h-12 items-center rounded-(--site-radius) px-8 text-base font-semibold transition-opacity hover:opacity-90"
      :class="styles.button"
    >
      {{ content.cta.label }}
    </a>
  </div>
</template>
