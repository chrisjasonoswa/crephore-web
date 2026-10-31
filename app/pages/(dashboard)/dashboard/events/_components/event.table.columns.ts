import type { ColumnDef } from '@tanstack/vue-table'
import type { Event } from '~/features/events/event.type'
import type { SiteAddress } from '~/features/sites/site'
import { NuxtLink } from '#components'
import { h } from 'vue'
import CDataTableColumnHeader from '~/components/custom/c-data-table/CDataTableColumnHeader.vue'
import { CDataTableDateTimeColumn } from '~/components/custom/c-data-table/column-defs/datetime-column'
import { CDataTableTextColumn } from '~/components/custom/c-data-table/column-defs/text-column'
import { eventTypeLabels } from '~/features/events/event.type'

// The event's own page (details, website, guests)
export const eventPagePath = (id: number) => `/dashboard/events/${id}`

export const getEventTableColumns = (site: SiteAddress): ColumnDef<Event>[] => {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => h(CDataTableColumnHeader, { column, title: 'Name' }),
      cell: ({ row }) => h(
        NuxtLink,
        { to: eventPagePath(row.original.id), class: 'block truncate font-medium hover:underline' },
        () => row.original.name,
      ),
    },
    {
      accessorKey: 'type',
      header: ({ column }) => h(CDataTableColumnHeader, { column, title: 'Type' }),
      cell: ({ row }) => eventTypeLabels[row.original.type] ?? row.original.type,
    },
    CDataTableDateTimeColumn<Event>({
      accessorKey: 'startsAt',
      label: 'Starts',
      timeZone: event => event.timezone,
    }),
    CDataTableTextColumn<Event>({
      accessorKey: 'venueName',
      label: 'Venue',
      enableSorting: false,
    }),
    // The full address guests open, e.g. "jane-and-john.crephore.com"
    {
      accessorKey: 'subdomain',
      header: ({ column }) => h(CDataTableColumnHeader, { column, title: 'Website address' }),
      cell: ({ row }) => h('div', { class: 'truncate' }, site.hostOf(row.original.subdomain)),
    },
    {
      id: 'eventGroup',
      header: 'Group',
      enableSorting: false,
      cell: ({ row }) => h('span', { class: row.original.eventGroup ? '' : 'text-muted-foreground' }, row.original.eventGroup?.name ?? '—'),
    },
  ]
}
