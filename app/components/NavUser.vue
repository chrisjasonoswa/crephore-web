<script setup lang="ts">
import { ChevronsUpDown, LogOut, UserRound } from '@lucide/vue'
import { useSidebar } from '~/components/ui/sidebar'
import { useAuthStore } from '~/features/auth/auth.store'
import { cToast } from '~/lib/cToast'

defineProps<{
  user: {
    name: string
    email: string
    avatarFallback: string
  }
}>()

const { isMobile } = useSidebar()
const authStore = useAuthStore()

async function signOut() {
  await authStore.logout()
  cToast({ title: 'You have been signed out.', type: 'success' })
  await navigateTo('/sign-in')
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="rounded-lg border border-sidebar-border data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:border-0"
          >
            <Avatar class="size-8 rounded-lg">
              <AvatarFallback class="rounded-lg bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                {{ user.avatarFallback }}
              </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 leading-tight">
              <span class="truncate font-medium text-sidebar-foreground">{{ user.name }}</span>
              <span class="truncate text-xs text-sidebar-foreground/70">{{ user.email }}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-(--reka-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="end"
          :side-offset="4"
        >
          <DropdownMenuItem>
            <UserRound />
            Account
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @select="signOut">
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
