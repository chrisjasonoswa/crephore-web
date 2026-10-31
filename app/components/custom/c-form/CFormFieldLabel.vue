<script setup lang="ts">
import CFormFieldInfo from './CFormFieldInfo.vue'

// A field label with optional help text behind an info icon (zao's ZFormFieldLabel).
defineProps<{
  forId?: string
  label?: string
}>()
</script>

<template>
  <div v-if="label" class="flex items-center gap-1.5">
    <FieldLabel :for="forId">
      {{ label }}
    </FieldLabel>
    <CFormFieldInfo v-if="$slots['field-info']">
      <slot name="field-info" />
    </CFormFieldInfo>
  </div>
</template>
