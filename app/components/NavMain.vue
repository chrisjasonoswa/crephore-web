<script setup lang="ts">
import type { NavArea, NavItem } from '~/config/navigation'
import { areas, navItems } from '~/config/navigation'

const props = defineProps<{
  area: NavArea
  label: string
  items: NavItem[]
}>()

const route = useRoute()

// Exact match for the area's root, prefix match for everything below it.
function matches(item: NavItem) {
  if (item.to === areas[props.area].root)
    return route.path === item.to
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

// Only the most specific match in the whole area is active (e.g. Playground, not also Section types).
const activeTo = computed(() =>
  navItems(props.area).filter(matches).sort((a, b) => b.to.length - a.to.length)[0]?.to,
)
const isActive = (item: NavItem) => item.to === activeTo.value
</script>

<template>
  <SidebarGroup class="py-1">
    <SidebarGroupLabel class="text-sidebar-foreground/50">{{ props.label }}</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu class="gap-1">
        <SidebarMenuItem v-for="item in props.items" :key="item.to">
          <!-- Rose bar on the sidebar edge marks the active page -->
          <span
            v-if="isActive(item)"
            class="absolute inset-y-1.5 -left-2 w-1 rounded-r-full bg-sidebar-accent-foreground"
          />
          <SidebarMenuButton
            as-child
            :is-active="isActive(item)"
            :tooltip="item.title"
            class="h-9 rounded-lg px-3 text-sm text-sidebar-foreground/80 data-active:bg-sidebar-accent data-active:text-sidebar-foreground data-active:[&>svg]:text-sidebar-accent-foreground"
          >
            <NuxtLink :to="item.to">
              <component :is="item.icon" />
              <span>{{ item.title }}</span>
            </NuxtLink>
          </SidebarMenuButton>
          <SidebarMenuSub v-if="item.children?.length">
            <SidebarMenuSubItem v-for="child in item.children" :key="child.to">
              <SidebarMenuSubButton
                as-child
                :is-active="isActive(child)"
                class="text-sidebar-foreground/80 data-active:text-sidebar-foreground [&>svg]:text-current data-active:[&>svg]:text-sidebar-accent-foreground"
              >
                <NuxtLink :to="child.to">
                  <component :is="child.icon" />
                  <span>{{ child.title }}</span>
                </NuxtLink>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
