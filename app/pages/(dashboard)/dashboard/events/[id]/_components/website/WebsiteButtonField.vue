<script setup lang="ts">
import type { SectionCta } from '~/features/sections/section.content.type'

// A section's optional button: a switch, and its text when on. Turning it on uses `defaultCta` (its link too).
const props = defineProps<{
  defaultCta: SectionCta
}>()

const cta = defineModel<SectionCta | undefined>('cta', { required: true })

const id = useId()

function setShown(shown: boolean) {
  cta.value = shown ? { ...props.defaultCta } : undefined
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between gap-3">
      <Label :for="`${id}-shown`">Button</Label>
      <Switch :id="`${id}-shown`" :model-value="Boolean(cta)" @update:model-value="setShown" />
    </div>
    <Input
      v-if="cta"
      :model-value="cta.label"
      aria-label="Button text"
      placeholder="Button text"
      maxlength="40"
      @update:model-value="cta = { ...cta!, label: String($event) }"
    />
  </div>
</template>
