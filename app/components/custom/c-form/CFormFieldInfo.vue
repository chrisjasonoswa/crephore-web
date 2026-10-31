<script setup lang="ts">
import { InfoIcon } from '@lucide/vue'

// An info icon that opens help text in a popover (zao's ZFormFieldInfo).
defineProps<{
  text?: string
}>()
</script>

<template>
  <div v-if="!!$slots.default" class="flex items-center gap-2">
    <span v-if="text">{{ text }}</span>
    <Popover>
      <PopoverTrigger as-child>
        <Button
          type="button"
          variant="link"
          size="icon-sm"
          aria-label="More information"
          class="size-4 cursor-pointer p-0"
        >
          <InfoIcon class="size-3.5 text-muted-foreground hover:text-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-fit max-w-72 border-none bg-secondary p-2 text-secondary-foreground shadow-xl">
        <div class="text-[13px] leading-snug">
          <slot />
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>
