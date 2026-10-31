<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button, type ButtonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ConfirmationVariant = 'default' | 'destructive' | 'warning'

const isOpen = defineModel<boolean>('isOpen')

const props = withDefaults(defineProps<{
  title?: string
  confirmButtonText?: string
  cancelButtonText?: string
  variant?: ConfirmationVariant
  onConfirm: () => void | Promise<any>
  onCancel?: () => void | Promise<any>
}>(), {
  confirmButtonText: 'Confirm',
  cancelButtonText: 'Cancel',
  variant: 'default',
})


const isConfirming = ref(false)

const confirmButtonVariant = computed<ButtonVariants['variant']>(() => (
  props.variant === 'destructive' ? 'destructive' : 'default'
))

const confirmButtonClass = computed(() => (
  props.variant === 'warning'
    ? 'cursor-pointer bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500/20'
    : 'cursor-pointer'
))

const setOpen = (value: boolean) => {
  isOpen.value = value
}

const handleConfirm = async () => {
  isConfirming.value = true
  try {
    await props.onConfirm()
    setOpen(false)
  } finally {
    isConfirming.value = false
  }
}

const handleCancel = async () => {
  await props.onCancel?.()
  setOpen(false)
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle v-if="title">{{ title }}</DialogTitle>
        <DialogDescription as-child>
          <div>
            <slot />
          </div>
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          class="cursor-pointer"
          :disabled="isConfirming"
          @click="handleCancel"
        >
          {{ cancelButtonText }}
        </Button>

        <Button
          type="button"
          :variant="confirmButtonVariant"
          :class="confirmButtonClass"
          :disabled="isConfirming"
          @click="handleConfirm"
        >
          {{ confirmButtonText }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
