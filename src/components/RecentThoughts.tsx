import React from 'react'
import type { JournalEntry } from '../types'
import { MISSION_2027_COLLECTION } from '../types'
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
      {/* Quiet, Minimal Collection Overview */}
      <div className="mb-8 p-5 sm:p-6 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 bg-stone-100/50 dark:bg-stone-900/40 select-none">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-meta text-stone-400 dark:text-stone-500 mb-2">
          <span className="uppercase tracking-widest font-semibold text-stone-700 dark:text-stone-300">
            {MISSION_2027_COLLECTION.name}
          </span>
          <div className="flex items-center gap-3">
            <span>Started {MISSION_2027_COLLECTION.startingDate}</span>
            <span>•</span>
            <button
              onClick={() => window.print()}
              className="hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer flex items-center gap-1 transition-colors text-stone-600 dark:text-stone-400 font-medium"
              title="Print all journal entries (book layout)"
            >
              <span>🖨️</span>
              <span>print journal</span>
            </button>
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-serif-title font-medium text-stone-900 dark:text-stone-100">
          {MISSION_2027_COLLECTION.subtitle}
        </h2>
        <div className="mt-4 pt-3 border-t border-stone-200/60 dark:border-stone-800/60 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-mono-meta text-stone-500 dark:text-stone-400">
          <span>Dec 31, 2026 • Foundation</span>
          <span className="text-stone-300 dark:text-stone-700">•</span>
          <span className="text-stone-800 dark:text-stone-200 font-medium">Mar 31, 2027 • Major Checkpoint</span>
          <span className="text-stone-300 dark:text-stone-700">•</span>
          <span>Dec 31, 2027 • Long-Term Vision</span>
        </div>
      </div>

      <div className="flex items-center justify-between pb-2 mb-2">
        <h2 className="text-xs font-mono-meta tracking-widest uppercase text-stone-400 dark:text-stone-500 font-medium">
          RECENT THOUGHTS & REFLECTIONS
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
