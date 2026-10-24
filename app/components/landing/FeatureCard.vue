<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps<{
  icon: Component
  title: string
  description: string
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div :class="cn('flex min-h-80 flex-col rounded-3xl border bg-card p-8 text-card-foreground lg:min-h-96', props.class)">
    <component :is="icon" class="size-6" />
    <h3 class="mt-4 text-xl font-bold tracking-tight">
      {{ title }}
    </h3>
    <p class="mt-4 text-sm leading-relaxed opacity-80">
      {{ description }}
    </p>
  </div>
</template>
