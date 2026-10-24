<script setup lang="ts">
import { tagline } from '~/config/brand'

const year = new Date().getFullYear()
</script>

<template>
  <div class="grid min-h-svh lg:grid-cols-2">
    <div class="flex flex-col px-4 py-6 md:px-10 md:py-8">
      <AppLogo class="self-start" />
      <main class="flex flex-1 items-center justify-center py-12">
        <div class="w-full max-w-sm">
          <slot />
        </div>
      </main>
    </div>

    <!-- Brand panel: `dark` borrows the theme's dark tokens, so it stays dark teal + pink in both modes -->
    <aside class="dark hidden flex-col justify-between bg-card p-12 text-card-foreground lg:flex">
      <p class="text-xs font-bold tracking-widest text-primary uppercase">
        Event pages · RSVPs · Photos
      </p>
      <div>
        <p class="text-5xl leading-[0.95] font-bold tracking-tighter xl:text-6xl">
          Every event,<br>
          <em class="font-serif font-normal tracking-normal italic text-pink-deep">beautifully</em> kept.
        </p>
        <ul class="mt-12 flex flex-col gap-3 border-t pt-8 text-2xl font-bold tracking-tight">
          <li v-for="part in tagline" :key="part.syllable">
            <span class="text-pink-deep">{{ part.syllable }}</span>{{ part.rest }}
          </li>
        </ul>
      </div>
      <p class="text-sm text-muted-foreground">
        © {{ year }} Crephore
      </p>
    </aside>
  </div>
</template>
