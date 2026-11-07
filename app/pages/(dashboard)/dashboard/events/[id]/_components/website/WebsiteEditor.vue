<script setup lang="ts">
import type { EventWebsiteDraft, WebsiteSection } from '~/features/event-websites/event-website.type'
import type { Event } from '~/features/events/event.type'
import type { SectionProgram } from '~/features/sections/program/program.type'
import type { SectionType } from '~/features/sections/section.type'
import type { CustomToastType } from '~/utils/styles/toast-and-alert'
import { CloudOff, ExternalLink, MoreHorizontal, Plus, RotateCcw } from '@lucide/vue'
import CAlert from '~/components/custom/c-alert/CAlert.vue'
import CConfirmationModal from '~/components/custom/c-modal/CConfirmationModal.vue'
import PreviewFrame from '~/components/site-editor/PreviewFrame.vue'
import ThemeControls from '~/components/site-editor/ThemeControls.vue'
import { createWebsiteSection, duplicateWebsiteSection, eventOccasion, moveItem, websiteProblem, websiteWarnings } from '~/features/event-websites/event-website'
import { getSectionType } from '~/features/sections/section.registry'
import { eventKindFor } from '~/site-theme/eventKinds'
import WebsiteAddSectionDialog from './WebsiteAddSectionDialog.vue'
import WebsitePreview from './WebsitePreview.vue'
import { toastAndAlertStyles } from '~/utils/styles/toast-and-alert'
import WebsiteSectionList from './WebsiteSectionList.vue'
import WebsiteSectionSettings from './WebsiteSectionSettings.vue'

// The website editor: on the left the sections (add, reorder, hide, edit one) and the site style; on the right a
// live preview at desktop, tablet or phone width. Clicking a section in the preview or the list opens its settings.
// Above them, the save bar (save, publish, view the live site); the Website tab does the saving and publishing.
const props = defineProps<{
  event: Event
  // The event's saved program, which the program sections show
  program: SectionProgram
  // The website is on the server (saved at least once)
  isSaved: boolean
  // There are changes to save
  isDirty: boolean
  isSaving: boolean
  // When guests last got a version; null while unpublished
  publishedAt: string | null
  // Published, but the saved website differs from what guests see
  hasUnpublishedChanges: boolean
  isPublishing: boolean
  // The website's address, e.g. https://ana-and-marco.crephore.com
  siteUrl: string
  // Props rather than events, so their confirmations stay open (and show progress) while they run
  onStartOver: () => void | Promise<void>
  onUnpublish: () => void | Promise<void>
}>()

const website = defineModel<EventWebsiteDraft>('website', { required: true })

const emit = defineEmits<{
  save: []
  discard: []
  // Saves first when there are unsaved changes
  publish: []
}>()

// What has to change before it can be saved (e.g. no hero), shown instead of the save status
const problem = computed(() => websiteProblem(website.value))
// Sections missing content their layout needs: a warning under the save bar, never a reason not to save or publish
const warnings = computed(() => websiteWarnings(website.value))

const saveStatus = computed(() => {
  if (problem.value)
    return problem.value
  if (!props.isSaved)
    return 'Not saved yet. Save to keep your website.'
  return props.isDirty ? 'You have unsaved changes.' : 'All changes saved.'
})
// Green once everything is saved, red while anything isn't
const saveAlert = computed(() => toastAndAlertStyles[(props.isSaved && !props.isDirty && !problem.value ? 'success' : 'error') satisfies CustomToastType])

const isPublished = computed(() => props.publishedAt !== null)
// Guests would see something else after publishing (unsaved edits are saved first)
const hasChangesToPublish = computed(() => !isPublished.value || props.isDirty || props.hasUnpublishedChanges)
const publishStatus = computed(() => {
  if (!isPublished.value)
    return 'Not published'
  return hasChangesToPublish.value ? 'Live · changes not published' : 'Live'
})
const canPublish = computed(() =>
  hasChangesToPublish.value && !props.isSaving && !props.isPublishing && !problem.value && website.value.sections.some(section => section.isVisible))
const publishLabel = computed(() => {
  if (props.isPublishing)
    return 'Publishing…'
  if (!isPublished.value)
    return 'Publish'
  return hasChangesToPublish.value ? 'Publish changes' : 'Published'
})
const publishHint = computed(() => {
  if (problem.value)
    return problem.value
  return website.value.sections.some(section => section.isVisible) ? undefined : 'Add a visible section to publish'
})
const isBusy = computed(() => props.isSaving || props.isPublishing)

