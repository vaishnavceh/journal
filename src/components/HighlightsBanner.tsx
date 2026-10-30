import React, { useState } from 'react'
import type { Highlight, JournalEntry } from '../types'
import { DEFAULT_HIGHLIGHTS } from '../data/highlights'

interface HighlightsBannerProps {
  onOpenEntryById: (entryId: string) => void
  entries: JournalEntry[]
}

export const HighlightsBanner: React.FC<HighlightsBannerProps> = ({
  onOpenEntryById
}) => {
  const [highlights] = useState<Highlight[]>(DEFAULT_HIGHLIGHTS)
  const [currentIndex, setCurrentIndex] = useState(() => {
    // Pick a random highlight on initial load
    return Math.floor(Math.random() * DEFAULT_HIGHLIGHTS.length)
  })
  const [isCopied, setIsCopied] = useState(false)
  const [showTranslation, setShowTranslation] = useState(true)

  const current = highlights[currentIndex]

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % highlights.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + highlights.length) % highlights.length)
  }

  const handleShuffle = () => {
    let nextIndex = Math.floor(Math.random() * highlights.length)
    while (nextIndex === currentIndex && highlights.length > 1) {
      nextIndex = Math.floor(Math.random() * highlights.length)
    }
    setCurrentIndex(nextIndex)
  }

  const handleCopy = () => {
    const textToCopy = `"${current.quote}"\n— ${current.context}`
    navigator.clipboard.writeText(textToCopy)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <section className="my-8 relative select-none">
      {/* Decorative Container */}
      <div className="relative overflow-hidden rounded-2xl border border-stone-300/80 dark:border-stone-800 bg-gradient-to-br from-stone-100/70 via-stone-50/50 to-stone-100/40 dark:from-stone-900/60 dark:via-stone-925/40 dark:to-stone-900/30 backdrop-blur-md p-6 sm:p-8 transition-all shadow-xs">
        {/* Subtle Watermark Quote Mark */}
        <div className="absolute -top-6 -right-3 text-8xl sm:text-9xl font-serif text-stone-200/50 dark:text-stone-800/40 pointer-events-none select-none font-italic leading-none">
          &rdquo;
        </div>

        {/* Top Meta Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200/60 dark:border-stone-800/60 text-xs font-mono-meta">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-700 dark:bg-stone-300 animate-pulse" />
            <span className="tracking-widest uppercase text-stone-500 dark:text-stone-400 font-medium text-[11px]">
              HIGHLIGHTED CONVICTIONS
            </span>
            <span className="text-stone-300 dark:text-stone-700 hidden sm:inline">•</span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 hidden sm:inline">
              #{current.tag}
            </span>
          </div>

          <div className="flex items-center gap-3 text-stone-400 dark:text-stone-500">
            <span className="text-[11px]">
              {currentIndex + 1} / {highlights.length}
            </span>
            <button
              onClick={handleShuffle}
              className="hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer text-xs"
              title="Shuffle to random highlight"
            >
              🔀
            </button>
          </div>
        </div>

        {/* Quote Content */}
        <div className="relative py-2">
          <blockquote className="text-xl sm:text-2xl font-serif-title font-normal leading-[1.8] sm:leading-[1.9] text-stone-900 dark:text-stone-100 tracking-tight transition-all">
            &ldquo;{current.quote}&rdquo;
          </blockquote>

          {/* Translation / Parallel Reflection */}
          {current.translation && showTranslation && (
            <p className="mt-3 text-sm sm:text-base font-serif italic text-stone-500 dark:text-stone-400 leading-relaxed pl-3 border-l-2 border-stone-300 dark:border-stone-700">
              {current.translation}
            </p>
          )}
        </div>

        {/* Bottom Actions & Source Link */}
        <div className="mt-6 pt-4 border-t border-stone-200/60 dark:border-stone-800/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono-meta">
          {/* Source Entry Link */}
          <button
            onClick={() => onOpenEntryById(current.entryId)}
            className="flex items-center gap-1.5 text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100 transition-colors cursor-pointer group text-left"
            title="Jump to source entry"
          >
            <span className="text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300">from</span>
            <span className="underline underline-offset-4 font-medium">{current.context}</span>
            <span className="group-hover:translate-x-0.5 transition-transform text-[10px]">→</span>
          </button>

          {/* Controls: Prev, Next, Copy */}
          <div className="flex items-center gap-3">
            {current.translation && (
              <button
                onClick={() => setShowTranslation((prev) => !prev)}
                className="text-[11px] text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-300 cursor-pointer hidden sm:inline"
              >
                {showTranslation ? 'hide meaning' : 'show meaning'}
              </button>
            )}

            <button
              onClick={handleCopy}
              className="text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-300 transition-colors cursor-pointer px-2 py-1 rounded"
              title="Copy quote"
            >
              {isCopied ? 'copied!' : 'copy'}
            </button>

            <div className="flex items-center border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden bg-white/40 dark:bg-stone-900/40">
              <button
                onClick={handlePrev}
                className="px-2.5 py-1 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer"
                title="Previous highlight"
              >
                ←
              </button>
              <span className="w-px h-3 bg-stone-200 dark:bg-stone-800" />
              <button
                onClick={handleNext}
                className="px-2.5 py-1 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer"
                title="Next highlight"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
