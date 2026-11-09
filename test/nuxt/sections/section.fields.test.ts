import { describe, expect, it } from 'vitest'
import { layoutFields, missingFields, missingNotes } from '~/features/sections/section.fields'

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

  it('words the missing notes with the type\'s field names: a list by its item, text as itself', () => {
    const about = { fieldNames: { body: 'story', timeline: ['chapter', 'chapters'] as const } }

    expect(missingNotes(about, timeline, { timeline: [] })).toEqual(['This layout needs at least one chapter.'])
    expect(missingNotes({ fieldNames: { body: 'message' } }, { fields: ['body'], required: ['body'] }, {})).toEqual(['This layout needs a message.'])
    expect(missingNotes({ fieldNames: { attire: 'attire motif' } }, { fields: ['attire'], required: ['attire'] }, {})).toEqual(['This layout needs an attire motif.'])
    expect(missingNotes(about, timeline, { timeline: [{}] })).toEqual([])
    expect(missingNotes(about, story, { timeline: [] })).toEqual([])
  })
})