// One hero per page: the add dialog doesn't offer another
const hasHero = computed(() => website.value.sections.some(section => section.type === 'hero'))

const isUnpublishOpen = ref(false)

const occasion = computed(() => eventOccasion(props.event, props.program))

const sections = computed({
  get: () => website.value.sections,
  set: next => (website.value = { ...website.value, sections: next }),
})
// Each press of the Style tab's "Play intro" plays the page transition in the preview
const introKey = ref(0)

const theme = computed({
  get: () => website.value.theme,
  set: next => (website.value = { ...website.value, theme: next }),
})

const panel = ref<'sections' | 'style'>('sections')
const selectedKey = ref<string | null>(null)
const selected = computed({
  get: () => sections.value.find(section => section.key === selectedKey.value),
  set: (next) => {
    if (next)
      sections.value = sections.value.map(section => (section.key === next.key ? next : section))
  },
})

// The layout picker of the section being edited; it opens on its own for a section just added
const isLayoutPickerOpen = ref(false)
const newSectionKey = ref<string | null>(null)
watch(isLayoutPickerOpen, (open) => {
  if (!open)
    newSectionKey.value = null
})

function select(key: string) {
  selectedKey.value = key
  panel.value = 'sections'
  isLayoutPickerOpen.value = false
}


const indexOf = (section: WebsiteSection) => sections.value.findIndex(item => item.key === section.key)

function insertAt(index: number, section: WebsiteSection) {
  sections.value = [...sections.value.slice(0, index), section, ...sections.value.slice(index)]
  select(section.key)
}

// New sections go after the one being edited, else at the end
const isAddOpen = ref(false)
function addSection(type: SectionType) {
  const index = selected.value ? indexOf(selected.value) + 1 : sections.value.length
  const section = createWebsiteSection(type, props.event)
  insertAt(index, section)
  newSectionKey.value = section.key
  isLayoutPickerOpen.value = true
}

const duplicate = (section: WebsiteSection) => insertAt(indexOf(section) + 1, duplicateWebsiteSection(section))
const move = (from: number, to: number) => (sections.value = moveItem(sections.value, from, to))
const toggleVisible = (section: WebsiteSection) =>
  (sections.value = sections.value.map(item => (item.key === section.key ? { ...item, isVisible: !item.isVisible } : item)))

const sectionToDelete = ref<WebsiteSection | null>(null)
const isDeleteOpen = computed({
  get: () => sectionToDelete.value !== null,
  set: (open) => {
    if (!open)
      sectionToDelete.value = null
  },
})
function deleteSection() {
  const key = sectionToDelete.value?.key
  sections.value = sections.value.filter(section => section.key !== key)
  if (selectedKey.value === key)
    selectedKey.value = null
}

const isStartOverOpen = ref(false)
function startOver() {
  if (props.isSaved || sections.value.length)
    isStartOverOpen.value = true
  else
    props.onStartOver()
}
</script>

