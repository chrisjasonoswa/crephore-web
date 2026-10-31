import type { ColumnDef } from '@tanstack/vue-table'
import type { ColumnOptions } from './type'
import { h } from 'vue'
import CDateTime from '~/components/custom/c-date-time/CDateTime.vue'
import { browserTimeZone, formatDateTime } from '~/lib/date'
import { cn } from '~/lib/utils'
import CDataTableColumnHeader from '../CDataTableColumnHeader.vue'

interface DateTimeColumnOptions<T> extends ColumnOptions<T> {
  // The row's IANA timezone (e.g. an event's): the time is shown in it, and the timezone is added
  // when the viewer is in another one (tables are on client-only dashboard pages, so the browser's is known)
  timeZone?: (item: T) => string
}

// A date/time column, in the viewer's local time unless `timeZone` is given.
export function CDataTableDateTimeColumn<T>({
  accessorKey,
  label,
  className = '',
  enableSorting = true,
  timeZone,
}: DateTimeColumnOptions<T>): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header: ({ column }) => h(CDataTableColumnHeader, { column, title: label }),
    cell: ({ row }) =>
      h(
        'div',
        { class: cn(className, 'truncate') },
        timeZone
          ? h(CDateTime, { value: String(row.getValue(accessorKey as string) ?? ''), timeZone: timeZone(row.original), viewerTimeZone: browserTimeZone() })
          : formatDateTime(String(row.getValue(accessorKey as string) ?? '')),
      ),
    enableSorting,
  }
}
