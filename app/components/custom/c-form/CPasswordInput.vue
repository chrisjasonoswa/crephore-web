<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue'

// Attributes (id, autocomplete, required, minlength…) go to the <input>.
defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ default: '' })
const visible = ref(false)
</script>

<template>
  <InputGroup>
    <InputGroupInput v-model="model" :type="visible ? 'text' : 'password'" v-bind="$attrs" />
    <InputGroupAddon align="inline-end">
      <InputGroupButton
        size="icon-xs"
        :aria-label="visible ? 'Hide password' : 'Show password'"
        :aria-pressed="visible"
        @click="visible = !visible"
      >
        <EyeOff v-if="visible" />
        <Eye v-else />
      </InputGroupButton>
    </InputGroupAddon>
  </InputGroup>
</template>
