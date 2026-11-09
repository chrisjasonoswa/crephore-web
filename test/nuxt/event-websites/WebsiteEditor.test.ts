import type { EventWebsiteDraft } from '~/features/event-websites/event-website.type'
import type { Event } from '~/features/events/event.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createBlankWebsite, createWebsiteSection } from '~/features/event-websites/event-website'
import WebsiteEditor from '~/pages/(dashboard)/dashboard/events/[id]/_components/website/WebsiteEditor.vue'
import { toastAndAlertStyles } from '~/utils/styles/toast-and-alert'

const { uploadPhoto } = vi.hoisted(() => ({ uploadPhoto: vi.fn() }))
vi.mock('~/features/media/media.api', () => ({ uploadPhoto }))

const event = {
  id: 5,
  name: 'Ana & Marco',
  type: 'Wedding',
  venueName: 'Manila Cathedral',
  startsAt: '2027-06-12T07:00:00Z',
  endsAt: '2027-06-12T13:00:00Z',
  timezone: 'Asia/Manila',
  bornOn: null,
  diedOn: null,
  subdomain: 'ana-and-marco',
  createdAt: '2026-10-01T00:00:00Z',
  access: ['Owner'],
  eventGroup: null,
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

// The event's saved program (the Program tab's), as the program sections show it
const program = { venue: 'Manila Cathedral', items: [
  { id: 'item-1', date: '2027-06-12', startTime: '15:00', endTime: '16:00', title: 'Ceremony' },
  { id: 'item-2', date: '2027-06-12', startTime: '18:00', title: 'Dinner', venue: 'Grand Ballroom' },
] }

// Mounted like the Website tab uses it: the editor's website changes are fed back in
async function mountEditor(website: EventWebsiteDraft = createBlankWebsite(), state: SaveState = {}) {
  const wrapper = await mountSuspended(WebsiteEditor, {
    props: {
      'event': event,
      'program': program,
      'venues': [],
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

const pressEscape = async () => {
  document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  await settle()
}

// Adds a section and keeps its first layout (closes the layout picker that opens after adding)
async function addSection(wrapper: Editor, type: string) {
  await buttonNamed(wrapper, 'Add a section').trigger('click')
  await settle()
  inBody(`[data-add-section="${type}"]`)!.click()
  await settle()
  await pressEscape()
  // Layouts load on demand
  await vi.waitFor(() => expect(wrapper.find('[data-preview-section] section').exists()).toBe(true))
}

describe('website editor', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('one hero per page', () => {
    const sectionMenuItem = async (wrapper: Editor, typeName: string, label: string) => {
      await wrapper.find(`button[aria-label="More actions for ${typeName}"]`).trigger('keydown', { key: 'Enter' })
      await settle()
      return [...document.body.querySelectorAll<HTMLElement>('[role="menuitem"]')].find(item => item.textContent?.trim() === label)!
    }

    it('cannot save or publish without a hero, saying why', async () => {
      const countdown = createWebsiteSection('countdown', event)
      const wrapper = await mountEditor({ ...createBlankWebsite(), sections: [countdown] }, { isSaved: true, isDirty: true })

      expect(wrapper.find('[data-save-status]').text()).toBe('Add a hero section: every website needs one.')
      expect(wrapper.find('[data-save-bar]').classes()).toContain('bg-red-50')
      expect(buttonNamed(wrapper, 'Save changes').attributes('disabled')).toBeDefined()
      expect(wrapper.find('[data-publish]').attributes('disabled')).toBeDefined()
      expect(wrapper.find('[data-publish]').attributes('title')).toBe('Add a hero section: every website needs one.')

      await addSection(wrapper, 'hero')
      expect(wrapper.find('[data-save-status]').text()).toBe('You have unsaved changes.')
      expect(buttonNamed(wrapper, 'Save changes').attributes('disabled')).toBeUndefined()
      expect(wrapper.find('[data-publish]').attributes('disabled')).toBeUndefined()
    })

    it('counts a hidden hero as the page\'s hero', async () => {
      const hero = { ...createWebsiteSection('hero', event), isVisible: false }
      const wrapper = await mountEditor({ ...createBlankWebsite(), sections: [hero, createWebsiteSection('countdown', event)] }, { isSaved: true, isDirty: true })

      expect(wrapper.find('[data-save-status]').text()).toBe('You have unsaved changes.')
      expect(buttonNamed(wrapper, 'Save changes').attributes('disabled')).toBeUndefined()
    })

    it('does not offer another hero once the page has one', async () => {
      const wrapper = await mountEditor({ ...createBlankWebsite(), sections: [createWebsiteSection('hero', event)] })

      await buttonNamed(wrapper, 'Add a section').trigger('click')
      await settle()

      expect(inBody('[data-add-section="hero"]')!.hasAttribute('disabled')).toBe(true)
      expect(inBody('[data-add-section="hero"]')!.textContent).toContain('Your page already has its hero')
      expect(inBody('[data-add-section="countdown"]')!.hasAttribute('disabled')).toBe(false)
      inBody('[data-add-section="hero"]')!.click()
      await settle()
      expect(website(wrapper).sections).toHaveLength(1)
    })

    it('cannot duplicate the hero', async () => {
      const wrapper = await mountEditor({ ...createBlankWebsite(), sections: [createWebsiteSection('hero', event), createWebsiteSection('countdown', event)] })

      expect((await sectionMenuItem(wrapper, 'Hero', 'Duplicate')).hasAttribute('data-disabled')).toBe(true)
    })

    it('can still duplicate other sections', async () => {
      const wrapper = await mountEditor({ ...createBlankWebsite(), sections: [createWebsiteSection('hero', event), createWebsiteSection('countdown', event)] })

      expect((await sectionMenuItem(wrapper, 'Countdown', 'Duplicate')).hasAttribute('data-disabled')).toBe(false)
    })

    it('asks for a new hero after the hero is deleted', async () => {
      const wrapper = await mountEditor({ ...createBlankWebsite(), sections: [createWebsiteSection('hero', event), createWebsiteSection('countdown', event)] }, { isSaved: true })

      ;(await sectionMenuItem(wrapper, 'Hero', 'Delete')).click()
      await settle()
      await confirmDialog('Delete')

      expect(website(wrapper).sections.map(section => section.type)).toEqual(['countdown'])
      expect(wrapper.find('[data-save-status]').text()).toBe('Add a hero section: every website needs one.')
    })
  })

  it('starts empty, offering each section type to add', async () => {
    const wrapper = await mountEditor()

    expect(wrapper.text()).toContain('Your page is empty')
    await buttonNamed(wrapper, 'Add a section').trigger('click')
    await settle()

    expect([...document.body.querySelectorAll('[data-add-section]')].map(el => el.getAttribute('data-add-section')))
      .toEqual(['hero', 'countdown', 'message', 'about', 'people', 'program', 'dress-code'])
  })

  it('adds a hero with the event\'s details, shows it in the preview and opens its settings', async () => {
    const wrapper = await mountEditor()
    await addSection(wrapper, 'hero')

    expect(website(wrapper).sections).toHaveLength(1)
    expect(wrapper.find('[data-preview-section] h1').text()).toBe('Ana & Marco')
    expect(wrapper.find('[data-preview-section]').text()).toContain('Saturday, 12 June 2027')
    expect(wrapper.find('[data-preview-section]').text()).toContain('Manila Cathedral')
    // Settings of the new section: its layout, background and text; the event's details are shown as text, not fields
    expect(wrapper.find('[data-change-layout]').text()).toContain('Full')
    const eventFields = wrapper.find('[data-event-fields]')
    expect(eventFields.find('[role="note"]').text()).toBe('Heading, date and place are from the event details. Click here to edit event details')
    expect(eventFields.find('[role="note"] a').text()).toBe('Click here to edit event details')
    // In the shared info style, like the app's other alerts and toasts
    expect(eventFields.find('[role="note"]').classes()).toEqual(expect.arrayContaining(toastAndAlertStyles.info.container.split(' ')))
    expect(eventFields.find('[role="note"]').classes()).not.toContain('bg-card')
    expect(eventFields.findAll('dt').map(dt => dt.text())).toEqual(['Heading', 'Date', 'Place'])
    expect(eventFields.findAll('dd').map(dd => dd.text())).toEqual(['Ana & Marco', 'Saturday, 12 June 2027', 'Manila Cathedral'])
    expect(eventFields.find('input').exists()).toBe(false)
    // Never saved with the section: they come from the event
    expect(website(wrapper).sections[0]!.content).not.toHaveProperty('heading')
  })

  it('shows the event\'s program in a program section, faded with a note while it has no items', async () => {
    const wrapper = await mountEditor({ ...createBlankWebsite(), sections: [createWebsiteSection('hero', event), createWebsiteSection('program', event)] })
    const programPreview = () => wrapper.findAll('[data-preview-section]')[1]!

    await vi.waitFor(() => expect(programPreview().text()).toContain('Ceremony'))
    expect(programPreview().text()).toContain('Dinner')
    expect(programPreview().find('[data-program-overall-venue]').text()).toContain('Manila Cathedral')
    // Never saved with the section
    expect(website(wrapper).sections[1]!.content).toEqual({ eyebrow: 'The day', heading: 'Program', venuesHeading: 'Getting there', layoutPhotos: [] })

    await wrapper.setProps({ program: { items: [] } })
    expect(programPreview().text()).toContain('Program and venue · No schedule yet')
    expect(programPreview().find('.opacity-40').exists()).toBe(true)
  })

  it('updates the preview as the text is edited', async () => {
    const wrapper = await mountEditor()
    await addSection(wrapper, 'hero')

    await wrapper.find('input[placeholder="e.g. Together with their families"]').setValue('With joy')

    expect(website(wrapper).sections[0]!.content).toMatchObject({ eyebrow: 'With joy' })
    expect(wrapper.find('[data-preview-section]').text()).toContain('With joy')
  })

  it('heads the countdown with the event\'s name until the host writes a heading, and with no heading again when emptied', async () => {
    const wrapper = await mountEditor({ ...createBlankWebsite(), sections: [createWebsiteSection('hero', event)] })
    await addSection(wrapper, 'countdown')
    const headings = () => wrapper.findAll('[data-preview-section] h2').map(h2 => h2.text())
    const field = () => wrapper.find('[data-countdown-heading] input')

    await vi.waitFor(() => expect(headings()).toContain('Ana & Marco'))
    expect(field().attributes('placeholder')).toBe('Ana & Marco')
    expect(wrapper.find('[data-event-fields]').exists()).toBe(false)

    await field().setValue('Join us as we begin our life together')
    expect(website(wrapper).sections[1]!.content).toMatchObject({ heading: 'Join us as we begin our life together' })
    await vi.waitFor(() => expect(headings()).toContain('Join us as we begin our life together'))

    await field().setValue('')
    expect(website(wrapper).sections[1]!.content).toMatchObject({ heading: undefined })
  })

  it('adds a message with a generic signature and edits its message', async () => {
    const wrapper = await mountEditor()
    await addSection(wrapper, 'message')

    expect(wrapper.find('[data-preview-section] [data-message-signature]').text()).toBe('With love, from us')
    await wrapper.find('textarea').setValue('Thank you for coming.\nSee you there!')

    expect(website(wrapper).sections[0]!.content).toMatchObject({ body: 'Thank you for coming.\nSee you there!' })
    expect(wrapper.find('[data-preview-section] [data-message-body]').text()).toContain('Thank you for coming.')
  })

  it('asks for the layout right after a section is added', async () => {
    const wrapper = await mountEditor({ ...createBlankWebsite(), sections: [createWebsiteSection('hero', event)] })
    await buttonNamed(wrapper, 'Add a section').trigger('click')
    await settle()
    inBody('[data-add-section="countdown"]')!.click()
    await settle()

    const dialog = inBody('[role="dialog"]')!
    expect(dialog.textContent).toContain('Choose a countdown layout')
    expect(dialog.textContent).toContain('Pick how your new section looks')
    // The section is already there with the first layout, picked by default
    expect(website(wrapper).sections.map(section => section.layout)).toEqual(['fullscreen', 'boxes'])
    expect(inBody('[data-layout="boxes"]')!.getAttribute('aria-pressed')).toBe('true')

    inBody('[data-layout="rings"]')!.click()
    await settle()

    expect(website(wrapper).sections[1]!.layout).toBe('rings')
    expect(inBody('[role="dialog"]')).toBeNull()
  })

  it('keeps the first layout when the picker is closed, and later offers it with the usual wording', async () => {
    const wrapper = await mountEditor()
    await addSection(wrapper, 'hero')

    expect(inBody('[role="dialog"]')).toBeNull()
    expect(website(wrapper).sections[0]!.layout).toBe('fullscreen')

    await wrapper.find('[data-change-layout]').trigger('click')
    await settle()
    expect(inBody('[role="dialog"]')!.textContent).toContain('only the arrangement changes')
    expect(inBody('[role="dialog"]')!.textContent).not.toContain('Pick how your new section looks')
  })

  it('changes the layout from the layout picker, keeping the text', async () => {
    const wrapper = await mountEditor()
    await addSection(wrapper, 'hero')

    await wrapper.find('[data-change-layout]').trigger('click')
    await settle()
    inBody('[data-layout="split"]')!.click()
    await settle()

    // Full starts on the photo; Split has its own photo, so it starts on light
    expect(website(wrapper).sections[0]).toMatchObject({ layout: 'split', background: 'light' })
    await vi.waitFor(() => expect(wrapper.find('[data-preview-section] h1').text()).toBe('Ana & Marco'))
    // Split shows one photo inside the layout: one photo field (no background photo on light)
    const photoLabels = wrapper.findAll('[data-photo-label]')
    expect(photoLabels.map(label => label.text())).toEqual(['Photo'])
    // A single photo is already named by the "Photo" heading, so its label is for screen readers only
    expect(photoLabels[0]!.classes()).toContain('sr-only')
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

  it('keeps the Sections and Style tabs, and an open section\'s title row under them, in view while the panel scrolls', async () => {
    const wrapper = await mountEditor({ ...createBlankWebsite(), sections: [createWebsiteSection('hero', event)] })
    // Under the app's sticky header while the page scrolls; at the panel's top from xl, where the panel scrolls itself
    expect(wrapper.find('[data-editor-tabs]').classes()).toEqual(expect.arrayContaining(['sticky', 'top-16', 'xl:top-0', 'h-16', 'bg-card']))

    await wrapper.find('[data-preview-section]').trigger('click')
    const title = wrapper.find('[data-section-title]')
    expect(title.classes()).toEqual(expect.arrayContaining(['sticky', 'top-32', 'xl:top-16', 'bg-card']))
    expect(title.text()).toContain('Hero')
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
    const wrapper = await mountEditor({ ...createBlankWebsite(), sections: [createWebsiteSection('hero', event)] }, { isSaved: true, isDirty: false })

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
      expect(buttonNamed(wrapper, 'View website').attributes('disabled')).toBeDefined()
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
