import React from 'react'
import type { JournalEntry } from '../types'

interface ThoughtItemProps {
  entry: JournalEntry
  onClick: () => void
}

export const ThoughtItem: React.FC<ThoughtItemProps> = ({ entry, onClick }) => {
  return (
    <article
      onClick={onClick}
      className="group py-6 cursor-pointer select-none transition-colors"
    >
      <div className="flex items-center justify-between mb-1.5">
        <time className="text-xs font-mono-meta tracking-wider text-stone-400 dark:text-stone-500 lowercase">
          {entry.date}
        </time>
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex items-center gap-1.5">
            {entry.tags.slice(0, 2).map((t) => (
              <span key={t} className="text-[11px] font-mono-meta text-stone-400/80 dark:text-stone-600">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      <h3 className="text-xl sm:text-2xl font-serif-title font-medium tracking-tight text-stone-900 dark:text-stone-100 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors">
        {entry.title}
      </h3>

      {entry.subtitle && (
        <p className="mt-1.5 text-base sm:text-lg text-stone-500 dark:text-stone-400 font-light leading-relaxed">
          {entry.subtitle}
        </p>
      )}

      {/* Divider line matching wireframe */}
      <div className="mt-7 border-b border-stone-200/80 dark:border-stone-800/80 group-hover:border-stone-400 dark:group-hover:border-stone-600 transition-colors" />
    </article>
  )
}
