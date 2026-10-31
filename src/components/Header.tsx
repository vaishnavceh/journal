import React from 'react'
import { formatHeaderDate } from '../utils/date'
import { isSupabaseConfigured } from '../services/supabase'

interface HeaderProps {
  isDarkMode: boolean
  onToggleTheme: () => void
  onNavigateHome: () => void
  onOpenSyncModal?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleTheme,
  onNavigateHome,
  onOpenSyncModal,
}) => {
  const currentDate = formatHeaderDate()
  const hasCloud = isSupabaseConfigured()

  return (
    <header className="pt-8 pb-4">
      {/* Top Bar: Brand and Sun/Moon symbol */}
      <div className="flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="text-2xl font-serif-title tracking-tight font-medium hover:opacity-80 transition-opacity cursor-pointer group"
          title="Back to Journal"
        >
          <span>vaishh</span>
          <span className="text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300">.</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Cloud Sync Button */}
          {onOpenSyncModal && (
            <button
              onClick={onOpenSyncModal}
              aria-label="Cloud Sync & Mobile Settings"
              title={hasCloud ? 'Cloud Sync Active (Click to manage)' : 'Connect Supabase & Mobile App'}
              className="p-1.5 text-xs font-mono-meta flex items-center gap-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors cursor-pointer"
            >
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  hasCloud ? 'bg-emerald-500' : 'bg-stone-400 dark:bg-stone-600'
                }`}
              />
              <span className="hidden sm:inline">{hasCloud ? 'cloud sync' : 'sync'}</span>
            </button>
          )}

          {/* Theme switcher */}
          <button
            onClick={onToggleTheme}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 text-xl leading-none text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-transform active:scale-95 cursor-pointer font-serif select-none"
            title={isDarkMode ? 'Light mode (☼)' : 'Dark mode (☾)'}
          >
            {isDarkMode ? '☾' : '☼'}
          </button>
        </div>
      </div>

      {/* Date Subtitle */}
      <div className="mt-2">
        <span className="text-sm font-light tracking-wide text-stone-500 dark:text-stone-400 lowercase font-mono-meta">
          {currentDate}
        </span>
      </div>
    </header>
  )
}
