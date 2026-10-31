import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { cn } from '~/lib/utils'
import CDataTableColumnHeader from '../CDataTableColumnHeader.vue'
import type { ColumnOptions } from './type'

interface TextColumnOptions<T> extends ColumnOptions<T> {}

export function CDataTableTextColumn<T>({
  accessorKey,
  label,
  className = '',
  enableSorting = true,
}: TextColumnOptions<T>): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header: ({ column }) => h(CDataTableColumnHeader, { column, title: label }),
    cell: ({ row }) =>
      h(
        'div',
        { class: cn(className, 'truncate') },
        String(row.getValue(accessorKey as string) ?? ''),
        
      ),
    enableSorting,
  }
}
