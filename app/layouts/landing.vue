<script setup lang="ts">
const navLinks = [
  { label: 'Features', to: '/#features' },
  { label: 'Templates', to: '/#templates' },
  { label: 'For teams', to: '/#teams' },
  { label: 'Pricing', to: '#' },
]
const footerLinks = ['About', 'Help', 'Privacy']
const year = new Date().getFullYear()
</script>

<template>
  <div class="flex min-h-svh flex-col">
    <header class="mx-auto grid h-20 w-full max-w-7xl grid-cols-[1fr_auto] items-center px-4 md:grid-cols-[1fr_auto_1fr] md:px-6">
      <AppLogo />
      <nav class="hidden items-center gap-8 text-sm md:flex">
        <NuxtLink v-for="link in navLinks" :key="link.label" :to="link.to" class="hover:text-muted-foreground">
          {{ link.label }}
        </NuxtLink>
      </nav>
      <div class="flex items-center justify-end gap-2">
        <Button variant="ghost" as-child>
          <NuxtLink to="/sign-in">Sign in</NuxtLink>
        </Button>
        <Button class="px-4 font-semibold" as-child>
          <NuxtLink to="/sign-up">Try it free</NuxtLink>
        </Button>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t">
      <div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm md:flex-row md:items-center md:justify-between md:px-6">
        <span class="font-bold tracking-tight">crephore</span>
        <nav class="flex gap-6 text-muted-foreground">
          <a v-for="link in footerLinks" :key="link" href="#" class="hover:text-foreground">{{ link }}</a>
        </nav>
        <p class="text-muted-foreground">
          © {{ year }} Crephore
        </p>
      </div>
    </footer>
  </div>
</template>
