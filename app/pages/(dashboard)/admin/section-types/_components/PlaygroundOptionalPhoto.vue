<script setup lang="ts">
import { Plus, X } from '@lucide/vue'

// One optional photo URL (e.g. the background photo): an "Add" button until it is set, then a field to edit or remove it.
defineProps<{
  label: string
  hint: string
}>()

const url = defineModel<string | undefined>('url', { required: true })

const id = useId()
</script>

<template>
  <div class="flex flex-col gap-2">
    <Label :for="id">{{ label }}</Label>
    <p class="text-xs text-muted-foreground">
      {{ hint }}
    </p>
    <div v-if="url !== undefined" class="flex items-center gap-2">
      <Input
        :id="id"
        :model-value="url"
        type="url"
        :placeholder="`${label}: https://…`"
        @update:model-value="url = String($event).trim()"
      />
      <Button type="button" variant="ghost" size="icon-sm" :aria-label="`Remove ${label.toLowerCase()}`" @click="url = undefined">
        <X />
      </Button>
    </div>
    <Button v-else type="button" variant="outline" size="sm" class="self-start" @click="url = ''">
      <Plus />
      Add {{ label.toLowerCase() }}
    </Button>
  </div>
</template>
