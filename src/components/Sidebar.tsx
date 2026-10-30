import React from 'react'
import { formatHeaderDate } from '../utils/date'
import { AudioPlayer } from './AudioPlayer'
import type { TabView } from '../types'

interface SidebarProps {
  currentTab: TabView
  onSelectTab: (tab: TabView) => void
  isDarkMode: boolean
  onToggleTheme: () => void
  onNavigateHome: () => void
  totalEntries: number
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isDarkMode,
  onToggleTheme,
  onNavigateHome,
  totalEntries
}) => {
  const currentDate = formatHeaderDate()

  const navItems: { id: TabView; number: string; label: string }[] = [
    { id: 'journal', number: '01', label: 'journal' },
    { id: 'archive', number: '02', label: 'archive' },
    { id: 'about', number: '03', label: 'about' }
  ]

  // Calculate days passed since Oct 30, 2026
  const startDate = new Date('2026-10-30').getTime()
  const now = new Date().getTime()
  const daysIntoMission = Math.max(1, Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1)

  return (
    <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-8 self-start space-y-8 select-none py-2">
      {/* Brand & Theme */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={onNavigateHome}
            className="text-3xl font-serif-title font-medium tracking-tight hover:opacity-80 transition-opacity cursor-pointer group text-left block"
          >
            <span>vaishh</span>
            <span className="text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300">.</span>
          </button>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs font-mono-meta text-stone-400 dark:text-stone-500 tracking-wider lowercase">
              {currentDate}
            </span>
            <span className="text-stone-300 dark:text-stone-700 text-xs">•</span>
            <span className="text-[11px] font-mono-meta text-stone-400 dark:text-stone-500">
              mission 2027
            </span>
          </div>
        </div>

        <button
          onClick={onToggleTheme}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 text-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-transform active:scale-90 cursor-pointer font-serif rounded-lg border border-transparent hover:border-stone-200 dark:hover:border-stone-800"
          title={isDarkMode ? 'Light mode (☼)' : 'Dark mode (☾)'}
        >
          {isDarkMode ? '☾' : '☼'}
        </button>
      </div>

      {/* Atmospheric Audio Player */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono-meta tracking-widest uppercase text-stone-400 dark:text-stone-500 flex items-center justify-between">
          <span>ambient soundtrack</span>
          <span className="text-[9px] text-stone-400 dark:text-stone-600">shuffle • 2 tracks</span>
        </div>
        <AudioPlayer />
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        <div className="text-[10px] font-mono-meta tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-2">
          navigation
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-mono-meta transition-all cursor-pointer ${
                isActive
                  ? 'bg-stone-200/60 dark:bg-stone-800/60 text-stone-900 dark:text-stone-100 font-medium'
                  : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100/50 dark:hover:bg-stone-900/40 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-xs text-stone-400 dark:text-stone-600">{item.number}</span>
                <span>{item.label}</span>
              </span>
              {item.id === 'journal' && (
                <span className="text-[11px] text-stone-400 dark:text-stone-600">
                  {totalEntries}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Mission 2027 Tracker Card */}
      <div className="p-4 rounded-xl border border-stone-200/80 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/30 text-xs font-mono-meta space-y-3">
        <div className="flex items-center justify-between text-stone-400 dark:text-stone-500">
          <span className="tracking-widest uppercase text-[10px] font-semibold text-stone-600 dark:text-stone-300">
            Mission 2027
          </span>
          <span>Day {daysIntoMission}</span>
        </div>

        <div className="space-y-2 text-[11px] text-stone-600 dark:text-stone-400">
          <div className="flex items-center justify-between">
            <span>Target Weight:</span>
            <span className="text-stone-800 dark:text-stone-200 font-medium">98kg → 80-85kg</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Recreational Screen:</span>
            <span className="text-stone-800 dark:text-stone-200 font-medium">&lt; 5 hrs/day</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Daily Reading:</span>
            <span className="text-stone-800 dark:text-stone-200 font-medium">10+ pages</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Relationship Focus:</span>
            <span className="text-stone-800 dark:text-stone-200 font-medium">1-Year Break</span>
          </div>
        </div>

        <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800/60 text-[10px] text-stone-400 dark:text-stone-500 italic font-serif">
          &ldquo;Quiet compounding beats loud fireworks.&rdquo;
        </div>
      </div>

      {/* Aesthetic Coordinates Stamp */}
      <div className="pt-2 text-[10px] font-mono-meta text-stone-400 dark:text-stone-600 space-y-0.5">
        <div>COORDINATES: 09.9312° N, 76.2673° E</div>
        <div>TIMEZONE: IST (UTC+05:30)</div>
        <div>STATION: VAISHH JOURNAL HQ</div>
      </div>
    </aside>
  )
}
