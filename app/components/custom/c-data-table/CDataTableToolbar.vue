<script setup lang="ts">
import { Plus } from '@lucide/vue'
import { useDebounceFn } from '@vueuse/core'
import { pluralize, titleize } from 'inflection'
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const props = defineProps<{
  resourceName: string
  searchKey: string
  onSearchKeyChange: (value: string) => void
  onAddButtonClicked?: () => void
}>()

const searchKeyValue = ref(props.searchKey)

const debouncedSearchChange = useDebounceFn((value: string) => {
  props.onSearchKeyChange(value)
}, 500)

watch(searchKeyValue, (value) => {
  debouncedSearchChange(value)
})
</script>

<template>
  <div class="@container flex flex-wrap items-center justify-between gap-2 lg:flex-nowrap">
    <div class="flex flex-1 items-center space-x-2">
      <Input
        v-model="searchKeyValue"
        :placeholder="`Search ${pluralize(resourceName.toLowerCase())}...`"
        class="w-50 cursor-text lg:w-75"
      />
    </div>

    <div class="flex items-center space-x-2">
      <Button
        v-if="onAddButtonClicked"
        class="cursor-pointer"
        @click="onAddButtonClicked"
      >
        <Plus class="h-4 w-4 @lg:mr-2" />
        <span class="hidden @lg:block">
          Add {{ titleize(resourceName) }}
        </span>
      </Button>
    </div>
  </div>
</template>
