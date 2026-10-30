export interface JournalEntry {
  id: string
  title: string
  subtitle?: string
  content: string
  date: string // e.g. "October 31, 2026"
  createdAt: number // timestamp
  mood?: string // e.g. "Motivated", "Determined", etc.
  category?: string // e.g. "Personal Growth", "Health & Fitness", etc.
  collection?: string // e.g. "MISSION 2027"
  sort_order?: number // dedicated 1-16 sort sequence
  tags?: string[]
}

export interface CollectionInfo {
  name: string
  subtitle: string
  startingDate: string
  firstMilestone: string
  majorMilestone: string
  longTermVision: string
}

export const MISSION_2027_COLLECTION: CollectionInfo = {
  name: 'MISSION 2027',
  subtitle: 'Becoming a Better Version of Myself',
  startingDate: 'October 31, 2026',
  firstMilestone: 'December 31, 2026',
  majorMilestone: 'March 31, 2027',
  longTermVision: 'December 31, 2027'
}

export interface Highlight {
  id: string
  quote: string
  context: string
  entryId: string
  date: string
  translation?: string
  tag: string
}

export type TabView = 'journal' | 'archive' | 'about'
