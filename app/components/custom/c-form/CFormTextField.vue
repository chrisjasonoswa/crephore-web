<script setup lang="ts">
import { Field as VeeField } from 'vee-validate'
import CFormFieldLabel from './CFormFieldLabel.vue'
import CPasswordInput from './CPasswordInput.vue'

// A vee-validate field with label, input and error message.
// `type="password"` renders the show/hide CPasswordInput.
// `#addon-start` / `#addon-end` put text or icons inside the input (shadcn InputGroup, like zao's ZFormTextField),
// e.g. a ".crephore.com" suffix.
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
      <CFormFieldLabel :for-id="name" :label="label">
        <template v-if="$slots['field-info']" #field-info>
          <slot name="field-info" />
        </template>
      </CFormFieldLabel>
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
      <InputGroup v-else-if="$slots['addon-start'] || $slots['addon-end']">
        <InputGroupAddon v-if="$slots['addon-start']">
          <slot name="addon-start" />
        </InputGroupAddon>
        <InputGroupInput
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
        <InputGroupAddon v-if="$slots['addon-end']" align="inline-end">
          <slot name="addon-end" />
        </InputGroupAddon>
      </InputGroup>
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
