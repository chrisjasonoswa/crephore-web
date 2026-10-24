<script setup lang="ts">
import { Field as VeeField } from 'vee-validate'
import CPasswordInput from './CPasswordInput.vue'

// A vee-validate field with label, input and error message.
// `type="password"` renders the show/hide CPasswordInput.
const props = withDefaults(defineProps<{
  name: string
  label?: string
  type?: string
  placeholder?: string
  autocomplete?: string
  class?: string
}>(), {
  type: 'text',
})
</script>

<template>
  <!-- Validates on blur, then on every change once the field shows an error -->
  <VeeField v-slot="{ value, errors, handleChange, handleBlur }" :name="name">
    <Field :data-invalid="!!errors.length" :class="props.class">
      <FieldLabel v-if="label" :for="name">
        {{ label }}
      </FieldLabel>
      <CPasswordInput
        v-if="type === 'password'"
        :id="name"
        :model-value="value ?? ''"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :aria-invalid="!!errors.length"
        :aria-describedby="$slots.description ? `${name}-description` : undefined"
        @update:model-value="handleChange($event, !!errors.length)"
        @blur="handleBlur"
      />
      <Input
        v-else
        :id="name"
        :model-value="value ?? ''"
        :type="type"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :aria-invalid="!!errors.length"
        :aria-describedby="$slots.description ? `${name}-description` : undefined"
        @update:model-value="handleChange($event, !!errors.length)"
        @blur="handleBlur"
      />
      <!-- One message at a time, like vee-validate's errorMessage -->
      <FieldError v-if="errors.length" :errors="[errors[0]]" />
      <FieldDescription v-else-if="$slots.description" :id="`${name}-description`">
        <slot name="description" />
      </FieldDescription>
    </Field>
  </VeeField>
</template>
