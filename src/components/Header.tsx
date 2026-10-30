import React from 'react'
import { formatHeaderDate } from '../utils/date'

interface HeaderProps {
  isDarkMode: boolean
  onToggleTheme: () => void
  onNavigateHome: () => void
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleTheme,
  onNavigateHome
}) => {
  const currentDate = formatHeaderDate()

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

        <button
          onClick={onToggleTheme}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-1.5 text-xl leading-none text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-transform active:scale-95 cursor-pointer font-serif select-none"
          title={isDarkMode ? 'Light mode (☼)' : 'Dark mode (☾)'}
        >
          {isDarkMode ? '☾' : '☼'}
        </button>
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