<template>
  <div class="grid items-start gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
    <div data-save-bar class="flex flex-wrap items-center gap-2 rounded-xl border px-4 py-3 xl:col-span-2" :class="saveAlert.container">
      <div class="mr-auto flex flex-wrap items-center gap-x-3 gap-y-1">
        <p data-save-status class="flex items-center gap-2 text-sm font-medium" role="status">
          <component :is="saveAlert.icon" class="size-4 shrink-0" aria-hidden="true" />
          {{ saveStatus }}
        </p>
        <Badge data-publish-status :variant="isPublished ? 'default' : 'outline'">
          {{ publishStatus }}
        </Badge>
      </div>

      <!-- The real website in a new tab: what guests see (the last published version) -->
      <Button v-if="isPublished" variant="outline" size="sm" as-child>
        <a data-view-site :href="siteUrl" target="_blank" rel="noopener">
          <ExternalLink />
          View website
        </a>
      </Button>
      <Button v-else type="button" variant="outline" size="sm" disabled title="Publish your website to see it live">
        <ExternalLink />
        View website
      </Button>
      <Button type="button" variant="outline" size="sm" :disabled="!isSaved || !isDirty || isBusy" @click="emit('discard')">
        Discard changes
      </Button>
      <Button type="button" variant="outline" size="sm" :disabled="!isDirty || isBusy || !!problem" @click="emit('save')">
        {{ isSaving ? 'Saving…' : 'Save changes' }}
      </Button>
      <Button
        type="button"
        size="sm"
        data-publish
        :disabled="!canPublish"
        :title="publishHint"
        @click="emit('publish')"
      >
        {{ publishLabel }}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="More website actions" :disabled="isBusy">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem v-if="isPublished" @select="isUnpublishOpen = true">
            <CloudOff /> Unpublish
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" @select="startOver">
            <RotateCcw /> Start over
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <CAlert
      v-if="warnings.length"
      data-website-warnings
      type="warning"
      size="sm"
      role="note"
      title="Some sections are missing content their layout needs"
      class="w-full xl:col-span-2"
    >
      <p>You can still publish: guests see placeholders there until you add it.</p>
      <ul class="mt-1 list-disc pl-5">
        <li v-for="warning in warnings" :key="warning">
          {{ warning }}
        </li>
      </ul>
    </CAlert>

    <!-- Scrolls on its own when taller than the viewport, so every control stays reachable -->
    <Card class="py-0 xl:sticky xl:top-6 xl:max-h-[calc(100svh-3rem)] xl:overflow-y-auto">
      <CardContent class="p-4">
        <Tabs v-model="panel" class="gap-5">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="sections">
              Sections
            </TabsTrigger>
            <TabsTrigger value="style">
              Style
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sections">
            <WebsiteSectionSettings
              v-if="selected"
              v-model:section="selected"
              v-model:layout-picker-open="isLayoutPickerOpen"
              :event="event"
              :theme="theme"
              :occasion="occasion"
              :is-new="selected.key === newSectionKey"
              @back="selectedKey = null"
            />
            <div v-else class="flex flex-col gap-3">
              <p class="text-sm text-muted-foreground">
                {{ sections.length ? 'Your page, top to bottom. Pick a section to edit it.' : 'Your page has no sections yet.' }}
              </p>
              <WebsiteSectionList
                v-if="sections.length"
                :sections="sections"
                @select="select"
                @move="move"
                @toggle-visible="toggleVisible"
                @duplicate="duplicate"
                @delete="sectionToDelete = $event"
              />
              <Button type="button" variant="outline" class="w-full border-dashed" @click="isAddOpen = true">
                <Plus />
                Add a section
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="style">
            <ThemeControls v-model:theme="theme" :event-kind="eventKindFor(event.type)" @play-intro="introKey++" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <PreviewFrame>
      <WebsitePreview
        :sections="sections"
        :theme="theme"
        :intro-key="introKey"
        :event-kind="eventKindFor(event.type)"
        :occasion="occasion"
        :selected-key="selectedKey"
        @select="select"
        @add="isAddOpen = true"
      />
    </PreviewFrame>

    <WebsiteAddSectionDialog v-model:open="isAddOpen" :event="event" :occasion="occasion" :theme="theme" :has-hero="hasHero" @add="addSection" />

    <CConfirmationModal
      v-model:is-open="isDeleteOpen"
      title="Delete this section?"
      confirm-button-text="Delete"
      variant="destructive"
      :on-confirm="deleteSection"
    >
      The {{ sectionToDelete ? getSectionType(sectionToDelete.type).name.toLowerCase() : '' }} and its text and photos
      will be removed from the page. To keep it for later, hide it instead.
    </CConfirmationModal>

    <CConfirmationModal
      v-model:is-open="isStartOverOpen"
      title="Start over?"
      confirm-button-text="Start over"
      variant="destructive"
      :on-confirm="onStartOver"
    >
      <template v-if="isPublished">
        Your website will be taken offline and deleted: its sections and style. You can then pick a template or start
        from scratch again.
      </template>
      <template v-else-if="isSaved">
        Your saved website will be deleted: its sections and style. You can then pick a template or start from scratch
        again.
      </template>
      <template v-else>
        Your sections and style will be removed, and you can pick a template or start from scratch again.
      </template>
    </CConfirmationModal>

    <CConfirmationModal
      v-model:is-open="isUnpublishOpen"
      title="Unpublish your website?"
      confirm-button-text="Unpublish"
      variant="destructive"
      :on-confirm="onUnpublish"
    >
      Guests will no longer see it. Your saved website stays here, and you can publish it again any time.
    </CConfirmationModal>
  </div>
</template>
