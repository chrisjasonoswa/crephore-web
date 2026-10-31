<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'
import type { HeroContent } from '~/features/sections/section.content.type'
import { safeHref } from '~/features/sections/section.links'

// The hero's text (eyebrow, title, date · venue, RSVP button). Not a layout: every hero layout renders it,
// so they stay consistent. Slots let a layout put its photos in the flow (`#before-title`, `#after-title`,
// `#before-cta`).
const props = withDefaults(defineProps<{
  content: HeroContent
  styles: BackgroundStyles
  align?: 'start' | 'center' | 'end'
  // Title size: display for full-width layouts, large for half-width, medium for cards and narrow columns
  size?: 'display' | 'large' | 'medium'
  // The eyebrow under the title instead of above it ("Bea & Carlo / are getting married")
  eyebrowBelow?: boolean
  // Details and button on one row from 768px (editorial)
  inlineCta?: boolean
  // The button first, then the date and venue as labelled columns ("Date", "Location"), stacked on phones
  // under a thin line (offset-frame)
  labelledDetails?: boolean
  // Extra classes for the title, e.g. a brand text colour on the light background
  titleClass?: string
}>(), {
  align: 'center',
  size: 'large',
})

const details = computed(() => [props.content.date, props.content.venue].filter(Boolean))
const labelled = computed(() => [
  { label: 'Date', value: props.content.date },
  { label: 'Location', value: props.content.venue },
].filter(detail => detail.value))

const alignClasses = {
  start: 'items-start text-start',
  center: 'items-center text-center',
  end: 'items-end text-end',
}
const justifyClasses = { start: 'justify-start', center: 'justify-center', end: 'justify-end' }
const titleSizes = {
  display: 'text-5xl @2xl:text-7xl @4xl:text-8xl',
  large: 'text-4xl @2xl:text-6xl',
  medium: 'text-3xl @2xl:text-5xl',
}
</script>

<template>
  <div class="flex flex-col" :class="alignClasses[align]">
    <slot name="before-title" />

    <p
      v-if="content.eyebrow && !eyebrowBelow"
      class="text-[0.7rem] font-semibold tracking-[0.25em] uppercase @2xl:text-xs"
      :class="styles.eyebrow"
    >
      {{ content.eyebrow }}
    </p>

    <h1
      class="font-(family-name:--site-font-heading) leading-[1.05] text-balance"
      :class="[titleSizes[size], content.eyebrow && !eyebrowBelow && 'mt-4', titleClass]"
    >
      {{ content.title }}
    </h1>

    <p v-if="content.eyebrow && eyebrowBelow" class="mt-3 text-sm @2xl:text-base" :class="styles.muted">
      {{ content.eyebrow }}
    </p>

    <slot name="after-title" />

    <template v-if="labelledDetails">
      <slot name="before-cta" />

      <a
        v-if="content.cta"
        :href="safeHref(content.cta.href)"
        class="mt-8 inline-flex h-11 shrink-0 items-center rounded-(--site-radius) px-7 text-xs font-semibold tracking-[0.15em] uppercase transition-opacity hover:opacity-90"
        :class="styles.button"
      >
        {{ content.cta.label }}
      </a>

      <dl
        v-if="labelled.length"
        data-hero-details
        class="mt-10 flex w-full flex-col gap-4 border-t border-current/15 pt-6 @2xl:flex-row @2xl:gap-16 @3xl:mt-16 @3xl:border-0 @3xl:pt-0"
        :class="justifyClasses[align]"
      >
        <div v-for="detail in labelled" :key="detail.label" class="flex flex-col gap-1">
          <dt class="font-(family-name:--site-font-heading) text-base @2xl:text-lg">
            {{ detail.label }}
          </dt>
          <dd class="text-sm" :class="styles.muted">
            {{ detail.value }}
          </dd>
        </div>
      </dl>
    </template>

    <div
      v-else-if="details.length || content.cta"
      class="flex w-full flex-col gap-6"
      :class="[inlineCta ? '@3xl:flex-row @3xl:items-center @3xl:justify-between' : alignClasses[align], details.length ? 'mt-5' : 'mt-2']"
    >
      <p
        v-if="details.length"
        class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm @2xl:text-base"
        :class="inlineCta ? justifyClasses.start : justifyClasses[align]"
      >
        <template v-for="(detail, i) in details" :key="detail">
          <span v-if="i > 0" aria-hidden="true" :class="styles.muted">·</span>
          <span>{{ detail }}</span>
        </template>
      </p>

      <slot name="before-cta" />

      <a
        v-if="content.cta"
        :href="safeHref(content.cta.href)"
        class="inline-flex h-11 shrink-0 items-center self-auto rounded-(--site-radius) px-7 text-xs font-semibold tracking-[0.15em] uppercase transition-opacity hover:opacity-90"
        :class="styles.button"
      >
        {{ content.cta.label }}
      </a>
    </div>
  </div>
</template>
