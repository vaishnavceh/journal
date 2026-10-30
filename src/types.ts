export interface JournalEntry {
  id: string
  title: string
  subtitle: string
  content: string
  date: string // e.g. "October 30, 2026"
  createdAt: number // timestamp
  tags?: string[]
  category?: string // collection name
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
