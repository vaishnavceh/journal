import React, { useState, useEffect } from 'react'
import { audioManager, PLAYLIST } from '../audio/audioManager'
import { formatHeaderDate } from '../utils/date'

interface IntroScreenProps {
  userName: string
  onEnter: () => void
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ userName, onEnter }) => {
  const [isFading, setIsFading] = useState(false)
  const currentDate = formatHeaderDate()

  const handleEnterWithMusic = () => {
    setIsFading(true)
    audioManager.startRandomPlayback()
    localStorage.setItem('vaishh_music_enabled', 'true')
    sessionStorage.setItem('vaishh_intro_seen', 'true')
    setTimeout(() => {
      onEnter()
    }, 450)
  }

  const handleEnterSilently = () => {
    setIsFading(true)
    audioManager.pause()
    localStorage.setItem('vaishh_music_enabled', 'false')
    sessionStorage.setItem('vaishh_intro_seen', 'true')
    setTimeout(() => {
      onEnter()
    }, 450)
  }

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleEnterWithMusic()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleEnterSilently()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0c0d0e] text-[#f2efe9] transition-opacity duration-500 select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(55,50,45,0.22),transparent_70%)] pointer-events-none" />

      {/* Card Content */}
      <div className="relative max-w-md w-full text-center space-y-8 animate-fade-in p-8 rounded-2xl border border-stone-800/80 bg-stone-900/40 backdrop-blur-md shadow-2xl">
        {/* Top Coordinates / Meta */}
        <div className="flex items-center justify-between text-[11px] font-mono-meta text-stone-500 tracking-wider">
          <span>09.9312° N, 76.2673° E</span>
          <span>{currentDate}</span>
        </div>

        {/* Brand */}
        <div>
          <h1 className="text-4xl sm:text-5xl font-serif-title font-medium tracking-tight text-stone-100">
            vaishh<span className="text-stone-500">.</span>
          </h1>
          <p className="mt-1 text-xs font-mono-meta text-stone-500 tracking-widest uppercase">
            Mission 2027 Sanctuary
          </p>
        </div>

        {/* Question */}
        <div className="space-y-2 py-2">
          <p className="text-sm font-mono-meta text-stone-400">
            hey, {userName.toLowerCase()}.
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif-title font-normal text-stone-200">
            want music, my brother?
          </h2>
          <p className="text-xs text-stone-500 font-serif italic pt-1">
            ♫ {PLAYLIST.map((t) => t.title).join(' • ')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Primary CTA: Yes, play music */}
          <button
            onClick={handleEnterWithMusic}
            autoFocus
            className="w-full py-3.5 px-6 rounded-xl bg-stone-100 text-stone-900 hover:bg-white active:scale-[0.99] transition-all cursor-pointer font-mono-meta text-sm font-medium shadow-md flex items-center justify-center gap-2.5 group"
          >
            <span className="group-hover:scale-110 transition-transform">♫</span>
            <span>yes, play soundtrack</span>
            <span className="text-[11px] opacity-60 hidden sm:inline">(Press Enter)</span>
          </button>

          {/* Secondary CTA: Enter in silence */}
          <button
            onClick={handleEnterSilently}
            className="w-full py-2.5 px-6 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800/40 active:scale-[0.99] transition-all cursor-pointer font-mono-meta text-xs"
          >
            enter in silence <span className="opacity-60 text-[10px] hidden sm:inline">(Esc)</span>
          </button>
        </div>

        {/* Footnote */}
        <div className="pt-2 text-[10px] font-mono-meta text-stone-600">
          music will shuffle randomly between tracks
        </div>
      </div>
    </div>
  )
}
