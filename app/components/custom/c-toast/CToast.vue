<script setup lang="ts">
import type { ToasterProps } from 'vue-sonner'
import Toaster from '~/components/ui/sonner/Sonner.vue'

const props = defineProps<ToasterProps>()
</script>

<template>
  <Toaster v-bind="props" />
</template>
