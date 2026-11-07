<script setup lang="ts">
import type { CustomToastType } from '~/utils/styles/toast-and-alert'
import { toastAndAlertStyles } from '~/utils/styles/toast-and-alert'

// The save bar of the Details and Program tabs, above the form like the website editor's, so it's seen right away:
// red while there are unsaved changes, green once everything is saved. Put it inside the form: Save submits it.
const props = defineProps<{
  isDirty: boolean
  isSubmitting: boolean
}>()

const emit = defineEmits<{
  discard: []
}>()

const alert = computed(() => toastAndAlertStyles[(props.isDirty ? 'error' : 'success') satisfies CustomToastType])
</script>

<template>
  <div data-save-bar class="flex flex-wrap items-center gap-2 rounded-xl border px-4 py-3" :class="alert.container">
    <p data-save-status class="mr-auto flex items-center gap-2 text-sm font-medium" role="status">
      <component :is="alert.icon" class="size-4 shrink-0" aria-hidden="true" />
      {{ isDirty ? 'You have unsaved changes.' : 'All changes saved.' }}
    </p>
    <Button type="button" variant="outline" size="sm" :disabled="!isDirty || isSubmitting" @click="emit('discard')">
      Discard changes
    </Button>
    <Button type="submit" size="sm" :disabled="!isDirty || isSubmitting">
      {{ isSubmitting ? 'Saving…' : 'Save changes' }}
    </Button>
  </div>
</template>
