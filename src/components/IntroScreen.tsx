import React, { useState, useEffect } from 'react'
import { audioManager, PLAYLIST } from '../audio/audioManager'
import { formatHeaderDate } from '../utils/date'

interface IntroScreenProps {
  userName?: string
  onEnter: () => void
}

type IntroStep = 'welcome' | 'secret' | 'music'

export const IntroScreen: React.FC<IntroScreenProps> = ({ onEnter }) => {
  const [step, setStep] = useState<IntroStep>('welcome')
  const [secretInput, setSecretInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isFading, setIsFading] = useState(false)
  const currentDate = formatHeaderDate()

  const SECRET_KEY = 'you are very special to me'

  const handleWelcomeNext = () => {
    setStep('secret')
  }

  const handleSecretSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    // Normalize input
    const cleanInput = secretInput
      .trim()
      .toLowerCase()
      .replace(/[.,!]+$/, '') // remove trailing punctuation

    if (cleanInput === SECRET_KEY) {
      setErrorMsg('')
      setStep('music')
    } else {
      setErrorMsg("that's not what vaishnav told you. try again.")
    }
  }

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

  // Keyboard accessibility per step
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (step === 'welcome') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleWelcomeNext()
        }
      } else if (step === 'music') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleEnterWithMusic()
        } else if (e.key === 'Escape') {
          e.preventDefault()
          handleEnterSilently()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [step])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0c0d0e] text-[#f2efe9] transition-opacity duration-500 select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient radial aura */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(65,58,50,0.25),transparent_70%)] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative max-w-md w-full text-center space-y-7 animate-fade-in p-8 sm:p-10 rounded-2xl border border-stone-800/80 bg-stone-900/50 backdrop-blur-md shadow-2xl">
        {/* Top Header / Coordinates */}
        <div className="flex items-center justify-between text-[11px] font-mono-meta text-stone-500 tracking-wider">
          <span>09.9312° N, 76.2673° E</span>
          <span>{currentDate}</span>
        </div>

        {/* STEP 1: WELCOME SCREEN */}
        {step === 'welcome' && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-serif-title font-medium tracking-tight text-stone-100">
                vaishh<span className="text-stone-500">.</span>
              </h1>
              <p className="text-xs font-mono-meta text-stone-500 tracking-widest uppercase">
                Sanctuary // 2026
              </p>
            </div>

            <div className="py-4 space-y-3">
              <h2 className="text-2xl sm:text-3xl font-serif-title font-normal text-stone-200 leading-snug">
                you are entering vaishh&apos;s world.
              </h2>
              <p className="text-xs font-serif italic text-stone-400">
                a quiet digital space of thoughts, convictions, and mission 2027.
              </p>
            </div>

            <button
              onClick={handleWelcomeNext}
              autoFocus
              className="w-full py-3.5 px-6 rounded-xl bg-stone-100 text-stone-900 hover:bg-white active:scale-[0.99] transition-all cursor-pointer font-mono-meta text-sm font-medium shadow-md flex items-center justify-center gap-2 group"
            >
              <span>yes, continue</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        )}

        {/* STEP 2: SECRET KEY CHALLENGE */}
        {step === 'secret' && (
          <form onSubmit={handleSecretSubmit} className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <span className="text-[10px] font-mono-meta text-stone-500 uppercase tracking-widest block">
                verification
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif-title font-normal text-stone-100 leading-snug">
                tell the secret key vaishnav told you.
              </h2>
              <p className="text-xs font-serif italic text-stone-400">
                a phrase meant only for those close to his thoughts.
              </p>
            </div>

            <div className="space-y-2 text-left">
              <input
                type="text"
                placeholder="type the secret key..."
                value={secretInput}
                onChange={(e) => {
                  setSecretInput(e.target.value)
                  if (errorMsg) setErrorMsg('')
                }}
                autoFocus
                className="w-full py-3 px-4 rounded-xl bg-stone-950/80 border border-stone-800 focus:border-stone-400 outline-none text-stone-100 text-sm font-serif placeholder:text-stone-600 transition-colors"
              />
              {errorMsg && (
                <p className="text-[11px] font-mono-meta text-red-400 pt-1 text-center animate-shake">
                  {errorMsg}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!secretInput.trim()}
              className="w-full py-3.5 px-6 rounded-xl bg-stone-100 text-stone-900 hover:bg-white disabled:opacity-40 active:scale-[0.99] transition-all cursor-pointer font-mono-meta text-sm font-medium shadow-md flex items-center justify-center gap-2"
            >
              <span>unlock sanctuary</span>
              <span>→</span>
            </button>
          </form>
        )}

        {/* STEP 3: SOUNDTRACK CHOICE */}
        {step === 'music' && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1">
              <span className="text-[11px] font-mono-meta text-emerald-400/90 tracking-widest uppercase block">
                ✓ key accepted
              </span>
              <h2 className="text-3xl font-serif-title font-normal text-stone-100 pt-1">
                want soundtrack?
              </h2>
              <p className="text-xs font-serif italic text-stone-400 pt-1">
                ♫ {PLAYLIST.map((t) => t.title).join(' • ')}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Primary: Play music */}
              <button
                onClick={handleEnterWithMusic}
                autoFocus
                className="w-full py-3.5 px-6 rounded-xl bg-stone-100 text-stone-900 hover:bg-white active:scale-[0.99] transition-all cursor-pointer font-mono-meta text-sm font-medium shadow-md flex items-center justify-center gap-2.5 group"
              >
                <span className="group-hover:scale-110 transition-transform">♫</span>
                <span>yes, play soundtrack</span>
                <span className="text-[11px] opacity-60 hidden sm:inline">(Press Enter)</span>
              </button>

              {/* Secondary: Silent entry */}
              <button
                onClick={handleEnterSilently}
                className="w-full py-2.5 px-6 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800/40 active:scale-[0.99] transition-all cursor-pointer font-mono-meta text-xs"
              >
                enter in silence <span className="opacity-60 text-[10px] hidden sm:inline">(Esc)</span>
              </button>
            </div>
          </div>
        )}

        {/* Step Indicator Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <span
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              step === 'welcome' ? 'bg-stone-200 w-4' : 'bg-stone-700'
            }`}
          />
          <span
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              step === 'secret' ? 'bg-stone-200 w-4' : 'bg-stone-700'
            }`}
          />
          <span
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              step === 'music' ? 'bg-stone-200 w-4' : 'bg-stone-700'
            }`}
          />
        </div>
      </div>
    </div>
  )
}
