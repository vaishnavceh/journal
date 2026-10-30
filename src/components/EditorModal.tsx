import React, { useState, useEffect } from 'react'
import type { JournalEntry } from '../types'
import { formatEntryDate } from '../utils/date'

interface EditorModalProps {
  initialEntry?: JournalEntry | null
  isOpen: boolean
  onClose: () => void
  onSave: (entry: Omit<JournalEntry, 'id' | 'createdAt'> & { id?: string }) => void
}

export const EditorModal: React.FC<EditorModalProps> = ({
  initialEntry,
  isOpen,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [content, setContent] = useState('')
  const [date, setDate] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  useEffect(() => {
    if (initialEntry) {
      setTitle(initialEntry.title)
      setSubtitle(initialEntry.subtitle || '')
      setContent(initialEntry.content)
      setDate(initialEntry.date)
      setTagsInput(initialEntry.tags?.join(', ') || '')
    } else {
      // Check for saved draft in localStorage
      const draft = localStorage.getItem('vaishh_journal_draft')
      if (draft) {
        try {
          const parsed = JSON.parse(draft)
          setTitle(parsed.title || '')
          setSubtitle(parsed.subtitle || '')
          setContent(parsed.content || '')
          setDate(parsed.date || formatEntryDate())
          setTagsInput(parsed.tagsInput || '')
        } catch {
          setDate(formatEntryDate())
        }
      } else {
        setTitle('')
        setSubtitle('')
        setContent('')
        setDate(formatEntryDate())
        setTagsInput('')
      }
    }
  }, [initialEntry, isOpen])

  // Save draft for new entries
  useEffect(() => {
    if (!initialEntry && isOpen) {
      const draft = { title, subtitle, content, date, tagsInput }
      localStorage.setItem('vaishh_journal_draft', JSON.stringify(draft))
    }
  }, [title, subtitle, content, date, tagsInput, initialEntry, isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleSubmit()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, title, subtitle, content, date, tagsInput])

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!title.trim() && !content.trim()) return

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter(Boolean)

    onSave({
      id: initialEntry?.id,
      title: title.trim() || 'Untitled Thought',
      subtitle: subtitle.trim(),
      content: content.trim(),
      date: date.trim() || formatEntryDate(),
      tags
    })

    if (!initialEntry) {
      localStorage.removeItem('vaishh_journal_draft')
    }
    onClose()
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/40 dark:bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[var(--bg-primary)] border border-stone-300 dark:border-stone-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/70 dark:border-stone-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-meta text-stone-400 dark:text-stone-500">
              {initialEntry ? 'edit thought' : 'new thought'}
            </span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs font-mono-meta text-stone-500 dark:text-stone-400 bg-transparent outline-none hover:text-stone-700 dark:hover:text-stone-200 w-28"
              title="Edit entry date"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono-meta text-stone-400 dark:text-stone-500 hidden sm:inline">
              {wordCount} words
            </span>
            <button
              onClick={onClose}
              className="text-xs font-mono-meta text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-300 px-2 py-1 cursor-pointer"
            >
              cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() && !content.trim()}
              className="text-xs font-mono-meta bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 hover:opacity-90 px-3 py-1.5 rounded-md disabled:opacity-40 transition-opacity cursor-pointer font-medium"
            >
              save thought
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Title */}
          <div>
            <input
              type="text"
              placeholder="Title (e.g. Mission 2027)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="w-full text-2xl sm:text-3xl font-serif-title font-medium bg-transparent outline-none text-stone-900 dark:text-stone-100 placeholder:text-stone-400/60 dark:placeholder:text-stone-600"
            />
          </div>

          {/* Subtitle / Quote Preview */}
          <div>
            <input
              type="text"
              placeholder="Subtitle / preview quote (e.g. my life, my thoughts, my journey.)"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full text-sm sm:text-base font-serif-title italic bg-transparent outline-none text-stone-600 dark:text-stone-400 placeholder:text-stone-400/50 dark:placeholder:text-stone-600"
            />
          </div>

          <div className="border-b border-stone-200/60 dark:border-stone-800/60 my-2" />

          {/* Main Body */}
          <div>
            <textarea
              placeholder="Write your thought freely here... 

- Use dashes for bullet points
- Use > for quotes
- Press Ctrl + Enter to save"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full bg-transparent outline-none text-stone-800 dark:text-stone-200 text-base leading-relaxed placeholder:text-stone-400/40 dark:placeholder:text-stone-600 resize-none font-light"
            />
          </div>

          {/* Tags */}
          <div className="pt-2 border-t border-stone-200/50 dark:border-stone-800/50 flex items-center gap-2">
            <span className="text-xs font-mono-meta text-stone-400 dark:text-stone-500">
              tags:
            </span>
            <input
              type="text"
              placeholder="goals, thoughts, life (comma separated)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full text-xs font-mono-meta bg-transparent outline-none text-stone-600 dark:text-stone-300 placeholder:text-stone-400/40 dark:placeholder:text-stone-600"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
