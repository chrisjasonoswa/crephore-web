<script setup lang="ts">
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { pluralize } from 'inflection'


const props = withDefaults(defineProps<{
  table: any
  totalCount?: number
  resourceName?: string
}>(), {
  totalCount: 0,
  resourceName: 'items',
})


const pageCount = computed(() => props.table.getPageCount())
const maxPage = computed(() => Math.max(pageCount.value, 1))
const currentPage = computed(() => props.table.getState().pagination.pageIndex + 1)

const pageInput = ref(String(currentPage.value))

watch(currentPage, (nextValue) => {
  pageInput.value = String(nextValue)
})

const goToPage = (page: number) => {
  if (pageCount.value < 1) return

  const nextPage = Math.min(Math.max(page, 1), pageCount.value)
  props.table.setPageIndex(nextPage - 1)
}

const setPageSize = (size: number) => {
  props.table.setPageSize(size)
}

const pageSizeOptions = [5, 10, 20, 30, 40, 50, 100]

const pageSizeValue = computed({
  get: () => String(props.table.getState().pagination.pageSize),
  set: (value: string) => setPageSize(Number(value)),
})
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-1 px-2">
    <div class="flex-1 text-sm text-muted-foreground">
      Total {{ pluralize(resourceName) }}: {{ totalCount }}
    </div>

    <div class="flex flex-wrap items-center gap-1 space-x-6 lg:space-x-8">
      <div class="flex items-center space-x-2">
        <p class="text-sm font-medium">Rows per page</p>

        <Select v-model="pageSizeValue">
          <SelectTrigger class="h-8 w-18 cursor-pointer">
            <SelectValue :placeholder="String(table.getState().pagination.pageSize)" />
          </SelectTrigger>
          <SelectContent side="top" align="end">
            <SelectItem
              v-for="pageSize in pageSizeOptions"
              :key="pageSize"
              :value="String(pageSize)"
              class="cursor-pointer"
            >
              {{ pageSize }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center space-x-2">
        <div class="flex items-center gap-2 text-sm font-medium">
          <span>Page</span>
          <Input
            v-model="pageInput"
            type="number"
            min="1"
            :max="maxPage"
            class="h-8 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            :style="{ width: `${Math.max(String(pageInput || currentPage).length + 2.4, 4)}ch` }"
            :disabled="pageCount < 1"
            @blur="() => {
              if (!pageInput) {
                pageInput = String(currentPage)
                return
              }

              goToPage(Number(pageInput))
            }"
            @keydown="(event: KeyboardEvent) => {
              if (event.key !== 'Enter') return
              event.preventDefault()

              if (!pageInput) {
                pageInput = String(currentPage)
                return
              }

              goToPage(Number(pageInput))
            }"
          />
          <div class="whitespace-nowrap">of {{ maxPage }}</div>
        </div>

        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            class="h-8 w-8 cursor-pointer p-0 disabled:cursor-not-allowed"
            :disabled="!table.getCanPreviousPage()"
            @click="table.setPageIndex(0)"
          >
            <span class="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            class="h-8 w-8 cursor-pointer p-0 disabled:cursor-not-allowed"
            :disabled="!table.getCanPreviousPage()"
            @click="table.previousPage()"
          >
            <span class="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            class="h-8 w-8 cursor-pointer p-0 disabled:cursor-not-allowed"
            :disabled="!table.getCanNextPage()"
            @click="table.nextPage()"
          >
            <span class="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            class="h-8 w-8 cursor-pointer p-0 disabled:cursor-not-allowed"
            :disabled="!table.getCanNextPage()"
            @click="table.setPageIndex(table.getPageCount() - 1)"
          >
            <span class="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
