<script setup lang="ts">
import type { EventFormValues } from '../../_components/event.form.schema'
import type { Event } from '~/features/events/event.type'
import { toTypedSchema } from '@vee-validate/zod'
import { useEventListener } from '@vueuse/core'
import { useForm } from 'vee-validate'
import CConfirmationModal from '~/components/custom/c-modal/CConfirmationModal.vue'
import { updateEvent } from '~/features/events/event.api'
import { getApiErrors } from '~/lib/axios'
import { cToast } from '~/lib/cToast'
import { applyServerErrors } from '~/lib/form'
import EventFormFields from '../../_components/EventFormFields.vue'
import EventSaveBar from './EventSaveBar.vue'
import { eventFormSchema, mapEventToFormValues, mapFormValuesToUpdateEventRequest } from '../../_components/event.form.schema'

// The Details tab: the event's fields, saved with PUT /events/{id}
const props = defineProps<{
  event: Event
}>()

const emit = defineEmits<{
  saved: [event: Event]
}>()

const canEdit = computed(() => props.event.access.includes('Owner'))

const form = useForm<EventFormValues>({
  validationSchema: toTypedSchema(eventFormSchema),
  initialValues: mapEventToFormValues(props.event),
})

const isDirty = computed(() => form.meta.value.dirty)
const isSubmitting = computed(() => form.isSubmitting.value)

const onSubmit = form.handleSubmit(async (values) => {
  try {
    const response = await updateEvent(props.event.id, mapFormValuesToUpdateEventRequest(values))
    // The saved event is the new starting point, so there is nothing left to save
    form.resetForm({ values: mapEventToFormValues(response.data) })
    emit('saved', response.data)
    cToast({ title: 'Event updated.', type: 'success' })
  }
  catch (error) {
    applyServerErrors(form, getApiErrors(error))
  }
})

const discardChanges = () => form.resetForm()

/* Unsaved changes: ask before leaving the page (switching tabs keeps them) */
const isLeaveConfirmOpen = ref(false)
let resolveLeave: ((leave: boolean) => void) | null = null

function settleLeave(leave: boolean) {
  resolveLeave?.(leave)
  resolveLeave = null
}

onBeforeRouteLeave(() => {
  if (!isDirty.value || isSubmitting.value)
    return true
  isLeaveConfirmOpen.value = true
  return new Promise<boolean>(resolve => (resolveLeave = resolve))
})

// Closed without confirming (Cancel, Escape, outside click): stay
watch(isLeaveConfirmOpen, (open) => {
  if (!open)
    settleLeave(false)
})

// Closing or reloading the browser tab
useEventListener(window, 'beforeunload', (event: BeforeUnloadEvent) => {
  if (isDirty.value)
    event.preventDefault()
})
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
    <EventSaveBar v-if="canEdit" :is-dirty="isDirty" :is-submitting="isSubmitting" @discard="discardChanges" />

    <div class="rounded-xl border bg-card p-4 sm:p-6">
      <EventFormFields :form="form" :view-only="!canEdit" />
    </div>

    <CConfirmationModal
      v-model:is-open="isLeaveConfirmOpen"
      title="Leave without saving?"
      confirm-button-text="Leave"
      cancel-button-text="Stay"
      variant="destructive"
      :on-confirm="() => settleLeave(true)"
    >
      Your changes to this event's details haven't been saved.
    </CConfirmationModal>
  </form>
</template>
