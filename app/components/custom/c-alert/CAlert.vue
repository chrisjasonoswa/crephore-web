<script setup lang="ts">
import type { Component } from 'vue'
import type { CustomToastType } from '~/utils/styles/toast-and-alert'
import { cn } from 'cn'
import { toastAndAlertStyles } from '~/utils/styles/toast-and-alert'

// An alert in one of the shared toast and alert styles (zao's ZAlert): `type` picks the colours and the icon; `icon`
// replaces the icon, or hides it with null.
// `description` is HTML (for line breaks): only ever pass Crephore's own text, never what a host typed. For richer
// content (e.g. a link), use the default slot.
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  type?: CustomToastType
  icon?: Component | null
  title?: string
  description?: string
  size?: 'default' | 'sm'
  class?: string
}>(), {
  class: 'w-fit',
  type: 'info',
  size: 'default',
})

const attrs = useAttrs()

// The type's icon unless one is given (null: none)
const iconComponent = computed(() => (props.icon === undefined ? toastAndAlertStyles[props.type].icon : props.icon))

const containerClass = computed(() => cn(toastAndAlertStyles[props.type].container, props.class, attrs.class as string | undefined))

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <Alert
    v-bind="forwardedAttrs"
    :class="cn(containerClass, { 'text-xs px-2.5 py-1': props.size === 'sm' })"
  >
    <component :is="iconComponent" v-if="iconComponent" />
    <AlertTitle v-if="title">
      {{ title }}
    </AlertTitle>
    <AlertDescription v-if="description" class="text-inherit!">
      <span v-html="description" />
    </AlertDescription>
    <div v-if="$slots.default" class="group-has-[>svg]/alert:col-start-2">
      <slot />
    </div>
  </Alert>
</template>
