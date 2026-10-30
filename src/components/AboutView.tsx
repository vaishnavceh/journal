import React, { useState } from 'react'

interface AboutViewProps {
  userName: string
}

export const AboutView: React.FC<AboutViewProps> = ({ userName }) => {
  const [socialLink, setSocialLink] = useState(() => {
    return localStorage.getItem('vaishh_about_link') || 'https://github.com'
  })
  const [isEditingLink, setIsEditingLink] = useState(false)

  const handleLinkSave = (newLink: string) => {
    setSocialLink(newLink)
    localStorage.setItem('vaishh_about_link', newLink)
    setIsEditingLink(false)
  }

  return (
    <div className="pt-2 pb-32 animate-fade-in space-y-12 max-w-4xl">
      {/* Header */}
      <div className="pb-8 border-b border-stone-200/70 dark:border-stone-800/80">
        <h1 className="text-4xl sm:text-5xl font-serif-title font-medium tracking-tight text-stone-900 dark:text-stone-100">
          about {userName.toLowerCase()}.
        </h1>
        <p className="mt-3 text-xl font-serif-title italic text-stone-500 dark:text-stone-400">
          a digital sanctuary for thoughts, craft, and mission 2027.
        </p>
      </div>

      {/* Main Philosophy */}
      <section className="space-y-5 text-stone-700 dark:text-stone-300 font-light leading-relaxed">
        <h2 className="text-xs font-mono-meta tracking-widest uppercase text-stone-400 dark:text-stone-500 font-medium">
          the vision & manifesto
        </h2>
        <p className="text-lg sm:text-xl leading-[1.9]">
          This journal is where raw thoughts turn into conviction. In a world full of fast dopamine, endless feeds, and reactionary opinions, having a quiet space to slow down, observe, and write is a superpower.
        </p>
        <p className="text-lg sm:text-xl leading-[1.9]">
          Everything here revolves around <strong>Mission 2027</strong>—a commitment to deep craft, physical health, clarity of thought, and building a life lived with deliberate intention.
        </p>
      </section>

      {/* Guiding Principles Grid */}
      <section className="space-y-6 pt-6 border-t border-stone-200/50 dark:border-stone-800/50">
        <h2 className="text-xs font-mono-meta tracking-widest uppercase text-stone-400 dark:text-stone-500 font-medium">
          three guiding principles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-6 rounded-xl border border-stone-200/60 dark:border-stone-800/80 bg-stone-50/30 dark:bg-stone-900/20 space-y-2">
            <span className="text-xs font-mono-meta text-stone-400 block">01</span>
            <h3 className="font-serif-title text-xl font-medium text-stone-900 dark:text-stone-100">
              Clarity is written, not found.
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed">
              If an idea is tangled in your mind, putting it into words forces structure, honesty, and resolution.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-stone-200/60 dark:border-stone-800/80 bg-stone-50/30 dark:bg-stone-900/20 space-y-2">
            <span className="text-xs font-mono-meta text-stone-400 block">02</span>
            <h3 className="font-serif-title text-xl font-medium text-stone-900 dark:text-stone-100">
              Quiet compounding beats loud fireworks.
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed">
              The real changes happen in the ordinary Tuesdays and quiet late nights nobody claps for.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-stone-200/60 dark:border-stone-800/80 bg-stone-50/30 dark:bg-stone-900/20 space-y-2">
            <span className="text-xs font-mono-meta text-stone-400 block">03</span>
            <h3 className="font-serif-title text-xl font-medium text-stone-900 dark:text-stone-100">
              Protect your focus.
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed">
              Be greedy with your attention. Guard your mornings, limit screen distractions, and leave time to daydream.
            </p>
          </div>
        </div>
      </section>

      {/* Tech / Stack Details */}
      <section className="pt-6 border-t border-stone-200/50 dark:border-stone-800/50 text-xs font-mono-meta text-stone-400 space-y-3">
        <div className="flex items-center justify-between">
          <span>built for</span>
          <span className="text-stone-600 dark:text-stone-300 font-medium">{userName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>ambient soundtrack</span>
          <span className="text-stone-600 dark:text-stone-300">Cornfield Chase (Interstellar) Procedural Synth</span>
        </div>
        <div className="flex items-center justify-between">
          <span>storage</span>
          <span className="text-stone-600 dark:text-stone-300">private & local (browser persistent)</span>
        </div>
        <div className="flex items-center justify-between">
          <span>theme</span>
          <span className="text-stone-600 dark:text-stone-300">editorial paper / obsidian</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span>link</span>
          {isEditingLink ? (
            <input
              type="text"
              defaultValue={socialLink}
              onBlur={(e) => handleLinkSave(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLinkSave(e.currentTarget.value)
              }}
              autoFocus
              className="text-stone-700 dark:text-stone-200 bg-stone-200/60 dark:bg-stone-800/60 px-2 py-0.5 rounded outline-none"
            />
          ) : (
            <span
              onClick={() => setIsEditingLink(true)}
              className="hover:underline cursor-pointer text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
              title="Click to change link"
            >
              {socialLink}
            </span>
          )}
        </div>
      </section>
    </div>
  )
}
