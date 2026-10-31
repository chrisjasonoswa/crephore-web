<script
  setup
  lang="ts"
  generic="TItem extends { id: number }, TForm extends Record<string, unknown>, TRequest extends ApiPaginatedRequest"
>
import { ChevronRight, Loader2 } from '@lucide/vue'
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  type Row,
  type SortingState,
} from '@tanstack/vue-table'
import { computed, h, ref, watch, type Component } from 'vue'
import { cToast } from '~/lib/cToast'
import { Button } from '@/components/ui/button'
import { valueUpdater } from '~/lib/table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import CDataTableFormDialog from './CDataTableFormDialog.vue'
import CDataTablePagination from './CDataTablePagination.vue'
import CDataTableRowActions from './CDataTableRowActions.vue'
import CDataTableToolbar from './CDataTableToolbar.vue'
import type { ApiPaginatedRequest, ApiPaginatedResponse } from '~/types/api'
import type { FormContext, GenericObject } from 'vee-validate'
import { pluralize, titleize } from "inflection"

export type CDataTableRowActionsConfig<TData> = {
  separator?: boolean
  buttonName?: string
  className?: string
  variant?: 'default' | 'destructive'
  onClick?: (data: any) => void
}

type WithRequiredId<T> = T & { id: number }

type GeneralProps = {
  resourceName: string
  columns: ColumnDef<TItem>[]
  rowActionsColumn?: ColumnDef<TItem>
  expandedRowComponent?: Component
  loadItems: (params: TRequest) => Promise<ApiPaginatedResponse<TItem>>
  addItem?: (payload: TForm) => Promise<unknown>
  onAddItemClicked?: () => void
  updateItem?: (payload: WithRequiredId<TForm>) => Promise<unknown>
  // Edit somewhere else (e.g. its own page) instead of the table's dialog
  onUpdateItemClicked?: (item: TItem) => void
  deleteItem?: (id: number) => Promise<unknown>
  mapItemToFormValues?: (item: TItem) => TForm
  viewOnlyRow?: (row: TItem | null) => boolean
  defaultPageSize?: number
  dialogMaxWidth?: string
}
const props = withDefaults(defineProps<
  GeneralProps &
  (
    // Form is handled in the table internally
    | {
        form?: FormContext<GenericObject>
        formInitialValues: GenericObject
        formFieldComponent?: any
      }
    // Form is handled by the parent component
    | {
        form?: never
        formInitialValues?: never
        formFieldComponent?: never
      }
  )
>(), {
  defaultPageSize: 10,
  dialogMaxWidth: '960px',
})

const tableIsLoading = ref(false)
const data = ref<TItem[]>([])

const rowSelection = ref({})
const expanded = ref<ExpandedState>({})
const columnFilters = ref<ColumnFiltersState>([])
const sorting = ref<SortingState>([])
const searchKey = ref('')
const pagination = ref({
  pageIndex: 0,
  pageSize: props.defaultPageSize,
})

const totalCount = ref(0)
const pageCount = computed(() => Math.ceil(totalCount.value / pagination.value.pageSize))
const tableColumnCount = computed(() => columnsWithRowActions.value.length + (props.expandedRowComponent ? 1 : 0))

const isFormOpen = ref(false)
const formMode = ref<'add' | 'update' | 'delete' | 'view'>('add')
const activeItem = ref<TItem | null>(null)

const openForm = (mode: 'add' | 'update' | 'delete' | 'view', item?: TItem) => {
  formMode.value = mode
  activeItem.value = item ?? null

  if ((mode === 'update' || mode === 'delete' || mode === 'view') && item) {
    props.form?.resetForm({
      values: props.mapItemToFormValues?.(item) ?? item,
    })
  } else {
    props.form?.resetForm({
      values: props.formInitialValues
    })
  }

  isFormOpen.value = true
}

const columnsWithRowActions = computed(() => {
  const actions: CDataTableRowActionsConfig<TItem>[] = []

  const onUpdateClicked = props.updateItem
    ? (item: TItem) => openForm('update', item)
    : props.onUpdateItemClicked

  if (onUpdateClicked) {
    actions.push({
      buttonName: 'Edit',
      onClick: (row) => onUpdateClicked(row.original),
    })
  }

  if (props.deleteItem) {
    if (onUpdateClicked) {
      actions.push({ separator: true })
    }

    actions.push({
      buttonName: 'Delete',
      variant: 'destructive',
      onClick: (row) => openForm('delete', row.original),
    })
  }

  const getAction = (row: any) => {
    if (props.viewOnlyRow && props.viewOnlyRow(row.original)) {
      return [{
        buttonName: 'View',
        onClick: () => openForm('view', row.original),
      }]
    }

    return actions
  }

  const defaultRowActionsColumn: ColumnDef<TItem> = {
    id: 'actions',
    cell: ({ row }) =>
      h(CDataTableRowActions, {
        row,
        actions: getAction(row),
      }),
  }

  if (props.rowActionsColumn) {
    return [...props.columns, props.rowActionsColumn]
  }

  if (actions.length > 0) {
    return [...props.columns, defaultRowActionsColumn]
  }

  return props.columns
})

const table = useVueTable({
  get data() {
    return data.value as unknown as TItem[]
  },
  get columns() {
    return columnsWithRowActions.value
  },
  state: {
    get sorting() {
      return sorting.value
    },
    get pagination() {
      return pagination.value
    },
    get rowSelection() {
      return rowSelection.value
    },
    get expanded() {
      return expanded.value
    },
    get columnFilters() {
      return columnFilters.value
    },
  },
  manualPagination: true,
  get pageCount() {
    return pageCount.value
  },
  enableRowSelection: true,
  getRowCanExpand: () => Boolean(props.expandedRowComponent),
  onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
  onExpandedChange: updaterOrValue => valueUpdater(updaterOrValue, expanded),
  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
  onPaginationChange: updaterOrValue => valueUpdater(updaterOrValue, pagination),
  getCoreRowModel: getCoreRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
})

