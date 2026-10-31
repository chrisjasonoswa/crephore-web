<script setup lang="ts">
import type { Component } from 'vue'
import type { Event } from '~/features/events/event.type'
import { ArrowRight, Blocks, LayoutTemplate } from '@lucide/vue'

export type EventWebsiteStartChoice = 'template' | 'blank'

// The first step of an event's website: start from a template, or from a blank page.
defineProps<{
  event: Event
}>()

const emit = defineEmits<{
  start: [choice: EventWebsiteStartChoice]
}>()

const choices: { value: EventWebsiteStartChoice, title: string, description: string, action: string, icon: Component, recommended?: boolean }[] = [
  {
    value: 'template',
    title: 'Start from a template',
    description: 'Pick a ready-made design for your event. You can still add your own sections, change layouts and reorder everything after.',
    action: 'Browse templates',
    icon: LayoutTemplate,
    recommended: true,
  },
  {
    value: 'blank',
    title: 'Start from scratch',
    description: 'Begin with a blank page and add the sections you want, one at a time.',
    action: 'Choose sections',
    icon: Blocks,
  },
]

const { hostOf } = useSiteAddress()
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <h2 class="text-lg font-semibold">
        Set up your event website
      </h2>
      <p class="text-sm text-muted-foreground">
        Guests will see it at <strong class="font-medium text-foreground">{{ hostOf(event.subdomain) }}</strong>. How would you like to start?
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <button
        v-for="choice in choices"
        :key="choice.value"
        type="button"
        :data-start="choice.value"
        class="group flex flex-col gap-4 rounded-xl border bg-card p-6 text-left text-card-foreground shadow-xs transition-colors hover:border-primary hover:bg-accent/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        @click="emit('start', choice.value)"
      >
        <div class="flex items-start justify-between gap-3">
          <span class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <component :is="choice.icon" class="size-5" />
          </span>
          <Badge v-if="choice.recommended" variant="secondary">
            Recommended
          </Badge>
        </div>
        <div class="flex flex-1 flex-col gap-1.5">
          <span class="font-semibold">{{ choice.title }}</span>
          <span class="text-sm text-muted-foreground">{{ choice.description }}</span>
        </div>
        <span class="flex items-center gap-1 text-sm font-medium text-primary">
          {{ choice.action }}
          <ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </button>
    </div>
  </div>
</template>
