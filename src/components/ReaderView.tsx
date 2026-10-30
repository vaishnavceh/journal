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

export const ReaderView: React.FC<ReaderViewProps> = ({
  entry,
  onBack,
  onEdit,
  onDelete
}) => {
  const [copied, setCopied] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack()
      }
    }
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handleScroll)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [onBack])

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

  // Extract headings for Table of Contents if available
  const tableOfContents = useMemo(() => {
    const lines = entry.content.split('\n')
    const headings: { id: string; title: string }[] = []
    lines.forEach((line) => {
      const match = line.match(/^###\s+(.*)/)
      if (match) {
        const title = match[1].trim()
        const id = 'heading-' + title.replace(/[^a-zA-Z0-9\u0D00-\u0D7F]/g, '-').slice(0, 30)
        headings.push({ id, title })
      }
    })
    return headings
  }, [entry.content])

  return (
    <article className="pt-2 pb-32 animate-fade-in relative">
      {/* Reading Progress Indicator */}
      <div
        className="fixed top-0 left-0 h-1 bg-stone-800 dark:bg-stone-200 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between pb-6 mb-8 border-b border-stone-200/60 dark:border-stone-800/60 gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono-meta text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors cursor-pointer group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span>back to thoughts</span>
        </button>

        <div className="flex items-center gap-5 text-xs font-mono-meta">
          <button
            onClick={handleCopy}
            className="text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-300 transition-colors cursor-pointer"
          >
            {copied ? 'copied!' : 'copy thought'}
          </button>
          <button
            onClick={() => onEdit(entry)}
            className="text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-300 transition-colors cursor-pointer"
          >
            edit in studio
          </button>
          {isDeleting ? (
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-mono-meta text-[11px]">confirm?</span>
              <button
                onClick={handleDeleteConfirm}
                className="text-red-600 hover:underline cursor-pointer"
              >
                yes, delete
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content Area */}
        <div className={tableOfContents.length > 3 ? 'lg:col-span-8' : 'lg:col-span-12'}>
          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs font-mono-meta text-stone-400 dark:text-stone-500 mb-4">
            <span>{entry.date}</span>
            <span>•</span>
            <span>{calculateReadingTime(entry.content)}</span>
            {entry.tags && entry.tags.length > 0 && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {entry.tags.map((t) => (
                    <span key={t} className="text-stone-400 dark:text-stone-500">
                      #{t}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-serif-title font-medium tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
            {entry.title}
          </h1>

          {/* Subtitle / Quote */}
          {entry.subtitle && (
            <p className="mt-4 text-xl sm:text-2xl font-serif-title italic text-stone-500 dark:text-stone-400 leading-relaxed">
              &ldquo;{entry.subtitle}&rdquo;
            </p>
          )}

          {/* Artistic Divider */}
          <div className="my-10 border-b border-stone-200/80 dark:border-stone-800/80" />

          {/* Markdown Content */}
          <div className="prose dark:prose-invert max-w-none text-stone-800 dark:text-stone-200 font-light leading-relaxed">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl sm:text-3xl font-serif-title font-medium mt-10 mb-4 text-stone-900 dark:text-stone-100">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl sm:text-2xl font-serif-title font-medium mt-8 mb-3 text-stone-900 dark:text-stone-100">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => {
                  const titleStr = String(children)
                  const id = 'heading-' + titleStr.replace(/[^a-zA-Z0-9\u0D00-\u0D7F]/g, '-').slice(0, 30)
                  return (
                    <h3
                      id={id}
                      className="text-xl sm:text-2xl font-serif-title font-medium mt-12 mb-3 text-stone-900 dark:text-stone-100 border-b border-stone-200/50 dark:border-stone-800/50 pb-2 scroll-mt-20"
                    >
                      {children}
                    </h3>
                  )
                },
                p: ({ children }) => (
                  <p className="text-lg sm:text-[19px] leading-[2] my-4 text-stone-800 dark:text-stone-200">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-stone-900 dark:text-stone-100">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-stone-700 dark:text-stone-300">
                    {children}
                  </em>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-2.5 my-5 pl-6 list-disc marker:text-stone-400">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="space-y-2.5 my-5 pl-6 list-decimal marker:text-stone-400 font-mono-meta text-sm">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-lg leading-[1.9] text-stone-800 dark:text-stone-200">
                    {children}
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="pl-5 border-l-2 border-stone-400 dark:border-stone-600 italic text-stone-600 dark:text-stone-300 my-6 text-lg">
                    {children}
                  </blockquote>
                ),
                hr: () => (
                  <hr className="my-10 border-stone-200/70 dark:border-stone-800/70" />
                )
              }}
            >
              {entry.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Table of Contents for Long Entries */}
        {tableOfContents.length > 3 && (
          <aside className="hidden lg:block lg:col-span-4 self-start sticky top-12 p-6 rounded-xl border border-stone-200/70 dark:border-stone-800/80 bg-stone-50/40 dark:bg-stone-900/30 text-xs font-mono-meta space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="tracking-widest uppercase text-[10px] font-semibold text-stone-400 dark:text-stone-500 pb-2 border-b border-stone-200/60 dark:border-stone-800/60">
              index ({tableOfContents.length} sections)
            </div>
            <nav className="space-y-1.5">
              {tableOfContents.map((h, i) => (
                <a
                  key={i}
                  href={`#${h.id}`}
                  className="block py-1 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors truncate"
                  title={h.title}
                >
                  {h.title}
                </a>
              ))}
            </nav>
          </aside>
        )}
      </div>
    </article>
  )
}
