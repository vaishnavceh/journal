import React, { useEffect, useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import type { JournalEntry } from '../types'
import { calculateReadingTime } from '../utils/date'

interface ReaderViewProps {
  entry: JournalEntry
  onBack: () => void
  onEdit: (entry: JournalEntry) => void
  onDelete: (id: string) => void
}

interface SectionPage {
  id: string
  title: string
  content: string
  pageNumber: number
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  entry,
  onBack,
  onEdit,
  onDelete
}) => {
  const [currentPage, setCurrentPage] = useState(0)
  const [isBookMode, setIsBookMode] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Parse entry content into discrete section pages
  const pages: SectionPage[] = useMemo(() => {
    const rawLines = entry.content.split('\n')
    const sections: SectionPage[] = []

    let currentTitle = ''
    let currentBodyLines: string[] = []
    let sectionCount = 0

    // Check for prelude text before first heading
    let hasEncounteredFirstHeading = false
    const preludeLines: string[] = []

    for (const line of rawLines) {
      const headingMatch = line.match(/^###\s+(.*)/)
      if (headingMatch) {
        if (!hasEncounteredFirstHeading) {
          hasEncounteredFirstHeading = true
          if (preludeLines.join('').trim()) {
            sections.push({
              id: 'prelude',
              title: 'ആമുഖം (Introduction)',
              content: preludeLines.join('\n').trim(),
              pageNumber: 1
            })
            sectionCount++
          }
        } else {
          // Push previous section
          if (currentTitle) {
            sectionCount++
            sections.push({
              id: `sec-${sectionCount}`,
              title: currentTitle,
              content: currentBodyLines.join('\n').trim(),
              pageNumber: sectionCount
            })
          }
        }
        currentTitle = headingMatch[1].trim()
        currentBodyLines = []
      } else {
        if (!hasEncounteredFirstHeading) {
          preludeLines.push(line)
        } else {
          currentBodyLines.push(line)
        }
      }
    }

    // Push the final section
    if (currentTitle) {
      sectionCount++
      sections.push({
        id: `sec-${sectionCount}`,
        title: currentTitle,
        content: currentBodyLines.join('\n').trim(),
        pageNumber: sectionCount
      })
    }

    // If no ### headings were found, treat whole entry as 1 page
    if (sections.length === 0) {
      sections.push({
        id: 'full-entry',
        title: entry.title,
        content: entry.content.trim(),
        pageNumber: 1
      })
    }

    return sections
  }, [entry.content, entry.title])

  const totalPages = pages.length
  const currentSection = pages[currentPage] || pages[0]
  const isSectionMalayalam = /[\u0D00-\u0D7F]/.test(currentSection.title + currentSection.content)
  const isEntryMalayalam = /[\u0D00-\u0D7F]/.test(entry.title + (entry.subtitle || ''))

  // Keyboard navigation: Left/Right arrows for page flipping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack()
      } else if (isBookMode) {
        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
          if (currentPage < totalPages - 1) {
            e.preventDefault()
            setCurrentPage((p) => p + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          if (currentPage > 0) {
            e.preventDefault()
            setCurrentPage((p) => p - 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, totalPages, isBookMode, onBack])

  const handleCopy = () => {
    const fullText = `${entry.title}\n${entry.subtitle ? entry.subtitle + '\n\n' : '\n'}${entry.content}`
    navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeleteConfirm = () => {
    onDelete(entry.id)
    onBack()
  }

  const progressPercentage = Math.round(((currentPage + 1) / totalPages) * 100)

  return (
    <div className="w-full animate-fade-in pb-32">
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-stone-200 dark:bg-stone-800 z-50">
        <div
          className="h-full bg-stone-800 dark:bg-stone-200 transition-all duration-200"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Top Action & Navigation Header */}
      <header className="flex flex-wrap items-center justify-between pb-6 mb-8 border-b border-stone-200/70 dark:border-stone-800/80 gap-4">
        {/* Left: Exit button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono-meta text-stone-500 hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100 transition-colors cursor-pointer group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span>back to journal</span>
        </button>

        {/* Center: View Mode Toggle (Book Mode vs Continuous) */}
        {totalPages > 1 && (
          <div className="flex items-center border border-stone-200 dark:border-stone-800 rounded-lg p-0.5 text-xs font-mono-meta bg-stone-100/40 dark:bg-stone-900/40">
            <button
              onClick={() => setIsBookMode(true)}
              className={`px-3 py-1 rounded cursor-pointer transition-colors ${
                isBookMode
                  ? 'bg-stone-800 text-stone-100 dark:bg-stone-200 dark:text-stone-900 font-medium'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              📖 Page-by-Page
            </button>
            <button
              onClick={() => setIsBookMode(false)}
              className={`px-3 py-1 rounded cursor-pointer transition-colors ${
                !isBookMode
                  ? 'bg-stone-800 text-stone-100 dark:bg-stone-200 dark:text-stone-900 font-medium'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              📜 Continuous Scroll
            </button>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-4 text-xs font-mono-meta">
          <button
            onClick={handleCopy}
            className="text-stone-400 hover:text-stone-800 dark:text-stone-500 dark:hover:text-stone-300 transition-colors cursor-pointer"
          >
            {copied ? 'copied!' : 'copy'}
          </button>
          <button
            onClick={() => onEdit(entry)}
            className="text-stone-400 hover:text-stone-800 dark:text-stone-500 dark:hover:text-stone-300 transition-colors cursor-pointer"
          >
            edit
          </button>
          {isDeleting ? (
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-mono-meta text-[11px]">sure?</span>
              <button
                onClick={handleDeleteConfirm}
                className="text-red-600 hover:underline cursor-pointer"
              >
                delete
              </button>
              <button
                onClick={() => setIsDeleting(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsDeleting(true)}
              className="text-stone-400 hover:text-red-500 dark:text-stone-500 dark:hover:text-red-400 transition-colors cursor-pointer"
            >
              delete
            </button>
          )}
        </div>
      </header>

      {/* Main Entry Title & Subtitle Banner */}
      <div className="mb-10 text-center max-w-4xl mx-auto space-y-3">
        <div className="flex items-center justify-center gap-3 text-xs font-mono-meta text-stone-400 dark:text-stone-500">
          <span>{entry.date}</span>
          {entry.category && (
            <>
              <span>•</span>
              <span className="text-stone-500 dark:text-stone-400 font-medium">{entry.category}</span>
            </>
          )}
          <span>•</span>
          <span>{calculateReadingTime(entry.content)}</span>
          {entry.tags && entry.tags.length > 0 && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                {entry.tags.map((t) => (
                  <span key={t} className="text-stone-400 dark:text-stone-500">
                    #{t}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-title font-medium tracking-tight text-stone-900 dark:text-stone-100">
          {entry.title}
        </h1>

        {entry.subtitle && (
          <p className="text-xl sm:text-2xl font-serif-title italic text-stone-500 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
            &ldquo;{entry.subtitle}&rdquo;
          </p>
        )}
      </div>

      {/* Horizontal Chapter Jump Ribbon (When multi-page) */}
      {totalPages > 1 && isBookMode && (
        <div className="mb-10 pb-3 overflow-x-auto select-none border-b border-stone-200/60 dark:border-stone-800/60">
          <div className="flex items-center gap-2 min-w-max px-2">
            {pages.map((p, idx) => {
              const isActive = currentPage === idx
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setCurrentPage(idx)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono-meta cursor-pointer transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-semibold shadow-xs scale-105'
                      : 'border border-stone-200/80 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/30 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                  title={p.title}
                >
                  <span>§{idx + 1}</span>
                  <span className="truncate max-w-32">{p.title.replace(/^\d+[\.\s]*/, '')}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Content Canvas */}
      {isBookMode && totalPages > 1 ? (
        /* PAGE-BY-PAGE BOOK VIEW */
        <main className="max-w-4xl lg:max-w-5xl mx-auto">
          {/* Chapter Header */}
          <div className="mb-8 pb-4 border-b border-stone-200/70 dark:border-stone-800/80 flex items-center justify-between">
            <span className="text-xs font-mono-meta tracking-widest uppercase text-stone-400 dark:text-stone-500">
              SECTION {currentPage + 1} OF {totalPages}
            </span>
            <span className="text-xs font-mono-meta text-stone-400 dark:text-stone-500">
              Page {currentPage + 1} / {totalPages}
            </span>
          </div>

          {/* Section Title */}
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-serif-title font-medium text-stone-900 dark:text-stone-100 leading-snug mb-8 ${isSectionMalayalam ? 'font-malayalam' : ''}`}>
            {currentSection.title}
          </h2>

          {/* Section Body */}
          <div className={`prose dark:prose-invert max-w-none text-stone-800 dark:text-stone-200 font-light leading-relaxed ${isSectionMalayalam ? 'font-malayalam' : ''}`}>
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="text-lg sm:text-xl lg:text-[22px] leading-[2.1] my-5 text-stone-800 dark:text-stone-200 font-light">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-stone-950 dark:text-stone-50">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-stone-700 dark:text-stone-300">
                    {children}
                  </em>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-3 my-6 pl-6 list-disc marker:text-stone-400 text-lg sm:text-xl leading-[2]">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="space-y-3 my-6 pl-6 list-decimal marker:text-stone-400 text-lg sm:text-xl leading-[2] font-mono-meta">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-lg sm:text-xl leading-[2] text-stone-800 dark:text-stone-200">
                    {children}
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="pl-6 border-l-2 border-stone-400 dark:border-stone-600 italic text-stone-600 dark:text-stone-300 my-8 text-xl leading-relaxed">
                    {children}
                  </blockquote>
                ),
                hr: () => (
                  <hr className="my-10 border-stone-200/70 dark:border-stone-800/70" />
                )
              }}
            >
              {currentSection.content}
            </ReactMarkdown>
          </div>

          {/* Bottom Flip Navigation Buttons */}
          <nav className="mt-16 pt-8 border-t border-stone-200/80 dark:border-stone-800/80 flex flex-wrap items-center justify-between gap-4 select-none">
            {/* Previous Page */}
            {currentPage > 0 ? (
              <button
                onClick={() => {
                  setCurrentPage((p) => p - 1)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="flex items-center gap-3 py-3 px-5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100/60 dark:hover:bg-stone-800/60 text-stone-800 dark:text-stone-200 text-sm font-mono-meta transition-all cursor-pointer group shadow-2xs"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                <span className="truncate max-w-48 sm:max-w-64 text-left">
                  Previous: {pages[currentPage - 1].title.replace(/^\d+[\.\s]*/, '')}
                </span>
              </button>
            ) : (
              <div />
            )}

            {/* Indicator */}
            <div className="text-xs font-mono-meta text-stone-400 dark:text-stone-500 text-center">
              <div>Page {currentPage + 1} of {totalPages}</div>
              <div className="text-[10px] opacity-70">Use ← → arrow keys to flip</div>
            </div>

            {/* Next Page */}
            {currentPage < totalPages - 1 ? (
              <button
                onClick={() => {
                  setCurrentPage((p) => p + 1)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="flex items-center gap-3 py-3 px-5 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 hover:opacity-90 text-sm font-mono-meta transition-all cursor-pointer group shadow-2xs font-medium"
              >
                <span className="truncate max-w-48 sm:max-w-64 text-left">
                  Next: {pages[currentPage + 1].title.replace(/^\d+[\.\s]*/, '')}
                </span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            ) : (
              <button
                onClick={onBack}
                className="py-3 px-5 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-sm font-mono-meta transition-all cursor-pointer font-medium"
              >
                ✓ Finished Reading • Back to Journal
              </button>
            )}
          </nav>
        </main>
      ) : (
        /* WIDE CONTINUOUS SCROLL VIEW */
        <main className={`max-w-4xl lg:max-w-5xl mx-auto prose dark:prose-invert text-stone-800 dark:text-stone-200 font-light leading-relaxed ${isEntryMalayalam ? 'font-malayalam' : ''}`}>
          <ReactMarkdown
            components={{
              h3: ({ children }) => (
                <h3 className="text-2xl sm:text-3xl font-serif-title font-medium mt-16 mb-4 text-stone-900 dark:text-stone-100 border-b border-stone-200/50 dark:border-stone-800/50 pb-2">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-lg sm:text-xl lg:text-[22px] leading-[2.1] my-5 text-stone-800 dark:text-stone-200">
                  {children}
                </p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-stone-950 dark:text-stone-50">
                  {children}
                </strong>
              ),
              ul: ({ children }) => (
                <ul className="space-y-3 my-6 pl-6 list-disc marker:text-stone-400 text-lg sm:text-xl leading-[2]">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="text-lg sm:text-xl leading-[2] text-stone-800 dark:text-stone-200">
                  {children}
                </li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="pl-6 border-l-2 border-stone-400 dark:border-stone-600 italic text-stone-600 dark:text-stone-300 my-8 text-xl">
                  {children}
                </blockquote>
              ),
              hr: () => (
                <hr className="my-12 border-stone-200/70 dark:border-stone-800/70" />
              )
            }}
          >
            {entry.content}
          </ReactMarkdown>
        </main>
      )}
    </div>
  )
}
