import type { EventWebsiteDraft } from '~/features/event-websites/event-website.type'
import type { Event } from '~/features/events/event.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createBlankWebsite, createWebsiteSection } from '~/features/event-websites/event-website'
import WebsiteEditor from '~/pages/(dashboard)/dashboard/events/[id]/_components/website/WebsiteEditor.vue'

const { uploadPhoto } = vi.hoisted(() => ({ uploadPhoto: vi.fn() }))
vi.mock('~/features/media/media.api', () => ({ uploadPhoto }))

const event = {
  id: 5,
  name: 'Ana & Marco',
  description: null,
  type: 'Wedding',
  venueName: 'Manila Cathedral',
  venueAddress: 'Intramuros, Manila',
  venueLatitude: null,
  venueLongitude: null,
  venueGooglePlaceId: null,
  startsAt: '2027-06-12T07:00:00Z',
  endsAt: '2027-06-12T13:00:00Z',
  timezone: 'Asia/Manila',
  subdomain: 'ana-and-marco',
  createdAt: '2026-10-01T00:00:00Z',
  access: ['Owner'],
  eventGroup: null,
  timeline: [],
} satisfies Event

interface SaveState {
  isSaved?: boolean
  isDirty?: boolean
  isSaving?: boolean
  publishedAt?: string | null
  hasUnpublishedChanges?: boolean
  isPublishing?: boolean
  onStartOver?: () => void | Promise<void>
  onUnpublish?: () => void | Promise<void>
}

// Mounted like the Website tab uses it: the editor's website changes are fed back in
async function mountEditor(website: EventWebsiteDraft = createBlankWebsite(), state: SaveState = {}) {
  const wrapper = await mountSuspended(WebsiteEditor, {
    props: {
      'event': event,
      website,
      'isSaved': false,
      'isDirty': true,
      'isSaving': false,
      'publishedAt': null,
      'hasUnpublishedChanges': false,
      'isPublishing': false,
      'siteUrl': 'http://ana-and-marco.localhost:3000',
      'onStartOver': vi.fn(),
      'onUnpublish': vi.fn(),
      ...state,
      'onUpdate:website': (next: EventWebsiteDraft) => wrapper.setProps({ website: next }),
    },
    attachTo: document.body,
  })
  await flushPromises()
  return wrapper
}

type Editor = Awaited<ReturnType<typeof mountEditor>>

const website = (wrapper: Editor) => wrapper.props('website') as EventWebsiteDraft
// Dialogs render outside the editor (teleported to the body)
const inBody = (selector: string) => document.body.querySelector<HTMLElement>(selector)
const buttonNamed = (wrapper: Editor, text: string) => wrapper.findAll('button').find(button => button.text().includes(text))!

async function settle() {
  await flushPromises()
  await new Promise(resolve => setTimeout(resolve, 0))
}

// The save bar's "More" menu (unpublish, start over)
async function chooseFromMoreMenu(wrapper: Editor, label: string) {
  await wrapper.find('button[aria-label="More website actions"]').trigger('keydown', { key: 'Enter' })
  await settle()
  ;[...document.body.querySelectorAll<HTMLElement>('[role="menuitem"]')].find(item => item.textContent?.trim() === label)!.click()
  await settle()
}

const confirmDialog = async (label: string) => {
  ;[...document.body.querySelectorAll<HTMLElement>('[role="dialog"] button')].find(button => button.textContent?.trim() === label)!.click()
  await settle()
}

async function addSection(wrapper: Editor, type: string) {
  await buttonNamed(wrapper, 'Add a section').trigger('click')
  await settle()
  inBody(`[data-add-section="${type}"]`)!.click()
  await settle()
  // Layouts load on demand
  await vi.waitFor(() => expect(wrapper.find('[data-preview-section] section').exists()).toBe(true))
}

