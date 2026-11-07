import { describe, expect, it } from 'vitest'
import { fieldNotes, hiddenFields, layoutFields, missingFields } from '~/features/sections/section.fields'

const timeline = { fields: ['eyebrow', 'heading', 'body', 'timeline'], required: ['timeline'], labels: { body: 'Intro (optional)' } }
const story = { fields: ['eyebrow', 'heading', 'body'] }

describe('section fields', () => {
  it('says which fields a layout shows and requires, and their label there', () => {
    const fields = layoutFields<'eyebrow' | 'heading' | 'body' | 'timeline' | 'timeline.photo'>(timeline)

    expect(fields.uses('timeline')).toBe(true)
    expect(fields.uses('timeline.photo')).toBe(false)
    expect(fields.requires('timeline')).toBe(true)
    expect(fields.requires('body')).toBe(false)
    expect(fields.label('body', 'Story')).toBe('Intro (optional)')
    expect(fields.label('heading', 'Heading')).toBe('Heading')
  })

  it('lists the required fields still empty: a list without items, or blank text', () => {
    expect(missingFields(timeline, { timeline: [] })).toEqual(['timeline'])
    expect(missingFields(timeline, { timeline: [{ heading: 'We met' }] })).toEqual([])
    expect(missingFields({ fields: ['body'], required: ['body'] }, { body: '   ' })).toEqual(['body'])
    expect(missingFields(story, {})).toEqual([])
  })

  it('lists the filled-in fields a layout doesn\'t show, not counting its items\' fields', () => {
    const all = ['eyebrow', 'heading', 'body', 'timeline', 'timeline.photo']

    expect(hiddenFields(all, story, { heading: 'Our story', timeline: [{ heading: 'We met' }] })).toEqual(['timeline'])
    expect(hiddenFields(all, story, { timeline: [] })).toEqual([])
    expect(hiddenFields(all, timeline, { timeline: [{ heading: 'We met' }] })).toEqual([])
  })

  it('words the notes with the type\'s field names: a list in one and many, text as itself', () => {
    const about = { fields: ['eyebrow', 'heading', 'body', 'timeline', 'timeline.photo'], fieldNames: { body: 'story', timeline: ['chapter', 'chapters'] as const } }

    expect(fieldNotes(about, timeline, { timeline: [] }).missing).toEqual(['This layout needs at least one chapter.'])
    expect(fieldNotes({ fields: ['body'], fieldNames: { body: 'message' } }, { fields: ['body'], required: ['body'] }, {}).missing)
      .toEqual(['This layout needs a message.'])
    expect(fieldNotes(about, story, { timeline: [{}, {}, {}] }).hidden).toEqual(['This layout doesn\'t show your 3 chapters. They\'re kept for layouts that do.'])
    expect(fieldNotes(about, story, { timeline: [{}] }).hidden).toEqual(['This layout doesn\'t show your chapter. It\'s kept for layouts that do.'])
    expect(fieldNotes(about, timeline, { timeline: [{}] })).toEqual({ missing: [], hidden: [] })
  })
})
