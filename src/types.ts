export interface JournalEntry {
  id: string
  title: string
  subtitle: string
  content: string
  date: string // e.g. "30 oct 2026"
  createdAt: number // timestamp
  tags?: string[]
}

export type TabView = 'journal' | 'archive' | 'about'
