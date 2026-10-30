import React from 'react'
import type { TabView } from '../types'

interface BottomNavProps {
  currentTab: TabView
  onSelectTab: (tab: TabView) => void
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs: { id: TabView; label: string }[] = [
    { id: 'journal', label: 'journal' },
    { id: 'archive', label: 'archive' },
    { id: 'about', label: 'about' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none pb-6 pt-8 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/90 to-transparent">
      <div className="max-w-xl mx-auto px-6 flex justify-center items-center pointer-events-auto">
        <div className="flex items-center gap-8 py-2 px-6 rounded-full border border-stone-200/80 dark:border-stone-800/80 bg-white/70 dark:bg-stone-900/70 backdrop-blur-md shadow-xs">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative py-1 text-sm font-mono-meta transition-all cursor-pointer ${
                  isActive
                    ? 'text-stone-900 dark:text-stone-100 font-medium'
                    : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute -bottom-0.5 left-0 right-0 h-[1.5px] bg-stone-900 dark:bg-stone-100 rounded-full animate-fade-in" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
