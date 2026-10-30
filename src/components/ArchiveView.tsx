import React, { useState, useMemo } from 'react'
import type { JournalEntry } from '../types'
import { ThoughtItem } from './ThoughtItem'

interface ArchiveViewProps {
  entries: JournalEntry[]
  onSelectEntry: (entry: JournalEntry) => void
  onExport: () => void
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void
  onResetDefaults: () => void
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  entries,
  onSelectEntry,
  onExport,
  onImport,
  onResetDefaults
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Collect all unique collections
  const allCategories = useMemo(() => {
    const set = new Set<string>()
    entries.forEach((e) => e.category && set.add(e.category))
    return Array.from(set)
  }, [entries])

  // Collect all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>()
    entries.forEach((e) => e.tags?.forEach((t) => set.add(t)))
    return Array.from(set)
  }, [entries])

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        entry.title.toLowerCase().includes(q) ||
        entry.subtitle?.toLowerCase().includes(q) ||
        entry.mood?.toLowerCase().includes(q) ||
        entry.category?.toLowerCase().includes(q) ||
        entry.content.toLowerCase().includes(q) ||
        entry.date.toLowerCase().includes(q)

      const matchesTag = !selectedTag || entry.tags?.includes(selectedTag)
      const matchesCategory = !selectedCategory || entry.category === selectedCategory

      return matchesSearch && matchesTag && matchesCategory
    })
  }, [entries, searchQuery, selectedTag, selectedCategory])

  // Total words
  const totalWords = useMemo(() => {
    return entries.reduce((acc, entry) => {
      const words = entry.content.trim().split(/\s+/).filter(Boolean).length
      return acc + words
    }, 0)
  }, [entries])

  return (
    <div className="pt-2 pb-32 animate-fade-in space-y-8">
      {/* Archive Header */}
      <div className="pb-6 border-b border-stone-200/70 dark:border-stone-800/80">
        <h1 className="text-3xl sm:text-4xl font-serif-title font-medium text-stone-900 dark:text-stone-100">
          archive & collections.
        </h1>
        <p className="text-xs font-mono-meta text-stone-400 dark:text-stone-500 mt-2">
          {entries.length} {entries.length === 1 ? 'thought' : 'thoughts'} recorded • {totalWords} words total
        </p>

        {/* Search Input */}
        <div className="mt-6">
          <input
            type="text"
            placeholder="Search thoughts, collections, dates, or ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 px-4 text-sm font-mono-meta bg-stone-100/60 dark:bg-stone-900/60 rounded-xl border border-stone-300/70 dark:border-stone-800/80 outline-none text-stone-800 dark:text-stone-200 placeholder:text-stone-400 shadow-2xs"
          />
        </div>

        {/* Collections filter */}
        {allCategories.length > 0 && (
          <div className="mt-5 space-y-1.5">
            <span className="text-[10px] font-mono-meta uppercase tracking-wider text-stone-400 block">
              collections
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1 rounded-full text-xs font-mono-meta cursor-pointer transition-colors ${
                  selectedCategory === null
                    ? 'bg-stone-800 text-stone-100 dark:bg-stone-200 dark:text-stone-900 font-medium'
                    : 'bg-stone-200/50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                all collections
              </button>
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  className={`px-3 py-1 rounded-full text-xs font-mono-meta cursor-pointer transition-colors ${
                    selectedCategory === cat
                      ? 'bg-stone-800 text-stone-100 dark:bg-stone-200 dark:text-stone-900 font-medium'
                      : 'bg-stone-200/50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tag pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-stone-200/40 dark:border-stone-800/40">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-mono-meta cursor-pointer transition-colors ${
                selectedTag === null
                  ? 'text-stone-900 dark:text-stone-100 font-medium underline underline-offset-4'
                  : 'text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              all tags
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-mono-meta cursor-pointer transition-colors ${
                  selectedTag === tag
                    ? 'bg-stone-700 text-stone-100 dark:bg-stone-300 dark:text-stone-900'
                    : 'text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <div className="py-16 text-center text-base font-serif-title italic text-stone-400">
          no thoughts match your search or filter.
        </div>
      ) : (
        <div className="divide-y-0">
          {filteredEntries.map((entry) => (
            <ThoughtItem
              key={entry.id}
              entry={entry}
              onClick={() => onSelectEntry(entry)}
            />
          ))}
        </div>
      )}

      {/* Backup & Management Tools */}
      <div className="pt-8 border-t border-stone-200/60 dark:border-stone-800/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono-meta text-stone-400">
        <div className="flex flex-wrap items-center gap-6">
          <button
            onClick={() => window.print()}
            className="hover:text-stone-800 dark:hover:text-stone-200 underline underline-offset-4 cursor-pointer flex items-center gap-1.5"
            title="Print all journal entries (book format)"
          >
            <span>🖨️</span>
            <span>print all entries</span>
          </button>
          <button
            onClick={onExport}
            className="hover:text-stone-800 dark:hover:text-stone-200 underline underline-offset-4 cursor-pointer"
          >
            export backup (.json)
          </button>
          <label className="hover:text-stone-800 dark:hover:text-stone-200 underline underline-offset-4 cursor-pointer">
            import backup
            <input
              type="file"
              accept=".json"
              onChange={onImport}
              className="hidden"
            />
          </label>
        </div>
        <button
          onClick={onResetDefaults}
          className="hover:text-stone-600 dark:hover:text-stone-300 cursor-pointer"
        >
          restore initial sample thoughts
        </button>
      </div>
    </div>
  )
}
