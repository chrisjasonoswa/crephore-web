<script setup lang="ts">
import CPageHeader from '~/components/custom/c-header/CPageHeader.vue'

defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div class="flex flex-col gap-8">
    <CPageHeader :title="title" :description="description" />
    <div class="min-h-80 rounded-xl border-2 border-dashed" />
  </div>
</template>
