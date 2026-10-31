<script setup lang="ts">
import AppSidebar from '~/components/AppSidebar.vue'
import SiteHeader from '~/components/SiteHeader.vue'
import { init } from '~/lib/app-bootstrap'

const route = useRoute()
const area = computed(() => route.meta.area ?? 'user')

// Load the signed-in user (also restores it after a page refresh).
onMounted(() => {
  init()
})
</script>

<template>
  <SidebarProvider>
    <AppSidebar :area="area" />
    <SidebarInset>
      <SiteHeader />
      <main class="flex-1 px-4 py-8 md:px-8 md:py-10">
        <div class="mx-auto w-full" :class="route.meta.wide ? 'max-w-none' : 'max-w-screen-2xl'">
          <slot />
        </div>
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
