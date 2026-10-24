<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'

const colorMode = useColorMode()

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <Button variant="outline" size="icon" aria-label="Toggle colour theme" @click="toggleColorMode">
    <Sun class="dark:hidden" />
    <Moon class="hidden dark:block" />
  </Button>
</template>
