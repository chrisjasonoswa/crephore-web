<script setup lang="ts">
import { computed, nextTick, unref, watch } from 'vue'
import type { FormContext, GenericObject } from 'vee-validate'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { applyServerErrors } from '~/lib/form'
import { titleize } from 'inflection'

const props = withDefaults(defineProps<{
  form: FormContext<GenericObject>
  formFieldComponent: any
  isOpen: boolean
  maxWidth?: string
  resourceName: string
  mode: 'add' | 'update' | 'delete' | 'view'
  saveButtonText?: string
  updateButtonText?: string
  deleteButtonText?: string
  onSave?: (values: any) => Promise<void>
  onOpenChange?: (isOpen: boolean) => void
}>(), {
  maxWidth: '960px',
})

const saveButtonLabel = computed(
  () => props.saveButtonText ?? `Save`,
)
const deleteButtonLabel = computed(
  () => props.deleteButtonText ?? `Delete`,
)
const isFormSubmitting = computed(() => props.form.isSubmitting.value)
const isFormInvalid = computed(() => !props.form.meta.value.valid)
const isFormUpdated = computed(() => props.form.meta.value.dirty)

const handleDialogOpenChange = (isOpen: boolean) => {
  props.onOpenChange?.(isOpen)
}

const handleDialogOpenAutoFocus = (event: Event) => {
  event.preventDefault()
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
  }
}

const handleSubmit = props.form.handleSubmit(
  async (values: any) => {
    try {
      await props.onSave?.(values)
    } catch (error: any) {
      applyServerErrors(props.form, error.response?.data?.errors)
    }
  },
  async () => {
    // noop; field errors are already managed by vee-validate
  },
)

watch(
  () => props.isOpen,
  async (newVal) => {
    // Touch all fields when dialog is opened to trigger validation and show errors
    if (newVal) {
      // Wait for fields to mount inside the dialog before forcing validation state.
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      const touchedFields = Object.keys(props.form.values).reduce(
        (acc, field) => {
          acc[field] = true
          return acc
        },
        {} as Record<string, boolean>,
      )

      props.form.setTouched(touchedFields)
      await props.form.validate()
    }
  },
)

</script>

<template>
  <Dialog :open="isOpen" @update:open="handleDialogOpenChange">
    <DialogContent
      class="max-h-[90vh] max-w-full overflow-y-auto"
      :style="{ maxWidth: mode !== 'delete' ? maxWidth : '400px' }"
      @open-auto-focus="handleDialogOpenAutoFocus"
    >
      <DialogHeader>
        <DialogTitle class="text-xl font-semibold">
          <template v-if="mode === 'add'">Add {{ titleize(resourceName) }}</template>
          <template v-else-if="mode === 'update'">Update {{ titleize(resourceName) }}</template>
          <template v-else-if="mode === 'delete'">Delete {{ titleize(resourceName) }}</template>
          <template v-else>View {{ titleize(resourceName) }}</template>
        </DialogTitle>

        <DialogDescription>
          <template v-if="mode === 'add'">Create a new {{ resourceName }}.</template>
          <template v-else-if="mode === 'update'">Update {{ resourceName }} details.</template>
          <template v-else-if="mode === 'delete'">Are you sure you want to delete this {{ resourceName }}?</template>
        </DialogDescription>
      </DialogHeader>

      <form
        v-if="['add', 'update', 'view'].includes(mode)"
        class="space-y-4"
        @submit.prevent="handleSubmit"
        @keydown="handleKeyDown"
      >
        <component :is="formFieldComponent" :form="form" :view-only="mode === 'view'" />

        <DialogFooter v-if="mode !== 'view'">
          <Button
            type="button"
            variant="outline"
            class="cursor-pointer"
            :disabled="isFormSubmitting"
            @click="onOpenChange?.(false)"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            class="cursor-pointer"
            :disabled="isFormSubmitting || isFormInvalid || !isFormUpdated"
          >
            {{ saveButtonLabel }}
          </Button>
        </DialogFooter>
      </form>

      <DialogFooter v-else>
        <Button
          type="button"
          variant="outline"
          class="cursor-pointer"
          :disabled="isFormSubmitting"
          @click="onOpenChange?.(false)"
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="destructive"
          class="cursor-pointer"
          :disabled="isFormSubmitting"
          @click="handleSubmit"
        >
          {{ deleteButtonLabel }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
