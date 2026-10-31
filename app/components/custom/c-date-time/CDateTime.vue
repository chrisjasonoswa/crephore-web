<script setup lang="ts">
import { computed } from 'vue'
import { formatDateTime, formatDateTimeRange, formatTimeZone, isOtherTimeZone } from '~/lib/date'

// An event time (or range with `end`) in the event's timezone, e.g. "Jun 12, 2027, 3:00 PM",
// followed by a muted "(Manila, GMT+8)" only when the viewer is in another timezone.
// Pass `viewerTimeZone: null` on server-rendered pages until mounted (see lib/date.ts).
const props = defineProps<{
  value: string
  end?: string
  timeZone: string
  viewerTimeZone: string | null
}>()

const text = computed(() =>
  props.end ? formatDateTimeRange(props.value, props.end, props.timeZone) : formatDateTime(props.value, props.timeZone),
)
const zone = computed(() =>
  isOtherTimeZone(props.timeZone, props.viewerTimeZone, props.value) ? formatTimeZone(props.timeZone, props.value) : '',
)
</script>

<template>
  <span>{{ text }}<span v-if="text && zone" class="text-[0.9em] text-muted-foreground"> ({{ zone }})</span></span>
</template>
