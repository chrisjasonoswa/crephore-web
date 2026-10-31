<script setup lang="ts">
import { Search } from '@lucide/vue'
import { useEventListener } from '@vueuse/core'
import ModeToggle from '~/components/ModeToggle.vue'
import { areas, navItems } from '~/config/navigation'

const route = useRoute()
const area = computed(() => route.meta.area ?? 'user')
// Set by pages whose last segment is an id (e.g. the event's name)
const pageTitle = useBreadcrumbTitle()

// Area label first, then one crumb per segment below the area root
// (the root page itself shows its nav title, e.g. "Admin › Overview").
const crumbs = computed(() => {
  const { label, root } = areas[area.value]
  const items = navItems(area.value)
  const trail = [{ label, to: root }]
  const path = route.path.replace(/\/$/, '')
  if (path === root)
    return [...trail, { label: items.find(item => item.to === root)?.title ?? label, to: root }]

  const segments = path.slice(root.length).split('/').filter(Boolean)
  segments.forEach((segment, i) => {
    const to = `${root}/${segments.slice(0, i + 1).join('/')}`
    const isLast = i === segments.length - 1
    trail.push({
      label: items.find(item => item.to === to)?.title
        ?? (isLast ? pageTitle.value : null)
        ?? segment.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase()),
      to,
    })
  })
  return trail
})

// ⌘K / Ctrl+K focuses the search field (search itself is not wired up yet).
const search = useTemplateRef<HTMLElement>('search')
useEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault()
    search.value?.querySelector('input')?.focus()
  }
})
</script>

<template>
  <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:px-6">
    <SidebarTrigger class="-ml-1" />
    <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center" />

    <Breadcrumb>
      <BreadcrumbList class="text-base">
        <template v-for="(crumb, i) in crumbs" :key="i">
          <BreadcrumbSeparator v-if="i > 0" class="hidden md:block" />
          <BreadcrumbItem v-if="i < crumbs.length - 1" class="hidden md:block">
            <BreadcrumbLink as-child>
              <NuxtLink :to="crumb.to">{{ crumb.label }}</NuxtLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem v-else>
            <BreadcrumbPage>{{ crumb.label }}</BreadcrumbPage>
          </BreadcrumbItem>
        </template>
      </BreadcrumbList>
    </Breadcrumb>

    <div class="ml-auto flex items-center gap-2">
      <div ref="search" class="hidden md:block">
        <InputGroup class="w-64">
          <InputGroupInput :placeholder="areas[area].searchPlaceholder" />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Kbd>⌘K</Kbd>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <ModeToggle />
    </div>
  </header>
</template>