describe('website editor', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('starts empty, offering each section type to add', async () => {
    const wrapper = await mountEditor()

    expect(wrapper.text()).toContain('Your page is empty')
    await buttonNamed(wrapper, 'Add a section').trigger('click')
    await settle()

    expect([...document.body.querySelectorAll('[data-add-section]')].map(el => el.getAttribute('data-add-section')))
      .toEqual(['hero', 'countdown'])
  })

  it('adds a hero with the event\'s details, shows it in the preview and opens its settings', async () => {
    const wrapper = await mountEditor()
    await addSection(wrapper, 'hero')

    expect(website(wrapper).sections).toHaveLength(1)
    expect(wrapper.find('[data-preview-section] h1').text()).toBe('Ana & Marco')
    expect(wrapper.find('[data-preview-section]').text()).toContain('Saturday, 12 June 2027')
    // Settings of the new section: its layout, background and text
    expect(wrapper.find('[data-change-layout]').text()).toContain('Full')
    expect(wrapper.find<HTMLInputElement>('input[placeholder="e.g. Ana & Marco"]').element.value).toBe('Ana & Marco')
  })

  it('updates the preview as the text is edited', async () => {
    const wrapper = await mountEditor()
    await addSection(wrapper, 'hero')

    await wrapper.find('input[placeholder="e.g. Ana & Marco"]').setValue('Ana & Marco Santos')

    expect(wrapper.find('[data-preview-section] h1').text()).toBe('Ana & Marco Santos')
  })

  it('changes the layout from the layout picker, keeping the text', async () => {
    const wrapper = await mountEditor()
    await addSection(wrapper, 'hero')

    await wrapper.find('[data-change-layout]').trigger('click')
    await settle()
    inBody('[data-layout="split"]')!.click()
    await settle()

    // Every layout supports the photo background, so it is kept
    expect(website(wrapper).sections[0]).toMatchObject({ layout: 'split', background: 'photo' })
    await vi.waitFor(() => expect(wrapper.find('[data-preview-section] h1').text()).toBe('Ana & Marco'))
    // Split shows one photo inside the layout: a photo field next to the background photo
    const photoLabels = wrapper.findAll('[data-photo-label]')
    expect(photoLabels.map(label => label.text())).toEqual(['Background photo', 'Photo'])
    // A single photo is already named by the "Photo" heading, so its label is for screen readers only
    expect(photoLabels[1]!.classes()).toContain('sr-only')
  })

  it('offers the background photo only on the photo background', async () => {
    const wrapper = await mountEditor()
    await addSection(wrapper, 'hero')

    // Full starts on the photo background
    expect(wrapper.text()).toContain('Background photo')
    await wrapper.findAll('[role="radio"], [data-state]').find(el => el.text() === 'Light')!.trigger('click')

    expect(website(wrapper).sections[0]!.background).toBe('light')
    expect(wrapper.text()).not.toContain('Background photo')
  })

  it('uploads a background photo and shows it in the section', async () => {
    uploadPhoto.mockResolvedValue({ data: { url: 'http://localhost:5180/uploads/events/5/a.jpg' } })
    const wrapper = await mountEditor()
    await addSection(wrapper, 'hero')

    const input = wrapper.find<HTMLInputElement>('[data-photo-input]')
    const file = new File(['photo'], 'beach.jpg', { type: 'image/jpeg' })
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')
    await settle()

    expect(uploadPhoto).toHaveBeenCalledWith(5, file)
    expect(website(wrapper).sections[0]!.content).toMatchObject({ backgroundPhoto: 'http://localhost:5180/uploads/events/5/a.jpg' })
    expect(wrapper.find('[data-preview-section] img').attributes('src')).toBe('http://localhost:5180/uploads/events/5/a.jpg')
  })

  it('does not upload a file that is not a photo', async () => {
    uploadPhoto.mockClear()
    const wrapper = await mountEditor()
    await addSection(wrapper, 'hero')

    const input = wrapper.find<HTMLInputElement>('[data-photo-input]')
    Object.defineProperty(input.element, 'files', { value: [new File(['<svg/>'], 'logo.svg', { type: 'image/svg+xml' })] })
    await input.trigger('change')
    await settle()

    expect(uploadPhoto).not.toHaveBeenCalled()
    expect(website(wrapper).sections[0]!.content).not.toHaveProperty('backgroundPhoto')
  })

  it('hides a section from guests, keeping it faded in the preview', async () => {
    const wrapper = await mountEditor()
    await addSection(wrapper, 'hero')

    await buttonNamed(wrapper, 'Shown').trigger('click')

    expect(website(wrapper).sections[0]!.isVisible).toBe(false)
    expect(wrapper.find('[data-preview-section] > div').classes()).toContain('opacity-40')
    expect(wrapper.text()).toContain('Hidden from guests')
  })

  it('lists the sections in order and reorders them from the keyboard', async () => {
    const hero = createWebsiteSection('hero', event)
    const countdown = createWebsiteSection('countdown', event)
    const wrapper = await mountEditor({ ...createBlankWebsite(), sections: [hero, countdown] })

    const rows = () => wrapper.findAll('[data-section-row]').map(row => row.text())
    expect(rows()[0]).toContain('Hero')
    expect(rows()[1]).toContain('Countdown')

    await wrapper.findAll('[data-section-handle]')[1]!.trigger('keydown', { key: 'ArrowUp' })

    expect(website(wrapper).sections.map(section => section.key)).toEqual([countdown.key, hero.key])
    expect(wrapper.findAll('[data-preview-section]').map(el => el.attributes('data-preview-section'))).toEqual([countdown.key, hero.key])
  })

  it('opens a section\'s settings when it is clicked in the preview, and goes back to the list', async () => {
    const hero = createWebsiteSection('hero', event)
    const wrapper = await mountEditor({ ...createBlankWebsite(), sections: [hero] })

    await wrapper.find('[data-preview-section]').trigger('click')
    expect(wrapper.find('[data-change-layout]').exists()).toBe(true)

    await wrapper.find('button[aria-label="All sections"]').trigger('click')
    expect(wrapper.find('[data-section-row]').exists()).toBe(true)
  })

  it('asks before starting over when the page has sections', async () => {
    const onStartOver = vi.fn()
    const wrapper = await mountEditor({ ...createBlankWebsite(), sections: [createWebsiteSection('hero', event)] }, { onStartOver })

    await chooseFromMoreMenu(wrapper, 'Start over')
    expect(onStartOver).not.toHaveBeenCalled()
    expect(inBody('[role="dialog"]')!.textContent).toContain('Your sections and style will be removed')

    await confirmDialog('Start over')
    expect(onStartOver).toHaveBeenCalledOnce()
  })

  it('starts over right away when the page is empty and not saved', async () => {
    const onStartOver = vi.fn()
    const wrapper = await mountEditor(createBlankWebsite(), { onStartOver })

    await chooseFromMoreMenu(wrapper, 'Start over')

    expect(onStartOver).toHaveBeenCalledOnce()
  })

  it('warns that starting over deletes a saved website, even an empty one', async () => {
    const onStartOver = vi.fn()
    const wrapper = await mountEditor(createBlankWebsite(), { isSaved: true, isDirty: false, onStartOver })

    await chooseFromMoreMenu(wrapper, 'Start over')

    expect(onStartOver).not.toHaveBeenCalled()
    expect(inBody('[role="dialog"]')!.textContent).toContain('Your saved website will be deleted')
  })

  it('warns that starting over takes a published website offline', async () => {
    const wrapper = await mountEditor(createBlankWebsite(), { isSaved: true, isDirty: false, publishedAt: '2026-10-28T00:00:00Z' })

    await chooseFromMoreMenu(wrapper, 'Start over')

    expect(inBody('[role="dialog"]')!.textContent).toContain('taken offline and deleted')
  })

  it('saves and discards from the save bar, only when there are changes', async () => {
    const wrapper = await mountEditor(createBlankWebsite(), { isSaved: true, isDirty: false })

    expect(wrapper.find('[data-save-status]').text()).toBe('All changes saved.')
    expect(wrapper.find('[data-save-bar]').classes()).toContain('bg-green-50')
    expect(buttonNamed(wrapper, 'Save changes').attributes('disabled')).toBeDefined()
    expect(buttonNamed(wrapper, 'Discard changes').attributes('disabled')).toBeDefined()

    await wrapper.setProps({ isDirty: true })
    expect(wrapper.find('[data-save-status]').text()).toBe('You have unsaved changes.')
    expect(wrapper.find('[data-save-bar]').classes()).toContain('bg-red-50')
    await buttonNamed(wrapper, 'Save changes').trigger('click')
    await buttonNamed(wrapper, 'Discard changes').trigger('click')

    expect(wrapper.emitted('save')).toHaveLength(1)
    expect(wrapper.emitted('discard')).toHaveLength(1)
  })

  it('cannot discard a website that was never saved', async () => {
    const wrapper = await mountEditor({ ...createBlankWebsite(), sections: [createWebsiteSection('hero', event)] })

    expect(wrapper.find('[data-save-status]').text()).toBe('Not saved yet. Save to keep your website.')
    expect(wrapper.find('[data-save-bar]').classes()).toContain('bg-red-50')
    expect(buttonNamed(wrapper, 'Save changes').attributes('disabled')).toBeUndefined()
    expect(buttonNamed(wrapper, 'Discard changes').attributes('disabled')).toBeDefined()
  })

  it('shows progress while saving', async () => {
    const wrapper = await mountEditor(createBlankWebsite(), { isSaved: true, isSaving: true })

    expect(buttonNamed(wrapper, 'Saving…').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button[aria-label="More website actions"]').attributes('disabled')).toBeDefined()
  })

  describe('publishing', () => {
    const withHero = () => ({ ...createBlankWebsite(), sections: [createWebsiteSection('hero', event)] })
    const publishButton = (wrapper: Editor) => wrapper.find('[data-publish]')

    it('publishes a website that was never published; the live site opens only once it is', async () => {
      const wrapper = await mountEditor(withHero(), { isSaved: true, isDirty: false })

      expect(wrapper.find('[data-publish-status]').text()).toBe('Not published')
      expect(buttonNamed(wrapper, 'View live site').attributes('disabled')).toBeDefined()
      expect(wrapper.find('[data-view-site]').exists()).toBe(false)
      expect(publishButton(wrapper).text()).toBe('Publish')

      await publishButton(wrapper).trigger('click')
      expect(wrapper.emitted('publish')).toHaveLength(1)
    })

    it('can publish unsaved changes (the tab saves them first)', async () => {
      const wrapper = await mountEditor(withHero())

      expect(publishButton(wrapper).attributes('disabled')).toBeUndefined()
    })

    it('shows a published website as live, opening it in a new tab, with nothing to publish', async () => {
      const wrapper = await mountEditor(withHero(), { isSaved: true, isDirty: false, publishedAt: '2026-10-28T00:00:00Z' })

      expect(wrapper.find('[data-publish-status]').text()).toBe('Live')
      expect(publishButton(wrapper).text()).toBe('Published')
      expect(publishButton(wrapper).attributes('disabled')).toBeDefined()
      const link = wrapper.find('[data-view-site]')
      expect(link.attributes('href')).toBe('http://ana-and-marco.localhost:3000')
      expect(link.attributes('target')).toBe('_blank')
    })

    it('offers to publish changes guests don\'t see yet, saved or not', async () => {
      const saved = await mountEditor(withHero(), { isSaved: true, isDirty: false, publishedAt: '2026-10-28T00:00:00Z', hasUnpublishedChanges: true })
      const unsaved = await mountEditor(withHero(), { isSaved: true, isDirty: true, publishedAt: '2026-10-28T00:00:00Z' })

      for (const wrapper of [saved, unsaved]) {
        expect(wrapper.find('[data-publish-status]').text()).toBe('Live · changes not published')
        expect(publishButton(wrapper).text()).toBe('Publish changes')
        expect(publishButton(wrapper).attributes('disabled')).toBeUndefined()
      }
    })

    it('cannot publish a page with no visible sections', async () => {
      const hidden = { ...createWebsiteSection('hero', event), isVisible: false }
      const wrapper = await mountEditor({ ...createBlankWebsite(), sections: [hidden] }, { isSaved: true, isDirty: false })

      expect(publishButton(wrapper).attributes('disabled')).toBeDefined()
      expect(publishButton(wrapper).attributes('title')).toBe('Add a visible section to publish')
    })

    it('shows progress while publishing', async () => {
      const wrapper = await mountEditor(withHero(), { isSaved: true, isPublishing: true })

      expect(publishButton(wrapper).text()).toBe('Publishing…')
      expect(publishButton(wrapper).attributes('disabled')).toBeDefined()
    })

    it('asks before unpublishing', async () => {
      const onUnpublish = vi.fn()
      const wrapper = await mountEditor(withHero(), { isSaved: true, isDirty: false, publishedAt: '2026-10-28T00:00:00Z', onUnpublish })

      await chooseFromMoreMenu(wrapper, 'Unpublish')
      expect(onUnpublish).not.toHaveBeenCalled()
      expect(inBody('[role="dialog"]')!.textContent).toContain('Guests will no longer see it')

      await confirmDialog('Unpublish')
      expect(onUnpublish).toHaveBeenCalledOnce()
    })

    it('only offers to unpublish a published website', async () => {
      const wrapper = await mountEditor(withHero(), { isSaved: true, isDirty: false })

      await wrapper.find('button[aria-label="More website actions"]').trigger('keydown', { key: 'Enter' })
      await settle()

      expect([...document.body.querySelectorAll('[role="menuitem"]')].map(item => item.textContent?.trim())).toEqual(['Start over'])
    })
  })
})
