import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import type { JournalEntry } from '../types'
import { formatEntryDate, calculateReadingTime } from '../utils/date'
import { audioManager } from '../audio/audioManager'

interface FullPageEditorProps {
  initialEntry?: JournalEntry | null
  isOpen: boolean
  onClose: () => void
  onSave: (entry: Omit<JournalEntry, 'id' | 'createdAt'> & { id?: string }) => void
}

type EditorViewMode = 'wide' | 'split' | 'focus'

export const FullPageEditor: React.FC<FullPageEditorProps> = ({
  initialEntry,
  isOpen,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [content, setContent] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('Life & Reflections')
  const [tagsInput, setTagsInput] = useState('')
  const [viewMode, setViewMode] = useState<EditorViewMode>('wide')
  const [, setAudioTick] = useState(0)
  const [savedStatus, setSavedStatus] = useState('saved')

  // Subscribe to audio changes
  useEffect(() => {
    const unsub = audioManager.subscribe(() => {
      setAudioTick((t) => t + 1)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (initialEntry) {
      setTitle(initialEntry.title)
      setSubtitle(initialEntry.subtitle || '')
      setContent(initialEntry.content)
      setDate(initialEntry.date)
      setCategory(initialEntry.category || 'Life & Reflections')
      setTagsInput(initialEntry.tags?.join(', ') || '')
    } else {
      const draft = localStorage.getItem('vaishh_journal_draft')
      if (draft) {
        try {
          const parsed = JSON.parse(draft)
          setTitle(parsed.title || '')
          setSubtitle(parsed.subtitle || '')
          setContent(parsed.content || '')
          setDate(parsed.date || formatEntryDate())
          setCategory(parsed.category || 'Life & Reflections')
          setTagsInput(parsed.tagsInput || '')
        } catch {
          setDate(formatEntryDate())
        }
      } else {
        setTitle('')
        setSubtitle('')
        setContent('')
        setDate(formatEntryDate())
        setCategory('Life & Reflections')
        setTagsInput('')
      }
    }
  }, [initialEntry, isOpen])

  // Auto-save draft
  useEffect(() => {
    if (!initialEntry && isOpen) {
      setSavedStatus('saving...')
      const timeout = setTimeout(() => {
        const draft = { title, subtitle, content, date, category, tagsInput }
        localStorage.setItem('vaishh_journal_draft', JSON.stringify(draft))
        setSavedStatus('saved to disk')
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [title, subtitle, content, date, category, tagsInput, initialEntry, isOpen])

  // Keyboard shortcuts
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
      category: category.trim() || 'Life & Reflections',
      tags
    })

    if (!initialEntry) {
      localStorage.removeItem('vaishh_journal_draft')
    }
    onClose()
  }

  const toggleMusic = () => {
    audioManager.toggle()
  }

  const isMusicPlaying = audioManager.getIsPlaying()
  const currentTrack = audioManager.getCurrentTrack()

  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0
  const charCount = content.length

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[var(--bg-primary)] flex flex-col animate-fade-in overflow-hidden">
      {/* Top Studio Control Bar */}
      <header className="shrink-0 h-16 border-b border-stone-200/70 dark:border-stone-800/80 px-6 sm:px-10 flex items-center justify-between select-none bg-[var(--bg-primary)]/90 backdrop-blur-md">
        {/* Left: Back & Status */}
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-mono-meta text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors cursor-pointer group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>exit editor</span>
          </button>

          <span className="text-stone-300 dark:text-stone-700 hidden sm:inline">•</span>

          <span className="text-[11px] font-mono-meta text-stone-400 dark:text-stone-500 hidden sm:inline">
            {savedStatus}
          </span>
        </div>

        {/* Center: Ambient Audio Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMusic}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono-meta transition-all cursor-pointer ${
              isMusicPlaying
                ? 'bg-stone-800 text-stone-100 dark:bg-stone-200 dark:text-stone-900 ring-2 ring-stone-400/30'
                : 'border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
            title="Toggle background ambient track"
          >
            <span>{isMusicPlaying ? '♫ playing' : '♫ audio'}</span>
            <span className="text-[10px] opacity-75 truncate max-w-28 sm:max-w-44">
              {isMusicPlaying ? currentTrack.title : 'off'}
            </span>
          </button>
          {isMusicPlaying && (
            <button
              onClick={() => audioManager.playRandom()}
              className="p-1 text-xs text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
              title="Shuffle to next random song"
            >
              🔀
            </button>
          )}
        </div>

        {/* Right: Layout Switchers & Save CTA */}
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="hidden md:flex items-center border border-stone-200 dark:border-stone-800 rounded-lg p-0.5 text-xs font-mono-meta">
            <button
              onClick={() => setViewMode('focus')}
              className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                viewMode === 'focus'
                  ? 'bg-stone-200/80 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 font-medium'
                  : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              focus
            </button>
            <button
              onClick={() => setViewMode('wide')}
              className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                viewMode === 'wide'
                  ? 'bg-stone-200/80 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 font-medium'
                  : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              full page
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                viewMode === 'split'
                  ? 'bg-stone-200/80 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 font-medium'
                  : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
            >
              live preview
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!title.trim() && !content.trim()}
            className="text-xs font-mono-meta bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 hover:opacity-90 px-4 py-2 rounded-lg disabled:opacity-30 transition-all cursor-pointer font-medium shadow-xs"
          >
            save thought <span className="hidden sm:inline opacity-60 text-[10px] ml-1">(Ctrl+Enter)</span>
          </button>
        </div>
      </header>

      {/* Main Expansive Writing Canvas */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-12 lg:px-20 py-10">
        <div
          className={`mx-auto transition-all duration-200 ${
            viewMode === 'focus'
              ? 'max-w-3xl'
              : viewMode === 'split'
              ? 'max-w-7xl'
              : 'max-w-5xl'
          }`}
        >
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 text-xs font-mono-meta text-stone-400 dark:text-stone-500">
            <div className="flex items-center gap-3">
              <span>DATE:</span>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent border-b border-dashed border-stone-300 dark:border-stone-700 outline-none text-stone-700 dark:text-stone-300 w-32 pb-0.5"
                title="Edit thought date"
              />
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span>COLLECTION:</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-transparent border-b border-dashed border-stone-300 dark:border-stone-700 outline-none text-stone-700 dark:text-stone-300 cursor-pointer pb-0.5 text-xs font-mono-meta"
              >
                <option value="Life & Reflections" className="dark:bg-stone-900">Life & Reflections</option>
                <option value="Health & Discipline" className="dark:bg-stone-900">Health & Discipline</option>
                <option value="Relationships" className="dark:bg-stone-900">Relationships</option>
                <option value="Faith & Inner Peace" className="dark:bg-stone-900">Faith & Inner Peace</option>
                <option value="College Life" className="dark:bg-stone-900">College Life</option>
                <option value="Projects & Creativity" className="dark:bg-stone-900">Projects & Creativity</option>
                <option value="Mission 2027" className="dark:bg-stone-900">Mission 2027</option>
                <option value="Letters to Myself" className="dark:bg-stone-900">Letters to Myself</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{charCount} chars</span>
              <span>•</span>
              <span>{calculateReadingTime(content)}</span>
            </div>
          </div>

          {/* Title Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Title of your thought..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="w-full text-3xl sm:text-5xl lg:text-6xl font-serif-title font-medium bg-transparent outline-none text-stone-900 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-700 tracking-tight"
            />
          </div>

          {/* Subtitle / Preview Input */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="A one-line reflection or quote (e.g. my life, my thoughts, my journey.)..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full text-lg sm:text-2xl font-serif-title italic bg-transparent outline-none text-stone-600 dark:text-stone-400 placeholder:text-stone-300 dark:placeholder:text-stone-700"
            />
          </div>

          {/* Tags bar */}
          <div className="flex items-center gap-2 mb-8 pb-4 border-b border-stone-200/60 dark:border-stone-800/60 text-xs font-mono-meta text-stone-400">
            <span>TAGS:</span>
            <input
              type="text"
              placeholder="mission2027, reflections, philosophy (comma separated)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-transparent outline-none text-stone-600 dark:text-stone-300 placeholder:text-stone-400/50"
            />
          </div>

          {/* Editor Body: Split mode or Full width */}
          {viewMode === 'split' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Column: Markdown Input */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono-meta uppercase tracking-wider text-stone-400">
                  markdown editor
                </div>
                <textarea
                  placeholder="Start writing freely... Markdown is supported:
### Section Heading
**Bold text**
- Bullet list
> Quotes"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={26}
                  className="w-full bg-transparent outline-none text-stone-800 dark:text-stone-200 text-lg leading-relaxed font-light resize-none placeholder:text-stone-300 dark:placeholder:text-stone-700"
                />
              </div>

              {/* Right Column: Live Rendered Preview */}
              <div className="p-6 rounded-xl border border-stone-200/70 dark:border-stone-800/70 bg-stone-50/40 dark:bg-stone-900/30 overflow-y-auto max-h-[70vh]">
                <div className="text-[10px] font-mono-meta uppercase tracking-wider text-stone-400 mb-4 pb-2 border-b border-stone-200 dark:border-stone-800">
                  live reading preview
                </div>
                <div className="prose dark:prose-invert max-w-none text-stone-800 dark:text-stone-200 font-light leading-relaxed">
                  <ReactMarkdown>{content || '*Preview will appear as you type...*'}</ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <textarea
                placeholder="Start writing freely here...

Press Enter to create new paragraphs.
Use ### for numbered sections, **bold** for convictions, and - for lists.
Everything is auto-saved as you type."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={22}
                className="w-full bg-transparent outline-none text-stone-800 dark:text-stone-200 text-lg sm:text-xl leading-[2] font-light resize-none placeholder:text-stone-300 dark:placeholder:text-stone-700"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
