<script setup lang="ts">
import { X } from '@lucide/vue'
import { normalizeHex } from '~/site-theme/color'

// A colour as a swatch picker plus an editable hex value. `optional`: it can be left empty (the model is undefined),
// showing `emptyColor` faded in the swatch (what's used instead) and `placeholder` in the field, with a button to clear it.
const props = defineProps<{
  id: string
  label: string
  optional?: boolean
  emptyColor?: string
  placeholder?: string
}>()

const color = defineModel<string | undefined>({ required: true })

// The hex field keeps the user's partial typing; the colour only changes once it is a valid hex (or, when optional,
// once the field is emptied).
const draft = ref(color.value ?? '')
watch(color, (value) => {
  if (normalizeHex(draft.value, '') !== value)
    draft.value = value ?? ''
})

function onDraftInput(value: string | number) {
  draft.value = String(value)
  if (props.optional && !draft.value.trim()) {
    color.value = undefined
    return
  }
  const hex = normalizeHex(draft.value, '')
  if (hex)
    color.value = hex
}

// Restore a valid value when the field is left half-typed.
function onDraftBlur() {
  draft.value = color.value ?? ''
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <Label :for="props.id">{{ props.label }}</Label>
    <div class="flex items-center gap-2">
      <input
        :value="color ?? emptyColor ?? '#FFFFFF'"
        type="color"
        :aria-label="`${props.label} picker`"
        class="size-9 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
        :class="!color && 'border-dashed opacity-50'"
        @input="color = normalizeHex(($event.target as HTMLInputElement).value, color)"
      >
      <Input
        :id="props.id"
        :model-value="draft"
        class="font-mono uppercase placeholder:font-sans placeholder:normal-case"
        maxlength="7"
        spellcheck="false"
        :placeholder="placeholder"
        @update:model-value="onDraftInput"
        @blur="onDraftBlur"
      />
      <Button
        v-if="optional && color"
        type="button"
        variant="ghost"
        size="icon"
        class="shrink-0"
        :aria-label="`Clear ${props.label.toLowerCase()}`"
        data-clear-color
        @click="color = undefined"
      >
        <X />
      </Button>
    </div>
  </div>
</template>
