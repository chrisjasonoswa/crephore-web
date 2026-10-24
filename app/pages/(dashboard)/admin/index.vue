<script setup lang="ts">
import { Check, ChevronRight, History, Plus } from '@lucide/vue'
import CPageHeader from '~/components/custom/c-header/CPageHeader.vue'
import { navItems } from '~/config/navigation'

definePageMeta({ area: 'admin' })

// Titles and icons come from the admin navigation so they stay in sync with the sidebar.
const catalogue = [
  { to: '/admin/section-types', description: 'Content blocks hosts can add, like Hero, RSVP and FAQ.' },
  { to: '/admin/layouts', description: 'Visual variations of each section, with their previews.' },
  { to: '/admin/templates', description: 'Ready-made websites hosts start from, per event type.' },
  { to: '/admin/users', description: 'Hosts and admins, their plans and their events.' },
].map(entry => ({ ...entry, ...navItems('admin').find(item => item.to === entry.to)! }))

// Static for now; will come from the catalogue state once there is a backend.
const setupSteps = [
  {
    title: 'Seed section types',
    description: 'Navigation, Hero and Footer are registered from code.',
    done: true,
  },
  {
    title: 'Add layout previews',
    description: 'Upload a thumbnail for each layout so hosts can pick by sight.',
    done: false,
    action: { label: 'Go to layouts', to: '/admin/layouts' },
  },
  {
    title: 'Publish a first template',
    description: 'Start with Wedding, your biggest event type.',
    done: false,
    action: { label: 'Create template', to: '/admin/templates' },
  },
]
const doneCount = setupSteps.filter(step => step.done).length
</script>

<template>
  <div class="flex flex-col gap-8">
    <CPageHeader
      title="Overview"
      description="Manage what hosts can build with: section types, layouts and templates."
    >
      <template #actions>
        <Button variant="outline" size="lg" as-child>
          <NuxtLink to="/#templates">View live templates</NuxtLink>
        </Button>
        <Button size="lg" as-child>
          <NuxtLink to="/admin/templates">
            <Plus />
            New template
          </NuxtLink>
        </Button>
      </template>
    </CPageHeader>

    <!-- Catalogue: one card split into cells. The -m-px grid + overflow-hidden card
         hides the outer cell borders, leaving only the dividers between cells. -->
    <Card class="gap-0 py-0">
      <div class="-mt-px -ml-px grid sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="entry in catalogue" :key="entry.to" class="flex flex-col border-t border-l p-6">
          <div class="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <component :is="entry.icon" class="size-5" />
          </div>
          <h2 class="mt-4 text-base font-semibold">
            {{ entry.title }}
          </h2>
          <p class="mt-1 flex-1 text-muted-foreground">
            {{ entry.description }}
          </p>
          <NuxtLink :to="entry.to" class="mt-4 inline-flex items-center gap-1 self-start font-medium text-accent-foreground hover:underline">
            Manage
            <ChevronRight class="size-4" />
          </NuxtLink>
        </div>
      </div>
    </Card>

    <div class="grid gap-6 lg:grid-cols-[3fr_2fr]">
      <Card>
        <CardHeader class="border-b">
          <CardTitle class="font-semibold">
            Recent changes
          </CardTitle>
          <CardAction class="self-center text-muted-foreground">
            Last 30 days
          </CardAction>
        </CardHeader>
        <CardContent class="flex flex-1">
          <Empty class="p-8">
            <EmptyHeader>
              <EmptyMedia variant="icon" class="bg-accent text-accent-foreground">
                <History />
              </EmptyMedia>
              <EmptyTitle class="text-base font-semibold">
                No changes yet
              </EmptyTitle>
              <EmptyDescription>
                Edits to section types, layouts and templates will be listed here with who made them.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" as-child>
                <NuxtLink to="/admin/section-types">Open section types</NuxtLink>
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="border-b">
          <CardTitle class="font-semibold">
            Set up the catalogue
          </CardTitle>
          <CardAction class="self-center text-muted-foreground">
            {{ doneCount }} of {{ setupSteps.length }} done
          </CardAction>
        </CardHeader>
        <CardContent>
          <ol class="divide-y">
            <li v-for="(step, i) in setupSteps" :key="step.title" class="flex gap-4 py-4 first:pt-0 last:pb-0">
              <span
                class="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium"
                :class="step.done ? 'bg-primary text-primary-foreground' : 'border text-muted-foreground'"
              >
                <Check v-if="step.done" class="size-4" />
                <template v-else>{{ i + 1 }}</template>
              </span>
              <div>
                <p class="font-medium">
                  {{ step.title }}
                </p>
                <p class="mt-1 text-muted-foreground">
                  {{ step.description }}
                </p>
                <NuxtLink v-if="step.action" :to="step.action.to" class="mt-2 inline-block font-medium text-accent-foreground hover:underline">
                  {{ step.action.label }}
                </NuxtLink>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
