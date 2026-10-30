import React, { useMemo } from 'react'
import type { JournalEntry } from '../types'

interface ThoughtItemProps {
  entry: JournalEntry
  onClick: () => void
}

export const ThoughtItem: React.FC<ThoughtItemProps> = ({ entry, onClick }) => {
  // Extract a clean content preview snippet
  const previewSnippet = useMemo(() => {
    const cleaned = entry.content
      .replace(/###?\s+[^\n]+/g, '')
      .replace(/[*_#>`]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    return cleaned.slice(0, 150) + (cleaned.length > 150 ? '...' : '')
  }, [entry.content])

  const isMalayalam = /[\u0D00-\u0D7F]/.test(entry.content)

  return (
    <article
      onClick={onClick}
      className="group py-6 cursor-pointer select-none transition-colors"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono-meta text-stone-400 dark:text-stone-500">
          <time className="tracking-wider">{entry.date}</time>
          {entry.category && (
            <>
              <span>•</span>
              <span className="text-[11px] text-stone-600 dark:text-stone-400 font-medium">
                {entry.category}
              </span>
            </>
          )}
          {entry.mood && (
            <>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-meta bg-stone-200/70 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300">
                mood: {entry.mood.toLowerCase()}
              </span>
            </>
          )}
        </div>

        {entry.sort_order && (
          <span className="text-[11px] font-mono-meta text-stone-400/80 dark:text-stone-600">
            §{String(entry.sort_order).padStart(2, '0')}
          </span>
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

      {/* Short preview of the content */}
      {previewSnippet && (
        <p className={`mt-2.5 text-sm text-stone-600/90 dark:text-stone-400/90 line-clamp-2 leading-relaxed font-light ${isMalayalam ? 'font-malayalam' : ''}`}>
          {previewSnippet}
        </p>
      )}

      {/* Divider line matching wireframe */}
      <div className="mt-7 border-b border-stone-200/80 dark:border-stone-800/80 group-hover:border-stone-400 dark:group-hover:border-stone-600 transition-colors" />
    </article>
  )
}
