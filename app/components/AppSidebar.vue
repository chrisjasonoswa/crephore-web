<script setup lang="ts">
import type { NavArea } from '~/config/navigation'
import { ArrowLeftRight } from '@lucide/vue'
import NavMain from '~/components/NavMain.vue'
import NavUser from '~/components/NavUser.vue'
import { areas, navigation } from '~/config/navigation'
import { useAuthStore } from '~/features/auth/auth.store'

const props = defineProps<{ area: NavArea }>()

const authStore = useAuthStore()
// Empty until the user has loaded (see init() in the default layout).
const user = computed(() => ({
  name: [authStore.user?.firstName, authStore.user?.lastName].filter(Boolean).join(' '),
  email: authStore.user?.email ?? '',
  avatarFallback: [authStore.user?.firstName?.[0], authStore.user?.lastName?.[0]].filter(Boolean).join('').toUpperCase(),
}))

const groups = computed(() => navigation[props.area])
const otherArea = computed(() => (props.area === 'admin' ? 'user' : 'admin'))
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader class="h-16 justify-center border-b border-sidebar-border">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" class="hover:bg-transparent hover:text-sidebar-foreground active:bg-transparent active:text-sidebar-foreground" as-child>
            <NuxtLink :to="areas[area].root">
              <!-- App icon: pink C on teal in light mode, teal C on pink in dark mode -->
              <AppLogoMark />
              <span class="text-lg font-bold tracking-tight">crephore</span>
              <Badge
                v-if="area === 'admin'"
                variant="outline"
                class="ml-auto border-sidebar-accent-foreground/40 bg-sidebar-accent-foreground/10 text-sidebar-accent-foreground"
              >
                Admin
              </Badge>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent class="pt-2">
      <NavMain
        v-for="group in groups"
        :key="group.label"
        :area="area"
        :label="group.label"
        :items="group.items"
      />
    </SidebarContent>

    <SidebarFooter class="border-t border-sidebar-border">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton as-child :tooltip="areas[area].switchLabel" class="h-9 rounded-lg px-3 text-sm text-sidebar-foreground/80">
            <NuxtLink :to="areas[otherArea].root">
              <ArrowLeftRight />
              <span>{{ areas[area].switchLabel }}</span>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <NavUser :user="user" />
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>
