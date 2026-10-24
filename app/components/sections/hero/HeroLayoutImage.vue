<script setup lang="ts">
// The hero's layout image (not a layout): the optional photo placed inside the layout,
// beside, above or below the text. Layouts pass the sizing classes.
defineProps<{ src: string }>()
</script>

<template>
  <img :src="src" alt="" class="aspect-4/3 w-full rounded-(--site-radius) object-cover">
</template>