const handleLoadData = async (disableLoading = false) => {
  if (!disableLoading) {
    tableIsLoading.value = true
  }

  const requestParams = {
    page: pagination.value.pageIndex + 1,
    pageSize: pagination.value.pageSize,
    sort: sorting.value.map(sortItem => `${sortItem.id}:${sortItem.desc ? 'desc' : 'asc'}`),
    searchKey: searchKey.value,
  }

  const response = await props.loadItems(requestParams as unknown as TRequest)

  const payload = response.data
  data.value = payload.items
  totalCount.value = payload.totalCount
  pagination.value = {
    pageIndex: payload.page - 1,
    pageSize: payload.pageSize,
  }

  tableIsLoading.value = false
}

watch(
  [searchKey, sorting, () => pagination.value.pageIndex, () => pagination.value.pageSize],
  () => {
    handleLoadData()
  },
  { immediate: true },
)

const onFormSave = async (values: TForm) => {
  /*
    To simplify the implementation, we always reload the data after form submission.
    This is because when adding a new item or editing an item,
    the changes may affect the current sorting, filtering, and pagination state,
    which can be complex to handle correctly without reloading the data.
  */

  if (formMode.value === 'add') {
    await props.addItem?.(values)
  } else if (formMode.value === 'update') {
    await props.updateItem?.({
      ...(values as TForm),
      id: activeItem.value?.id ?? (values as WithRequiredId<TForm>).id,
    })
  } else if (formMode.value === 'delete') {
    await props.deleteItem?.(activeItem.value?.id ?? (values as WithRequiredId<TForm>).id)
  }

  isFormOpen.value = false

  const operationSuccess = formMode.value === 'add'
    ? 'added'
    : formMode.value === 'update'
      ? 'updated'
      : 'deleted'

  cToast({
    title: `${titleize(props.resourceName)} ${operationSuccess} successfully!`,
    type: 'success',
  })

  await handleLoadData()
}

const interactiveRowTargetSelector = [
  'a',
  'button',
  'input',
  'select',
  'textarea',
  '[role="button"]',
  '[role="checkbox"]',
  '[role="menuitem"]',
  '[data-no-row-expand]',
].join(',')

const onRowClick = (event: MouseEvent, row: Row<TItem>) => {
  if (!props.expandedRowComponent || !row.getCanExpand()) return

  const target = event.target as HTMLElement | null
  if (target?.closest(interactiveRowTargetSelector)) return

  row.toggleExpanded()
}


const reload = async() => {
  await handleLoadData()
}

defineExpose<CDataTableExpose>({
  reload
})

</script>

<script lang="ts">
export interface CDataTableExpose {
  reload: () => Promise<void>
}
</script>

<template>
  <div class="space-y-4">
    <CDataTableToolbar
      :resource-name="resourceName"
      :search-key="searchKey"
      :on-search-key-change="(value) => (searchKey = value)"
      :on-add-button-clicked="addItem
        ? () => openForm('add')
        : onAddItemClicked
      "
    />

    <div class="relative rounded-md border">
      <div v-if="tableIsLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
        <Loader2 class="h-5 w-5 animate-spin text-muted-foreground" />
      </div>

      <Table>
        <TableHeader>
          <TableRow  class="bg-muted/50" v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-if="expandedRowComponent" class="w-10" />
            <TableHead v-for="header in headerGroup.headers" :key="header.id" :colspan="header.colSpan">
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <template v-for="row in table.getRowModel().rows" :key="row.id">
              <TableRow
                :data-state="row.getIsSelected() ? 'selected' : row.getIsExpanded() ? 'expanded' : undefined"
                :aria-expanded="expandedRowComponent ? row.getIsExpanded() : undefined"
                :class="expandedRowComponent ? 'cursor-pointer' : undefined"
                @click="onRowClick($event, row)"
              >
                <TableCell v-if="expandedRowComponent" class="w-10 p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    class="h-7 w-7"
                    :aria-label="row.getIsExpanded() ? 'Collapse row' : 'Expand row'"
                    @click.stop="row.toggleExpanded()"
                  >
                    <ChevronRight
                      :class="[
                        'h-4 w-4 text-muted-foreground transition-transform',
                        row.getIsExpanded() ? 'rotate-90' : '',
                      ]"
                    />
                  </Button>
                </TableCell>
                <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <FlexRender
                    :render="cell.column.columnDef.cell"
                    :props="cell.getContext()"
                  />
                </TableCell>
              </TableRow>

              <TableRow
                v-if="expandedRowComponent && row.getIsExpanded()"
                class="bg-muted/20 hover:bg-muted/20"
              >
                <TableCell :colspan="row.getVisibleCells().length + 1" class="whitespace-normal p-0">
                  <component
                    :is="expandedRowComponent"
                    :item="row.original"
                    :row="row"
                  />
                </TableCell>
              </TableRow>
            </template>
          </template>

          <TableRow v-else>
            <TableCell :colspan="tableColumnCount" class="h-24 text-center">
              No {{ pluralize(resourceName) }} found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <CDataTablePagination :table="table" :total-count="totalCount" :resource-name="resourceName" />

    <CDataTableFormDialog
      v-if="form && formFieldComponent"
      :is-open="isFormOpen"
      :mode="formMode"
      :resource-name="resourceName"
      :form="form"
      :form-field-component="formFieldComponent"
      :max-width="dialogMaxWidth"
      :on-open-change="(open) => (isFormOpen = open)"
      :on-save="onFormSave"
    />
  </div>
</template>
