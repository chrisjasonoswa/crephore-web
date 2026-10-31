export interface ColumnOptions<T> {
  accessorKey: keyof T
  label: string
  className?: string
  enableSorting?: boolean
}
