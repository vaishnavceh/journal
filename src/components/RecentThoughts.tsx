import React from 'react'
import type { JournalEntry } from '../types'
import { ThoughtItem } from './ThoughtItem'

interface RecentThoughtsProps {
  entries: JournalEntry[]
  onSelectEntry: (entry: JournalEntry) => void
  onWriteNew: () => void
}

export const RecentThoughts: React.FC<RecentThoughtsProps> = ({
  entries,
  onSelectEntry,
  onWriteNew
}) => {
  return (
    <section className="pt-6 pb-20">
      <div className="flex items-center justify-between pb-2 mb-2">
        <h2 className="text-xs font-mono-meta tracking-widest uppercase text-stone-400 dark:text-stone-500 font-medium">
          RECENT THOUGHTS
        </h2>
        {entries.length > 0 && (
          <span className="text-[11px] font-mono-meta text-stone-400 dark:text-stone-600">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-lg my-4">
          <p className="text-sm text-stone-500 dark:text-stone-400 font-serif-title italic">
            no thoughts written down yet.
          </p>
          <button
            onClick={onWriteNew}
            className="mt-3 text-xs font-mono-meta text-stone-600 dark:text-stone-300 underline underline-offset-4 hover:opacity-80 cursor-pointer"
          >
            + write your first thought
          </button>
        </div>
      ) : (
        <div className="divide-y-0">
          {entries.map((entry) => (
            <ThoughtItem
              key={entry.id}
              entry={entry}
              onClick={() => onSelectEntry(entry)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
