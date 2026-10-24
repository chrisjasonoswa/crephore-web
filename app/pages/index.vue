<script setup lang="ts">
import { BookHeart, LockKeyhole, QrCode, SquarePlay, User } from '@lucide/vue'
import { tagline } from '~/config/brand'

definePageMeta({ layout: 'landing' })

const storyChapters = ['Getting Ready', 'Ceremony', 'Reception', 'First Dance', 'Afterparty']
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="mx-auto max-w-7xl px-4 pt-12 pb-16 md:px-6 md:pt-20">
      <h1 class="max-w-5xl text-5xl leading-[0.95] font-bold tracking-tighter text-balance sm:text-6xl lg:text-7xl">
        Your guest list, RSVPs and photos,
        <em class="font-serif font-normal tracking-normal italic text-pink-deep">finally</em> in one place.
      </h1>
      <div class="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <p class="max-w-md leading-relaxed text-muted-foreground">
          Send one link. Guests RSVP in seconds and share their photos by scanning a QR code.
          After the event, Crephore turns everything into a story you can keep.
        </p>
        <div class="flex flex-wrap gap-3">
          <Button size="lg" class="h-12 px-6 font-semibold" as-child>
            <NuxtLink to="/sign-up">Create an event</NuxtLink>
          </Button>
          <Button size="lg" variant="secondary" class="h-12 px-6 font-semibold">
            View templates
          </Button>
        </div>
      </div>
    </section>

    <!-- Features (the `dark` panels borrow the theme's dark tokens to stay dark in both modes) -->
    <section id="features" class="mx-auto max-w-7xl scroll-mt-4 px-4 pb-24 md:px-6">
      <div class="grid grid-flow-dense gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div id="templates" class="dark flex min-h-96 scroll-mt-4 flex-col justify-center gap-10 rounded-3xl bg-card p-8 text-card-foreground md:col-span-2 lg:col-span-4 lg:flex-row lg:items-center lg:p-10">
          <div class="lg:flex-1">
            <p class="text-xs font-bold tracking-widest text-primary uppercase">
              Website maker
            </p>
            <h2 class="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Pick a template. Pick two colors. Publish.
            </h2>
            <p class="mt-4 max-w-xl leading-relaxed text-foreground/80">
              Every section comes in several layouts and five styles: Plain, Soft, Bold, Dark and Photo.
            </p>
          </div>
          <div class="grid grid-cols-5 gap-2 lg:flex-1">
            <div class="aspect-2/3 rounded-xl bg-foreground" />
            <div class="aspect-2/3 rounded-xl bg-chart-2" />
            <div class="aspect-2/3 rounded-xl bg-primary" />
            <div class="aspect-2/3 rounded-xl border bg-background" />
            <div class="aspect-2/3 rounded-xl bg-linear-to-b from-chart-3/40 to-muted" />
          </div>
        </div>

        <div class="flex min-h-96 flex-col rounded-3xl bg-accent p-8">
          <p class="text-xs font-bold tracking-widest text-accent-foreground uppercase">
            Smart RSVP
          </p>
          <h3 class="mt-4 text-3xl font-bold tracking-tight">
            Invite-only links that know each guest by name.
          </h3>
          <div class="mt-auto rounded-xl bg-card p-4 pt-4 text-sm text-card-foreground">
            <p class="font-semibold">
              Welcome, Paolo
            </p>
            <p class="mt-1 text-muted-foreground">
              Code: [GUEST-CODE] · Seats reserved: 2
            </p>
          </div>
        </div>

        <LandingFeatureCard
          :icon="QrCode"
          title="QR photo uploads"
          description="Guests scan and upload. Photos sort themselves by time and by your event timeline."
        />
        <LandingFeatureCard
          :icon="SquarePlay"
          title="Auto memory video"
          description="The day after, a video of your event is ready, cut in the order it happened."
        />
        <LandingFeatureCard
          :icon="LockKeyhole"
          title="Time capsule"
          description="Letters and videos from guests that unlock on a date you choose."
          class="border-transparent bg-secondary text-secondary-foreground"
        />
        <LandingFeatureCard
          :icon="User"
          title="Personal guest galleries"
          description="Every guest gets a page of their photos, tags and messages."
        />

        <div class="dark flex min-h-96 flex-col rounded-3xl border bg-background p-8 text-foreground md:col-span-2">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h3 class="text-2xl font-bold tracking-tight">
              Event Story
            </h3>
            <p class="text-sm text-muted-foreground">
              Hundreds of photos, told in order
            </p>
          </div>
          <div class="mt-6 flex flex-wrap gap-2">
            <span
              v-for="chapter in storyChapters"
              :key="chapter"
              class="rounded-full px-4 py-2 text-sm font-semibold"
              :class="chapter === 'First Dance' ? 'bg-primary text-primary-foreground' : 'bg-card'"
            >
              {{ chapter }}
            </span>
          </div>
        </div>

        <LandingFeatureCard
          :icon="BookHeart"
          title="Memory book"
          description="Export favorites as a printable PDF book worth gifting."
        />
      </div>
    </section>

    <!-- Tagline: cre-pho-re as three steps -->
    <section class="mx-auto max-w-7xl px-4 pb-24 md:px-6">
      <!-- Desktop: steps pinned left / centre / right, one connector line runs through the numbers -->
      <ol class="flex flex-col gap-10 md:flex-row md:gap-0">
        <li v-for="(part, i) in tagline" :key="part.syllable" class="flex md:flex-1">
          <span v-if="i > 0" class="mt-4.75 hidden h-0.5 min-w-6 flex-1 bg-secondary md:block" />
          <div class="flex flex-col items-start md:items-center">
            <div class="flex items-center self-stretch">
              <span class="hidden h-0.5 flex-1 md:block" :class="i > 0 ? 'bg-secondary' : 'invisible'" />
              <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-secondary-foreground">
                {{ i + 1 }}
              </span>
              <span class="hidden h-0.5 flex-1 md:block" :class="i < tagline.length - 1 ? 'bg-secondary' : 'invisible'" />
            </div>
            <p class="mt-6 text-3xl font-bold tracking-tight md:text-center md:text-2xl lg:text-4xl xl:whitespace-nowrap">
              <span class="text-pink-deep">{{ part.syllable }}</span>{{ part.rest }}
            </p>
          </div>
          <span v-if="i < tagline.length - 1" class="mt-4.75 hidden h-0.5 min-w-6 flex-1 bg-secondary md:block" />
        </li>
      </ol>
    </section>

    <!-- Yearly events -->
    <section id="teams" class="border-y bg-card">
      <div class="mx-auto grid max-w-7xl gap-6 px-4 py-20 md:grid-cols-2 md:items-center md:gap-16 md:px-6 md:py-28">
        <h2 class="text-4xl font-bold tracking-tight md:text-5xl">
          Yearly events, all in one place.
        </h2>
        <p class="leading-relaxed text-muted-foreground">
          Family reunions, company anniversaries, annual galas. Keep every year's site, guest list and gallery
          together, and start next year's from last year's in one click.
        </p>
      </div>
    </section>

    <!-- Final call to action -->
    <section class="mx-auto max-w-7xl px-4 py-24 md:px-6 md:py-32">
      <h2 class="text-5xl leading-[0.95] font-bold tracking-tighter sm:text-7xl lg:text-8xl">
        Your next event starts<br>
        <em class="font-serif font-normal tracking-normal italic text-pink-deep">here.</em>
      </h2>
      <Button size="lg" class="mt-10 h-12 px-6 font-semibold" as-child>
        <NuxtLink to="/sign-up">Create your event, free</NuxtLink>
      </Button>
    </section>
  </div>
</template>
