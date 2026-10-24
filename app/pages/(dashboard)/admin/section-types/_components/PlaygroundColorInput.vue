<script setup lang="ts">
import { normalizeHex } from '~/site-theme/color'

// A colour as a swatch picker plus an editable hex value.
const props = defineProps<{
  id: string
  label: string
}>()

const color = defineModel<string>({ required: true })

// The hex field keeps the user's partial typing; the colour only changes once it is a valid hex.
const draft = ref(color.value)
watch(color, (value) => {
  if (normalizeHex(draft.value, '') !== value)
    draft.value = value
})

function onDraftInput(value: string | number) {
  draft.value = String(value)
  const hex = normalizeHex(draft.value, '')
  if (hex)
    color.value = hex
}

// Restore a valid value when the field is left half-typed.
function onDraftBlur() {
  draft.value = color.value
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <Label :for="props.id">{{ props.label }}</Label>
    <div class="flex items-center gap-2">
      <input
        :value="color"
        type="color"
        :aria-label="`${props.label} picker`"
        class="size-9 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
        @input="color = normalizeHex(($event.target as HTMLInputElement).value, color)"
      >
      <Input
        :id="props.id"
        :model-value="draft"
        class="font-mono uppercase"
        maxlength="7"
        spellcheck="false"
        @update:model-value="onDraftInput"
        @blur="onDraftBlur"
      />
    </div>
  </div>
</template>
