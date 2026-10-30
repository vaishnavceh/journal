import React, { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { Greeting } from './components/Greeting'
import { WriteButton } from './components/WriteButton'
import { RecentThoughts } from './components/RecentThoughts'
import { BottomNav } from './components/BottomNav'
import { ReaderView } from './components/ReaderView'
import { FullPageEditor } from './components/FullPageEditor'
import { ArchiveView } from './components/ArchiveView'
import { AboutView } from './components/AboutView'
import type { JournalEntry, TabView } from './types'
import { INITIAL_ENTRIES } from './data/initialEntries'

export function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('vaishh_theme')
    if (saved !== null) {
      return saved === 'dark'
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // User name
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('vaishh_username') || 'vaishnav'
  })

  // Entries
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('vaishh_entries')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Always ensure the authentic full Mission 2027 entry is present
          const hasMission2027 = parsed.some((item: JournalEntry) => item.title === 'Mission 2027')
          if (hasMission2027) {
            return parsed.map((item: JournalEntry) =>
              item.title === 'Mission 2027' ? INITIAL_ENTRIES[0] : item
            )
          } else {
            return [INITIAL_ENTRIES[0], ...parsed]
          }
        }
      } catch {
        // Fall back to initial entries
      }
    }
    return INITIAL_ENTRIES
  })

  // Navigation & modals
  const [currentTab, setCurrentTab] = useState<TabView>('journal')
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)

  // Sync theme to DOM
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('vaishh_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('vaishh_theme', 'light')
    }
  }, [isDarkMode])

  // Sync entries to localStorage
  useEffect(() => {
    localStorage.setItem('vaishh_entries', JSON.stringify(entries))
  }, [entries])

  // Save username
  const handleUpdateUserName = (newName: string) => {
    setUserName(newName)
    localStorage.setItem('vaishh_username', newName)
  }

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        setEditingEntry(null)
        setIsEditorOpen(true)
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault()
        setIsDarkMode((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Create or Update Entry
  const handleSaveEntry = (
    entryData: Omit<JournalEntry, 'id' | 'createdAt'> & { id?: string }
  ) => {
    if (entryData.id) {
      setEntries((prev) =>
        prev.map((item) =>
          item.id === entryData.id
            ? { ...item, ...entryData, id: entryData.id! }
            : item
        )
      )
      if (activeEntry && activeEntry.id === entryData.id) {
        setActiveEntry({
          ...activeEntry,
          ...entryData,
          id: entryData.id
        })
      }
    } else {
      const newEntry: JournalEntry = {
        ...entryData,
        id: 'entry-' + Date.now(),
        createdAt: Date.now()
      }
      setEntries((prev) => [newEntry, ...prev])
      setActiveEntry(newEntry)
    }
    setEditingEntry(null)
  }

  // Delete Entry
  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id))
    if (activeEntry && activeEntry.id === id) {
      setActiveEntry(null)
    }
  }

  // Export JSON backup
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(entries, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `vaishh_journal_backup_${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        if (Array.isArray(parsed)) {
          setEntries(parsed)
          alert(`Successfully imported ${parsed.length} entries.`)
        } else {
          alert('Invalid backup file format.')
        }
      } catch {
        alert('Could not parse the backup file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // Restore defaults
  const handleResetDefaults = () => {
    if (window.confirm('Restore initial sample thoughts? Your existing entries will be replaced.')) {
      setEntries(INITIAL_ENTRIES)
      setActiveEntry(null)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200 selection:bg-stone-200 dark:selection:bg-stone-800">
      {/* Expansive Full Desktop Container */}
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-8 min-h-screen">
        {/* Mobile Header (Hidden on Large Desktop) */}
        <div className="block lg:hidden mb-6">
          <Header
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode((prev) => !prev)}
            onNavigateHome={() => {
              setActiveEntry(null)
              setCurrentTab('journal')
            }}
          />
        </div>

        {/* Desktop 2-Column Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Sticky Sidebar on Desktop */}
          <div className="hidden lg:block lg:col-span-4">
            <Sidebar
              currentTab={activeEntry ? 'journal' : currentTab}
              onSelectTab={(tab) => {
                setActiveEntry(null)
                setCurrentTab(tab)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              isDarkMode={isDarkMode}
              onToggleTheme={() => setIsDarkMode((prev) => !prev)}
              onNavigateHome={() => {
                setActiveEntry(null)
                setCurrentTab('journal')
              }}
              totalEntries={entries.length}
            />
          </div>

          {/* Right Column: Main Content Stage */}
          <main className="lg:col-span-8 min-h-[80vh]">
            {activeEntry ? (
              <ReaderView
                entry={activeEntry}
                onBack={() => setActiveEntry(null)}
                onEdit={(entry) => {
                  setEditingEntry(entry)
                  setIsEditorOpen(true)
                }}
                onDelete={handleDeleteEntry}
              />
            ) : currentTab === 'journal' ? (
              <>
                {/* Greeting */}
                <Greeting
                  userName={userName}
                  onUpdateUserName={handleUpdateUserName}
                />

                {/* + write something (Artistic wide studio launcher) */}
                <WriteButton
                  onClick={() => {
                    setEditingEntry(null)
                    setIsEditorOpen(true)
                  }}
                />

                {/* RECENT THOUGHTS list */}
                <RecentThoughts
                  entries={entries}
                  onSelectEntry={(entry) => setActiveEntry(entry)}
                  onWriteNew={() => {
                    setEditingEntry(null)
                    setIsEditorOpen(true)
                  }}
                />
              </>
            ) : currentTab === 'archive' ? (
              <ArchiveView
                entries={entries}
                onSelectEntry={(entry) => setActiveEntry(entry)}
                onExport={handleExportBackup}
                onImport={handleImportBackup}
                onResetDefaults={handleResetDefaults}
              />
            ) : (
              <AboutView userName={userName} />
            )}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Pill (Visible on mobile/tablet) */}
      <div className="block lg:hidden">
        <BottomNav
          currentTab={activeEntry ? ('journal' as TabView) : currentTab}
          onSelectTab={(tab) => {
            setActiveEntry(null)
            setCurrentTab(tab)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
      </div>

      {/* Full-Page Distraction-Free Writing Studio */}
      <FullPageEditor
        isOpen={isEditorOpen}
        initialEntry={editingEntry}
        onClose={() => {
          setIsEditorOpen(false)
          setEditingEntry(null)
        }}
        onSave={handleSaveEntry}
      />
    </div>
  )
}

export default App
