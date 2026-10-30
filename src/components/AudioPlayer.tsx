import React, { useState, useEffect } from 'react'
import { audioManager } from '../audio/audioManager'

export const AudioPlayer: React.FC = () => {
  const [, setTick] = useState(0)
  const [hasInteracted, setHasInteracted] = useState(false)

  // Subscribe to audioManager updates
  useEffect(() => {
    const unsubscribe = audioManager.subscribe(() => {
      setTick((t) => t + 1)
    })
    return () => unsubscribe()
  }, [])

  // Auto-play random song on first click/keypress
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true)
        const savedPref = localStorage.getItem('vaishh_music_enabled')
        if (savedPref !== 'false') {
          audioManager.play()
        }
      }
    }

    window.addEventListener('click', handleFirstInteraction, { once: true })
    window.addEventListener('keydown', handleFirstInteraction, { once: true })

    return () => {
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [hasInteracted])

  const isPlaying = audioManager.getIsPlaying()
  const currentTrack = audioManager.getCurrentTrack()
  const volume = audioManager.getVolume()

  const togglePlay = () => {
    const active = audioManager.toggle()
    localStorage.setItem('vaishh_music_enabled', active ? 'true' : 'false')
  }

  const handleNextRandom = () => {
    audioManager.playRandom()
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    audioManager.setVolume(parseFloat(e.target.value))
  }

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl border border-stone-200/70 dark:border-stone-800/80 bg-stone-100/50 dark:bg-stone-900/40 backdrop-blur-xs text-xs font-mono-meta transition-all select-none shadow-2xs">
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="w-8 h-8 rounded-full flex items-center justify-center bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-xs shrink-0"
        title={isPlaying ? 'Pause music' : 'Play random track'}
      >
        {isPlaying ? (
          <span className="text-[10px] tracking-tighter font-mono font-bold">||</span>
        ) : (
          <span className="text-[11px] ml-0.5">▶</span>
        )}
      </button>

      {/* Song Info & Equalizer */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-stone-800 dark:text-stone-200 font-medium text-[11px]">
            {currentTrack.title}
          </span>
          <span className="text-[10px] text-stone-400 dark:text-stone-500 truncate hidden sm:inline">
            {currentTrack.artist}
          </span>
        </div>

        {/* Animated equalizer waves */}
        <div className="flex items-center gap-0.5 mt-1 h-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <span
              key={i}
              className={`w-0.5 bg-stone-500 dark:bg-stone-400 rounded-full transition-all duration-150 ${
                isPlaying ? 'animate-pulse' : 'h-1 opacity-30'
              }`}
              style={{
                height: isPlaying ? `${Math.sin(i * 1.3) * 5 + 6}px` : '3px',
                animationDelay: `${i * 140}ms`
              }}
            />
          ))}
          <span className="ml-1.5 text-[9px] text-stone-400 dark:text-stone-500">
            {isPlaying ? 'shuffling' : 'paused'}
          </span>
        </div>
      </div>

      {/* Shuffle / Random Next Button */}
      <button
        onClick={handleNextRandom}
        className="p-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors cursor-pointer rounded hover:bg-stone-200/50 dark:hover:bg-stone-800/50"
        title="Shuffle to another song"
      >
        <span className="text-sm">🔀</span>
      </button>

      {/* Volume slider */}
      <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-stone-200 dark:border-stone-800">
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          className="w-12 accent-stone-700 dark:accent-stone-300 h-1 bg-stone-300 dark:bg-stone-700 rounded cursor-pointer"
          title="Volume"
        />
      </div>
    </div>
  )
}
