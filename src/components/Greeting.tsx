import React, { useState } from 'react'

interface GreetingProps {
  userName: string
  onUpdateUserName: (name: string) => void
}

export const Greeting: React.FC<GreetingProps> = ({ userName, onUpdateUserName }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState(userName)

  const handleSave = () => {
    if (tempName.trim()) {
      onUpdateUserName(tempName.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setTempName(userName)
      setIsEditing(false)
    }
  }

  return (
    <section className="py-6 select-none">
      <div className="flex items-center gap-2">
        <span className="text-base text-stone-500 dark:text-stone-400 font-light">
          hey,{' '}
          {isEditing ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              autoFocus
              className="bg-stone-200/50 dark:bg-stone-800/60 px-1.5 py-0.5 rounded text-stone-900 dark:text-stone-100 outline-none border border-stone-300 dark:border-stone-700 w-28 inline-block"
            />
          ) : (
            <span
              onClick={() => setIsEditing(true)}
              className="underline decoration-dotted underline-offset-4 cursor-pointer hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              title="Click to change your name"
            >
              {userName}
            </span>
          )}
          .
        </span>
      </div>

      <h1 className="mt-2 text-2xl sm:text-3xl font-serif-title font-normal tracking-tight text-stone-800 dark:text-stone-200 leading-snug">
        what&apos;s on your mind today?
      </h1>
    </section>
  )
}
